const { test } = require("node:test");
const assert = require("node:assert/strict");
function response() {
  return {
    statusCode: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(n) {
      this.statusCode = n;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
}
test("real handlers report missing configuration, reject unauthorized discovery, and reject invalid methods", async () => {
  const previous = {};
  for (const key of [
    "GEMINI_API_KEY",
    "APP_ACCESS_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "CRON_SECRET",
  ]) {
    previous[key] = process.env[key];
    delete process.env[key];
  }
  const status = (await import("../api/status.js")).default,
    run = (await import("../api/run.js")).default,
    leads = (await import("../api/leads.js")).default;
  try {
    let res = response();
    await status({ method: "GET", headers: {} }, res);
    assert.equal(res.data.ready, false);
    assert.deepEqual(res.data.missing, ["GEMINI_API_KEY", "APP_ACCESS_KEY"]);
    res = response();
    await run(
      { method: "POST", headers: {}, body: { sector: "beauty", region: "uk" } },
      res,
    );
    assert.equal(res.statusCode, 401);
    process.env.APP_ACCESS_KEY = "contract-test-not-a-credential";
    res = response();
    await run(
      {
        method: "POST",
        headers: { "x-prospect-key": process.env.APP_ACCESS_KEY },
        body: {},
      },
      res,
    );
    assert.equal(res.statusCode, 424);
    assert.match(res.data.error, /GEMINI_API_KEY/);
    res = response();
    await run(
      {
        method: "POST",
        headers: { "x-prospect-key": process.env.APP_ACCESS_KEY },
        body: "{",
      },
      res,
    );
    assert.equal(res.statusCode, 400);
    res = response();
    await leads(
      {
        method: "DELETE",
        headers: { "x-prospect-key": process.env.APP_ACCESS_KEY },
      },
      res,
    );
    assert.equal(res.statusCode, 405);
    res = response();
    await run(
      {
        method: "GET",
        headers: { "x-prospect-key": process.env.APP_ACCESS_KEY },
      },
      res,
    );
    assert.equal(res.statusCode, 405);
    res = response();
    await leads(
      {
        method: "GET",
        headers: { "x-prospect-key": process.env.APP_ACCESS_KEY },
      },
      res,
    );
    assert.equal(res.statusCode, 200);
    assert.equal(res.data.stored, false);
  } finally {
    for (const [key, value] of Object.entries(previous))
      value === undefined
        ? delete process.env[key]
        : (process.env[key] = value);
  }
});
test("CSV export prevents formula execution and merging preserves reviewed drafts", async () => {
  const { csvContent, mergeLeads, safeLink } = await import("../src/lib.js");
  assert.ok(
    csvContent([
      { name: '=HYPERLINK("bad")', domain: "fixture.test" },
    ]).includes('"\'=HYPERLINK(""bad"")"'),
  );
  const [lead] = mergeLeads(
    [
      {
        domain: "fixture.test",
        id: "existing",
        stage: "approved",
        notes: "reviewed",
        outreach_body: "edited",
      },
    ],
    [
      {
        domain: "fixture.test",
        id: "new",
        stage: "new",
        score: 80,
        outreach_body: "generated",
      },
    ],
  );
  assert.equal(lead.id, "existing");
  assert.equal(lead.stage, "approved");
  assert.equal(lead.outreach_body, "edited");
  assert.equal(lead.score, 80);
  assert.equal(safeLink("javascript:alert(1)"), null);
  assert.equal(safeLink("https://user:password@fixture.test"), null);
});
test("scheduled settings and discovery inherit the same request deadline", async () => {
  const db = require("../api/_lib/db.cjs"),
    research = require("../api/_lib/research.cjs");
  const { timedSignal, withSignal } = require("../api/_lib/context.cjs");
  const controller = new AbortController();
  const original = {
    getSettings: db.getSettings,
    connected: db.connected,
    listRuns: db.listRuns,
    createRun: db.createRun,
    updateRun: db.updateRun,
    gather: research.gather,
  };
  const old = {
    key: process.env.GEMINI_API_KEY,
    cron: process.env.CRON_SECRET,
  };
  let parentSignal;
  try {
    process.env.GEMINI_API_KEY = "synthetic";
    process.env.CRON_SECRET = "synthetic-cron";
    db.getSettings = async () => {
      parentSignal = timedSignal(60000);
      return { sector: "home", region: "ca" };
    };
    db.connected = () => true;
    db.listRuns = async () => [];
    db.createRun = async () => ({ id: "synthetic-run" });
    db.updateRun = async () => {};
    research.gather = async (selection) => {
      assert.equal(selection.sector, "home");
      assert.equal(selection.region, "ca");
      const signal = timedSignal(60000);
      assert.notEqual(signal, parentSignal);
      assert.equal(signal.aborted, false);
      controller.abort();
      assert.equal(parentSignal.aborted, true);
      assert.equal(signal.aborted, true);
      return { candidates: [], queries: [], citations: [], model: "test" };
    };
    const handler = (await import("../api/run.js")).default;
    const res = response();
    await withSignal(controller.signal, () =>
      handler(
        { method: "GET", headers: { authorization: "Bearer synthetic-cron" } },
        res,
      ),
    );
    assert.equal(res.statusCode, 200);
    assert.ok(parentSignal);
    assert.equal(res.data.stored, true);
  } finally {
    for (const key of [
      "getSettings",
      "connected",
      "listRuns",
      "createRun",
      "updateRun",
    ])
      db[key] = original[key];
    research.gather = original.gather;
    old.key === undefined
      ? delete process.env.GEMINI_API_KEY
      : (process.env.GEMINI_API_KEY = old.key);
    old.cron === undefined
      ? delete process.env.CRON_SECRET
      : (process.env.CRON_SECRET = old.cron);
  }
});
test("protected Supabase verification checks all required tables and distinguishes missing or broken storage", async () => {
  const db = require("../api/_lib/db.cjs");
  const original = { connected: db.connected, request: db.request };
  const old = process.env.APP_ACCESS_KEY;
  process.env.APP_ACCESS_KEY = "synthetic-storage-check";
  const handler = (await import("../api/storage.js")).default;
  const headers = { "x-prospect-key": process.env.APP_ACCESS_KEY };
  try {
    let res = response();
    await handler({ method: "GET", headers: {} }, res);
    assert.equal(res.statusCode, 401);
    db.connected = () => false;
    res = response();
    await handler({ method: "GET", headers }, res);
    assert.equal(res.data.verified, false);
    assert.equal(res.data.mode, "browser");
    const tables = [];
    db.connected = () => true;
    db.request = async (table, options) => {
      tables.push(table);
      assert.equal(options.query, "select=id&limit=1");
      return [];
    };
    res = response();
    await handler({ method: "GET", headers }, res);
    assert.equal(res.data.verified, true);
    assert.deepEqual(tables.sort(), ["app_settings", "lead_runs", "leads"]);
    db.request = async () => {
      throw Error("synthetic schema error");
    };
    res = response();
    await handler({ method: "GET", headers }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.data.verified, false);
    assert.match(res.data.error, /schema.sql/);
  } finally {
    Object.assign(db, original);
    old === undefined
      ? delete process.env.APP_ACCESS_KEY
      : (process.env.APP_ACCESS_KEY = old);
  }
});
