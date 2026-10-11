import { expect, it, vi } from "vitest";
import { resolve } from "$app/paths";
import { getRouterInfo } from "./router";

vi.mock("$app/state", () => ({ page: { url: new URL("https://example.test/") } }));

it.each(["/search?tags[]=svelte", "/search#tags[]"])(
  "preserves literal brackets in href and to: %s",
  (href) => {
    const expectedHref = resolve("/") + href.slice(1);

    expect(getRouterInfo({ href }).linkAttributes.href).toBe(expectedHref);
    expect(getRouterInfo({ to: href }).linkAttributes.href).toBe(expectedHref);
  }
);
