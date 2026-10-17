import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import ContextFixture from "./ContextFixture.svelte";

describe("Railbar navigation context", () => {
  it.each([false, true])(
    "uses the nearest navigation container when the outer rail is expanded: %s",
    (expanded) => {
      const { body } = render(ContextFixture, { props: { expanded } });
      const destinations = [
        { id: "outer-rail", expanded, drawer: false },
        { id: "direct-navbar", expanded: false, drawer: false },
        { id: "layout-navbar", expanded: false, drawer: false },
        { id: "layout-content", expanded: false, drawer: false },
        { id: "drawer", expanded: false, drawer: true },
        { id: "nested-rail", expanded: false, drawer: false },
      ];

      for (const destination of destinations) {
        const item =
          body.match(
            new RegExp(`<button\\b[^>]*id="${destination.id}"[^>]*>[\\s\\S]*?</button>`)
          )?.[0] ?? "";
        const isHorizontal = destination.expanded || destination.drawer;

        expect(item, destination.id).toContain("q-nav-item__label");
        expect(item.includes("q-nav-item--expanded"), destination.id).toBe(destination.expanded);
        expect(item.includes("q-nav-item--drawer"), destination.id).toBe(destination.drawer);
        expect(item.includes("q-badge--floating"), destination.id).toBe(!isHorizontal);
        expect(
          item.indexOf("q-nav-item__badge") > item.indexOf("q-nav-item__label"),
          destination.id
        ).toBe(isHorizontal);
      }
    }
  );
});
