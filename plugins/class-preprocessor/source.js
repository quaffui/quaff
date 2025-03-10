/**
 *
 * @param {import("magic-string").default} source
 * @param {import("./types").Result} result
 */
export function changeSource(source, result) {
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
