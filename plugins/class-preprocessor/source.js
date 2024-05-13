/**
 *
 * @param {import("magic-string").MagicString} source
 * @param {import("./types").Result} result
 */
export function changeSource(source, result) {
  // Remove the classes definition
  source.remove(result.def.start, result.def.end);

  if (!result.uses.length) {
    return;
  }

  for (const use of result.uses) {
    // Replace the {...${namespace}.classes} attribute by class:dynamicClass attributes
    source.overwrite(use.start, use.end, result.def.bemClasses.join("\n"));

    // Add the new classes
    source.appendRight(use.classEnd - 1, result.def.classes.join(""));
  }
}
