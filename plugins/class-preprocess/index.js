import { parse } from "svelte/compiler";
import MagicString from "magic-string";
import { format } from "prettier";
import { prepareScript } from "./script.js";
import { prepareMarkup } from "./markup.js";
import { changeSource } from "./source.js";

/**
 * Preprocessor to ease the writing of classes following the BEM principle.
 * For it to work, a `Quaff.classes` global function type should be defined.
 *
 * @example
 * ```js
 * Quaff.classes("q-component__name", {
 *  dynamicClass1,
 *  dynamicClass2,
 *  dynamicClass3Renamed: dynamicClass3,
 * }, ["static-class", staticClassButFromVar, () => avoidSvelteWarningForDerivedVars])
 * ```
 *
 * @returns { import("svelte/types/compiler/preprocess").PreprocessorGroup }
 */
export function preprocessClasses() {
  return {
    name: "quaff-classes-preprocessor",
    async markup({ content, filename }) {
      const source = new MagicString(content);

      const parsed = parse(content, { modern: true, filename });

      if (!("fragment" in parsed)) return; // Force "parsed" to be of type `Root`

      const { fragment, instance } = parsed;
      if (!instance) return;

      const scriptDefs = prepareScript(instance, content);

      /** @type {import("./types").ComponentName} */
      let component;
      for (component in scriptDefs) {
        const def = scriptDefs[component];
        /** @type {import("./types").Use[]} */
        const uses = [];
        prepareMarkup(fragment, component, uses);

        const result = { def, uses };

        changeSource(source, result);
      }

      const code = await format(source.toString(), {
        plugins: ["prettier-plugin-svelte"],
        filepath: filename,
      });

      // logCode("progress/LinearProgress", filename, code);

      return {
        code,
        map: source.generateMap({ hires: true }),
        filename,
      };
    },
  };
}

function logCode(component, filename, code) {
  if (filename === `C:/kilian.davies/dev/TESTS/test_app/src/lib/components/${component}.svelte`)
    console.log(code);
}
