<script lang="ts">
  import { useMeta, type MetaSource } from "../../lib/meta.js";

  let { metadata }: { metadata: MetaSource } = $props();

  useMeta(() => (typeof metadata === "function" ? metadata() : metadata));
</script>

<p>Page content</p>
