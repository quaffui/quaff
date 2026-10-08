<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import QBtn from "$components/button/QBtn.svelte";
  import QFooter from "$components/footer/QFooter.svelte";
  import QHeader from "$components/header/QHeader.svelte";
  import QHeaderTitle from "$components/header/QHeaderTitle.svelte";
  import QLayout from "$components/layout/QLayout.svelte";
  import QRailbar from "$components/railbar/QRailbar.svelte";
  import "$css/index.scss";
  import "material-symbols/outlined.css";

  const NEXT_VARIANT = { medium: "small", small: "large", large: "medium" } as const;

  const params = $derived(page.url.searchParams);
  let changingVariant = $state<"small" | "medium" | "large">("medium");
  const variant = $derived.by(() => {
    if (params.has("switching")) {
      return changingVariant;
    }

    const requestedVariant = params.get("variant");

    if (requestedVariant === "large" || requestedVariant === "small") {
      return requestedVariant;
    }

    return "medium";
  });
  const height = $derived(params.has("height") ? Number(params.get("height")) : undefined);
  let ready = $state(false);
  let selected = $state(false);
  let visible = $state(true);
  let railExpanded = $state(false);
  let railOnEnd = $state(false);
  let insetOverride = $state<boolean>();
  const inset = $derived(insetOverride ?? params.has("inset"));
  let borderOverride = $state<boolean>();
  let subtitleOverride = $state<boolean>();
  const bordered = $derived(borderOverride ?? params.has("border"));
  const hasSubtitle = $derived(subtitleOverride ?? params.has("subtitle"));

  onMount(() => {
    ready = true;
  });
</script>

<main data-ready={ready} dir={params.has("rtl") ? "rtl" : "ltr"}>
  {#snippet appBar()}
    <QHeader
      id="header"
      {variant}
      {height}
      collapse={!params.has("static")}
      reveal={params.has("reveal")}
      revealOffset={32}
      {bordered}
    >
      {#if params.has("logo")}
        <img
          id="logo"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='24' height='24' fill='blue'/%3E%3C/svg%3E"
          alt="City guide"
          width="24"
          height="24"
        />
      {:else if !params.has("title-first")}
        <QBtn
          id="back"
          round
          flat
          icon="arrow_back"
          aria-label="Back"
          color={params.has("colored") ? "#123456" : undefined}
        />
      {/if}
      <QHeaderTitle
        id="title"
        subtitle={hasSubtitle ? "Weekend collection" : undefined}
        align={params.has("center") ? "center" : undefined}
      >
        {#if params.has("input")}
          <input id="query" aria-label="Search" />
        {:else}
          {params.has("long") ? "Nocturnal city archive" : "Oslo"}
        {/if}
      </QHeaderTitle>
      {#if !params.has("no-actions")}
        <QBtn id="save" round flat icon="bookmark" aria-label="Save" bind:selected />
        <QBtn id="more" round flat icon="more_vert" aria-label="More" />
      {/if}
    </QHeader>
  {/snippet}

  {#snippet statusBar()}
    <QFooter id="footer" height={40}>Playback status</QFooter>
  {/snippet}

  {#if params.has("standalone")}
    {@render appBar()}
  {:else}
    <QLayout
      id="layout"
      class="animated"
      style="height: 400px;"
      view={inset ? "lhr lpr lfr" : undefined}
      footer={params.has("footer") ? statusBar : undefined}
    >
      {#snippet header()}
        {#if visible}
          {@render appBar()}
        {/if}
      {/snippet}
      {#snippet railbarStart()}
        {#if params.has("rail")}
          <QRailbar
            id="rail"
            expanded={railExpanded}
            bordered={params.has("border")}
            side={railOnEnd ? "end" : "start"}
            style="transition-timing-function: linear;"
          />
        {/if}
      {/snippet}
      <div id="content" style:height={params.has("short") ? "310px" : "1400px"}>City guide</div>
    </QLayout>
  {/if}
  <button id="toggle-header" onclick={() => (visible = !visible)}>Toggle header</button>
  <button id="change-variant" onclick={() => (changingVariant = NEXT_VARIANT[changingVariant])}
    >Change variant</button
  >
  <button id="toggle-rail" onclick={() => (railExpanded = !railExpanded)}>Toggle rail</button>
  <button id="switch-rail-side" onclick={() => (railOnEnd = !railOnEnd)}>Switch rail side</button>
  <button id="toggle-inset" onclick={() => (insetOverride = !inset)}>Toggle full-width bars</button>
  <button id="toggle-border" onclick={() => (borderOverride = !bordered)}>Toggle border</button>
  <button id="toggle-subtitle" onclick={() => (subtitleOverride = !hasSubtitle)}
    >Toggle subtitle</button
  >
  <output id="selected">{selected}</output>
</main>

<style>
  :global(body) {
    margin: 0;
  }
</style>
