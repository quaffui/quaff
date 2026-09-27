import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import QColorPicker from "$components/color-picker/QColorPicker.svelte";
import QInput from "$components/input/QInput.svelte";
import QSelect from "$components/select/QSelect.svelte";

const HEX_MASK = String.raw`\#XXXXXX`;

function fieldClasses(body: string) {
  return body.match(/class="([^"]*\bq-field\b[^"]*)"/)?.[1].split(/\s+/) ?? [];
}

describe("color picker field variants", () => {
  it("preserves both modifiers on existing outlined and rounded inputs", () => {
    const { body } = render(QInput, { props: { outlined: true, rounded: true } });

    expect(fieldClasses(body)).toContain("q-field--outlined");
    expect(fieldClasses(body)).toContain("q-field--rounded");
  });

  it("preserves both modifiers on existing outlined and rounded selects", () => {
    const { body } = render(QSelect, {
      props: { value: "First", options: ["First"], outlined: true, rounded: true },
    });

    expect(fieldClasses(body)).toContain("q-field--outlined");
    expect(fieldClasses(body)).toContain("q-field--rounded");
  });

  it("resolves outlined and rounded locally for the color picker field", () => {
    const { body } = render(QColorPicker, {
      props: { value: "#6750A4", outlined: true, rounded: true },
    });

    expect(fieldClasses(body)).toContain("q-field--rounded");
    expect(fieldClasses(body)).not.toContain("q-field--outlined");
  });
});

describe("masked color picker server rendering", () => {
  it.each([
    { value: "rgb(26, 43, 60)", alpha: false, mask: HEX_MASK, display: "#1A2B3C" },
    { value: "rgb(26, 43, 60)", alpha: false, mask: String.raw`\#XX-XX-XX`, display: "#1A-2B-3C" },
    { value: "rgba(26, 43, 60, 0.5)", alpha: true, mask: HEX_MASK, display: "#1A2B3C" },
    { value: "rgba(26, 43, 60, 0.5)", alpha: true, mask: `${HEX_MASK}XX`, display: "#1A2B3C80" },
    { value: null, alpha: false, mask: HEX_MASK, display: "#______" },
  ])("renders $display for $value", ({ value, alpha, mask, display }) => {
    const { body } = render(QColorPicker, {
      props: { id: "color", value, alpha, mask, fillMask: true, format: "rgb" },
    });

    expect(body.match(/<input\b[^>]*id="color"[^>]*>/)?.[0]).toContain(`value="${display}"`);
  });
});
