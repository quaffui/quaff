import { render } from "svelte/server";
import { describe, expect, it, vi } from "vitest";
import QDrawer from "$components/drawer/QDrawer.svelte";

vi.mock("$app/state", () => ({ navigating: { type: null } }));

describe("drawer server rendering", () => {
  it.each([false, true])("defers automatic modal behavior until mount (open: %s)", (value) => {
    const { body } = render(QDrawer, { props: { value } });

    expect(body).toContain("q-drawer");
    expect(body).not.toContain("q-drawer--overlay");
    expect(body).not.toContain("q-drawer__scrim");
    expect(body).not.toContain("q-drawer__swipearea");
  });

  it("preserves explicitly requested mobile behavior on the server", () => {
    const { body } = render(QDrawer, { props: { behavior: "mobile", value: true } });

    expect(body).toContain("q-drawer--overlay");
    expect(body).toContain("q-drawer__scrim");
    expect(body).toContain("q-drawer__swipearea");
  });

  it("preserves explicit overlay without enabling desktop swipes", () => {
    const { body } = render(QDrawer, { props: { behavior: "desktop", overlay: true } });

    expect(body).toContain("q-drawer--overlay");
    expect(body).toContain("q-drawer__scrim");
    expect(body).not.toContain("q-drawer__swipearea");
  });
});
