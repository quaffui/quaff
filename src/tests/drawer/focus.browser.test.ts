import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "drawer/FocusFixture.svelte",
  stylesheets: [
    "base",
    "components/layout",
    "components/drawer",
    "components/dialog",
    "components/menu",
    "components/railbar",
  ],
  readySelector: "#open-drawer",
  pageOptions: { viewport: { width: 900, height: 600 } },
});

function readFocusedId(page: Page) {
  return page.evaluate(() => document.activeElement?.id);
}

async function openDrawer(page: Page) {
  await page.locator("#open-drawer").click();
  await expect.poll(() => readFocusedId(page)).toBe("open-dialog");
}

it.for([
  { scrollContainer: "#drawer", scrollTop: 0 },
  { scrollContainer: "#drawer", scrollTop: 400 },
  { scrollContainer: "#drawer-list", scrollTop: 400 },
])(
  "focuses an overlay without scrolling its layout ($scrollContainer scroll: $scrollTop)",
  async ({ scrollContainer, scrollTop }, { page, openFixture }) => {
    await openFixture("", { path: "drawer/LayoutFocusFixture.svelte" });
    const layout = page.locator("#layout");
    const drawer = page.locator("#drawer");
    await expect
      .poll(() => drawer.evaluate((element) => getComputedStyle(element).transitionProperty))
      .toContain("transform");

    const scroller = page.locator(scrollContainer);
    await scroller.evaluate((element, scrollTop) => (element.scrollTop = scrollTop), scrollTop);
    expect(await scroller.evaluate((element) => element.scrollTop)).toBe(scrollTop);

    await layout.evaluate((element) => {
      element.addEventListener("focusin", (event) => {
        if ((event.target as HTMLElement).closest("#drawer")) {
          element.dataset.scrollLeftAtFocus = String(element.scrollLeft);
        }
      });
    });
    await page.locator("#open-drawer").click();
    await expect.poll(() => readFocusedId(page)).toBe("drawer-action");
    expect(await layout.getAttribute("data-scroll-left-at-focus")).toBe("0");

    const bounds = await page.locator("#drawer-list").evaluate((element) => ({
      control: document.activeElement!.getBoundingClientRect().toJSON(),
      list: element.getBoundingClientRect().toJSON(),
      drawer: element.closest("#drawer")!.getBoundingClientRect().toJSON(),
    }));
    expect(bounds.control.top).toBeGreaterThanOrEqual(Math.max(bounds.list.top, bounds.drawer.top));
    expect(bounds.control.bottom).toBeLessThanOrEqual(
      Math.min(bounds.list.bottom, bounds.drawer.bottom)
    );
  }
);

it.for([false, true])(
  "contains focus and restores the opener, with a standard rail present: %s",
  async (rail, { page, openFixture }) => {
    await openFixture(rail ? "rail" : "");
    await openDrawer(page);
    expect(await page.locator("#drawer").getAttribute("aria-modal")).toBe("true");
    await page.keyboard.press("Shift+Tab");
    await expect.poll(() => readFocusedId(page)).toBe("close-drawer");
    await page.keyboard.press("Tab");
    await expect.poll(() => readFocusedId(page)).toBe("open-dialog");
    await page.locator("#outside").focus();
    await expect.poll(() => readFocusedId(page)).toBe("open-dialog");
    await page.keyboard.press("Escape");
    await expect.poll(() => readFocusedId(page)).toBe("open-drawer");
    expect(await page.locator("#drawer").getAttribute("aria-modal")).toBeNull();
  }
);

it.for(["", "modal"])(
  "defers focus and Escape to a dialog with modal=%s",
  async (query, { page, openFixture }) => {
    await openFixture(query);
    await openDrawer(page);
    await page.locator("#open-dialog").click();
    await page.locator("#dialog-action").waitFor();
    await page.locator("#dialog-action").focus();
    await expect.poll(() => readFocusedId(page)).toBe("dialog-action");
    await page.keyboard.press("Escape");
    await expect.poll(() => page.locator("#dialog").getAttribute("open")).toBeNull();
    expect(await page.locator("#drawer").getAttribute("aria-modal")).toBe("true");
    await expect.poll(() => readFocusedId(page)).toBe("open-dialog");
    await page.keyboard.press("Escape");
    await expect.poll(() => readFocusedId(page)).toBe("open-drawer");
  }
);

it("recovers focus after a control is blurred to the body", async ({ page, openFixture }) => {
  await openFixture();
  await openDrawer(page);
  await page.locator("#open-dialog").evaluate((element) => (element as HTMLElement).blur());
  await expect.poll(() => readFocusedId(page)).toBe("open-dialog");
});

it("allows portalled menu focus and recovers it when Escape removes the menu", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await openDrawer(page);
  await page.locator("#open-menu").click();
  const action = page.locator("#menu-action");
  await action.focus();
  await expect.poll(() => readFocusedId(page)).toBe("menu-action");
  expect(await action.evaluate((element) => !!element.closest("#drawer"))).toBe(false);
  await page.keyboard.press("Escape");
  await action.waitFor({ state: "detached" });
  await expect.poll(() => readFocusedId(page)).toBe("open-dialog");
  expect(await page.locator("#drawer").getAttribute("aria-modal")).toBe("true");
});
