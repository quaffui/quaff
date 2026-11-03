import { expect } from "vitest";
import { settleAnimations } from "../support/animations.js";
import { createComponentTest } from "../support/browserTest.js";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "notify/OverlayFixture.svelte",
  stylesheets: ["base", "components/snackbar", "components/button", "components/dialog"],
  readySelector: "#outside",
});

async function showNotification(page: Page, message = "Saved") {
  await page.evaluate((message) => {
    (window.fixture.showNotification as (message: string) => void)(message);
  }, message);
  await page.locator(".q-snackbar").waitFor();
  await settleAnimations(page.locator(".q-snackbar-positioner"));
}

async function changeDialog(page: Page, operation: "open" | "close" | "remove", id: string) {
  await page.evaluate(
    ({ operation, id }) => {
      const operationName = `${operation}Dialog`;
      (window.fixture[operationName] as (id: string) => void)(id);
    },
    { operation, id }
  );
  await page.evaluate(() => new Promise(requestAnimationFrame));
}

async function expectActionReachable(page: Page) {
  const action = page.locator(".q-snackbar__action");
  const isReachable = await action.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);

    return element.contains(hit);
  });
  expect(isReachable).toBe(true);
}

async function readMessage(page: Page) {
  return page.locator(".q-snackbar__message").textContent();
}

it("keeps notification actions visible and clickable inside a native modal", async ({
  page,
  openFixture,
  pageErrors,
}) => {
  await openFixture();
  await changeDialog(page, "open", "early");
  await showNotification(page);
  await expectActionReachable(page);
  await page.locator(".q-snackbar__action").click();
  await expect.poll(() => page.locator("#actions").textContent()).toBe("1");
  await expect.poll(() => page.locator(".q-snackbar").count()).toBe(0);
  expect(
    await page.locator("#early-input").evaluate((element) => element === document.activeElement)
  ).toBe(true);
  expect(pageErrors).toEqual([]);
});

it("preserves one notification queue when native dialogs open, close and detach", async ({
  page,
  openFixture,
  pageErrors,
}) => {
  await openFixture();
  await showNotification(page, "First");
  await showNotification(page, "Second");
  await changeDialog(page, "open", "late");
  await expectActionReachable(page);
  expect(await readMessage(page)).toBe("First");
  await changeDialog(page, "close", "late");
  await expectActionReachable(page);
  await changeDialog(page, "open", "early");
  await changeDialog(page, "remove", "early");
  await expectActionReachable(page);
  await page.locator(".q-snackbar__action").click();
  await expect.poll(() => readMessage(page)).toBe("Second");
  expect(await page.locator(".q-snackbar").count()).toBe(1);
  await page.locator(".q-snackbar__action").click();
  await expect.poll(() => page.locator("#hidden").textContent()).toBe("2");
  expect(await page.locator("#actions").textContent()).toBe("2");
  expect(pageErrors).toEqual([]);
});

it("follows modal opening order rather than DOM order after focus is blurred", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await showNotification(page);
  await changeDialog(page, "open", "late");
  await changeDialog(page, "open", "early");
  await page.locator("#early-input").evaluate((input) => (input as HTMLElement).blur());
  await expectActionReachable(page);
  await changeDialog(page, "open", "nested");
  await page.locator("#nested-input").evaluate((input) => (input as HTMLElement).blur());
  await expectActionReachable(page);
  await changeDialog(page, "close", "nested");
  await expectActionReachable(page);
  await changeDialog(page, "close", "early");
  await expectActionReachable(page);
  await page.locator(".q-snackbar__action").click();
  expect(await page.locator("#actions").textContent()).toBe("1");
});

it("keeps notifications above Quaff's transformed modal without moving or closing it", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await page.locator("#open-quaff").click();
  await settleAnimations(page.locator("#quaff-dialog"));
  const before = await page.locator("#quaff-dialog").boundingBox();
  await showNotification(page);
  await expectActionReachable(page);
  await page.locator(".q-snackbar__action").click();
  expect(
    await page.locator("#quaff-dialog").evaluate((dialog) => (dialog as HTMLDialogElement).open)
  ).toBe(true);
  expect(await page.locator("#quaff-dialog").boundingBox()).toEqual(before);
});

