<script lang="ts">
  import MetaHead from "../../internal/MetaHead.svelte";
  import { createMetaContext, setMetaContext } from "../../internal/metaContext.svelte.js";
  import type { QMetaProps } from "./props.js";

  let { metadata = {}, children }: QMetaProps = $props();
  const context = setMetaContext(createMetaContext(() => metadata));
</script>

{@render children?.()}
<!-- Render head in a separate component so descendants register their metadata first during SSR. -->
<MetaHead {context} />
