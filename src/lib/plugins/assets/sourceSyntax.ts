import { parse, preprocess } from "svelte/compiler";

/** Parse JavaScript, TypeScript, or Svelte source without processing its styles. */
export async function parseSourceSyntax(code: string) {
  try {
    // Script text inside a JS string must not terminate the synthetic Svelte script.
    const script = code
      .replace(/^#!/, "//")
      .replace(/<\/script/gi, (closing) => closing.replace("/", "\\/"));
    return parse(`<script lang="ts">\n${script}\n</script>`, { modern: true });
  } catch {
    try {
      const source = await preprocess(code, {
        style: ({ content }) => ({ code: content.replace(/[^\r\n]/g, " ") }),
      });
      return parse(source.code, { modern: true });
    } catch {
      return undefined;
    }
  }
}