it("does not emit notifications during SSR and mounts them after hydration", async ({
  page,
  openFixture,
  pageErrors,
}) => {
  await openFixture("ssr&notify-on-render");
  expect(await page.locator(".q-snackbar").count()).toBe(0);
  await page.evaluate(() => window.hydrateFixture());
  await page.locator(".q-snackbar").waitFor();
  await expectActionReachable(page);
  expect(await readMessage(page)).toBe("Hydrated notification");
  expect(pageErrors).toEqual([]);
});

it("finds the actual top modal when the first notification starts after focus is blurred", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await changeDialog(page, "open", "late");
  await changeDialog(page, "open", "early");
  await page.locator("#early-input").evaluate((input) => (input as HTMLElement).blur());
  await showNotification(page);
  await expectActionReachable(page);
  await page.locator(".q-snackbar__action").click();
  expect(await page.locator("#actions").textContent()).toBe("1");
});

it("keeps actions above a native modal closed and reopened in the same task", async ({
  page,
  openFixture,
  pageErrors,
}) => {
  await openFixture();
  await changeDialog(page, "open", "early");
  await showNotification(page);
  await expectActionReachable(page);
  await page.locator("#early").evaluate((dialog: HTMLDialogElement) => {
    dialog.close();
    dialog.showModal();
  });
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expectActionReachable(page);
  await page.locator(".q-snackbar__action").click();
  expect(await page.locator("#actions").textContent()).toBe("1");
  expect(pageErrors).toEqual([]);
});

it("preserves native focus behavior when an unrelated modeless dialog opens", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await changeDialog(page, "open", "early");
  await showNotification(page);
  const action = page.locator(".q-snackbar__action");
  await action.focus();
  const nativeFocus = await page.evaluateHandle(() => {
    document.querySelector<HTMLDialogElement>("#late")!.show();

    return document.activeElement;
  });
  await page.evaluate(() => new Promise(requestAnimationFrame));
  expect(await nativeFocus.evaluate((element) => document.activeElement === element)).toBe(true);
  await nativeFocus.dispose();
  await expectActionReachable(page);
});

it("escapes messages and clears active and queued notifications without reviving the portal", async ({
  page,
  openFixture,
  pageErrors,
}) => {
  await openFixture();
  await showNotification(page, '<img src="invalid" onerror="alert(1)">');
  await showNotification(page, "Queued");
  expect(await readMessage(page)).toBe('<img src="invalid" onerror="alert(1)">');
  expect(await page.locator(".q-snackbar img").count()).toBe(0);
  await page.evaluate(() => (window.fixture.clearNotifications as () => void)());
  await expect.poll(() => page.locator(".q-snackbar").count()).toBe(0);
  expect(await page.locator("[data-quaff-notify-host]").count()).toBe(0);
  await changeDialog(page, "open", "early");
  await changeDialog(page, "close", "early");
  expect(await page.locator("[data-quaff-notify-host]").count()).toBe(0);
  await showNotification(page, "Later");
  expect(await readMessage(page)).toBe("Later");
  expect(await page.locator("[data-quaff-notify-host]").count()).toBe(1);
  await expectActionReachable(page);
  expect(pageErrors).toEqual([]);
});

it("preserves dialog focus during portal moves and restores it after Escape dismissal", async ({
  page,
  openFixture,
  pageErrors,
}) => {
  await openFixture();
  await page.locator("#outside").focus();
  await showNotification(page);
  await changeDialog(page, "open", "early");
  expect(
    await page.locator("#early-input").evaluate((input) => document.activeElement === input)
  ).toBe(true);
  await page.locator(".q-snackbar__action").focus();
  await page.keyboard.press("Escape");
  await expect.poll(() => page.locator(".q-snackbar").count()).toBe(0);
  expect(
    await page.locator("#early-input").evaluate((input) => document.activeElement === input)
  ).toBe(true);
  expect(
    await page.locator("#early").evaluate((dialog) => (dialog as HTMLDialogElement).open)
  ).toBe(true);
  await showNotification(page);
  await page.locator(".q-snackbar__action").focus();
  await changeDialog(page, "close", "early");
  expect(await page.locator("#outside").evaluate((input) => document.activeElement === input)).toBe(
    true
  );
  await expectActionReachable(page);
  expect(pageErrors).toEqual([]);
});

