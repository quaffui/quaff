<script lang="ts">
  import { tick } from "svelte";
  import { resolve } from "$app/paths";
  import { QNavItemDocs } from "$components/nav-item/docs";
  import { QRailbarDocs } from "$components/railbar/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import {
    QBtn,
    QFooter,
    QHeader,
    QIcon,
    QIconBtn,
    QLayout,
    QNavItem,
    QRailbar,
    QSelect,
    QSwitch,
  } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QRailbar — Navigation Rail",
      "Build Material 3 navigation rails with QRailbar for Svelte. Try collapsed and expanded rails, modal expansion, placement, and accessible navigation."
    )
  );

  docsCtx.set({ snippets, componentDocs: [QRailbarDocs, QNavItemDocs] });

  const FILMS = [
    {
      id: "signal",
      title: "The Last Signal",
      genre: "Sci-fi",
      time: "18:30",
      duration: "98 min",
      room: "Screen 1",
      icon: "satellite_alt",
      color: "primary-container",
      note: "One transmission. A city listening.",
    },
    {
      id: "paper",
      title: "Paper Cities",
      genre: "Animation",
      time: "20:15",
      duration: "84 min",
      room: "Screen 2",
      icon: "location_city",
      color: "tertiary-container",
      note: "A miniature world with a very big secret.",
    },
    {
      id: "after",
      title: "After the Credits",
      genre: "Documentary",
      time: "21:00",
      duration: "72 min",
      room: "Screen 1",
      icon: "theaters",
      color: "secondary-container",
      note: "Meet the people who keep the projectors running.",
    },
  ] as const;
  const DESTINATIONS = [
    { id: "programme", label: "Programme", icon: "movie" },
    { id: "saved", label: "Saved", icon: "bookmark" },
    { id: "tickets", label: "Tickets", icon: "local_activity" },
  ] as const;
  const GUIDE_SECTIONS = [
    { id: "screenings", label: "Screenings", icon: "movie" },
    { id: "venues", label: "Venues", icon: "location_on" },
    { id: "updates", label: "Updates", icon: "notifications" },
  ] as const;
  const VENUES = [
    { name: "The Picture House", detail: "Screens 1 & 2 · Doors open at 18:00", icon: "theaters" },
    { name: "Warehouse 4", detail: "Short films · Doors open at 19:00", icon: "warehouse" },
  ] as const;
  const WIDTHS = [
    { label: "80px · Default", value: 80 },
    { label: "96px · Roomier", value: 96 },
  ];
  const EXPANDED_WIDTHS = [
    { label: "256px · Default", value: 256 },
    { label: "280px · Roomier", value: 280 },
  ];
  const COLORS = [
    { label: "Secondary", value: "secondary-container" },
    { label: "Primary", value: "primary-container" },
    { label: "Tertiary", value: "tertiary-container" },
  ];

  type Destination = (typeof DESTINATIONS)[number]["id"];
  type GuideSection = (typeof GUIDE_SECTIONS)[number]["id"];

  let previewContent = $state<HTMLDivElement>();
  let programmeHeading = $state<HTMLHeadingElement>();
  let guideHeading = $state<HTMLHeadingElement>();
  let programmeHeaderHeight = $state(0);
  let deskHeaderHeight = $state(0);
  let deskFooterHeight = $state(0);
  let previewPage = $state<Destination>("programme");
  let previewSaved = $state(false);
  let programmePage = $state<Destination>("programme");
  let programmeExpanded = $state(false);
  let programmeRail = $state<QRailbar>();
  let savedIds = $state<string[]>([]);
  let ticketIds = $state<string[]>([]);
  let programmeMessage = $state("Save a film or reserve a seat to build your evening.");
  const programmeTitle = $derived(DESTINATIONS.find((item) => item.id === programmePage)!.label);
  const programmeBadges = $derived({
    programme: undefined,
    saved: { count: savedIds.length, label: `${savedIds.length} saved films` },
    tickets: { count: ticketIds.length, label: `${ticketIds.length} reservations` },
  });
  const visibleFilms = $derived.by(() => {
    if (programmePage === "programme") {
      return FILMS;
    }

    const selectedIds = programmePage === "saved" ? savedIds : ticketIds;
    return FILMS.filter((film) => selectedIds.includes(film.id));
  });

  let guidePage = $state<GuideSection>("screenings");
  let guideExpanded = $state(false);
  let unreadUpdates = $state(true);
  let guideDay = $state("Friday");
  const guideTitle = $derived(GUIDE_SECTIONS.find((item) => item.id === guidePage)!.label);
  const guideFilms = $derived(guideDay === "Friday" ? FILMS.slice(0, 2) : FILMS.slice(1));

  let deskPage = $state("queue");
  let deskExpanded = $state(false);
  let deskOnRight = $state(true);
  let deskBordered = $state(true);
  let headerSpansRail = $state(true);
  let railWidth = $state(80);
  let expandedRailWidth = $state(256);
  let indicatorColor = $state("tertiary-container");
  let subtitles = $state(true);
  let selectedFilm = $state<string>(FILMS[0].id);
  const queuedFilm = $derived(FILMS.find((film) => film.id === selectedFilm)!);
  const deskView = $derived.by(() => {
    if (headerSpansRail) {
      return "hhh lpr fff";
    }

    return deskOnRight ? "hhr lpr ffr" : "lhh lpr lff";
  });

  function measureBarHeight(updateHeight: (height: number) => void) {
    return (element: HTMLElement) => {
      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        // Update layout offsets after the current resize observation has finished.
        frame = requestAnimationFrame(() => updateHeight(element.offsetHeight));
      });
      observer.observe(element, { box: "border-box" });

      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
      };
    };
  }

  function toggleSaved(id: string, title: string) {
    const wasSaved = savedIds.includes(id);
    savedIds = wasSaved ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id];
    programmeMessage = `${title} ${wasSaved ? "removed from" : "added to"} your saved films.`;

    if (wasSaved && programmePage === "saved") {
      void focusProgrammeHeading();
    }
  }

  function toggleTicket(id: string, title: string) {
    const wasReserved = ticketIds.includes(id);
    ticketIds = wasReserved ? ticketIds.filter((ticketId) => ticketId !== id) : [...ticketIds, id];
    programmeMessage = wasReserved
      ? `Reservation for ${title} canceled.`
      : `Seat reserved for ${title}. Find it in Tickets.`;

    if (wasReserved && programmePage === "tickets") {
      void focusProgrammeHeading();
    }
  }

  async function focusProgrammeHeading() {
    await tick();
    programmeHeading?.focus();
  }

  async function togglePreviewSaved() {
    previewSaved = !previewSaved;

    if (previewPage === "saved" && !previewSaved) {
      await tick();
      previewContent?.focus();
    }
  }

  function chooseGuidePage(page: GuideSection) {
    guidePage = page;
    guideExpanded = false;

    if (page === "updates") {
      unreadUpdates = false;
    }
  }
