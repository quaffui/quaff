import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "color-picker/InteractionFixture.svelte",
  stylesheets: ["components/color-picker"],
  readySelector: "#color",
  pageOptions: { viewport: { width: 900, height: 1000 } },
});

async function readSavedValue(page: Page) {
  return JSON.parse((await page.locator("#value").textContent())!);
}

async function commit(page: Page, text: string) {
  await page.locator("#color").fill(text);
  await page.locator("#color").press("Enter");
}

async function expectColor(page: Page, display: string, saved: string | null) {
  await expect.poll(() => page.locator("#color").inputValue()).toBe(display);
  await expect.poll(() => readSavedValue(page)).toBe(saved);
  expect(await page.locator("#color").getAttribute("aria-invalid")).toBeNull();
  expect(
    await page.locator("#color").evaluate((el) => (el as HTMLInputElement).validity.valid)
  ).toBe(true);
}

it.for(["true", "false"])(
  "keeps masked RGB commits editable with fillMask=%s",
  async (fill, { page, openFixture }) => {
    await openFixture({ fill });
    await commit(page, "#6750A4");
    await expectColor(page, "#6750A4", "rgb(103, 80, 164)");
    await commit(page, "#112233");
    await expectColor(page, "#112233", "rgb(17, 34, 51)");
  }
);

it("formats initial and external RGB values as masked HEX", async ({ page, openFixture }) => {
  await openFixture({ value: "rgb(103, 80, 164)" });
  await expectColor(page, "#6750A4", "rgb(103, 80, 164)");
  await page.locator("#update").click();
  await expectColor(page, "#112233", "rgb(17, 34, 51)");
});

it("formats popup Apply as HEX and preserves opacity during a later six-slot edit", async ({
  page,
  openFixture,
}) => {
  await openFixture({ value: "rgba(103, 80, 164, 0.25)", alpha: "true" });
  await page.getByRole("button", { name: "Choose color" }).click();
  const popup = page.getByRole("dialog");
  await popup.getByRole("button", { name: "HEX", exact: true }).click();
  await popup.getByRole("textbox", { name: "HEX", exact: true }).fill("#11223380");
  await popup.getByRole("button", { name: "Apply", exact: true }).click();
  await popup.waitFor({ state: "detached" });
  await expectColor(page, "#112233", "rgba(17, 34, 51, 0.502)");
  await commit(page, "#445566");
  await expectColor(page, "#445566", "rgba(68, 85, 102, 0.502)");
});

it.for(["rgb", "hex"])(
  "preserves alpha in six-slot edits with %s output",
  async (format, { page, openFixture }) => {
    await openFixture({ value: "rgba(103, 80, 164, 0.25)", alpha: "true", format });
    await commit(page, "#112233");
    await expectColor(page, "#112233", format === "rgb" ? "rgba(17, 34, 51, 0.25)" : "#11223340");
  }
);

it("edits opacity using all eight HEX positions", async ({ page, openFixture }) => {
  await openFixture({ mask: "8", alpha: "true", value: "rgba(17, 34, 51, 0.25)" });
  await expectColor(page, "#11223340", "rgba(17, 34, 51, 0.25)");
  await commit(page, "#44556680");
  await expectColor(page, "#44556680", "rgba(68, 85, 102, 0.502)");
});

it.for([
  ["6", "#ABC___"],
  ["6", "#ABCD__"],
  ["6", "#A_CDEF"],
  ["8", "#ABC_____"],
  ["8", "#ABCDEF__"],
  ["8", "#ABCD_EF0"],
])(
  "rejects incomplete %s-slot input %s without updating the model",
  async ([mask, input], { page, openFixture }) => {
    await openFixture({ mask, alpha: "true", value: "rgba(17, 34, 51, 0.25)" });
    await commit(page, input);
    expect(await readSavedValue(page)).toBe("rgba(17, 34, 51, 0.25)");
    expect(await page.locator("#color").inputValue()).toBe(input);
    expect(await page.locator("#color").getAttribute("aria-invalid")).toBe("true");
    expect(
      await page.locator("#color").evaluate((el) => (el as HTMLInputElement).validity.valid)
    ).toBe(false);
  }
);

it("clears filled masks to null", async ({ page, openFixture }) => {
  await openFixture({ value: "rgb(17, 34, 51)" });
  await commit(page, "");
  await expectColor(page, "#______", null);
});

it("recovers from invalid input when the next commit equals the saved value", async ({
  page,
  openFixture,
}) => {
  await openFixture({ value: "rgb(17, 34, 51)" });
  await commit(page, "#GGGGGG");
  expect(await page.locator("#color").getAttribute("aria-invalid")).toBe("true");
  await commit(page, "#112233");
  await expectColor(page, "#112233", "rgb(17, 34, 51)");
});

it("continues displaying and accepting RGB with no mask", async ({ page, openFixture }) => {
  await openFixture({ mask: "none", value: "rgb(17, 34, 51)" });
  await expectColor(page, "rgb(17, 34, 51)", "rgb(17, 34, 51)");
  await commit(page, "rgb(68, 85, 102)");
  await expectColor(page, "rgb(68, 85, 102)", "rgb(68, 85, 102)");
});
