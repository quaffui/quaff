import { onDestroy } from "svelte";
import { getMetaContext } from "../internal/metaContext.svelte.js";
import type { MetaSource } from "../components/meta/props.js";

/** Register page metadata during component initialization inside QMeta. */
export function useMeta(metadata: MetaSource) {
  const context = getMetaContext();
  onDestroy(context.add(metadata));
}
