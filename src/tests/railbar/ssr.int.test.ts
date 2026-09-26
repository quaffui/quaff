import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import RailbarFixture from "./RailbarFixture.svelte";

describe("Railbar server rendering", () => {
  it("renders collapsed destinations and their floating badges by default", () => {
    const { body } = render(RailbarFixture, {
      props: { railbar: { "aria-label": "Primary navigation" } },
    });
    const dialog = body.match(/<dialog\b[^>]*>/)?.[0];
    const navigation = body.match(/<nav\b[^>]*>/)?.[0];

    expect(dialog).toContain("q-railbar--collapsed");
    expect(dialog).toContain("q-railbar--start");
    expect(dialog).toContain("--q-railbar-width: 80px;");
    expect(dialog).toContain('role="presentation"');
    expect(dialog).not.toContain("aria-modal");
    expect(dialog).not.toContain("aria-label");
    expect(navigation).toContain('aria-label="Primary navigation"');
    expect(body).not.toContain("q-nav-item--expanded");
    expect(body).toContain("q-badge--floating");
    expect(body.indexOf("q-nav-item__badge")).toBeLessThan(body.indexOf("q-nav-item__label"));
  });

  it("renders expanded destinations with trailing badges and accessible descriptions", () => {
    const { body } = render(RailbarFixture, { props: { railbar: { expanded: true } } });
    const dialog = body.match(/<dialog\b[^>]*>/)?.[0];
    const descriptionId = body.match(/aria-describedby="([^"]+)"/)?.[1];

    expect(dialog).toContain("q-railbar--expanded");
    expect(dialog).toContain("--q-railbar-width: 256px;");
    expect(dialog).toContain('role="presentation"');
    expect(dialog).not.toContain("aria-modal");
    expect(body.match(/q-nav-item--expanded/g)).toHaveLength(2);
    expect(body).not.toContain("q-badge--floating");
    expect(body.indexOf("q-nav-item__badge")).toBeGreaterThan(body.indexOf("q-nav-item__label"));
    expect(descriptionId).toBeDefined();
    expect(body).toContain(`<span id="${descriptionId}" hidden="">12 unread messages</span>`);
    expect(body).toContain('aria-current="page"');
    expect(body).toContain('aria-disabled="true"');
    expect(body).toContain('tabindex="-1"');
  });

  it.each([false, true])("uses custom widths and attributes when expanded is %s", (expanded) => {
    const { body } = render(RailbarFixture, {
      props: {
        railbar: {
          expanded,
          width: 96,
          expandedWidth: 300,
          side: "right",
          bordered: true,
          class: "account-navigation",
          style: "color: red;",
          "aria-labelledby": "navigation-heading",
        },
      },
    });
    const dialog = body.match(/<dialog\b[^>]*>/)?.[0];
    const navigation = body.match(/<nav\b[^>]*>/)?.[0];

    expect(dialog).toContain(`--q-railbar-width: ${expanded ? 300 : 96}px;`);
    expect(dialog).toContain("q-railbar--right");
    expect(dialog).toContain("q-railbar--bordered");
    expect(dialog).toContain("account-navigation");
    expect(dialog).toContain("color: red;");
    expect(navigation).toContain('aria-labelledby="navigation-heading"');
  });

  it.each([false, true])("only exposes modal semantics while expanded is %s", (expanded) => {
    const { body } = render(RailbarFixture, {
      props: {
        railbar: {
          modal: true,
          expanded,
          "aria-label": "Main menu",
          "aria-labelledby": "menu-heading",
        },
      },
    });
    const dialog = body.match(/<dialog\b[^>]*>/)?.[0];
    const navigation = body.match(/<nav\b[^>]*>/)?.[0];

    expect(dialog).toContain(`role="${expanded ? "dialog" : "presentation"}"`);

    if (expanded) {
      expect(dialog).toContain('aria-modal="true"');
      expect(dialog).toContain('aria-label="Main menu"');
      expect(dialog).toContain('aria-labelledby="menu-heading"');
      expect(dialog).toContain('data-quaff-overlay="true"');
      expect(navigation).not.toContain("aria-label");
    } else {
      expect(dialog).not.toContain("aria-modal");
      expect(dialog).not.toContain("aria-label");
      expect(dialog).not.toContain("data-quaff-overlay");
      expect(navigation).toContain('aria-label="Main menu"');
      expect(navigation).toContain('aria-labelledby="menu-heading"');
    }
  });

  it.each([false, true])("renders one copy of child content when expanded is %s", (expanded) => {
    const { body } = render(RailbarFixture, { props: { railbar: { expanded } } });

    expect(body.match(/data-testid="filter"/g)).toHaveLength(1);
    expect(body).toContain('value="Unread"');
    expect(body.match(/>Inbox</g)).toHaveLength(1);
    expect(body.match(/>Settings</g)).toHaveLength(1);
    expect(body.match(/q-nav-item__badge/g)).toHaveLength(1);
  });

  it("keeps expanded navigation context isolated between server renders", () => {
    render(RailbarFixture, { props: { railbar: { expanded: true } } });
    const { body } = render(RailbarFixture);

    expect(body).not.toContain("q-nav-item--expanded");
    expect(body).toContain("q-badge--floating");
  });

  it.each([false, true])(
    "forwards navigation attributes to one accessible container (modal: %s)",
    (modal) => {
      const { body } = render(RailbarFixture, {
        props: {
          railbar: {
            expanded: modal,
            modal,
            "aria-label": "Primary navigation",
            "aria-describedby": "navigation-description",
            "aria-details": "navigation-details",
            "aria-live": "polite",
            role: "navigation",
            tabindex: 0,
          },
        },
      });
      const dialog = body.match(/<dialog\b[^>]*>/)?.[0];
      const navigation = body.match(/<nav\b[^>]*>/)?.[0];
      const labelledElement = modal ? dialog : navigation;
      const otherElement = modal ? navigation : dialog;

      for (const attribute of [
        'aria-label="Primary navigation"',
        'aria-describedby="navigation-description"',
        'aria-details="navigation-details"',
        'aria-live="polite"',
      ]) {
        expect(labelledElement).toContain(attribute);
        expect(otherElement).not.toContain(attribute);
      }

      expect(dialog).not.toContain("tabindex");

      if (modal) {
        expect(dialog).toContain('role="dialog"');
        expect(navigation).not.toContain("role=");
        expect(navigation).not.toContain("tabindex");
      } else {
        expect(dialog).toContain('role="presentation"');
        expect(navigation).toContain('role="navigation"');
        expect(navigation).toContain('tabindex="0"');
      }
    }
  );
});
