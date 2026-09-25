import { createMetaContext, setMetaContext } from "../internal/metaContext.svelte.js";
import type { MetaSource } from "../components/meta/types.js";

/** Set up metadata in the root component before rendering its children. */
export function initMeta(metadata: MetaSource = {}) {
  setMetaContext(createMetaContext(metadata));
}