</script>

<QDocs
  docDescription="Keep your main destinations within reach. Expand beside the page or open above it."
>
  {#snippet display()}
    <div class="cinema-preview surface no-overflow">
      <QLayout>
        {#snippet railbarStart()}
          <QRailbar width={72} aria-label="Framehouse preview" bordered>
            {#each DESTINATIONS as destination (destination.id)}
              <QNavItem
                icon={destination.icon}
                label={destination.id === "programme" ? "Tonight" : destination.label}
                active={previewPage === destination.id}
                onclick={() => (previewPage = destination.id)}
              />
            {/each}
          </QRailbar>
        {/snippet}
        <div
          class="preview-content q-pa-md"
          bind:this={previewContent}
          tabindex="-1"
          role="region"
          aria-label="Preview content"
        >
          <div class="label-small text-on-surface-variant">FRAMEHOUSE</div>
          {#if previewPage === "programme" || (previewPage === "saved" && previewSaved)}
            <div class="preview-art flex flex-center primary-container" aria-hidden="true">
              <QIcon name="satellite_alt" size="40px" />
            </div>
            <h2 class="title-medium q-my-sm">The Last Signal</h2>
            <p class="body-small q-mt-none">Tonight, 18:30 · Screen 1</p>
            <QBtn
              size="sm"
              variant="tonal"
              icon={previewSaved ? "bookmark_added" : "bookmark_add"}
              label={previewSaved ? "Saved" : "Save film"}
              aria-pressed={previewSaved}
              onclick={togglePreviewSaved}
            />
          {:else}
            <QIcon
              name={previewPage === "saved" ? "bookmark" : "local_activity"}
              size="40px"
              class="text-primary q-mt-lg"
              aria-hidden="true"
            />
            <h2 class="title-medium q-my-sm">
              {previewPage === "saved" ? "Your next great film" : "Make a night of it"}
            </h2>
            <p class="body-small">
              {previewPage === "saved"
                ? "Save something from Tonight to find it here."
                : "Explore tonight’s programme before choosing your seat."}
            </p>
            <QBtn
              size="sm"
              flat
              label="Browse tonight"
              onclick={async () => {
                previewPage = "programme";
                await tick();
                previewContent?.focus();
              }}
            />
          {/if}
        </div>
      </QLayout>
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Collapsed and Expanded">
        {#snippet sectionDescription()}
          Bind <code>expanded</code> to switch between a compact rail and destinations with labels
          beside their icons. Standard expansion resizes the page. Use a menu button with
          <code>aria-expanded</code>
          and <code>aria-controls</code>, or call <code>expand()</code>, <code>collapse()</code>,
          and <code>toggle()</code> on a component reference. Save a film or reserve a seat below, then
          visit Saved or Tickets. These reservations only change this example. On narrow screens, scroll
          the workspace horizontally.
        {/snippet}

        <div class="example-controls flex items-center q-mb-md">
          <QSwitch label="Expanded navigation" bind:value={programmeExpanded} />
          <QBtn
            variant="outlined"
            size="sm"
            label={programmeExpanded ? "Collapse rail" : "Expand rail"}
            onclick={() =>
              programmeExpanded ? programmeRail?.collapse() : programmeRail?.expand()}
          />
        </div>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (The workspace scrolls horizontally and needs keyboard access.) -->
        <div
          class="cinema-viewport border"
          role="region"
          aria-label="Framehouse programme workspace"
          tabindex="0"
        >
          <div class="cinema-stage surface">
            <QLayout view="hhh lpr fff">
              {#snippet header()}
                <QHeader class="surface-container-low" height={Math.max(64, programmeHeaderHeight)}>
                  <div
                    class="app-heading flex items-center q-pa-md"
                    {@attach measureBarHeight((height) => (programmeHeaderHeight = height))}
                  >
                    <QIcon name="theaters" aria-hidden="true" />
                    <span class="title-medium">Framehouse</span>
                    <span class="label-medium text-on-surface-variant">Friday programme</span>
                  </div>
                </QHeader>
              {/snippet}
              {#snippet railbarStart()}
                <QRailbar
                  id="programme-rail"
                  bind:this={programmeRail}
                  bind:expanded={programmeExpanded}
                  aria-label="Programme navigation"
                  bordered
                >
                  <div class="rail-menu flex justify-center">
                    <QIconBtn
                      icon="menu"
                      flat
                      aria-label="Toggle programme navigation"
                      aria-expanded={programmeExpanded}
                      aria-controls="programme-rail"
                      onclick={() => programmeRail?.toggle()}
                    />
                  </div>
                  {#each DESTINATIONS as destination (destination.id)}
                    {@const badge = programmeBadges[destination.id]}
                    {#snippet countBadge()}{badge?.count}{/snippet}
                    <QNavItem
                      icon={destination.icon}
                      label={destination.label}
                      active={programmePage === destination.id}
                      badge={badge?.count ? countBadge : undefined}
                      badgeAriaLabel={badge?.count ? badge.label : undefined}
                      onclick={() => (programmePage = destination.id)}
                    />
                  {/each}
                </QRailbar>
              {/snippet}
              <div class="app-content q-pa-lg">
                <div class="section-heading flex items-center justify-between q-mb-lg">
                  <div>
                    <p class="label-medium text-on-surface-variant q-ma-none">
                      YOUR EVENING AT THE CINEMA
                    </p>
                    <h6
                      bind:this={programmeHeading}
                      tabindex="-1"
                      class="title-large q-mt-xs q-mb-none"
                    >
                      {programmeTitle}
                    </h6>
                  </div>
                  <span class="film-count label-medium text-no-wrap"
                    >{visibleFilms.length} {visibleFilms.length === 1 ? "film" : "films"}</span
                  >
                </div>
                {#if visibleFilms.length}
                  <ul class="film-list q-ma-none q-pa-none">
                    {#each visibleFilms as film (film.id)}
                      {@const isSaved = savedIds.includes(film.id)}
                      {@const isReserved = ticketIds.includes(film.id)}
                      <li class="film-row q-py-md border-bottom border-outline-variant">
                        <div class="film-art flex flex-center {film.color}" aria-hidden="true">
                          <QIcon name={film.icon} size="32px" />
                        </div>
                        <div class="film-copy">
                          <h6 class="title-medium q-ma-none">{film.title}</h6>
                          <p class="body-small text-on-surface-variant q-my-xs">
                            {film.genre} · {film.duration}
                          </p>
                          <p class="body-medium q-ma-none">{film.time} · {film.room}</p>
                        </div>
                        <div class="film-actions flex items-center q-gap-sm">
                          <QIconBtn
                            icon={isSaved ? "bookmark_added" : "bookmark_add"}
                            flat
                            aria-label={`${isSaved ? "Unsave" : "Save"} ${film.title}`}
                            aria-pressed={isSaved}
                            onclick={() => toggleSaved(film.id, film.title)}
                          />
                          <QBtn
                            variant={isReserved ? "outlined" : "tonal"}
                            size="sm"
                            label={isReserved ? "Cancel reservation" : "Reserve seat"}
                            onclick={() => toggleTicket(film.id, film.title)}
                          />
                        </div>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <div class="empty-state surface-container-low q-pa-lg">
                    <QIcon
                      name={programmePage === "saved" ? "bookmark" : "local_activity"}
                      size="40px"
                      aria-hidden="true"
                    />
                    <h6 class="title-medium q-my-sm">
                      {programmePage === "saved"
                        ? "A shortlist worth keeping"
                        : "Your seats will appear here"}
                    </h6>
                    <p class="body-medium q-mt-none">
                      {programmePage === "saved"
                        ? "Bookmark a film from the programme to save it for later."
                        : "Find a film in the programme and reserve your seat."}
                    </p>
                    <QBtn
                      flat
                      label="Explore the programme"
                      onclick={() => {
                        programmePage = "programme";
                        void focusProgrammeHeading();
                      }}
                    />
                  </div>
                {/if}
                <p
                  class="body-small text-on-surface-variant action-message q-mt-md q-mb-none"
                  role="status"
                >
                  {programmeMessage}
                </p>
              </div>
            </QLayout>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Modal Expansion">
        {#snippet sectionDescription()}
          Add <code>modal</code> to expand over the page while keeping the collapsed rail’s space. The
          scrim covers the viewport and blocks background interaction. Press Escape, select the scrim,
          or use the menu button to collapse. This festival guide also collapses when you choose a destination;
          visiting Updates clears its unread badge.
        {/snippet}

        <div class="festival-window surface border no-overflow">
          <QLayout>
            {#snippet railbarEnd()}
              <QRailbar
                id="festival-rail"
                side="end"
                bind:expanded={guideExpanded}
                modal
                aria-label="Festival guide navigation"
                activeColor="primary-container"
                bordered
              >
                <div class="rail-menu flex justify-center">
                  <QIconBtn
                    icon={guideExpanded ? "close" : "menu"}
                    flat
                    aria-label={guideExpanded
                      ? "Close festival navigation"
                      : "Open festival navigation"}
                    aria-expanded={guideExpanded}
                    aria-controls="festival-rail"
                    onclick={() => (guideExpanded = !guideExpanded)}
                  />
                </div>
                {#each GUIDE_SECTIONS as destination (destination.id)}
                  {@const hasUnreadUpdates = destination.id === "updates" && unreadUpdates}
                  {#snippet unreadBadge()}{/snippet}
                  <QNavItem
                    icon={destination.icon}
                    label={destination.label}
                    active={guidePage === destination.id}
                    badge={hasUnreadUpdates ? unreadBadge : undefined}
                    badgeAriaLabel={hasUnreadUpdates ? "Unread festival update" : undefined}
                    onclick={() => chooseGuidePage(destination.id)}
                  />
                {/each}
              </QRailbar>
            {/snippet}
            <div class="app-content festival-content">
              <div class="festival-banner flex items-center tertiary-container q-pa-md">
                <QIcon name="movie" size="32px" aria-hidden="true" />
                <div>
                  <p class="label-small q-ma-none">FRAMEHOUSE PRESENTS</p>
                  <h6 class="title-large q-my-xs">After Hours</h6>
                  <p class="body-small q-ma-none">A weekend of independent film</p>
                </div>
              </div>
              <h6 bind:this={guideHeading} tabindex="-1" class="title-large q-my-md">
                {guideTitle}
              </h6>
              {#if guidePage === "screenings"}
                <QSelect
                  label="Festival day"
                  bind:value={guideDay}
                  options={["Friday", "Saturday"]}
                  outlined
                  dense
                />
                <ul class="guide-list q-ma-none q-pa-none q-mt-md">
                  {#each guideFilms as film (film.id)}
                    <li class="flex items-start q-py-md border-bottom border-outline-variant">
                      <span class="label-large text-primary">{film.time}</span>
                      <div>
                        <div class="title-small">{film.title}</div>
                        <div class="body-small text-on-surface-variant">{film.room}</div>
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else if guidePage === "venues"}
                <ul class="guide-list q-ma-none q-pa-none q-mt-md">
                  {#each VENUES as venue (venue.name)}
                    <li class="flex items-start q-py-md border-bottom border-outline-variant">
                      <QIcon name={venue.icon} class="text-primary" aria-hidden="true" />
                      <div>
                        <div class="title-small">{venue.name}</div>
                        <div class="body-small text-on-surface-variant">{venue.detail}</div>
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else}
                <div class="festival-update surface-container-low">
                  <span class="label-small text-primary">JUST ANNOUNCED</span>
                  <h6 class="title-medium q-my-sm">Stay for the conversation</h6>
                  <p class="body-medium q-ma-none">
                    The director of Paper Cities joins us for a Q&A after Saturday’s screening.
                  </p>
                </div>
                <QBtn
                  class="q-mt-md"
                  flat
                  label="View Saturday screenings"
                  onclick={async () => {
                    guideDay = "Saturday";
                    guidePage = "screenings";
                    await tick();
                    guideHeading?.focus();
                  }}
                />
              {/if}
            </div>
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Placement and Appearance">
        {#snippet sectionDescription()}
          Use <code>side</code>, <code>bordered</code>, and <code>activeColor</code> to fit the rail
          to your layout. <code>width</code> controls the collapsed width (80px by default);
          <code>expandedWidth</code>
          controls the expanded width (256px). <code>QLayout</code>’s <code>view</code> determines
          whether the header and footer span the rail. Try the controls, choose a film in the
          projection queue, or change its subtitle setting.
          <p>
            The default <code>side="start"</code> follows reading direction: left in LTR, right in
            RTL. Use <code>side="end"</code> for the opposite edge, with the matching
            <code>railbarStart</code> or <code>railbarEnd</code> layout snippet. Explicit
            <code>left</code> and <code>right</code> stay fixed, as in the projection desk below.
          </p>
        {/snippet}

        <div class="appearance-controls">
          <div class="example-controls flex items-center q-mb-md">
            <QSwitch label="Rail on the right" bind:value={deskOnRight} />
            <QSwitch label="Expanded rail" bind:value={deskExpanded} />
            <QSwitch label="Border" bind:value={deskBordered} />
            <QSwitch label="Full-width header and footer" bind:value={headerSpansRail} />
          </div>
          <div class="select-controls q-gap-md">
            <QSelect
              label="Collapsed width"
              options={WIDTHS}
              bind:value={railWidth}
              emitValue
              outlined
              dense
            />
            <QSelect
              label="Expanded width"
              options={EXPANDED_WIDTHS}
              bind:value={expandedRailWidth}
              emitValue
              outlined
              dense
            />
            <QSelect
              label="Active indicator"
              options={COLORS}
              bind:value={indicatorColor}
              emitValue
              outlined
              dense
            />
          </div>
        </div>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (The workspace scrolls horizontally and needs keyboard access.) -->
        <div
          class="cinema-viewport border"
          role="region"
          aria-label="Framehouse projection workspace"
          tabindex="0"
        >
          <div class="cinema-stage projection-stage surface">
            <QLayout view={deskView}>
              {#snippet header()}
                <QHeader class="surface-container-low" height={Math.max(64, deskHeaderHeight)}>
                  <div
                    class="app-heading flex items-center q-pa-md"
                    {@attach measureBarHeight((height) => (deskHeaderHeight = height))}
                  >
                    <QIcon name="videocam" aria-hidden="true" />
                    <span class="title-medium">Projection desk</span>
                    <span class="label-medium text-on-surface-variant">Screen 1</span>
                  </div>
                </QHeader>
              {/snippet}
              {#snippet railbarLeft()}
                <QRailbar
                  id="projection-rail"
                  side={deskOnRight ? "right" : "left"}
                  width={railWidth}
                  expandedWidth={expandedRailWidth}
                  bind:expanded={deskExpanded}
                  bordered={deskBordered}
                  activeColor={indicatorColor}
                  aria-label="Projection navigation"
                >
                  <div class="rail-menu flex justify-center" style:width="{railWidth}px">
                    <QIconBtn
                      icon="menu"
                      flat
                      aria-label="Toggle projection navigation"
                      aria-expanded={deskExpanded}
                      aria-controls="projection-rail"
                      onclick={() => (deskExpanded = !deskExpanded)}
                    />
                  </div>
                  <QNavItem
                    icon="video_library"
                    label="Queue"
                    active={deskPage === "queue"}
                    onclick={() => (deskPage = "queue")}
                  />
                  <QNavItem
                    icon="subtitles"
                    label="Captions"
                    active={deskPage === "captions"}
                    onclick={() => (deskPage = "captions")}
                  />
                  <QNavItem
                    icon="description"
                    label="Notes"
                    active={deskPage === "notes"}
                    onclick={() => (deskPage = "notes")}
                  />
                </QRailbar>
              {/snippet}
              {#snippet footer()}
                <QFooter class="surface-container-low" height={Math.max(80, deskFooterHeight)}>
                  <div
                    class="projection-status flex items-center q-gap-sm q-px-md body-small"
                    {@attach measureBarHeight((height) => (deskFooterHeight = height))}
                  >
                    <span class="status-light bg-primary" aria-hidden="true"></span>
                    <span>{queuedFilm.title} · {subtitles ? "Subtitles on" : "Subtitles off"}</span>
                  </div>
                </QFooter>
              {/snippet}
              <div class="app-content q-pa-lg">
                {#if deskPage === "queue"}
                  <h6 class="title-large q-mt-none q-mb-sm">Up next</h6>
                  <p class="body-medium text-on-surface-variant">
                    Choose the film to cue for the next screening.
                  </p>
                  <div class="queue-list flex column q-gap-sm">
                    {#each FILMS as film (film.id)}
                      <QBtn
                        flat
                        class="queue-film justify-start"
                        icon={selectedFilm === film.id ? "check_circle" : "play_circle"}
                        label={`${film.time} · ${film.title}`}
                        aria-pressed={selectedFilm === film.id}
                        onclick={() => (selectedFilm = film.id)}
                      />
                    {/each}
                  </div>
                {:else if deskPage === "captions"}
                  <h6 class="title-large q-mt-none q-mb-sm">Caption settings</h6>
                  <p class="body-medium">{queuedFilm.title} has English subtitles available.</p>
                  <QSwitch label="Show subtitles" bind:value={subtitles} />
                  <p class="body-small text-on-surface-variant q-mt-md">
                    The projection status below follows this setting.
                  </p>
                {:else}
                  <h6 class="title-large q-mt-none q-mb-sm">Screening notes</h6>
                  <div class="screening-note flex items-start q-gap-md secondary-container">
                    <QIcon name={queuedFilm.icon} size="32px" aria-hidden="true" />
                    <div>
                      <h6 class="title-medium q-mt-none q-mb-xs">{queuedFilm.title}</h6>
                      <p class="body-medium q-ma-none">{queuedFilm.note}</p>
                      <p class="body-small q-mb-none">
                        {queuedFilm.duration} · Cue lights after the final credits.
                      </p>
                    </div>
                  </div>
                {/if}
              </div>
            </QLayout>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Navigation and Accessibility" noCode>
        <p>
          Give each rail an accessible name with <code>aria-label</code> or
          <code>aria-labelledby</code>. Keep three to seven primary destinations visible, and pair
          icons with short labels.
        </p>
        <p>
          These examples use buttons to switch local views. For app navigation, pass <code>to</code>
          or <code>href</code> to
          <a class="q-docs-link" href={resolve("/components/nav-item", {})}>QNavItem</a>
          so destinations remain real links. Use <code>badgeAriaLabel</code> to explain counts or unread
          dots. Modal rails contain focus while expanded and restore it when collapsed.
        </p>
        <p>
          For more layout combinations, see <a
            class="q-docs-link"
            href={resolve("/layout/pages", {})}>QLayout</a
          >. Expansion follows the reduced-motion preference automatically.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .cinema-preview {
    width: 100%;
    max-width: 448px;
    height: 312px;
    border-radius: 16px;
  }
  .preview-content {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .preview-art {
    height: 88px;
    margin-top: 12px;
    border-radius: 12px;
    background-image: radial-gradient(
      circle at 75% 20%,
      transparent 12px,
      currentColor 13px,
      transparent 14px
    );
  }
  .example-controls {
    gap: 12px 24px;
  }
  .example-controls :global(.q-switch) {
    max-width: 100%;
  }
  .example-controls :global(.q-switch__label) {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .cinema-viewport {
    max-width: 100%;
    overflow: auto;
    border-radius: 16px;
  }
  .cinema-viewport:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: 3px;
  }
  .cinema-stage {
    height: 520px;
    min-width: 560px;
  }
  .rail-menu {
    flex: none;
    width: 80px;
    align-self: flex-start;
  }
  :global(.q-railbar--expanded) .rail-menu {
    margin-inline: -12px;
  }
  :global(.q-railbar--end) .rail-menu,
  :global(.q-railbar--right) .rail-menu,
  :global(.q-railbar--left:dir(rtl)) .rail-menu {
    align-self: flex-end;
  }
  :global(.q-railbar--right:dir(rtl)) .rail-menu {
    align-self: flex-start;
  }
  .app-heading {
    gap: 8px 12px;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .app-heading > :last-child {
    margin-inline-start: auto;
  }
  .app-content {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .section-heading {
    gap: 12px;
  }
  .film-count {
    padding: 6px 12px;
    border-radius: 9999px;
    background: var(--surface-container);
  }
  .film-list,
  .guide-list {
    list-style: none;
    border-radius: 0;
  }
  .film-list {
    container-type: inline-size;
  }
  .film-row {
    display: grid;
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 8px 16px;
  }
  .film-row:first-child {
    padding-top: 0;
  }
  .film-art {
    width: 56px;
    height: 80px;
    border-radius: 8px;
  }
  .film-copy {
    min-width: 0;
  }
  .film-actions {
    grid-column: 2;
  }
  .empty-state {
    border-radius: 16px;
  }
  .action-message {
    min-height: 2.5em;
  }
  .festival-window {
    max-width: 640px;
    height: 480px;
    border-radius: 16px;
  }
  .festival-content {
    padding: 20px;
  }
  .festival-banner {
    gap: 12px;
    border-radius: 16px;
  }
  .guide-list li {
    gap: 12px;
  }
  .guide-list li > :first-child {
    flex: none;
  }
  .guide-list li > div {
    min-width: 0;
  }
  .festival-update {
    padding: 20px;
    border-radius: 12px;
  }
  .appearance-controls {
    margin-bottom: 20px;
  }
  .select-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 192px), 1fr));
  }
  .projection-stage {
    height: 420px;
  }
  .projection-status {
    padding-block: 12px;
    overflow-wrap: anywhere;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    white-space: normal;
  }
  .status-light {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .queue-list {
    align-items: stretch;
  }
  .queue-list :global(.queue-film) {
    text-align: start;
  }
  .screening-note {
    padding: 20px;
    border-radius: 16px;
  }
  .screening-note > :first-child {
    flex: none;
  }
  .screening-note > div {
    min-width: 0;
  }
  .rail-menu,
  .guide-list li,
  .projection-status,
  .queue-list,
  .screening-note {
    flex-wrap: nowrap;
  }
  @container (width >= 520px) {
    .film-row {
      grid-template-columns: 56px minmax(0, 1fr) auto;
      align-items: center;
    }
    .film-actions {
      grid-column: auto;
    }
  }
  @media (width <= 480px) {
    .preview-content {
      padding: 12px;
    }
    .festival-content {
      padding: 12px;
    }
    .festival-banner {
      padding: 12px;
    }
  }
</style>
