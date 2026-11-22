import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest.js";

const it = createComponentTest({
  component: "list/MenuActionFixture.svelte",
  stylesheets: ["base", "components/icon", "components/list", "components/menu"],
  readySelector: "main button",
  hasIconFont: true,
});

const MENU_CASES = [
  { variant: "standard", direction: "ltr", gutter: 0, padding: 12, gap: 16 },
  { variant: "standard", direction: "rtl", gutter: 0, padding: 12, gap: 16 },
  { variant: "expressive", direction: "ltr", gutter: 2, padding: 16, gap: 12 },
  { variant: "expressive", direction: "rtl", gutter: 2, padding: 16, gap: 12 },
];

it.for(MENU_CASES)(
  "fills a menu row with its sole action ($variant, $direction)",
  async (options, { page, openFixture }) => {
    const { variant, direction, gutter, padding } = options;
    await openFixture(`${variant}&${direction}`);
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("menu");
    const action = menu.getByRole("button", { name: "Action", exact: true });
    await action.hover();

    const layout = await action.evaluate((section) => {
      const bounds = section.getBoundingClientRect();
      const row = section.parentElement!.getBoundingClientRect();
      const menu = section.closest(".q-menu")!.getBoundingClientRect();
      const style = getComputedStyle(section);

      return {
        horizontalInsets: [bounds.left - menu.left, menu.right - bounds.right],
        verticalInsets: [bounds.top - row.top, row.bottom - bounds.bottom],
        sectionPadding: [style.paddingInlineStart, style.paddingInlineEnd],
        direction: style.direction,
        hoverOpacity: getComputedStyle(section, "::after").opacity,
      };
    });

    expect(layout).toEqual({
      horizontalInsets: [gutter, gutter],
      verticalInsets: [0, 0],
      sectionPadding: ["16px", "24px"],
      direction,
      hoverOpacity: "0.08",
    });
    const ordinaryPadding = await menu.locator("#ordinary-item").evaluate((row) => {
      const style = getComputedStyle(row);

      return [style.paddingInlineStart, style.paddingInlineEnd];
    });
    expect(ordinaryPadding).toEqual([`${padding}px`, `${padding}px`]);
  }
);

it.for(MENU_CASES)(
  "aligns the leading action beside a separate settings action ($variant, $direction)",
  async ({ variant, direction, gutter, padding, gap }, { page, openFixture }) => {
    await openFixture(`${variant}&${direction}`);
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("menu");
    const locale = menu.getByRole("menuitemradio", { name: "English United States" });
    const settings = menu.getByRole("menuitem", { name: "English settings" });
    await settings.hover();
    const hoverOpacity = (element: Element) => getComputedStyle(element, "::after").opacity;
    expect(await settings.evaluate(hoverOpacity)).toBe("0.08");
    expect(await locale.evaluate(hoverOpacity)).toBe("0");

    const layout = await locale.evaluate((action) => {
      const menu = action.closest(".q-menu")!;
      const soleAction = menu.querySelector("button")!;
      const passiveSide = menu.querySelector("#passive-side")!;
      const settings = action.nextElementSibling!;
      const isRtl = getComputedStyle(action).direction === "rtl";
      const readInlineBounds = (element: Element) => {
        const { left, right } = element.getBoundingClientRect();
        return isRtl ? { start: -right, end: -left } : { start: left, end: right };
      };
      const menuBounds = readInlineBounds(menu);
      const actionBounds = readInlineBounds(action);
      const settingsBounds = readInlineBounds(settings);
      const iconBounds = readInlineBounds(settings.querySelector(".q-icon")!);
      const headline = ".q-item__section--headline";

      return {
        menuInset: actionBounds.start - menuBounds.start,
        labelOffset:
          readInlineBounds(action.querySelector(headline)!).start -
          readInlineBounds(soleAction.querySelector(headline)!).start,
        settingsGap: settingsBounds.start - actionBounds.end,
        settingsInset: menuBounds.end - settingsBounds.end,
        settingsIconInset: menuBounds.end - iconBounds.end,
        passiveSideInset: menuBounds.end - readInlineBounds(passiveSide).end,
      };
    });

    const actionLog = page.locator("#menu-action-log");
    await settings.click();
    expect(await actionLog.textContent()).toBe("settings;");
    await locale.click();
    expect(await actionLog.textContent()).toBe("settings;locale;");
    expect(layout).toEqual({
      menuInset: gutter,
      labelOffset: 0,
      settingsGap: gap,
      settingsInset: gutter,
      settingsIconInset: gutter + padding + (variant === "expressive" ? 14 : 12),
      passiveSideInset: gutter + padding,
    });
  }
);

it.for(MENU_CASES)(
  "preserves padding for a trailing icon and a responsive label ($variant, $direction)",
  async ({ variant, direction, gutter, padding }, { page, openFixture }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await openFixture(`${variant}&${direction}`);
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByRole("menu");
    const settings = menu.getByRole("menuitem", { name: "Plain settings" });

    const layout = await settings.evaluate((button, gutter) => {
      const menuBounds = button.closest(".q-menu")!.getBoundingClientRect();
      const buttonBounds = button.getBoundingClientRect();
      const iconBounds = button.querySelector(".q-icon")!.getBoundingClientRect();
      const isRtl = getComputedStyle(button).direction === "rtl";

      return {
        iconInset: isRtl ? iconBounds.left - menuBounds.left : menuBounds.right - iconBounds.right,
        edge: {
          x: isRtl ? menuBounds.left + gutter + 1 : menuBounds.right - gutter - 1,
          y: (buttonBounds.top + buttonBounds.bottom) / 2,
        },
      };
    }, gutter);

    const responsiveRow = menu.locator("#responsive-item");
    expect(await responsiveRow.getByText("Hidden action").isVisible()).toBe(false);
    const responsivePadding = await responsiveRow.evaluate((row) => {
      const style = getComputedStyle(row);
      return [style.paddingInlineStart, style.paddingInlineEnd];
    });

    await page.mouse.move(layout.edge.x, layout.edge.y);
    expect(await settings.evaluate((button) => getComputedStyle(button, "::after").opacity)).toBe(
      "0.08"
    );
    await page.mouse.click(layout.edge.x, layout.edge.y);
    expect(await page.locator("#menu-action-log").textContent()).toBe("plain-settings;");
    expect({ iconInset: layout.iconInset, responsivePadding }).toEqual({
      iconInset: gutter + padding,
      responsivePadding: [`${padding}px`, `${padding}px`],
    });
  }
);
