import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const fixture = {
  id: "fixture.test",
  domain: "fixture.test",
  name: "Synthetic QA fixture",
  sector: "beauty",
  region: "uk",
  score: 82,
  shopify: true,
  qualification: "strong",
  stage: "new",
  website: "https://fixture.test/",
  reason: "Synthetic Shopify storefront used only in automated tests",
  observed: ["Shopify technology detected", "Links to product catalogue"],
  evidence: [
    { label: "Synthetic homepage source", source: "https://fixture.test/" },
  ],
  scanned_at: "2026-10-22T12:00:00Z",
  outreach_subject: "QA draft",
  outreach_body: "This synthetic draft exercises the review form.",
};
const payload = {
  stored: false,
  found: 2,
  checked: 1,
  added: 1,
  verified: 1,
  failed: 1,
  leads: [fixture],
  details: {
    model: "Gemini contract fixture — not live",
    queries: ["Synthetic test query"],
    citations: [{ title: "Synthetic source", url: "https://source.test/" }],
    outcomes: [
      {
        domain: "fixture.test",
        accepted: true,
        reason: "Synthetic storefront",
      },
      { domain: "discarded.test", accepted: false, reason: "HTTP 403" },
    ],
    claims: [
      {
        domain: "fixture.test",
        country: "United Kingdom",
        description: "Synthetic AI suggestion",
      },
    ],
  },
};
async function mockConfigured(page) {
  await page.route("**/api/status", (route) =>
    route.fulfill({
      json: {
        service: "Prospect",
        search: true,
        secure: true,
        storage: false,
        schedule: false,
        missing: [],
        testFixture: true,
      },
    }),
  );
  await page.route("**/api/leads", (route) =>
    route.fulfill({ json: { stored: false, leads: [], runs: [] } }),
  );
  await page.addInitScript(() =>
    sessionStorage.setItem("prospect_access", "synthetic-test-access"),
  );
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("real local API reports missing bindings; setup and tabs are keyboard accessible", async ({
  page,
  request,
}, info) => {
  const health = await request.get("/api/status");
  expect(health.ok()).toBe(true);
  expect((await health.json()).service).toBe("Prospect");
  const unauthorized = await request.post("/api/run", {
    data: { sector: "beauty", region: "uk" },
  });
  expect(unauthorized.status()).toBe(401);
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Find your next conversation.",
      exact: true,
    }),
  ).toBeVisible();
  await noOverflow(page);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-empty.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open workspace settings" }).click();
  await expect(
    page.getByRole("heading", { name: "Workspace settings" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: /Shortlist/ }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: /Run log/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
test("synthetic discovery, evidence, draft review, deduplication, export and focus restoration", async ({
  page,
}, info) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await mockConfigured(page);
  let calls = 0;
  await page.route("**/api/run", async (route) => {
    calls++;
    await new Promise((r) => setTimeout(r, 350));
    await route.fulfill({ json: payload });
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Find prospects", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Find prospects", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Researching…", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Review Synthetic QA fixture" }),
  ).toBeVisible();
  expect(calls).toBe(1);
  await noOverflow(page);
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-synthetic-results.png`,
    fullPage: true,
  });
  await page.getByRole("tab", { name: /Run log/ }).click();
  await page.locator("summary").click();
  await expect(page.getByText("discarded.test", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Synthetic source" }),
  ).toHaveAttribute("href", "https://source.test/");
  await page.getByRole("tab", { name: /Shortlist/ }).click();
  await page
    .getByRole("button", { name: "Review Synthetic QA fixture" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await expect(
    dialog.getByText("Synthetic AI suggestion", { exact: false }),
  ).toBeVisible();
  await dialog
    .getByRole("combobox", { name: "Review stage", exact: true })
    .click();
  await page.getByRole("option", { name: "Approved", exact: true }).click();
  await dialog
    .getByLabel("Private review notes")
    .fill("Reviewed synthetic evidence");
  await dialog.getByRole("tab", { name: "Outreach draft" }).click();
  await dialog
    .getByLabel("First-touch draft")
    .fill("Edited QA draft — no message sent.");
  await dialog
    .getByRole("button", { name: "Save review", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText(
    "Review saved. No message sent.",
  );
  await dialog.evaluate((el) => (el.scrollTop = 0));
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-synthetic-inspector.png`,
    fullPage: false,
  });
  await dialog
    .getByRole("button", { name: "Save review", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-synthetic-inspector-actions.png`,
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review Synthetic QA fixture" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Find prospects", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Find prospects", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Review Synthetic QA fixture" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Approved", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Review Synthetic QA fixture" }),
  ).toBeVisible();
  await page.getByLabel("Search company or domain").fill("no match");
  await expect(page.getByText("No prospects match this view.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export (1)" }).click();
  expect((await download).suggestedFilename()).toBe("prospect-shortlist.csv");
  await page.reload();
  await page
    .getByRole("button", { name: "Review Synthetic QA fixture" })
    .click();
  await page.getByRole("tab", { name: "Outreach draft" }).click();
  await expect(page.getByLabel("First-touch draft")).toHaveValue(
    "Edited QA draft — no message sent.",
  );
  expect(errors).toEqual([]);
});
test("provider failure is visible, retained after reload, and never replaced by sample leads", async ({
  page,
}, info) => {
  await mockConfigured(page);
  await page.route("**/api/run", (route) =>
    route.fulfill({
      status: 429,
      json: {
        error: "Gemini quota or rate limit reached. Check provider quota.",
      },
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Find prospects", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Gemini quota");
  await page.locator("summary").click();
  await expect(page.locator(".run-details")).toContainText("Gemini quota");
  await page.reload();
  await page.getByRole("tab", { name: /Run log/ }).click();
  await expect(page.locator("summary")).toContainText("failed");
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-synthetic-failure.png`,
    fullPage: true,
  });
  expect(await page.locator(".prospect-row").count()).toBe(0);
});
test("unlock failures are actionable and access key is not stored in local storage", async ({
  page,
}) => {
  await page.route("**/api/status", (route) =>
    route.fulfill({
      json: {
        service: "Prospect",
        search: true,
        secure: true,
        storage: false,
        schedule: false,
        missing: [],
        testFixture: true,
      },
    }),
  );
  await page.route("**/api/leads", (route) =>
    route.fulfill({
      status: 401,
      json: { error: "Access code is missing or incorrect" },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Open workspace settings" }).click();
  await page.getByLabel("Workspace access key").fill("incorrect-test-key");
  await page
    .getByRole("button", { name: "Unlock workspace", exact: true })
    .click();
  await expect(
    page.getByText("Access code is missing or incorrect", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.values(localStorage).some((v) => v.includes("incorrect-test-key")),
    ),
  ).toBe(false);
  await noOverflow(page);
});
test("persisted run errors survive history refresh", async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("prospect_access", "synthetic-access"),
  );
  await page.route("**/api/status", (route) =>
    route.fulfill({
      json: {
        service: "Prospect",
        search: true,
        secure: true,
        storage: true,
        schedule: false,
        missing: [],
        testFixture: true,
      },
    }),
  );
  await page.route("**/api/leads", (route) =>
    route.fulfill({ json: { stored: true, leads: [], runs: [] } }),
  );
  await page.route("**/api/run", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "Synthetic persistence failure: refresh before retrying" },
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Find prospects", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Find prospects", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Synthetic persistence failure",
  );
});
test("custom controls, menu placement and focused workspace layout", async ({
  page,
}, info) => {
  await mockConfigured(page);
  await page.goto("/");
  const run = page.getByRole("button", { name: "Find prospects", exact: true });
  await expect(run).toBeEnabled();
  await expect(
    page.getByText("Gemini configured", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Connections" })).toHaveCount(0);
  const segment = page.getByRole("combobox", {
    name: "Business segment",
    exact: true,
  });
  await segment.click();
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-dropdown.png`,
    fullPage: true,
  });
  await page
    .getByRole("option", { name: "Home & lifestyle", exact: true })
    .click();
  await expect(segment).toContainText("Home & lifestyle");
  await segment.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(segment).toBeFocused();
  const trigger = await segment.boundingBox(),
    action = await run.boundingBox();
  if (info.project.name === "desktop")
    expect(action.x).toBeGreaterThan(trigger.x + trigger.width);
  await expect(
    page.getByRole("menuitem", { name: "Lock workspace" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Workspace menu", exact: true })
    .click();
  await expect(
    page.getByRole("menuitem", { name: "Lock workspace" }),
  ).toBeVisible();
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-account-menu.png`,
    fullPage: true,
  });
  await page.getByRole("menuitem", { name: "Workspace settings" }).click();
  const settings = page.getByRole("dialog", { name: "Workspace settings" });
  await expect(settings).toBeVisible();
  await expect(settings).toHaveCSS("opacity", "1");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(
    settings.getByRole("button", { name: "Lock workspace", exact: true }),
  ).toHaveCount(0);
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(a11y.violations).toEqual([]);
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-settings.png`,
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await expect(settings).not.toBeVisible();
  await noOverflow(page);
});
test("shared storage is only marked verified after the protected schema check", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("prospect_access", "synthetic-access"),
  );
  await page.route("**/api/status", (route) =>
    route.fulfill({
      json: {
        service: "Prospect",
        search: true,
        secure: true,
        storage: true,
        schedule: false,
        missing: [],
        testFixture: true,
      },
    }),
  );
  await page.route("**/api/leads", (route) =>
    route.fulfill({ json: { stored: true, leads: [], runs: [] } }),
  );
  let checks = 0;
  await page.route("**/api/storage", (route) => {
    checks++;
    return route.fulfill({
      json: { configured: true, verified: true, mode: "shared" },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Open workspace settings" }).click();
  const settings = page.getByRole("dialog", { name: "Workspace settings" });
  await expect(
    settings.getByText("Connection added", { exact: true }),
  ).toBeVisible();
  await settings.getByRole("button", { name: "Verify storage" }).click();
  await expect(settings.getByText("Verified", { exact: true })).toBeVisible();
  expect(checks).toBe(1);
});
test("unsaved reviews use an accessible in-app confirmation and preserve edits when canceled", async ({
  page,
}, info) => {
  await mockConfigured(page);
  await page.route("**/api/run", (route) => route.fulfill({ json: payload }));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Find prospects", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review Synthetic QA fixture" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Synthetic QA fixture" });
  await dialog
    .getByLabel("Private review notes")
    .fill("Unsaved synthetic review");
  await dialog.getByRole("button", { name: "Close prospect review" }).click();
  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toBeVisible();
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-discard-confirmation.png`,
    fullPage: false,
  });
  await confirm.getByRole("button", { name: "Keep editing" }).click();
  await expect(confirm).not.toBeVisible();
  await expect(dialog.getByLabel("Private review notes")).toHaveValue(
    "Unsaved synthetic review",
  );
  await dialog.getByRole("button", { name: "Close prospect review" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Discard changes" })
    .click();
  await expect(dialog).not.toBeVisible();
});

