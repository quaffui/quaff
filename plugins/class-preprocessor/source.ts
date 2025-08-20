import type MagicString from "magic-string";
import type { Result } from "./types.js";

export function changeSource(source: MagicString, result: Result) {
  // Remove the classes definition
  source.remove(result.def.start, result.def.end);

  if (!result.uses.length) {
    return;
  }

  for (const use of result.uses) {
    // As the class is of the form class="q-component",
    // We need to change it to class={["q-component",...]}
    source.update(use.start - 1, use.end + 1, `{[${result.def.classes.join(",")}]}`);
  }
}
