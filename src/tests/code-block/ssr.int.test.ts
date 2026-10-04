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

    expect(body).toContain(
      '<pre><code>&lt;script>\n  const label = "Tea &amp; cake";\n&lt;/script>\n&lt;QBtn {label} /></code></pre>'
    );
    expect(body).not.toContain("<script>");
  });
});
