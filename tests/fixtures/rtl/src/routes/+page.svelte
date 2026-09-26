<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import Quaff from "$classes/Quaff.svelte";
  import Notify from "$classes/Notify";
  import type { QuaffConfig } from "$internal/quaffConfig.svelte";
  import en from "$lib/locales/en-US";
  import de from "$lib/locales/de-DE";
  import QBtn from "$components/button/QBtn.svelte";
  import QLayout from "$components/layout/QLayout.svelte";
  import QDrawer from "$components/drawer/QDrawer.svelte";
  import QHeader from "$components/header/QHeader.svelte";
  import QFooter from "$components/footer/QFooter.svelte";
  import QRailbar from "$components/railbar/QRailbar.svelte";
  import QMenu from "$components/menu/QMenu.svelte";
  import QSelect from "$components/select/QSelect.svelte";
  import QTooltip from "$components/tooltip/QTooltip.svelte";
  import QTable from "$components/table/QTable.svelte";
  import QLinearProgress from "$components/progress/QLinearProgress.svelte";
  import QCircularProgress from "$components/progress/QCircularProgress.svelte";
  import "$css/index.scss";
  import "material-symbols/outlined.css";

  const scene = $derived(page.url.searchParams.get("scene"));
  const globalDirection = $derived(
    page.url.searchParams.has("global") || scene === "configuration"
  );
  const direction = $derived(
    globalDirection ? undefined : page.url.searchParams.get("dir") === "ltr" ? "ltr" : "rtl"
  );
  const config = $state<Partial<QuaffConfig>>({
    rtl:
      page.url.searchParams.has("global") || page.url.searchParams.get("scene") === "configuration"
        ? page.url.searchParams.get("global") === "rtl"
        : undefined,
    expressive: false,
    language: en,
  });
  Quaff.init(
    page.url.searchParams.has("static") ? { rtl: true, expressive: true, language: de } : config
  );
  const popup = $derived(page.url.searchParams.get("popup") ?? "menu");
  const physical = $derived(page.url.searchParams.has("physical"));
  const editable = $derived(page.url.searchParams.get("editable"));
  const growing = $derived(page.url.searchParams.has("growing"));
  const popupDir = $derived(
    editable
      ? inputValue === "مرحبا"
        ? "rtl"
        : "ltr"
      : page.url.searchParams.has("auto")
        ? "auto"
        : undefined
  );
  let ready = $state(false);
  let target = $state<HTMLElement>();
  let inputValue = $state("Hello");
  let expanded = $state(false);
  let dialog = $state<HTMLDialogElement>();
  let menu = $state<QMenu>();
  let tooltip = $state<QTooltip<HTMLElement>>();
  let drawerOpen = $state(false);
  let drawerSide = $state<"start" | "end">("start");

  onMount(() => {
    if (page.url.searchParams.has("dialog")) {
      dialog?.showModal();
    }

    ready = true;
  });
</script>

