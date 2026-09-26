<script lang="ts">
  import QRailbar from "$components/railbar/QRailbar.svelte";
  import "$css/components/railbar.scss";

  let expanded = $state(false);
  let modal = $state(true);
  let visible = $state(true);
  let preventCancel = $state(false);
  let events = $state<{ target: boolean; currentTarget: string; expanded: boolean }[]>([]);
</script>

<button id="expand" style="margin-left: 300px;" onclick={() => (expanded = true)}>Expand</button>
<output id="expanded">{expanded}</output>
<output id="events">{JSON.stringify(events)}</output>

{#if visible}
  <QRailbar
    id="rail"
    bind:expanded
    {modal}
    aria-label="Navigation"
    aria-describedby="description"
    aria-live="polite"
    tabindex={0}
    style="transition: width 250ms linear;"
    oncancel={(event) => preventCancel && event.preventDefault()}
    onclose={(event) =>
      events.push({
        target: event.target === event.currentTarget,
        currentTarget: event.currentTarget.id,
        expanded,
      })}
  >
    <p id="description">Choose a destination.</p>
    <button id="collapse" onclick={() => (expanded = false)}>Collapse</button>
    <button id="standard" onclick={() => (modal = false)}>Standard</button>
    <button id="prevent" onclick={() => (preventCancel = true)}>Prevent cancellation</button>
    <button id="remove" onclick={() => (visible = false)}>Remove</button>
  </QRailbar>
{/if}
