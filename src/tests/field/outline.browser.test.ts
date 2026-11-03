import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest.js";
import { settleAnimations } from "../support/animations.js";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "field/OutlineFixture.svelte",
  stylesheets: [
    "base",
    "shared/field",
    "components/select",
    "components/icon",
    "components/menu",
    "components/list",
  ],
  hasIconFont: true,
  pageOptions: { deviceScaleFactor: 1.25, viewport: { width: 700, height: 500 } },
  readySelector: ".q-field__input",
  onOpen: (page) => settleAnimations(page.locator(".q-field__wrapper")),
});

/** Reads the painted stroke, including antialiasing, on either side of its former join. */
async function measureTopStrokeVariation(page: Page) {
  const wrapper = (await page.locator(".q-field__wrapper").boundingBox())!;
  const png = (await page.screenshot()).toString("base64");

  return page.evaluate(
    async ({ wrapper, png }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const scale = window.devicePixelRatio;
      const edge = wrapper.x + wrapper.width;
      const startX = Math.ceil((edge - 48) * scale);
      const endX = Math.floor((edge - 8) * scale);
      const startY = Math.floor(wrapper.y * scale) - 2;
      let variation = 0;

      for (let y = startY; y < startY + Math.ceil(6 * scale); y++) {
        let lightest = 255;
        let darkest = 0;

        for (let x = startX; x < endX; x++) {
          const red = pixels[(y * canvas.width + x) * 4];
          lightest = Math.min(lightest, red);
          darkest = Math.max(darkest, red);
        }

        variation = Math.max(variation, darkest - lightest);
      }

      return variation;
    },
    { wrapper, png }
  );
}

it.for(["", "select"])(
  "paints a uniform outlined top edge at fractional device coordinates (%s)",
  async (component, { page, openFixture, pageErrors }) => {
    await openFixture(component);
    expect(await measureTopStrokeVariation(page)).toBeLessThanOrEqual(8);
    await page.locator(".q-field__input").focus();
    await settleAnimations(page.locator(".q-field__wrapper"));
    expect(await measureTopStrokeVariation(page)).toBeLessThanOrEqual(8);
    expect(pageErrors).toEqual([]);
  }
);

/** Reads the visible top edge away from the label notch and rounded corners. */
async function measurePaintedTop(page: Page) {
  const wrapper = await page.locator(".q-field__wrapper").evaluate((element) => {
    const { x, y, width } = element.getBoundingClientRect();

    return { x, y, width, isRtl: getComputedStyle(element).direction === "rtl" };
  });
  const png = (await page.screenshot()).toString("base64");

  return page.evaluate(
    async ({ wrapper, png }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const scale = window.devicePixelRatio;
      const sampleX = wrapper.isRtl ? wrapper.x + 40 : wrapper.x + wrapper.width - 40;
      const x = Math.round(sampleX * scale);
      const startY = Math.floor((wrapper.y - 4) * scale);
      const endY = Math.ceil((wrapper.y + 6) * scale);

      for (let y = startY; y < endY; y++) {
        if (pixels[(y * canvas.width + x) * 4] < 200) {
          return y;
        }
      }

      throw new Error("The field's top border was not painted");
    },
    { wrapper, png }
  );
}

it.for([
  "outlined",
  "outlined&select",
  "outlined&dense&rtl",
  "outlined&select&no-label",
  "rounded",
  "rounded&select",
  "rounded&dense&rtl",
  "rounded&select&no-label",
])(
  "keeps the focused outline inside its resting bounds (%s)",
  async (query, { page, openFixture }) => {
    await openFixture(`variant=${query}`);
    const before = await page.locator(".q-field__wrapper").boundingBox();
    const paintedTop = await measurePaintedTop(page);
    await page.locator(".q-field__input").focus();
    await settleAnimations(page.locator(".q-field__wrapper"));
    expect(await page.locator(".q-field__wrapper").boundingBox()).toEqual(before);
    expect(await measurePaintedTop(page)).toBe(paintedTop);
  }
);