<main id="scope" dir={direction} lang="ar" data-ready={ready}>
  {#if scene === "navigation"}
    <QLayout
      id="layout"
      view="lhh lpr lff"
      style="width: 800px; height: 320px; margin-inline: auto;"
    >
      {#snippet header()}<QHeader height={56} />{/snippet}
      {#snippet footer()}<QFooter height={40} />{/snippet}
      {#snippet railbarStart()}<QRailbar id="start-rail" width={64} />{/snippet}
      {#snippet railbarEnd()}<QRailbar id="end-rail" side="end" width={80} />{/snippet}
      {#snippet drawerStart()}
        {#if !physical}
          <QDrawer
            id="start-drawer"
            side={drawerSide}
            width={160}
            value
            behavior="desktop"
            persistent
          />
        {/if}
      {/snippet}
      {#snippet drawerLeft()}
        {#if physical}
          <QDrawer
            id="physical-drawer"
            side="left"
            width={100}
            value
            behavior="desktop"
            persistent
          />
        {/if}
      {/snippet}
      Content
    </QLayout>
    <button id="change-side" onclick={() => (drawerSide = "end")}>Change side</button>
  {:else if scene === "drawer-width"}
    <QDrawer id="relative-drawer" width="50vw" value behavior="desktop" persistent />
  {:else if scene === "swipe"}
    <QDrawer id="swipe-drawer" width={200} behavior="mobile" bind:value={drawerOpen} />
    <output id="drawer-open">{drawerOpen}</output>
  {:else if scene === "overlays"}
    {#if page.url.searchParams.has("dialog")}
      <dialog bind:this={dialog}>{@render controls()}</dialog>
    {:else}
      {@render controls()}
    {/if}
  {:else if scene === "configuration"}
    <button
      id="config-notify"
      onclick={() =>
        Notify.create({ message: "Settings preview", timeout: 0, actions: [{ label: "Undo" }] })}
      >Notify</button
    >
    <QBtn id="config-button" label="Action" />
    <QBtn id="config-override" expressive={false} label="Baseline" />
    <button
      id="config-change"
      onclick={() => {
        config.expressive = !config.expressive;
        config.rtl = config.expressive;
        config.language = config.expressive ? de : en;
      }}>Update settings</button
    >
    <QTable
      columns={[{ name: "name", label: "Name", field: "name" }]}
      rows={Array.from({ length: 6 }, (_, i) => ({ name: `Row ${i + 1}` }))}
    />
  {:else if scene === "table"}
    <QTable
      columns={[{ name: "name", label: "Name", field: "name" }]}
      rows={Array.from({ length: 6 }, (_, i) => ({ name: `Row ${i + 1}` }))}
    />
  {:else if scene === "progress"}
    {#each ["ar", "he-IL", "iw"] as lang (lang)}
      <section {lang}>
        <QLinearProgress id={lang} value={0.25} />
        <QLinearProgress id={`${lang}-reverse`} value={0.25} reverse />
      </section>
    {/each}
    <QLinearProgress id="explicit-ltr" dir="ltr" value={0.25} />
    <QCircularProgress id="circle-rtl" value={0.25} />
    <QCircularProgress id="circle-ltr" dir="ltr" value={0.25} />
  {/if}
</main>

{#snippet controls()}
  {#if popup === "select"}
    <QSelect id="select" options={["One", "Two"]} value={null} aria-label="Choice" />
  {:else}
    {#if editable === "input"}
      <input
        id="trigger"
        dir="auto"
        aria-label="Trigger"
        bind:this={target}
        bind:value={inputValue}
        onfocus={() => (popup === "menu" ? menu?.show() : tooltip?.show())}
      />
    {:else if editable === "textarea"}
      <textarea
        id="trigger"
        dir="auto"
        aria-label="Trigger"
        bind:this={target}
        bind:value={inputValue}
        onfocus={() => (popup === "menu" ? menu?.show() : tooltip?.show())}></textarea>
    {:else}
      <button
        id="trigger"
        bind:this={target}
        onclick={() => (popup === "menu" ? menu?.show() : tooltip?.show())}>Open</button
      >
    {/if}
    {#if popup === "menu"}
      <QMenu
        id="popup"
        bind:this={menu}
        {target}
        dir={popupDir}
        anchor={physical ? "bottom left" : undefined}
        self={physical ? "top left" : undefined}
        autoClose={!growing && !globalDirection}
        style={growing ? undefined : "width: 220px; height: 40px;"}
      >
        {#if globalDirection}
          <button id="toggle-direction" onclick={() => (config.rtl = !config.rtl)}
            >Change direction</button
          >
        {:else if growing}
          <button id="grow-menu" onclick={() => (expanded = true)}>
            {expanded ? "Additional menu actions that become available after loading" : "Expand"}
          </button>
        {:else}
          {popupDir ? "مرحبا" : "Menu"}
        {/if}
      </QMenu>
    {:else}
      <QTooltip
        id="popup"
        bind:this={tooltip}
        {target}
        dir={popupDir}
        delay={0}
        hideDelay={0}
        role={globalDirection ? "dialog" : "tooltip"}
      >
        {#if globalDirection}
          <button id="toggle-direction" onclick={() => (config.rtl = !config.rtl)}
            >Change direction</button
          >
        {:else}
          {popupDir ? "مرحبا" : "Tooltip"}
        {/if}
      </QTooltip>
    {/if}
  {/if}
{/snippet}

<style>
  :global(body) {
    margin: 0;
  }
  main {
    padding: 40px;
  }
  #trigger {
    margin-inline: 280px;
    width: 140px;
  }
  dialog {
    width: 720px;
    padding: 40px;
  }
  :global(#select) {
    width: 260px;
    margin-inline: 280px;
  }
  :global(.q-linear-progress) {
    width: 240px;
    margin-block: 10px;
  }
</style>
