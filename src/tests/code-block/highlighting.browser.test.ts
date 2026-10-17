import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Route } from "playwright";

const HIGHLIGHTING_ENGINE_URL_PATTERN = /\/wasm[-./]/;

const it = createComponentTest({
  component: "code-block/HighlightingFixture.svelte",
  stylesheets: ["index"],
  readySelector: "#example .q-docs-section__actions button",
  pageOptions: { permissions: ["clipboard-read", "clipboard-write"] },
});

function filterHighlightingEngineRequests(requestedUrls: string[]) {
  return requestedUrls.filter((url) => HIGHLIGHTING_ENGINE_URL_PATTERN.test(url));
}

it.beforeEach(async ({ page, openFixture, requestedUrls }) => {
  await openFixture();
  await page.waitForLoadState("networkidle");
  expect(await page.locator(".q-code-block").count()).toBe(0);
  expect(filterHighlightingEngineRequests(requestedUrls)).toEqual([]);
});

it.afterEach(({ pageErrors }) => {
  expect(pageErrors).toEqual([]);
});

it("highlights example source only when opened and supports reopening", async ({
  page,
  requestedUrls,
}) => {
  const sourceTrigger = page.locator("#example .q-docs-section__actions button");
  const dialog = page.getByRole("dialog");
  await sourceTrigger.click();
  await dialog.locator(".shiki").waitFor();
  expect(await dialog.locator("code").textContent()).toBe('<QBtn label="Example" />');
  expect(filterHighlightingEngineRequests(requestedUrls).length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await page.getByRole("button", { name: "Copied!", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  const isSourceTriggerFocused = await sourceTrigger.evaluate(
    (element) => element === document.activeElement
  );
  expect(isSourceTriggerFocused).toBe(true);
  await sourceTrigger.click();
  await dialog.locator(".shiki").waitFor();
});

it("preserves type tooltip focus during highlighting and cleans up on tab changes", async ({
  page,
  requestedUrls,
}) => {
  let highlightingEngineRoute: Route | undefined;
  await page.route(HIGHLIGHTING_ENGINE_URL_PATTERN, (route) => {
    highlightingEngineRoute = route;
  });

  const typeTrigger = page.locator('[data-type-name="Size"]');
  await typeTrigger.focus();
  const tooltip = page.getByRole("tooltip");
  const code = tooltip.locator("code");
  await code.waitFor();
  await page.keyboard.press("Tab");
  const focusedCode = await code.elementHandle();
  const isFallbackCodeFocused = await focusedCode!.evaluate(
    (element) => element === document.activeElement
  );
  expect(isFallbackCodeFocused).toBe(true);
  await expect.poll(() => highlightingEngineRoute).toBeDefined();
  await highlightingEngineRoute!.continue();
  await tooltip.locator(".shiki").waitFor();
  const hasPreservedFocus = await focusedCode!.evaluate(
    (element) => element === document.activeElement
  );
  expect(hasPreservedFocus).toBe(true);
  expect(await code.evaluate((element) => getComputedStyle(element).padding)).toBe("0px");
  expect(await tooltip.locator("code").textContent()).toBe('type Size = "small" | "large";');
  expect(filterHighlightingEngineRequests(requestedUrls).length).toBeGreaterThan(0);
  const initialThemeClass = await tooltip.locator("pre").getAttribute("class");

  // Keep keyboard focus in the code while changing the theme.
  await page
    .getByRole("button", { name: "Toggle theme" })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await expect.poll(() => tooltip.locator("pre").getAttribute("class")).not.toBe(initialThemeClass);
  const hasPreservedThemeFocus = await focusedCode!.evaluate(
    (element) => element === document.activeElement
  );
  expect(hasPreservedThemeFocus).toBe(true);
  await page.getByRole("tab", { name: "Methods" }).click();
  await tooltip.waitFor({ state: "detached" });
  expect(await page.locator(".q-code-block").count()).toBe(0);
  await page.getByRole("tab", { name: "Props" }).click();
  await typeTrigger.hover();
  await tooltip.locator(".shiki").waitFor();
  expect(await page.getByRole("tooltip").count()).toBe(1);
  await code.focus();
  await page.keyboard.press("Escape");
  await tooltip.waitFor({ state: "detached" });
  const isTypeTriggerFocused = await typeTrigger.evaluate(
    (element) => element === document.activeElement
  );
  expect(isTypeTriggerFocused).toBe(true);
});