/** Checks the actual painted border leaves clearance before the floating label. */
async function measureNotchClearance(page: Page) {
  const geometry = await page.locator(".q-field__wrapper").evaluate((wrapper) => {
    const label = wrapper.querySelector(".q-field__label-text")!.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const isRtl = getComputedStyle(wrapper).direction === "rtl";

    return {
      start: isRtl ? label.right : label.left,
      direction: isRtl ? 1 : -1,
      top: wrapperRect.top,
    };
  });
  const png = (await page.screenshot()).toString("base64");

  return page.evaluate(
    async ({ geometry, png }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${png}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const scale = window.devicePixelRatio;
      const y = Math.round((geometry.top + 1) * scale);
      let darkest = 0;

      for (const distance of [1.5, 2, 2.5]) {
        const x = Math.round((geometry.start + geometry.direction * distance) * scale);
        darkest = Math.max(darkest, 255 - pixels[(y * canvas.width + x) * 4]);
      }

      return darkest;
    },
    { geometry, png }
  );
}

it.for([
  "outlined",
  "outlined&rtl&select",
  "outlined&dense&select",
  "outlined&dense&rtl",
  "rounded",
  "rounded&rtl&select",
  "rounded&dense&select",
  "rounded&dense&rtl",
])("keeps the focused notch clear of its label (%s)", async (query, { page, openFixture }) => {
  await openFixture(`variant=${query}`);
  const label = page.locator(".q-field__label-text");
  const before = (await label.boundingBox())!;
  await page.locator(".q-field__input").focus();
  await settleAnimations(page.locator(".q-field__wrapper"));
  expect(await measureNotchClearance(page)).toBeLessThanOrEqual(35);
  const after = (await label.boundingBox())!;
  expect(after.x).toBeCloseTo(before.x, 1);
  expect(after.y).toBeCloseTo(before.y, 1);
});

it.for(["", "select"])(
  "preserves native naming and keyboard interaction (%s)",
  async (component, { page, openFixture, pageErrors }) => {
    await openFixture(component);
    const role = component ? "combobox" : "textbox";
    const input = page.getByRole(role, {
      name: "Delivery address for your next order",
      exact: true,
    });
    expect(await input.count()).toBe(1);
    expect(await page.getByRole("group").count()).toBe(0);
    await input.focus();

    if (component) {
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      expect(await input.inputValue()).toBe("Office");
      expect(await input.getAttribute("aria-expanded")).toBe("false");
    } else {
      await input.fill("Office");
      expect(await input.inputValue()).toBe("Office");
    }

    expect(pageErrors).toEqual([]);
  }
);

it.for(["default", "filled"])(
  "preserves underline colors and error semantics for %s fields",
  async (variant, { page, openFixture }) => {
    await openFixture(`variant=${variant}`);
    await page.locator(".q-field").evaluate((field) => {
      field.style.setProperty("--outline", "rgb(90, 100, 110)");
      field.style.setProperty("--primary", "rgb(20, 80, 160)");
      field.style.setProperty("--error", "rgb(160, 30, 40)");
    });
    const wrapper = page.locator(".q-field__wrapper");
    expect(await wrapper.evaluate((element) => getComputedStyle(element).boxShadow)).toContain(
      "rgb(90, 100, 110)"
    );
    await page.locator(".q-field__input").focus();
    expect(await wrapper.evaluate((element) => getComputedStyle(element).boxShadow)).toContain(
      "rgb(20, 80, 160)"
    );
    expect(await page.locator("fieldset").count()).toBe(0);
    await openFixture(`variant=${variant}&error`);
    expect(await page.locator(".q-field__input").getAttribute("aria-invalid")).toBe("true");
  }
);

it.for(["", "select"])(
  "keeps decorative outlines out of native form controls (%s)",
  async (component, { page, openFixture }) => {
    await openFixture(`form&${component}`);
    const readForm = () =>
      page.locator("form").evaluate((form: HTMLFormElement) => ({
        elements: Array.from(form.elements).map((element) => element.tagName),
        entries: Array.from(new FormData(form).entries()),
        isValid: form.checkValidity(),
      }));
    const initial = await readForm();
    expect(initial.elements).toEqual(["INPUT"]);
    expect(initial.entries).toEqual(component ? [] : [["address", "Home"]]);
    expect(initial.isValid).toBe(true);

    if (!component) {
      await page.locator(".q-field__input").fill("");
      const empty = await readForm();
      expect(empty.entries).toEqual([["address", ""]]);
      expect(empty.isValid).toBe(false);
    }
  }
);
