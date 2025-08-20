import { parse } from "svelte/compiler";
import MagicString from "magic-string";
import { format } from "prettier";
import { prepareScript } from "./script.js";
import { prepareMarkup } from "./markup.js";
import { changeSource } from "./source.js";
import type { PreprocessorGroup } from "svelte/compiler";
import type { ComponentName, ClassesUsage } from "./types.js";

/**
 * Preprocessor to ease the writing of classes following the BEM principle.
 * For it to work, a `${namespace}.classes` global function type should be defined.
 *
 * @example
 * ```js
 * ${namespace}.classes("q-component__name", {
 *  dynamicClass1,
 *  dynamicClass2,
 *  dynamicClass3Renamed: dynamicClass3,
 * }, ["static-class", staticClassButFromVar, () => avoidSvelteWarningForDerivedVars])
 * ```
 *
 * @param namespace The global namespace to recognise the function `${namespace}.classes()`
 *
 */
export function preprocessClasses(namespace: string): PreprocessorGroup {
  return {
    name: "quaff-classes-preprocessor",
    async markup({ content, filename }) {
      const source = new MagicString(content);

      const parsed = parse(content, { modern: true, filename });

      // Force "parsed" to be of type `Root`
      if (!("fragment" in parsed)) {
        return;
      }

      const { fragment, instance } = parsed;
      if (!instance) {
        return;
      }

      const scriptDefs = prepareScript(instance, content, namespace);

      for (const component in scriptDefs) {
        const def = scriptDefs[component];
        const uses: ClassesUsage[] = [];
        prepareMarkup(fragment, component as ComponentName, uses, namespace);

        const result = { def, uses };

        changeSource(source, result);
      }

      const code = await format(source.toString(), {
        plugins: ["prettier-plugin-svelte"],
        filepath: filename,
      });

      return {
        code,
        map: source.generateMap({ hires: true }),
        filename,
      };
    },
  };
}
