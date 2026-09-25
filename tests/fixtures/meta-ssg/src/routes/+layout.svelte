<script>
  import { initMeta, QMetaHead } from "$lib/meta";

  let { children } = $props();

  initMeta({ title: "Default", titleTemplate: (title) => `${title} | Quaff` });
</script>

{@render children()}
<QMetaHead />
