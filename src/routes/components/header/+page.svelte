<script lang="ts">
  import { QHeaderDocs, QHeaderTitleDocs } from "$components/header/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
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
  import snippets from "./docs.snippets";

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

<svelte:head>
  <title>{pageTitle("QHeader")}</title>
</svelte:head>

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
            <span class="primary-container"><QIcon name="directions_run" size="2.5rem" /></span>
            <span class="tertiary-container"><QIcon name="fitness_center" size="3rem" /></span>
            <span class="secondary-container"><QIcon name="sports_gymnastics" size="2.5rem" /></span
            >
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
            <QAvatar size="4rem" class={currentNote.color} aria-hidden="true">
              <QIcon name={currentNote.icon} size="2rem" />
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

      <QDocsSection title="Custom Height">
        {#snippet sectionDescription()}
          The default height is 64px. Set <code>height</code> to a number of pixels for more room;
          this booking app uses <code>height={96}</code>.
        {/snippet}

        <QLayout class="header-frame sauna-layout">
          {#snippet header()}
            <QHeader height={96} class="tertiary-container">
              <QIcon name="hot_tub" size="2rem" class="q-ml-md" aria-hidden="true" />
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
    height: 21.5rem;
    border-radius: 1.5rem;
  }

  .workout-content,
  .sauna-content {
    padding: 1rem;
  }

  .workout-art {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 0.75rem;
    height: 6rem;
  }

  .workout-art span {
    display: grid;
    place-items: center;
    flex: 1;
    height: 4.5rem;
    max-width: 5.5rem;
    border-radius: 1.25rem;
  }

  .workout-art span:nth-child(2) {
    height: 6rem;
  }

  .example-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 1.5rem;
    margin-bottom: 1rem;
  }

  :global(.header-frame) {
    max-width: 48rem;
    background-color: var(--surface-container-low);
    color: var(--on-surface);
    border-radius: 1rem;
    overflow: hidden;
  }

  .note-preview {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  :global(.sauna-layout) {
    height: 22rem;
  }

  .session-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-block: 0.5rem;
  }

  :global(.reader-layout) {
    height: 22rem;
  }

  .journal-content {
    max-width: 40rem;
    margin-inline: auto;
    padding: 1.5rem;
  }

  .journal-content article + article {
    border-top: 0.0625rem solid var(--outline-variant);
    margin-top: 2rem;
    padding-top: 2rem;
  }

  .search-results {
    display: grid;
    gap: 1.25rem;
    padding: 1.25rem;
  }

  .search-result {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
