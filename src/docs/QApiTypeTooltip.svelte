<script lang="ts">
  import QCodeBlock from "#components/codeBlock/QCodeBlock.svelte";
  import QTooltip from "#components/tooltip/QTooltip.svelte";

  let { target, code }: { target: HTMLElement; code: string } = $props();
</script>

<QTooltip
  {target}
  class="q-api-type-tooltip q-pa-none transparent"
  style="max-width: calc(100vw - 16px)">
  <QCodeBlock {code} language="typescript" />
</QTooltip>

<style>
  :global(.q-tooltip.q-api-type-tooltip .q-code-block pre > code) {
    padding: 0;
  }
</style>
