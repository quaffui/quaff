import { onDestroy } from "svelte";
import { getMetaContext } from "../internal/metaContext.svelte.js";
import type { MetaSource } from "../components/meta/types.js";

/** Register metadata during component initialization after initMeta has set up the root. */
export function useMeta(metadata: MetaSource) {
  const context = getMetaContext();
  onDestroy(context.add(metadata));
}
