<script lang="ts">
  import { tick } from "svelte";
  import { Quaff, QBtn, QLayout, QNavbar, QNavItem, QRailbar } from "$lib";
  import type { MaterialSymbol } from "material-symbols";

  const RELEASES = [
    {
      id: "tidelines",
      title: "Tidelines",
      artist: "Ada North",
      genre: "electronic",
      color: "#b8d9d0",
      accent: "#244b52",
      note: "Harbour field recordings meet warm analogue synths. A record for watching the last ferry leave.",
      edition: "SR–024 · Sea-glass vinyl · 8 tracks",
    },
    {
      id: "afterhours",
      title: "After Hours",
      artist: "The Quiet Assembly",
      genre: "jazz",
      color: "#eec4a7",
      accent: "#854326",
      note: "One room, four musicians, and the tape still rolling. Unhurried improvisations from a late-night session.",
      edition: "SR–025 · Copper vinyl · 6 tracks",
    },
    {
      id: "signals",
      title: "Small Signals",
      artist: "Mira & the Machines",
      genre: "electronic",
      color: "#d5c8ef",
      accent: "#514078",
      note: "Pocket-sized melodies made with found sounds, drum machines, and a beautifully unreliable cassette deck.",
      edition: "SR–026 · Lilac vinyl · 10 tracks",
    },
  ] as const;
  const DESTINATIONS: { id: "all" | "electronic" | "jazz"; label: string; icon: MaterialSymbol }[] =
    [
      { id: "all", label: "All", icon: "album" },
      { id: "electronic", label: "Electronic", icon: "graphic_eq" },
      { id: "jazz", label: "Jazz", icon: "piano" },
    ];
  const WIDTHS = [
    { label: "Fit", value: 0 },
    { label: "Compact · 390px", value: 390 },
    { label: "Medium · 700px", value: 700 },
    { label: "Expanded · 1000px", value: 1000 },
    { label: "Large · 1400px", value: 1400 },
  ];

  let previewWidth = $state(0);
  let measuredWidth = $state<number>();
  let genre = $state<(typeof DESTINATIONS)[number]["id"]>("all");
  let selectedId = $state<string>();
  let showDetail = $state(false);
  let windowEl = $state<HTMLDivElement>();
  let listPane = $state<HTMLElement>();
  let detailPane = $state<HTMLElement>();
  let listHeading = $state<HTMLHeadingElement>();
  let detailHeading = $state<HTMLHeadingElement>();
  let previousNavigation: string | undefined;

  const screen = $derived(Quaff.getScreen(measuredWidth));
  const showList = $derived(screen.twoPane || !showDetail);
  const showDetails = $derived(screen.twoPane || showDetail);
  const visibleReleases = $derived(
    RELEASES.filter((release) => genre === "all" || release.genre === genre)
  );
  const selected = $derived(RELEASES.find((release) => release.id === selectedId));

  $effect.pre(() => {
    const { navigation, twoPane } = screen;
    const focused = document.activeElement;
    const oldNavigation = windowEl?.querySelector(
      `[data-listening-navigation="${previousNavigation}"]`
    );
    let nextFocus: (() => HTMLElement | undefined) | undefined;

    if (!showList && listPane?.contains(focused)) {
      nextFocus = () => detailHeading;
    } else if (!showDetails && detailPane?.contains(focused)) {
      nextFocus = () =>
        listPane?.querySelector<HTMLElement>(`[data-release="${selectedId}"]`) ?? listHeading;
    } else if (twoPane && detailPane?.querySelector("[data-collection-back]")?.contains(focused)) {
      nextFocus = () => detailHeading;
    } else if (navigation !== previousNavigation && oldNavigation?.contains(focused)) {
      nextFocus = () =>
        windowEl?.querySelector<HTMLElement>("[data-listening-navigation] [aria-current='page']") ??
        undefined;
    }

    previousNavigation = navigation;

    if (nextFocus) {
      void tick().then(() => nextFocus?.()?.focus({ preventScroll: true }));
    }
  });
</script>

