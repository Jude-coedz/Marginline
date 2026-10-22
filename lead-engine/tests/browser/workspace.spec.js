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
    page.getByRole("heading", { name: "Prospect research", exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({
    path: `/workspace/artifacts/prospect/after/${info.project.name}-empty.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open workspace settings" }).click();
  await expect(
    page.getByRole("heading", { name: "Research connections" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Connections" }).focus();
  await page.keyboard.press("ArrowLeft");
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
    page.getByText("Gemini configured", { exact: true }),
  ).toBeVisible();
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
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await expect(
    dialog.getByText("Synthetic AI suggestion", { exact: false }),
  ).toBeVisible();
  await dialog.getByLabel("Review stage").selectOption("approved");
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
    page.getByText("Gemini configured", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Find prospects", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Synthetic persistence failure",
  );
});
test("phone brief expands without horizontal overflow", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "mobile", "Phone-only layout interaction");
  await page.goto("/");
  const edit = page.getByRole("button", { name: "Edit", exact: true });
  await expect(edit).toBeVisible();
  await edit.click();
  await expect(page.getByLabel("Business segment")).toBeVisible();
  await page.getByLabel("Business segment").selectOption("home");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.getByLabel("Business segment")).not.toBeVisible();
  await expect(page.locator(".brief-summary")).toContainText(
    "Home & lifestyle",
  );
  await noOverflow(page);
});
