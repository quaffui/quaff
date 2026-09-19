import { createContext } from "svelte";
import type { MetaOptions, MetaSource } from "../components/meta/props.js";

export const [getMetaContext, setMetaContext] =
  createContext<ReturnType<typeof createMetaContext>>();

export function createMetaContext(defaults: () => MetaSource) {
  let entries = $state.raw<{ source: MetaSource }[]>([]);

  return {
    add(source: MetaSource) {
      const entry = { source };
      entries = [...entries, entry];

      return () => {
        entries = entries.filter((current) => current !== entry);
      };
    },

    resolve() {
      const result: Required<MetaOptions> = {
        title: "",
        titleTemplate: (title) => title,
        meta: Object.create(null),
        link: Object.create(null),
      };

      for (const source of [defaults(), ...entries.map((entry) => entry.source)]) {
        const metadata = typeof source === "function" ? source() : source;

        if (metadata.title !== undefined) {
          result.title = metadata.title;
        }

        if (metadata.titleTemplate) {
          result.titleTemplate = metadata.titleTemplate;
        }

        Object.assign(result.meta, metadata.meta);
        Object.assign(result.link, metadata.link);
      }

      result.title = result.titleTemplate(result.title);
      return result;
    },
  };
}
