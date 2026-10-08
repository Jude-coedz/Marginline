const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.join(__dirname, "..");
const script = fs.readFileSync(path.join(root, "demo.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

function harness() {
  const nodes = new Map();
  const listeners = new Map();
  const memory = new Map();
  const downloads = [];
  let lastUrl = null;
  function node(id) {
    if (!nodes.has(id)) {
      const classes = new Set();
      nodes.set(id, {
        id, dataset: {}, style: {}, hidden: false,
        textContent: "", innerHTML: "", title: "", disabled: false,
        value: "20",
        firstChild: {textContent: "Show the math "},
        lastElementChild: {textContent: ""},
        classList: {
          toggle: (name, enabled) => { if (enabled) classes.add(name); else classes.delete(name); },
          contains: (name) => classes.has(name)
        },
        addEventListener(name, fn) { listeners.set(id + ":" + name, fn); },
        setAttribute(name, value) { this[name] = String(value); },
        getAnimations: () => [],
        scrollIntoView: () => {},
        animate: () => ({cancel() {}})
      });
    }
    return nodes.get(id);
  }
  const document = {
    getElementById: node,
    querySelectorAll(selector) {
      if (selector === ".step-dot") return [node("dot0"), node("dot1"), node("dot2"), node("dot3")];
      if (selector === ".connection-flow") return [node("line0"), node("line1")];
      return [];
    },
    createElement: () => ({click() { downloads.push(lastUrl); }, remove() {}}),
    body: {appendChild() {}}
  };
  const window = {
    sessionStorage: {
      getItem: (key) => memory.has(key) ? memory.get(key) : null,
      setItem: (key, value) => memory.set(key, value)
    },
    matchMedia: () => ({matches: true}),
    setTimeout
  };
  const URL = {
    createObjectURL(blob) { lastUrl = blob; return "blob:test"; },
    revokeObjectURL() {}
  };
  node("evidence").hidden = true;
  vm.runInNewContext(script, {document, window, URL, Blob, setTimeout, console});
  return {
    node,
    trigger(id, event = "click") {
      const fn = listeners.get(id + ":" + event);
      assert.ok(fn, "listener registered for " + id + ":" + event);
      fn({preventDefault() {}});
    },
    downloads
  };
}

test("the interactive demo has all required markup targets", () => {
  const ids = [...script.matchAll(/\$\("([a-z][a-z0-9-]*)"\)/g)].map(m => m[1]);
  const missing = [...new Set(ids)].filter(id => !html.includes('id="' + id + '"'));
  assert.deepEqual(missing, []);
});

test("the above-fold hero launches the guided walkthrough without extra ceremony", () => {
  const d = harness();
  assert.match(d.node("planned-number").innerHTML, /—/);
  d.trigger("hero-start");
  assert.equal(d.node("instrument").dataset.stage, "1");
  assert.equal(d.node("decision-status").textContent, "Both passed");
  assert.match(d.node("planned-number").innerHTML, /—/);
});

test("4-stage progression shows the shared-inventory collision", () => {
  const d = harness();
  assert.equal(d.node("instrument").dataset.stage, "0");
  assert.equal(d.node("decision-status").textContent, "Not checked");
  d.trigger("primary-action");
  assert.equal(d.node("instrument").dataset.stage, "1");
  assert.equal(d.node("decision-status").textContent, "Both passed");
  d.trigger("primary-action");
  assert.equal(d.node("instrument").dataset.stage, "2");
  assert.equal(d.node("decision-status").textContent, "Release held");
  assert.match(d.node("capacity-difference").textContent, /4 units oversubscribed/);
  assert.match(d.node("planned-number").innerHTML, /40/);
});

test("the release cannot be exported when combined demand exceeds stock", () => {
  const d = harness();
  d.trigger("primary-action"); d.trigger("primary-action"); d.trigger("primary-action");
  assert.equal(d.node("instrument").dataset.stage, "3");
  assert.equal(d.node("primary-action").disabled, true);
  d.trigger("primary-action");
  assert.equal(d.downloads.length, 0);
});

test("an actual inventory adjustment changes the verdict and exported record", async () => {
  const d = harness();
  d.trigger("primary-action"); d.trigger("primary-action"); d.trigger("primary-action");
  d.node("second-demand").value = "16";
  d.trigger("second-demand", "input");
  assert.equal(d.node("source-b-units").textContent, "16");
  assert.equal(d.node("decision-status").textContent, "Ready for review");
  assert.equal(d.node("primary-action").disabled, false);
  assert.match(d.node("planned-number").innerHTML, /36/);
  d.trigger("primary-action");
  assert.equal(d.downloads.length, 1);
  const payload = JSON.parse(await d.downloads[0].text());
  assert.equal(payload.evaluation.verdict, "READY_FOR_APPROVAL");
  assert.equal(payload.evaluation.combinedUnits, 36);
  assert.equal(payload.evaluation.shortage, 0);
  assert.equal(payload.workflow, "Demo exercise, no connected systems or executions");
});

test("suggested fix works, and restart resets the original proposal", () => {
  const d = harness();
  d.trigger("primary-action"); d.trigger("primary-action"); d.trigger("primary-action");
  d.trigger("suggest-fix");
  assert.equal(d.node("source-b-units").textContent, "16");
  assert.equal(d.node("decision-status").textContent, "Ready for review");
  d.trigger("restart");
  assert.equal(d.node("instrument").dataset.stage, "0");
  assert.equal(d.node("source-b-units").textContent, "20");
  assert.equal(d.node("decision-status").textContent, "Not checked");
});

test("expandable evidence opens, closes, and exposes honest product limitations", () => {
  const d = harness();
  assert.equal(d.node("evidence").hidden, true);
  d.trigger("evidence-toggle");
  assert.equal(d.node("evidence").hidden, false);
  assert.equal(d.node("evidence-toggle")["aria-expanded"], "true");
  d.trigger("evidence-toggle");
  assert.equal(d.node("evidence").hidden, true);
  assert.equal(d.node("evidence-toggle")["aria-expanded"], "false");
  assert.match(d.node("math-conclusion").textContent, /shared release check/i);
});
