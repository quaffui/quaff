<script lang="ts">
  import { tick, type Snippet } from "svelte";
  import { resolve } from "$app/paths";
  import { QNavbarDocs } from "$components/navbar/docs";
  import { QNavItemDocs } from "$components/nav-item/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QBtn, QIcon, QIconBtn, QLayout, QNavbar, QNavItem, QSelect, QSwitch } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QNavbar — Navigation Bar",
      "Navigate between primary destinations with QNavbar for Svelte. Explore badges, horizontal items, active links, custom labels, and QLayout integration."
    )
  );

  docsCtx.set({ snippets, componentDocs: [QNavbarDocs, QNavItemDocs] });

  type Destination = "stalls" | "saved" | "updates";
  const DESTINATIONS = [
    { id: "stalls", label: "Stalls", icon: "storefront" },
    { id: "saved", label: "Saved", icon: "bookmark" },
    { id: "updates", label: "Updates", icon: "notifications" },
  ] as const;
  const STALLS = [
    { id: "clay", name: "Jasper & Clay" },
    { id: "paper", name: "Folded Stories" },
    { id: "bread", name: "The Warm Crumb" },
  ];
  const HEIGHTS = [
    { label: "64px · default", value: 64 },
    { label: "80px · roomy", value: 80 },
    { label: "96px · extra room", value: 96 },
  ];
  const DESTINATION_TITLES = {
    stalls: "Market stalls",
    saved: "Saved stalls",
    updates: "Market update",
  };
  let selected = $state<Destination>("stalls");
  let savedIds = $state<string[]>([]);
  let hasUnreadUpdate = $state(true);
  let previewDestination = $state<Destination>("stalls");
  let activeColor = $state("secondary-container");
  let height = $state(64);
  let horizontal = $state(false);
  let bordered = $state(false);
  let shouldUseCustomIcon = $state(false);
  let contentHeading = $state<HTMLHeadingElement>();
  const visibleStalls = $derived(
    selected === "saved" ? STALLS.filter((stall) => savedIds.includes(stall.id)) : STALLS
  );
  const badges = $derived<Record<Destination, Snippet | undefined>>({
    stalls: undefined,
    saved: savedIds.length ? savedBadge : undefined,
    updates: hasUnreadUpdate ? unreadBadge : undefined,
  });
  const badgeDescriptions = $derived({
    stalls: undefined,
    saved: savedIds.length ? `${savedIds.length} saved stalls` : undefined,
    updates: hasUnreadUpdate ? "Unread market update" : undefined,
  });
  const title = $derived(DESTINATION_TITLES[selected]);

  function navigate(destination: Destination) {
    selected = destination;

    if (destination === "updates") {
      hasUnreadUpdate = false;
    }
  }

  async function saveStall(id: string, isSaved: boolean | undefined) {
    const isLeavingSavedList = selected === "saved" && !isSaved;
    savedIds = isSaved ? [...savedIds, id] : savedIds.filter((savedId) => savedId !== id);

    if (isLeavingSavedList) {
      await tick();
      contentHeading?.focus();
    }
  }

  async function exploreMarket() {
    navigate("stalls");
    await tick();
    contentHeading?.focus();
    contentHeading?.scrollIntoView({ block: "center" });
  }
</script>

