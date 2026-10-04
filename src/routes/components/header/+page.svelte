<script lang="ts">
  import { QHeaderDocs, QHeaderTitleDocs } from "$components/header/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import {
    QAvatar,
    QBtn,
    QHeader,
    QHeaderTitle,
    QIcon,
    QIconBtn,
    QInput,
    QLayout,
    QSwitch,
  } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QHeader — App Bar",
      "Build Material 3 app bars with QHeader for Svelte. Explore titles, subtitles, flexible heights, search, and headers that collapse or reveal on scroll."
    )
  );

  docsCtx.set({ snippets, componentDocs: [QHeaderDocs, QHeaderTitleDocs] });

  const NOTES = [
    {
      title: "The art of noticing",
      icon: "wb_sunny",
      color: "primary-container",
      summary: "Small details make familiar places feel new.",
      paragraphs: [
        "Take a familiar walk without a destination. Look up at the windows, down at the paving stones, and across at the shop you usually hurry past. There is often something new hiding in a place you know well.",
        "Bring back one detail: the shape of a shadow, a hand-painted sign, or the color of a doorway. Write it down before the rest of the day fills the space. A collection starts with noticing one thing.",
      ],
    },
    {
      title: "Five minutes of quiet",
      icon: "spa",
      color: "secondary-container",
      summary: "A small pause can change the pace of a day.",
      paragraphs: [
        "Put the kettle on and leave your phone in another room. You do not need to make the pause productive. Watch the steam, open a window, or sit somewhere you can see a patch of sky.",
        "When the cup is empty, choose one thing to do next. It can be a small thing. The point is to return to the day at your own pace, with a little more room between one task and another.",
      ],
    },
    {
      title: "Make something small",
      icon: "draw",
      color: "tertiary-container",
      summary: "A little space for making, just for yourself.",
      paragraphs: [
        "Fold a scrap of paper into a tiny book. Sketch the plant on your desk, write a postcard, or try a new combination of colors. Pick something small enough to finish before you start wondering whether it is any good.",
        "Leave what you made where you can see it. Tomorrow you might add another page, or you might try something completely different. A few minutes and whatever is already on the table are enough to begin.",
      ],
    },
  ] as const;

  const SAUNA_SESSIONS = ["17:30", "18:30"] as const;
  const HARBOR_STOPS = [
    {
      title: "The old port",
      time: "09:00",
      icon: "sailing",
      color: "primary-container",
      detail: "Stone quays, tall ships, and a city built around the water.",
      description:
        "Start by the harbor clock. Follow the quay past the old warehouses, where painted numbers still mark each loading bay. The small exhibition inside the customs house tells the story of the ships that once docked here.",
    },
    {
      title: "Market hall",
      time: "09:45",
      icon: "storefront",
      color: "tertiary-container",
      detail: "An iron-and-glass landmark, still full of local flavor.",
      description:
        "Cross the footbridge to the covered market. Its original iron roof shelters bakers, flower stalls, and a counter serving coffee from early morning. Take the stairs to the gallery for a closer look at the building's tiled signs.",
    },
    {
      title: "Ferry landing",
      time: "10:45",
      icon: "directions_boat",
      color: "secondary-container",
      detail: "A new view of the waterfront, just across the river.",
      description:
        "Continue along the promenade to the public ferry. Boats leave every fifteen minutes, and a regular city ticket covers the crossing. From the opposite bank, you can see the whole route: the warehouses, the market roof, and the harbor clock.",
    },
  ] as const;

  let hasLargeAppBar = $state(false);
  let hasCenteredAppBar = $state(false);
  let hasAppBarSubtitle = $state(true);
  let hasSavedWeekend = $state(false);
  let hasSavedWalk = $state(false);

  let reservedSession = $state<string>();
  let hasClassReminders = $state(false);
  let noteIndex = $state(0);
  let hasElevation = $state(true);
  let hasBorder = $state(false);
  let isInset = $state(true);
  let hasCompactTitle = $state(true);
  let searchQuery = $state("");
  const currentNote = $derived(NOTES[noteIndex]);
  const matchingNotes = $derived(
    NOTES.filter((note) => note.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  );
</script>

<QDocs docDescription="Keep navigation, titles, and actions at the top of your app.">
  {#snippet display()}
    <QLayout class="header-preview surface">
      {#snippet header()}
        <QHeader bordered>
          <QIcon name="fitness_center" class="text-tertiary q-ml-sm" aria-hidden="true" />
          <QHeaderTitle>Tempo</QHeaderTitle>
          <QIconBtn
            icon="notifications"
            variant="flat"
            aria-label="Class reminders"
            bind:selected={hasClassReminders}
          />
        </QHeader>
      {/snippet}
      {#snippet content()}
        <div class="workout-content">
          <div class="workout-art" aria-hidden="true">
            <span class="primary-container"><QIcon name="directions_run" size="40px" /></span>
            <span class="tertiary-container"><QIcon name="fitness_center" size="48px" /></span>
            <span class="secondary-container"><QIcon name="sports_gymnastics" size="40px" /></span>
          </div>
          <div class="label-medium text-on-surface-variant q-mt-md">TONIGHT'S CLASS</div>
          <h2 class="headline-small q-my-sm">Strength circuit</h2>
          <p class="body-medium q-ma-none" aria-live="polite">
            {hasClassReminders ? "Class reminder set for 18:30." : "18:30 · 35 minutes · Studio 2"}
          </p>
        </div>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Navigation and Style">
        {#snippet sectionDescription()}
          Use a header on its own, or place it in the <code>header</code> snippet of
          <code>QLayout</code>. Try the arrows to browse these notes, and switch between a shadow
          and a border.
        {/snippet}

        <div class="example-controls">
          <QSwitch label="Elevated" bind:value={hasElevation} />
          <QSwitch label="Bordered" bind:value={hasBorder} />
        </div>
        <div class="header-frame">
          <QHeader elevated={hasElevation} bordered={hasBorder}>
            <QIconBtn
              icon="arrow_back"
              variant="flat"
              aria-label="Previous note"
              disabled={noteIndex === 0}
              onclick={() => noteIndex--}
            />
            <QHeaderTitle>Reading room</QHeaderTitle>
            <QIconBtn
              icon="arrow_forward"
              variant="flat"
              aria-label="Next note"
              disabled={noteIndex === NOTES.length - 1}
              onclick={() => noteIndex++}
            />
          </QHeader>
          <div class="note-preview" aria-live="polite">
            <QAvatar size="64px" class={currentNote.color} aria-hidden="true">
              <QIcon name={currentNote.icon} size="32px" />
            </QAvatar>
            <div>
              <div class="label-medium text-on-surface-variant">
                NOTE {noteIndex + 1} OF {NOTES.length}
              </div>
              <h6 class="headline-small q-my-sm">{currentNote.title}</h6>
              <p class="body-medium q-ma-none">{currentNote.summary}</p>
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Flexible App Bars">
        {#snippet sectionDescription()}
          Use <code>variant="medium"</code> or <code>variant="large"</code> for a larger title. Add
          <code>subtitle</code>
          and <code>align="center"</code> to <code>QHeaderTitle</code>.
        {/snippet}

        <div class="example-controls">
          <QSwitch label="Large" bind:value={hasLargeAppBar} />
          <QSwitch label="Centered" bind:value={hasCenteredAppBar} />
          <QSwitch label="Subtitle" bind:value={hasAppBarSubtitle} />
        </div>
        <div class="header-frame city-preview">
          <QHeader variant={hasLargeAppBar ? "large" : "medium"}>
            <QIcon name="apartment" class="text-primary q-ml-sm" aria-hidden="true" />
            <QHeaderTitle
              align={hasCenteredAppBar ? "center" : "start"}
              subtitle={hasAppBarSubtitle ? "A weekend behind closed doors" : undefined}
              >Open House</QHeaderTitle
            >
            <QIconBtn
              icon="bookmark"
              variant="flat"
              aria-label="Save Open House weekend"
              bind:selected={hasSavedWeekend}
            />
          </QHeader>
          <div class="city-content">
            <div class="city-art" aria-hidden="true">
              <span class="city-sun tertiary-container"></span>
              <span class="city-building secondary-container"
                ><QIcon name="window" size="40px" /></span
              >
              <span class="city-building primary-container"
                ><QIcon name="door_front" size="48px" /></span
              >
              <span class="city-building tertiary-container"
                ><QIcon name="window" size="40px" /></span
              >
            </div>
            <div class="city-caption">
              <div>
                <div class="label-medium text-on-surface-variant">18–19 MAY · FREE ENTRY</div>
                <h6 class="title-large q-mt-sm q-mb-xs">See the city from the inside.</h6>
                <p class="body-medium text-on-surface-variant q-ma-none">
                  Studios, courtyards, and the stories behind them.
                </p>
              </div>
              <span class="label-large text-primary" aria-live="polite">
                {hasSavedWeekend ? "Saved to your plans" : "32 places to explore"}
              </span>
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Height">
        {#snippet sectionDescription()}
          The default height is 64px. Set <code>height</code> to a number of pixels for more room;
          this booking app uses <code>height={96}</code>.
        {/snippet}

        <QLayout class="header-frame sauna-layout">
          {#snippet header()}
            <QHeader height={96} class="tertiary-container">
              <QIcon name="hot_tub" size="32px" class="q-ml-md" aria-hidden="true" />
              <QHeaderTitle class="justify-start">
                <div>
                  <div class="label-medium">NORTH BATHS</div>
                  <div class="headline-small">Sauna sessions</div>
                </div>
              </QHeaderTitle>
            </QHeader>
          {/snippet}
          {#snippet content()}
            <div class="sauna-content">
              <div class="label-large text-on-surface-variant q-mb-md">
                TODAY · 60 MINUTES · €18
              </div>
              {#each SAUNA_SESSIONS as session (session)}
                <div class="session-row">
                  <div class="title-large">{session}</div>
                  <QBtn
                    variant="tonal"
                    label={reservedSession === session ? "Cancel" : "Reserve"}
                    aria-label={`${reservedSession === session ? "Cancel" : "Reserve"} ${session} session`}
                    onclick={() =>
                      (reservedSession = reservedSession === session ? undefined : session)}
                  />
                </div>
              {/each}
              <p class="body-medium text-on-surface-variant q-mb-none" aria-live="polite">
                {reservedSession
                  ? `${reservedSession} reserved. Bring a towel.`
                  : "Choose your time. Towels are available to hire."}
              </p>
            </div>
          {/snippet}
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Collapse on Scroll">
        {#snippet sectionDescription()}
          Set <code>collapse</code> inside <code>QLayout</code>. Scroll inside the guide: the title
          and subtitle become compact and stay small until you return to the top.
        {/snippet}

        <QLayout class="header-frame harbor-layout">
          {#snippet header()}
            <QHeader variant="large" collapse>
              <QIcon name="explore" class="text-primary q-ml-sm" aria-hidden="true" />
              <QHeaderTitle subtitle="3 stops · 2.4 km">Harbor walk</QHeaderTitle>
              <QIconBtn
                icon="bookmark"
                variant="flat"
                aria-label="Save harbor walk"
                bind:selected={hasSavedWalk}
              />
            </QHeader>
          {/snippet}
          {#snippet content()}
            <div class="harbor-content">
              <div class="walk-intro body-medium text-on-surface-variant">
                <QIcon name="directions_walk" aria-hidden="true" />
                <span>Two hours along the waterfront. Start at the harbor clock.</span>
              </div>
              {#each HARBOR_STOPS as stop, i (stop.title)}
                <article class="harbor-stop">
                  <div class="stop-marker" aria-hidden="true">
                    <span class={stop.color}><QIcon name={stop.icon} size="28px" /></span>
                  </div>
                  <div>
                    <div class="label-medium text-on-surface-variant">
                      STOP {i + 1} · {stop.time}
                    </div>
                    <h6 class="title-large q-mt-sm q-mb-xs">{stop.title}</h6>
                    <p class="body-medium text-primary q-mt-none q-mb-md">{stop.detail}</p>
                    <p class="body-large q-ma-none">{stop.description}</p>
                  </div>
                </article>
              {/each}
              <p class="walk-saved label-large text-primary" aria-live="polite">
                {hasSavedWalk
                  ? "Saved to your plans. See you by the water."
                  : "Save this walk for your next free morning."}
              </p>
            </div>
          {/snippet}
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Reveal on Scroll">
        {#snippet sectionDescription()}
          Scroll inside the reading area: <code>reveal</code> hides the header as you scroll down
          and brings it back as you scroll up. <code>revealOffset</code> sets the extra distance beyond
          the header height before it hides.
        {/snippet}

        <QLayout class="header-frame reader-layout">
          {#snippet header()}
            <QHeader reveal revealOffset={48} bordered>
              <QIcon name="auto_stories" class="text-tertiary q-ml-md" aria-hidden="true" />
              <QHeaderTitle class="justify-start">The slow journal</QHeaderTitle>
            </QHeader>
          {/snippet}
          {#snippet content()}
            <div class="journal-content">
              {#each NOTES as note (note.title)}
                <article>
                  <QIcon name={note.icon} class="text-tertiary" aria-hidden="true" />
                  <h6 class="headline-small q-my-sm">{note.title}</h6>
                  {#each note.paragraphs as paragraph (paragraph)}
                    <p class="body-large">{paragraph}</p>
                  {/each}
                </article>
              {/each}
            </div>
          {/snippet}
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Inset and Title Width">
        {#snippet sectionDescription()}
          <code>inset</code> leaves space before the content. <code>QHeaderTitle</code> fills the
          remaining width by default; <code>shrink</code> keeps it at its natural width.
        {/snippet}

        <div class="example-controls">
          <QSwitch label="Inset content" bind:value={isInset} />
          <QSwitch label="Compact title" bind:value={hasCompactTitle} />
        </div>
        <div class="header-frame">
          <QHeader inset={isInset} bordered>
            <QHeaderTitle shrink={hasCompactTitle}>Drafts</QHeaderTitle>
            <QIcon name="cloud_done" class="text-tertiary q-mr-md" aria-label="All changes saved" />
          </QHeader>
        </div>
      </QDocsSection>

      <QDocsSection title="Search">
        {#snippet sectionDescription()}
          The title area can hold a search field instead of text. Type a note title to filter the
          results below.
        {/snippet}

        <div class="header-frame">
          <QHeader bordered>
            <QHeaderTitle>
              <QInput
                bind:value={searchQuery}
                placeholder="Find a note"
                aria-label="Find a note"
                dense
                rounded
                style="width: 100%"
              >
                {#snippet prepend()}<QIcon name="search" aria-hidden="true" />{/snippet}
              </QInput>
            </QHeaderTitle>
            <QIconBtn
              icon="close"
              variant="flat"
              aria-label="Clear search"
              disabled={!searchQuery}
              onclick={() => (searchQuery = "")}
            />
          </QHeader>
          <div class="search-results" aria-live="polite">
            {#each matchingNotes as note (note.title)}
              <div class="search-result">
                <QAvatar class={note.color} aria-hidden="true">
                  <QIcon name={note.icon} />
                </QAvatar>
                <div>
                  <div class="title-medium">{note.title}</div>
                  <div class="body-medium text-on-surface-variant">{note.summary}</div>
                </div>
              </div>
            {:else}
              <p class="body-medium q-ma-none">No notes match your search.</p>
            {/each}
          </div>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  :global(.header-preview) {
    width: 100%;
    max-width: 28rem;
    height: 344px;
    border-radius: 24px;
  }

  .workout-content,
  .sauna-content {
    padding: 16px;
  }

  .workout-art {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 12px;
    height: 96px;
  }

  .workout-art span {
    display: grid;
    place-items: center;
    flex: 1;
    height: 72px;
    max-width: 88px;
    border-radius: 20px;
  }

  .workout-art span:nth-child(2) {
    height: 96px;
  }

  .example-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    margin-bottom: 16px;
  }

  :global(.header-frame) {
    max-width: 48rem;
    background-color: var(--surface-container-low);
    color: var(--on-surface);
    border-radius: 16px;
    overflow: hidden;
  }

  .note-preview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 24px;
    padding: 24px;
  }

  :global(.sauna-layout) {
    height: 352px;
  }

  .session-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-block: 8px;
  }

  :global(.reader-layout) {
    height: 352px;
  }

  .journal-content {
    max-width: 40rem;
    margin-inline: auto;
    padding: 24px;
  }

  .journal-content article + article {
    border-top: 1px solid var(--outline-variant);
    margin-top: 32px;
    padding-top: 32px;
  }

  .city-content {
    padding: 16px 24px 24px;
  }

  .city-art {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 12px;
    height: 168px;
    padding-inline: 16px;
    overflow: hidden;
    border-radius: 16px;
    background: var(--surface-container);
  }

  .city-sun {
    position: absolute;
    width: 56px;
    height: 56px;
    inset-block-start: 16px;
    inset-inline-end: 12%;
    border-radius: 50%;
  }

  .city-building {
    position: relative;
    display: grid;
    place-items: center;
    flex: 1;
    max-width: 136px;
    height: 96px;
    border-radius: 48px 48px 0 0;
  }

  .city-building:nth-of-type(3) {
    height: 144px;
    border-radius: 8px 8px 0 0;
  }

  .city-building:nth-of-type(4) {
    height: 112px;
    border-radius: 32px 8px 0 0;
  }

  .city-caption {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    padding-top: 24px;
  }

  :global(.harbor-layout) {
    height: 440px;
  }

  .harbor-content {
    padding: 20px 24px 24px;
  }

  .walk-intro {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .harbor-stop {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 16px;
    padding-bottom: 32px;
  }

  .stop-marker {
    position: relative;
    display: flex;
    justify-content: center;
    border-radius: 0;
  }

  .harbor-stop:not(:last-of-type) .stop-marker::after {
    position: absolute;
    content: "";
    width: 2px;
    inset-block: 56px -24px;
    background: var(--outline-variant);
  }

  .stop-marker span {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }

  .walk-saved {
    margin: 0;
    padding-top: 20px;
    border-top: 1px solid var(--outline-variant);
    border-radius: 0;
  }

  .search-results {
    display: grid;
    gap: 20px;
    padding: 20px;
  }

  .search-result {
    display: flex;
    align-items: center;
    gap: 16px;
  }
</style>
