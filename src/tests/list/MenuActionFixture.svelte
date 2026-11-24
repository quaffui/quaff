<script lang="ts">
  import { untrack } from "svelte";
  import QIcon from "#components/icon/QIcon.svelte";
  import QItem from "#components/list/QItem.svelte";
  import QItemSection from "#components/list/QItemSection.svelte";
  import QList from "#components/list/QList.svelte";
  import QMenu from "#components/menu/QMenu.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const expressive = params.has("expressive");
  const direction = params.has("rtl") ? "rtl" : "ltr";
  let target = $state<HTMLButtonElement>();
  let open = $state(false);
  let actionLog = $state("");
</script>

{#snippet radio()}
  <QIcon name="radio_button_unchecked" />
{/snippet}

{#snippet description()}
  <QItemSection type="icon"><QIcon name="info" /></QItemSection>
  <QItemSection><span>Location information for the selected region</span></QItemSection>
{/snippet}

<main dir={direction} style="padding: 32px">
  <button
    bind:this={target}
    type="button"
    style={params.has("compare") ? "width: 210px" : undefined}
    onclick={() => (open = true)}>Open menu</button
  >
  <output>{actionLog}</output>
  <QList {expressive}>
    <QItem id="outside-item">
      <QItemSection action>Outside action</QItemSection>
      <QItemSection type="side">Outside description</QItemSection>
    </QItem>
  </QList>
  <QMenu bind:value={open} {target} {expressive} autoClose={false} fit={params.has("compare")}>
    <QList>
      <QItem id="single">
        <QItemSection action leading={radio}><span>Single</span></QItemSection>
      </QItem>
      <QItem id="pair" class={params.get("spacing")} style={params.get("style") ?? undefined}>
        <QItemSection action leading={radio} onclick={() => (actionLog += "primary ")}>
          <span
            role="presentation"
            onclick={params.has("decorated") ? () => (actionLog += "label ") : undefined}
            >English</span
          >
        </QItemSection>
        <QItemSection
          type="side"
          action
          aria-label="Settings"
          onclick={() => (actionLog += "settings ")}
        >
          <QIcon name="settings" />
          {#if params.has("decorated")}
            <span
              aria-hidden="true"
              class="badge"
              style="position: absolute; top: 3px; inset-inline-end: 3px; width: 4px; height: 4px; background: currentColor"
            ></span>
          {/if}
        </QItemSection>
      </QItem>
      <QItem id="mixed" class={params.get("spacing")} style={params.get("style") ?? undefined}>
        <QItemSection action class="xs-hide">Pin</QItemSection>
        <QItemSection><span>Details</span></QItemSection>
        <QItemSection type="side"><span>Available</span></QItemSection>
        <QItemSection action type="side" class="xs-hide">Edit</QItemSection>
      </QItem>
      {#if params.has("compare")}
        <QItem id="reference">{@render description()}</QItem>
        <QItem id="comparison">
          {@render description()}
          <QItemSection action type="side" class="xs-hide">Edit</QItemSection>
        </QItem>
        <QItem id="hidden-leading">
          <QItemSection type="icon" class="xs-hide"><QIcon name="info" /></QItemSection>
          <QItemSection><span>Details</span></QItemSection>
          <QItemSection action type="side">Edit</QItemSection>
        </QItem>
        <QItem id="edges">
          <QItemSection action class="xs-hide">Back</QItemSection>
          <QItemSection action>Open</QItemSection>
          <QItemSection action type="side">More</QItemSection>
          <QItemSection action type="side" class="xs-hide">Help</QItemSection>
        </QItem>
      {/if}
      <QItem id="ordinary" clickable>
        <QItemSection><span>Ordinary item</span></QItemSection>
      </QItem>
    </QList>
  </QMenu>
</main>
