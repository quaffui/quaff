<script lang="ts">
  import QTooltip from "#components/tooltip/QTooltip.svelte";

  let trigger = $state<HTMLTextAreaElement>();
</script>

<main style="padding: 48px;">
  <textarea id="trigger" bind:this={trigger} aria-label="Notes" style="height: 40px;"></textarea>
  <QTooltip id="tooltip" target={trigger} delay={0} hideDelay={0}>Notes help</QTooltip>
</main>