test("locking workspace ignores a late shared-storage refresh", async ({
  page,
}) => {
  await mockConfigured(page);
  await page.route("**/api/status", (route) =>
    route.fulfill({
      json: {
        service: "Prospect",
        search: true,
        secure: true,
        storage: true,
        schedule: false,
        missing: [],
      },
    }),
  );
  await page.route("**/api/leads", (route) =>
    route.fulfill({ json: { stored: true, leads: [fixture], runs: [] } }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Review Synthetic QA fixture" }),
  ).toBeVisible();
  let respond;
  let requested;
  const started = new Promise((resolve) => {
    requested = resolve;
  });
  await page.route("**/api/leads", async (route) => {
    requested();
    await new Promise((resolve) => {
      respond = resolve;
    });
    await route.fulfill({ json: { stored: true, leads: [fixture], runs: [] } });
  });
  await page.getByRole("tab", { name: "Run log" }).click();
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await started;
  const delivered = page.waitForResponse("**/api/leads");
  try {
    await page.getByRole("button", { name: "Workspace menu" }).click();
    await page.getByRole("menuitem", { name: "Lock workspace" }).click();
  } finally {
    respond();
  }
  await (await delivered).finished();
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.getByRole("tab", { name: /Shortlist/ }).click();
  await expect(
    page.getByRole("button", { name: "Review Synthetic QA fixture" }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => sessionStorage.getItem("prospect_access")),
  ).toBeNull();
});