{#snippet savedBadge()}{savedIds.length}{/snippet}
{#snippet unreadBadge()}{/snippet}
{#snippet stallIcon()}
  <svg
    class="block"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill={selected === "stalls" ? "currentColor" : "none"}
    ><path
      d="M3 10 5 3h14l2 7M5 10v11h14V10M3 10h18M9 21v-7h6v7"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    /></svg
  >
{/snippet}

<QDocs>
  {#snippet display()}
    <div class="market-preview surface overflow-hidden">
      <QLayout>
        {#snippet content()}
          <div class="q-pa-lg">
            <p class="label-medium text-tertiary q-mt-none q-mb-sm">LANTERN LANE MARKET</p>
            <h2 class="title-large q-ma-none">
              {DESTINATIONS.find((destination) => destination.id === previewDestination)?.label}
            </h2>
          </div>
        {/snippet}
        {#snippet navbar()}
          <QNavbar aria-label="Market preview destinations">
            {#each DESTINATIONS as destination (destination.id)}
              <QNavItem
                icon={destination.icon}
                active={previewDestination === destination.id}
                onclick={() => (previewDestination = destination.id)}>{destination.label}</QNavItem
              >
            {/each}
          </QNavbar>
        {/snippet}
      </QLayout>
    </div>
  {/snippet}
  {#snippet usage()}
    <QDocsSection title="Destinations, Badges and Appearance">
      {#snippet sectionDescription()}
        Put <code>QNavbar</code> in the <code>navbar</code> snippet of <code>QLayout</code> so content
        keeps clear of the bar. Use three to five stable, equal-priority destinations, each with an icon
        and a concise visible label. Save a stall, switch destinations, and read the update to clear its
        dot. Exactly one destination stays active.
      {/snippet}
      <div class="market-options items-start q-gap-md q-mb-lg">
        <QSelect
          label="Active indicator color"
          options={["secondary-container", "primary-container", "tertiary-container"]}
          bind:value={activeColor}
          outlined
        /><QSelect
          label="Bar minimum height"
          options={HEIGHTS}
          bind:value={height}
          emitValue
          outlined
        /><QSwitch label="Horizontal items" bind:value={horizontal} /><QSwitch
          label="Top border"
          bind:value={bordered}
        /><QSwitch label="Custom stall icon" bind:value={shouldUseCustomIcon} /><QBtn
          variant="outlined"
          icon="notifications"
          label="Mark update unread"
          disabled={hasUnreadUpdate || selected === "updates"}
          onclick={() => (hasUnreadUpdate = true)}
        />
      </div>
      <div class="market-window border overflow-hidden">
        <QLayout>
          {#snippet content()}
            <div class="market-content q-pa-lg">
              <div class="q-mb-lg">
                <p class="label-medium text-tertiary q-mt-none q-mb-xs">LANTERN LANE MARKET</p>
                <h3 bind:this={contentHeading} tabindex="-1" class="title-large q-ma-none">
                  {title}
                </h3>
              </div>
              {#if selected === "updates"}<article
                  class="notice-card flex items-start q-gap-md q-pa-md tertiary-container"
                >
                  <QIcon name="notifications" size={32} aria-hidden="true" />
                  <div class="min-width-0">
                    <p class="body-medium q-ma-none">Bookbinding demonstration at 19:00.</p>
                    <p class="body-small q-mb-none">
                      You're all caught up. The unread dot is cleared.
                    </p>
                  </div>
                </article>
              {:else if visibleStalls.length}<div class="column q-gap-md">
                  {#each visibleStalls as stall (stall.id)}<article
                      class="stall-card bg-surface-container-low flex items-center q-gap-md q-pa-md"
                    >
                      <h4 class="stall-copy min-width-0 title-medium q-ma-none">{stall.name}</h4>
                      <QIconBtn
                        variant="tonal"
                        icon="bookmark"
                        aria-label={`Save ${stall.name}`}
                        bind:selected={
                          () => savedIds.includes(stall.id),
                          (isSaved) => saveStall(stall.id, isSaved)
                        }
                      />
                    </article>{/each}
                </div>
              {:else}<div class="empty-saved bg-surface-container-low q-pa-lg">
                  <p class="body-medium q-ma-none">Save a stall to see it here.</p>
                  <QBtn
                    class="q-mt-lg"
                    variant="tonal"
                    label="Browse stalls"
                    onclick={exploreMarket}
                  />
                </div>{/if}
            </div>
          {/snippet}
          {#snippet navbar()}<QNavbar
              {activeColor}
              {height}
              {horizontal}
              {bordered}
              aria-label="Night market destinations"
              >{#each DESTINATIONS as destination (destination.id)}<QNavItem
                  icon={destination.id === "stalls" && shouldUseCustomIcon
                    ? stallIcon
                    : destination.icon}
                  active={selected === destination.id}
                  onclick={() => navigate(destination.id)}
                  badge={badges[destination.id]}
                  badgeAriaLabel={badgeDescriptions[destination.id]}>{destination.label}</QNavItem
                >{/each}</QNavbar
            >{/snippet}
        </QLayout>
      </div>
      <p class="body-small text-on-surface-variant q-mt-md q-mb-none" role="status">
        {savedIds.length} saved stalls · {hasUnreadUpdate ? "One unread update" : "Updates read"}.
      </p>
      <p class="body-medium q-mt-lg q-mb-none">
        <code>height</code> is a minimum in pixels; the bar grows when labels need space.
        <code>bordered</code>
        adds its top divider, and <code>activeColor</code> changes the selected indicator.
        <code>horizontal</code> places labels beside icons, intended for medium-width layouts from 600px
        through 839px. Try it in a wider window.
      </p>
    </QDocsSection>
    <QDocsSection title="Badge Content" noCode>
      {#snippet sectionDescription()}
        An empty <code>badge</code> snippet renders a dot; plain text renders a count. Provide a
        <code>badgeAriaLabel</code> for meaningful badges, especially dots. Keep count text to four
        characters including a plus sign, such as <code>999+</code>. In the market, Saved shows a
        count only when something is saved, and Updates clears its dot when opened. Custom
        <code>icon</code> snippets can draw their own active appearance; the stall icon above fills
        when selected. A label can come from <code>label</code> or the default children snippet.
      {/snippet}
    </QDocsSection>
    <QDocsSection title="Navigate with Real Links">
      {#snippet sectionDescription()}
        The market changes local demo state with <code>onclick</code>. In an app, use
        <code>href</code>
        or its <code>to</code> alias for actual destinations. Router links match the current route
        automatically, including nested routes. An explicit <code>active</code> overrides that
        matching;
        <code>activeClass</code> and <code>activeStyle</code> customize its appearance. This small guide
        links to real documentation pages.
      {/snippet}
      <div class="guide-window border overflow-hidden">
        <QLayout>
          {#snippet content()}<div class="guide-content q-pa-lg">
              <div class="label-medium text-tertiary">NAVIGATION GUIDE</div>
              <h3 class="title-large q-mt-sm q-mb-sm">Links to related docs</h3>
              <p class="body-medium q-ma-none">
                Compare bars, rails and drawers for your own app. Tickets is an unavailable
                destination in this example.
              </p>
            </div>{/snippet}
          {#snippet navbar()}<QNavbar bordered aria-label="Navigation component guide"
              ><QNavItem
                icon="bottom_navigation"
                label="Bar"
                to="/components/navbar"
                activeClass="text-primary"
                activeStyle="font-weight: 600;"
              /><QNavItem icon="side_navigation" label="Rail" href="/components/railbar" /><QNavItem
                icon="menu"
                label="Drawer"
                to="/components/drawer"
              /><QNavItem icon="confirmation_number" label="Tickets" disabled /></QNavbar
            >{/snippet}
        </QLayout>
      </div>
    </QDocsSection>
    <QDocsSection title="Keep Navigation Predictable" noCode>
      {#snippet sectionDescription()}
        Use the bar for destinations, with actions inside their content. For wider layouts, consider
        <a class="q-docs-link" href={resolve("/components/railbar")}>QRailbar</a>; for drawer
        destinations and expandable groups, see
        <a class="q-docs-link" href={resolve("/components/nav-item")}>QNavItem</a>.
      {/snippet}
    </QDocsSection>
    <QDocsSection title="Accessibility" noCode>
      <p>
        Name each <code>QNavbar</code> with <code>aria-label</code> or
        <code>aria-labelledby</code>. Keep destination labels and focus indicators visible.
      </p>
      <p>
        Tab and Shift+Tab move between enabled destinations; Enter or Space activates them. Use
        <code>href</code> or <code>to</code> for navigation. Active items expose
        <code>aria-current="page"</code>; disabled items are skipped in the tab order.
      </p>
      <p>
        Describe unread dots and counts with <code>badgeAriaLabel</code> instead of relying on color.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .market-preview {
    width: min(100%, 352px);
    height: 220px;
    max-height: 100%;
    border-radius: 24px;
    overflow-wrap: anywhere;
  }
  .market-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 224px), 1fr));
  }
  .market-window,
  .guide-window {
    height: 360px;
    border-radius: 24px;
    isolation: isolate;
  }
  .market-content,
  .guide-content {
    overflow-wrap: anywhere;
  }
  .stall-card,
  .notice-card,
  .empty-saved {
    border-radius: 20px;
  }
  .stall-copy {
    flex: 1;
  }
  .notice-card > div {
    flex: 1 1 220px;
  }
  .guide-window {
    height: 320px;
  }
  h3:focus {
    outline: 3px solid var(--secondary);
    outline-offset: 4px;
  }
  @media (max-width: 500px) {
    .market-content,
    .guide-content {
      padding: 16px;
    }
  }
</style>
