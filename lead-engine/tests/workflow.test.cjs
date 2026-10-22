const test = require("node:test");
const assert = require("node:assert/strict");
const db = require("../api/_lib/db.cjs"),
  research = require("../api/_lib/research.cjs"),
  worker = require("../api/_lib/workflow.cjs");
test("manual pilot works with Gemini and without Supabase; audits, preserves evidence and returns leads", async () => {
  const old = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "unit-test";
  const originals = {};
  let audited = 0;
  try {
    originals.dbConnected = db.connected;
    db.connected = () => false;
    originals.gather = research.gather;
    research.gather = async () => ({
      queries: ["web search"],
      citations: [{ url: "https://source.example" }],
      model: "gemini-2.5-flash",
      candidates: [
        {
          domain: "good-example.com",
          sourceUrl: "https://good-example.com/",
          name: "Good Example",
        },
      ],
    });
    originals.audit = research.auditDomain;
    research.auditDomain = async (d) => {
      audited++;
      return {
        url: `https://${d}/`,
        title: "Good Example",
        description: "Commerce shop",
        shopify: true,
        productLinks: true,
        newsletter: false,
        contact: true,
        subscription: false,
        checkedAt: new Date().toISOString(),
      };
    };
    const output = await worker.execute({ sector: "beauty", region: "uk" });
    assert.equal(output.found, 1);
    assert.equal(output.added, 1);
    assert.equal(output.verified, 1);
    assert.equal(output.stored, false);
    assert.equal(output.leads[0].domain, "good-example.com");
    assert.deepEqual(
      output.leads[0].evidence.map((e) => e.label),
      [
        "Shopify marker on public homepage",
        "Product catalogue links visible",
        "Contact link visible",
      ],
    );
    assert.equal(audited, 1);
  } finally {
    db.connected = originals.dbConnected;
    research.gather = originals.gather;
    research.auditDomain = originals.audit;
    if (old === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = old;
  }
});
test("scheduled runs demand persistent storage", async () => {
  const old = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "unit-test";
  const connected = db.connected;
  db.connected = () => false;
  try {
    await assert.rejects(
      () => worker.execute({}, "scheduled"),
      /needs Supabase/,
    );
  } finally {
    db.connected = connected;
    if (old === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = old;
  }
});
test("rejects inaccessible and non-commerce sites, preserves candidate decisions and suggested claims separately", async () => {
  const old = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "unit-test";
  const original = {
    connected: db.connected,
    gather: research.gather,
    audit: research.auditDomain,
  };
  try {
    db.connected = () => false;
    research.gather = async () => ({
      queries: ["test query"],
      citations: [],
      model: "test",
      candidates: [
        { domain: "closed.test" },
        {
          domain: "noncommerce.test",
          snippet: "AI category suggestion",
          declaredCountry: "United Kingdom",
        },
      ],
    });
    research.auditDomain = async (d) => {
      if (d === "closed.test") throw Error("Website returned HTTP 403");
      return {
        url: "https://noncommerce.test",
        title: "Test fixture",
        shopify: false,
        productLinks: false,
      };
    };
    const out = await worker.execute({ sector: "beauty", region: "uk" });
    assert.equal(out.found, 2);
    assert.equal(out.checked, 0);
    assert.equal(out.failed, 2);
    assert.deepEqual(out.leads, []);
    assert.equal(out.details.outcomes.length, 2);
    assert.match(out.details.errors[1].error, /No Shopify marker/);
    assert.match(out.details.claims[1].label, /human confirmation/);
  } finally {
    Object.assign(db, { connected: original.connected });
    Object.assign(research, {
      gather: original.gather,
      auditDomain: original.audit,
    });
    old === undefined
      ? delete process.env.GEMINI_API_KEY
      : (process.env.GEMINI_API_KEY = old);
  }
});
test("persisted run records accepted totals and fails honestly when a lead cannot be saved", async () => {
  const old = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "unit-test";
  const original = {
    connected: db.connected,
    saveSettings: db.saveSettings,
    listRuns: db.listRuns,
    createRun: db.createRun,
    request: db.request,
    updateRun: db.updateRun,
    gather: research.gather,
    auditDomain: research.auditDomain,
  };
  const updates = [];
  let failSave = false;
  try {
    Object.assign(db, {
      connected: () => true,
      saveSettings: async () => {},
      listRuns: async () => [],
      createRun: async () => ({ id: "run-fixture" }),
      request: async (table, options) => {
        if (options.method === "POST") {
          if (failSave) throw Error("Database temporarily unavailable");
          return [{ id: "lead-fixture" }];
        }
        return [];
      },
      updateRun: async (id, data) => updates.push(data),
    });
    research.gather = async () => ({
      queries: ["synthetic"],
      citations: [],
      model: "test",
      candidates: [{ domain: "fixture.test" }],
    });
    research.auditDomain = async () => ({
      url: "https://fixture.test/",
      title: "Synthetic",
      shopify: true,
      productLinks: true,
      checkedAt: new Date().toISOString(),
    });
    const out = await worker.execute({});
    assert.equal(out.verified, 1);
    assert.equal(out.checked, 1);
    assert.equal(out.stored, true);
    assert.equal(updates.at(-1).status, "completed");
    assert.equal(updates.at(-1).details.outcomes.length, 1);
    failSave = true;
    await assert.rejects(
      () => worker.execute({}),
      /Could not save all research results/,
    );
    assert.equal(updates.at(-1).status, "failed");
  } finally {
    for (const key of [
      "connected",
      "saveSettings",
      "listRuns",
      "createRun",
      "request",
      "updateRun",
    ])
      db[key] = original[key];
    research.gather = original.gather;
    research.auditDomain = original.auditDomain;
    old === undefined
      ? delete process.env.GEMINI_API_KEY
      : (process.env.GEMINI_API_KEY = old);
  }
});