<div class="preview-controls" aria-label="Preview width">
  {#each WIDTHS as width (width.value)}
    <QBtn
      label={width.label}
      variant={previewWidth === width.value ? "tonal" : "flat"}
      aria-pressed={previewWidth === width.value}
      onclick={() => (previewWidth = width.value)}
    />
  {/each}
</div>
<p class="preview-status body-medium" aria-live="polite">
  {Math.round(screen.width)}px · {screen.name} ·
  {screen.navigation === "navbar" ? "Bottom bar" : "Navigation rail"} ·
  {screen.twoPane ? "Two panes" : "One pane"}. Wider previews scroll horizontally.
</p>
<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users must be able to scroll wider previews.) -->
<div class="preview-scroll" tabindex="0" role="region" aria-label="Listening room preview">
  <div
    class="room-window"
    bind:this={windowEl}
    bind:clientWidth={measuredWidth}
    style:width={previewWidth ? `${previewWidth}px` : "100%"}
  >
    <QLayout>
      {#snippet navbar()}
        {#if screen.navigation === "navbar"}
          <QNavbar aria-label="Record genres" data-listening-navigation="navbar">
            {@render destinations()}
          </QNavbar>
        {/if}
      {/snippet}
      {#snippet railbarStart()}
        {#if screen.navigation === "railbar"}
          <QRailbar aria-label="Record genres" data-listening-navigation="railbar">
            {@render destinations()}
          </QRailbar>
        {/if}
      {/snippet}
      <div
        class="room-content"
        class:compact={screen.xs}
        style:--list-width={screen.gt.md ? "412px" : "360px"}
      >
        <header class="room-header">
          <span class="label-large">SIDE ROOM RECORDS</span>
          <h2 class="headline-small">Independent sounds.</h2>
        </header>
        <div class="panes" class:two-pane={screen.twoPane}>
          <section
            class="release-list"
            bind:this={listPane}
            hidden={!showList}
            aria-label="Release collection"
          >
            <h3 class="title-large" bind:this={listHeading} tabindex="-1">Releases</h3>
            {#each visibleReleases as release (release.id)}
              <button
                class="release"
                class:selected={screen.twoPane && selectedId === release.id}
                aria-current={screen.twoPane && selectedId === release.id ? "true" : undefined}
                data-release={release.id}
                onclick={() => {
                  selectedId = release.id;
                  showDetail = true;
                }}
              >
                <span class="mini-record" style:background={release.color} aria-hidden="true">
                  <span style:background={release.accent}></span>
                </span>
                <span class="release-copy">
                  <strong class="title-medium">{release.title}</strong>
                  <span class="body-medium">{release.artist}</span>
                </span>
              </button>
            {/each}
          </section>
          <section
            class="release-detail"
            bind:this={detailPane}
            hidden={!showDetails}
            aria-label="Release details"
          >
            {#if !screen.twoPane}
              <QBtn
                data-collection-back
                label="Back to releases"
                variant="flat"
                onclick={() => (showDetail = false)}
              />
            {/if}
            <h3 class="headline-small" bind:this={detailHeading} tabindex="-1">
              {selected?.title ?? "Choose a release"}
            </h3>
            {#if selected}
              <p class="title-medium">{selected.artist}</p>
              <div class="record-sleeve" style:background={selected.color} aria-hidden="true">
                <span class="record" style:--record-label={selected.accent}></span>
              </div>
              <p class="label-medium">{selected.edition}</p>
              <p class="body-medium">{selected.note}</p>
            {:else}
              <p class="empty-state body-medium">Browse the catalog to read its liner notes.</p>
            {/if}
          </section>
        </div>
      </div>
    </QLayout>
  </div>
</div>

{#snippet destinations()}
  {#each DESTINATIONS as item (item.id)}
    <QNavItem
      icon={item.icon}
      label={item.label}
      active={genre === item.id}
      onclick={() => {
        genre = item.id;
        selectedId = undefined;
        showDetail = false;
      }}
    />
  {/each}
{/snippet}

<style>
  .preview-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .preview-status {
    margin-block: 12px;
    color: var(--on-surface-variant);
  }

  .preview-scroll {
    overflow: auto;
    border: 1px solid var(--outline-variant);
    border-radius: 24px;
  }

  .room-window {
    height: max(560px, 35rem);
    background: var(--surface);
    border-radius: 24px;
  }

  .room-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    padding: 24px;
  }

  .room-content.compact {
    padding: 16px;
  }

  .room-header {
    margin-block-end: 24px;
  }

  .room-header h2 {
    margin-block: 8px 0;
  }

  .panes {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    flex: 1;
    min-height: 0;
  }

  .panes.two-pane {
    grid-template-columns: var(--list-width) minmax(0, 1fr);
  }

  .release-list,
  .release-detail {
    min-width: 0;
    overflow: auto;
    border-radius: 0;
    overflow-wrap: anywhere;
  }

  .release-list h3,
  .release-detail h3 {
    margin-block: 0 16px;
  }

  .release {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    width: 100%;
    margin-block-end: 8px;
    padding: 12px;
    border: 0;
    border-radius: 16px;
    background: var(--surface-container-low);
    color: var(--on-surface);
    text-align: start;
    cursor: pointer;
  }

  .release.selected {
    background: var(--secondary-container);
    color: var(--on-secondary-container);
  }

  .release:hover {
    box-shadow: inset 0 0 0 1px var(--outline);
  }

  .release:focus-visible,
  .preview-scroll:focus-visible,
  h3:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
  }

  .release-copy {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .mini-record {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 8px;
  }

  .mini-record span {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }

  .record-sleeve {
    display: grid;
    place-items: center;
    height: 128px;
    margin-block: 16px;
    border-radius: 16px;
    overflow: hidden;
  }

  .record {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      #eee 0 3px,
      var(--record-label) 4px 26px,
      #222 27px 30px,
      #343434 31px 32px,
      #222 33px 52px,
      #343434 53px 54px,
      #222 55px
    );
  }

  .release-detail p {
    margin-block: 12px;
  }

  .empty-state {
    color: var(--on-surface-variant);
  }
</style>