it("preserves scrolling in a tall Quaff modal while showing a notification", async ({
  page,
  openFixture,
}) => {
  await openFixture("tall");
  await page.locator("#open-quaff").click();
  await settleAnimations(page.locator("#quaff-dialog"));
  const before = await page.locator("#quaff-dialog").evaluate((dialog) => {
    dialog.scrollTop = 300;

    return { overflow: getComputedStyle(dialog).overflowY, scrollTop: dialog.scrollTop };
  });
  expect(before.scrollTop).toBe(300);
  await showNotification(page);
  await expectActionReachable(page);
  const after = await page.locator("#quaff-dialog").evaluate((dialog) => ({
    overflow: getComputedStyle(dialog).overflowY,
    scrollTop: dialog.scrollTop,
  }));
  expect(after).toEqual(before);
  await page.locator(".q-snackbar__action").click();
  expect(
    await page.locator("#quaff-dialog").evaluate((dialog) => (dialog as HTMLDialogElement).open)
  ).toBe(true);
});

it("moves an existing notification into a Quaff modal when it opens", async ({
  page,
  openFixture,
  pageErrors,
}) => {
  await openFixture();
  await showNotification(page, "First");
  await page.locator("#open-quaff").click();
  await settleAnimations(page.locator("#quaff-dialog"));
  await expect
    .poll(() =>
      page.locator("[data-quaff-notify-host]").evaluate((host) => host.closest("dialog")?.id)
    )
    .toBe("quaff-dialog");
  await expectActionReachable(page);
  await page.locator(".q-snackbar__action").click();
  expect(await page.locator("#actions").textContent()).toBe("1");
  expect(pageErrors).toEqual([]);
});

it("preserves the queue when a Quaff modal unmounts", async ({ page, openFixture, pageErrors }) => {
  await openFixture();
  await page.locator("#open-quaff").click();
  await settleAnimations(page.locator("#quaff-dialog"));
  await showNotification(page, "First");
  await showNotification(page, "Second");
  expect(
    await page.locator("[data-quaff-notify-host]").evaluate((host) => host.closest("dialog")?.id)
  ).toBe("quaff-dialog");
  await expectActionReachable(page);
  await page.locator("#remove-quaff").click();
  expect(await page.locator("#quaff-dialog").count()).toBe(0);
  await expect.poll(() => page.locator("[data-quaff-notify-host]").count()).toBe(1);
  await expectActionReachable(page);
  expect(await readMessage(page)).toBe("First");
  await page.locator(".q-snackbar__action").click();
  await expect.poll(() => readMessage(page)).toBe("Second");
  await expectActionReachable(page);
  await page.locator(".q-snackbar__action").click();
  await expect.poll(() => page.locator("#hidden").textContent()).toBe("2");
  expect(await page.locator("#actions").textContent()).toBe("2");
  expect(pageErrors).toEqual([]);
});

it("preserves standalone snackbar viewport positioning", async ({ page, openFixture }) => {
  await openFixture("standalone");
  await settleAnimations(page.locator(".q-snackbar-positioner"));
  expect(
    await page
      .locator(".q-snackbar-positioner")
      .evaluate((element) => getComputedStyle(element).position)
  ).toBe("fixed");
  const snackbar = await page.locator(".q-snackbar").boundingBox();
  expect(snackbar!.y + snackbar!.height).toBeGreaterThan(page.viewportSize()!.height - 40);
  expect(snackbar!.y + snackbar!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  expect(await page.locator("[data-quaff-notify-host]").count()).toBe(0);
});
