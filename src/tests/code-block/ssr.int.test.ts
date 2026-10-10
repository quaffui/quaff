import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import QCodeBlock from "$components/codeBlock/QCodeBlock.svelte";

describe("code block server rendering", () => {
  it("renders escaped source with its whitespace before client highlighting", () => {
    const { body } = render(QCodeBlock, {
      props: {
        language: "svelte",
        code: '<script>\n  const label = "Tea & cake";\n</script>\n<QBtn {label} />',
      },
    });

    expect(body).toContain('<code tabindex="0">');
    expect(body).toContain(
      "&lt;script&gt;\n  const label = &quot;Tea &amp; cake&quot;;\n&lt;/script&gt;\n&lt;QBtn {label} /&gt;"
    );
    expect(body).not.toContain("<script>");
  });
});
