import { createContext } from "svelte";
import { SvelteSet } from "svelte/reactivity";
import type { MetaOptions, MetaSource } from "../components/meta/types.js";

export const [getMetaContext, setMetaContext] =
  createContext<ReturnType<typeof createMetaContext>>();

export function createMetaContext(defaults: MetaSource) {
  const entries = new SvelteSet<{ source: MetaSource }>();

  return {
    add(source: MetaSource) {
      const entry = { source };
      entries.add(entry);

      return () => {
        entries.delete(entry);
      };
    },

    resolve() {
      const result: Required<MetaOptions> = {
        title: "",
        titleTemplate: (title) => title,
        meta: Object.create(null),
        link: Object.create(null),
      };

      for (const source of [defaults, ...Array.from(entries, (entry) => entry.source)]) {
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
