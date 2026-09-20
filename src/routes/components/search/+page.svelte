<script lang="ts">
  import { QSearchDocs } from "$components/search/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QChip, QIcon, QIconBtn, QItem, QItemSection, QList, QSearch } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QSearchDocs });

  const places = [
    {
      name: "Glasshouse Conservatory",
      category: "Gardens",
      icon: "psychiatry",
      distance: "12 min walk",
      detail: "A warm indoor garden with towering ferns and a quiet reading bench.",
    },
    {
      name: "Wildflower Roof Garden",
      category: "Gardens",
      icon: "local_florist",
      distance: "8 min walk",
      detail: "An open rooftop planted for pollinators, with views across the old town.",
    },
    {
      name: "Harbour Observatory",
      category: "Culture",
      icon: "travel_explore",
      distance: "18 min walk",
      detail: "Explore star maps and the history of navigation inside a converted lighthouse.",
    },
    {
      name: "The Print Workshop",
      category: "Culture",
      icon: "palette",
      distance: "6 min walk",
      detail: "A small gallery of letterpress posters, handmade paper, and local illustrations.",
    },
    {
      name: "Reedbed Boardwalk",
      category: "Waterfront",
      icon: "water",
      distance: "15 min walk",
      detail: "A level wooden path through the reeds, with plenty of places to watch the water.",
    },
    {
      name: "East Quay Steps",
      category: "Waterfront",
      icon: "wb_twilight",
      distance: "10 min walk",
      detail: "Broad waterside steps that catch the last light of the day.",
    },
  ] as const;
  const placeCategories = ["All", "Gardens", "Culture", "Waterfront"] as const;
  type Place = (typeof places)[number];
  type PlaceCategory = (typeof placeCategories)[number];

  let previewQuery = $state("");
  let placeQuery = $state("");
  let placeCategory = $state<PlaceCategory>("All");
  let selectedPlace = $state<Place>(places[0]);
  const previewPlaces = $derived(
    places.filter((place) => matchesQuery(place.name, previewQuery)).slice(0, 3)
  );
  const matchingPlaces = $derived(
    places.filter((place) => {
      const matchesCategory = placeCategory === "All" || place.category === placeCategory;
      return matchesCategory && matchesQuery(`${place.name} ${place.category}`, placeQuery);
    })
  );

  const documents = [
    {
      title: "A quieter welcome",
      category: "Research",
      date: "12 September",
      summary: "Onboarding interviews",
      content:
        "People wanted one clear next step. We shortened the introduction and moved optional setup until after the first useful action.",
    },
    {
      title: "Wayfinding without a map",
      category: "Design",
      date: "8 September",
      summary: "Navigation design notes",
      content:
        "Landmarks made directions easier to remember. The prototype pairs each turn with a recognizable place instead of relying on distances alone.",
    },
    {
      title: "The small-screen checklist",
      category: "Design",
      date: "3 September",
      summary: "Mobile accessibility review",
      content:
        "Keep the primary action within reach, preserve the reading order, and check that the interface still works with larger text and a keyboard.",
    },
    {
      title: "What we learned outside",
      category: "Research",
      date: "28 August",
      summary: "Field research observations",
      content:
        "Bright light and divided attention changed how people used the interface. Short labels and visible progress helped more than extra instructions.",
    },
  ];
  type SearchDocument = (typeof documents)[number];

  let documentQuery = $state("");
  let submittedQuery = $state("");
  let recentQueries = $state(["design", "research", "mobile"]);
  let selectedDocument = $state<SearchDocument>(documents[0]);
  const matchingDocuments = $derived(
    documents.filter((document) =>
      matchesQuery(
        `${document.title} ${document.category} ${document.summary} ${document.content}`,
        submittedQuery
      )
    )
  );

  const recordings = [
    {
      title: "Rain on the glasshouse",
      location: "Botanical gardens",
      duration: "8:24",
      icon: "rainy",
      description: "Soft rain, distant birds, and the occasional creak of the greenhouse frame.",
    },
    {
      title: "First ferry of the morning",
      location: "East harbour",
      duration: "6:12",
      icon: "directions_boat",
      description: "A low engine note fades into gulls, footsteps, and the water against the quay.",
    },
    {
      title: "Night train through the valley",
      location: "Mountain pass",
      duration: "12:08",
      icon: "train",
      description:
        "Steady rail rhythms move through open air, tunnels, and quiet station platforms.",
    },
    {
      title: "Wind in the reedbeds",
      location: "Riverside reserve",
      duration: "4:36",
      icon: "air",
      description: "Dry reeds rustle above a slow current, punctuated by a few nearby songbirds.",
    },
  ] as const;
  type Recording = (typeof recordings)[number];

  let recordingQuery = $state("");
  let selectedRecording = $state<Recording>(recordings[0]);
  let savedTitles = $state<string[]>([]);
  const matchingRecordings = $derived(
    recordings.filter((recording) =>
      matchesQuery(`${recording.title} ${recording.location}`, recordingQuery)
    )
  );

  function matchesQuery(text: string, query: string) {
    return text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }

  function handlePlaceCategory(event: Event, category: PlaceCategory) {
    event.preventDefault();
    placeCategory = category;
  }

  function handleSelectPlace(place: Place, close: () => void) {
    selectedPlace = place;
    close();
  }

  function handleSearchDocuments(query: string) {
    submittedQuery = query.trim();

    if (submittedQuery) {
      recentQueries = [
        submittedQuery,
        ...recentQueries.filter((recent) => recent !== submittedQuery),
      ].slice(0, 4);
    }
  }

  function handleSelectDocument(document: SearchDocument, close: () => void) {
    selectedDocument = document;
    close();
  }

  function handleSelectRecording(recording: Recording, close: () => void) {
    selectedRecording = recording;
    close();
  }

  function handleBookmarkRecording(event: Event, title: string) {
    event.preventDefault();
    toggleSavedRecording(title);
  }

  function toggleSavedRecording(title: string) {
    if (savedTitles.includes(title)) {
      savedTitles = savedTitles.filter((saved) => saved !== title);
      return;
    }

    savedTitles = [...savedTitles, title];
  }
</script>

<svelte:head>
  <title>{pageTitle("QSearch")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QSearch
      bind:value={previewQuery}
      status={`${previewPlaces.length} places found`}
      placeholder="Find a little adventure"
      aria-label="Find a little adventure"
      style="max-width: 28rem;"
    >
      {#snippet children({ close })}
        <p class="label-large q-px-md q-pt-sm">Somewhere nearby</p>
        <QList tag="ul" role="list" aria-label="Nearby places">
          {#each previewPlaces as place (place.name)}
            <QItem tag="li">
              <QItemSection
                action
                onclick={() => {
                  previewQuery = place.name;
                  close();
                }}
              >
                {#snippet leading()}<QIcon aria-hidden="true" name={place.icon} />{/snippet}
                {place.name}
                {#snippet line1()}{place.distance}{/snippet}
              </QItemSection>
            </QItem>
          {:else}
            <QItem tag="li">
              <QItemSection>No nearby places match. Try “garden” or “harbour”.</QItemSection>
            </QItem>
          {/each}
        </QList>
      {/snippet}
    </QSearch>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Search">
        {#snippet sectionDescription()}
          Bind <code>value</code> to filter results as someone types. The default <code>auto</code>
          layout opens a docked view on larger screens and fills the screen below 600px. Combine search
          with filter chips to help people narrow a broad collection. This example uses
          <code>{"expressive={false}"}</code> for a divided view, with a divider below its search field.
        {/snippet}

        <div class="search-demo">
          <p class="label-large q-mb-sm">THE SLOW ROUTE · LOCAL GUIDE</p>
          <h6 class="q-mb-md">Take the scenic way home.</h6>
          <QSearch
            bind:value={placeQuery}
            expressive={false}
            placeholder="Search places nearby"
            aria-label="Search places nearby"
            status={`${matchingPlaces.length} places found`}
          >
            {#snippet children({ close })}
              <div class="flex q-gap-sm q-pa-md" role="group" aria-label="Place categories">
                {#each placeCategories as category (category)}
                  <QChip
                    kind="filter"
                    label={category}
                    selected={placeCategory === category}
                    onclick={(event) => handlePlaceCategory(event, category)}
                  />
                {/each}
              </div>
              <QList tag="ul" role="list" aria-label="Matching places">
                {#each matchingPlaces as place (place.name)}
                  <QItem tag="li">
                    <QItemSection action onclick={() => handleSelectPlace(place, close)}>
                      {#snippet leading()}<QIcon aria-hidden="true" name={place.icon} />{/snippet}
                      {place.name}
                      {#snippet line1()}{place.category} · {place.distance}{/snippet}
                    </QItemSection>
                  </QItem>
                {:else}
                  <QItem tag="li">
                    <QItemSection
                      >No places found. Try a different category or a shorter search.</QItemSection
                    >
                  </QItem>
                {/each}
              </QList>
            {/snippet}
          </QSearch>
          <div class="search-detail q-mt-lg" aria-live="polite">
            <QIcon aria-hidden="true" name={selectedPlace.icon} size={36} />
            <div>
              <div class="title-medium">{selectedPlace.name}</div>
              <p class="q-my-sm">{selectedPlace.detail}</p>
              <span class="label-medium">{selectedPlace.distance} · {selectedPlace.category}</span>
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Expressive Search">
        {#snippet sectionDescription()}
          Use <code>onsearch</code> for submitted queries. Type a term and press Enter, or choose a
          recent search. Results stay unchanged while the next query is being edited. The
          <code>search</code> snippet function submits a suggestion through the same callback.
          <code>expressive</code> gives the search field its own contained shape in the open view.
        {/snippet}

        <div class="search-demo">
          <p class="label-large q-mb-sm">THE WORKING NOTEBOOK · 4 DOCUMENTS</p>
          <QSearch
            bind:value={documentQuery}
            expressive
            onsearch={handleSearchDocuments}
            placeholder="Search the notebook"
            aria-label="Search the notebook"
            status={submittedQuery
              ? `${matchingDocuments.length} documents found for ${submittedQuery}`
              : "Choose a recent search or submit a query"}
          >
            {#snippet children({ close, search })}
              {#if submittedQuery}
                <p class="label-large q-px-md q-pt-md">Results for “{submittedQuery}”</p>
                <QList tag="ul" role="list" aria-label="Document results">
                  {#each matchingDocuments as document (document.title)}
                    <QItem tag="li">
                      <QItemSection action onclick={() => handleSelectDocument(document, close)}>
                        {#snippet leading()}<QIcon
                            aria-hidden="true"
                            name="description"
                          />{/snippet}
                        {document.title}
                        {#snippet line1()}{document.summary}{/snippet}
                        {#snippet line2()}{document.category} · {document.date}{/snippet}
                      </QItemSection>
                    </QItem>
                  {:else}
                    <QItem tag="li">
                      <QItemSection
                        >No documents match “{submittedQuery}”. Try “design”, “research”, or
                        “mobile”.</QItemSection
                      >
                    </QItem>
                  {/each}
                </QList>
              {:else}
                <p class="label-large q-px-md q-pt-md">Recent searches</p>
                <QList tag="ul" role="list" aria-label="Recent notebook searches">
                  {#each recentQueries as query (query)}
                    <QItem tag="li">
                      <QItemSection action onclick={() => search(query)}>
                        {#snippet leading()}<QIcon aria-hidden="true" name="history" />{/snippet}
                        {query}
                      </QItemSection>
                    </QItem>
                  {/each}
                </QList>
              {/if}
            {/snippet}
          </QSearch>
          <article class="q-mt-lg" aria-live="polite">
            <span class="label-medium">{selectedDocument.category} · {selectedDocument.date}</span>
            <h6 class="q-my-sm">{selectedDocument.title}</h6>
            <p>{selectedDocument.content}</p>
          </article>
        </div>
      </QDocsSection>

      <QDocsSection title="Expressive Full-screen Search">
        {#snippet sectionDescription()}
          Use <code>layout="fullscreen"</code> for a more immersive search. Results can include independent
          actions: open a recording's notes or bookmark it without leaving search. These sample recordings
          have descriptions only; no audio is loaded.
        {/snippet}

        <div class="search-demo search-demo--recordings">
          <p class="label-large q-mb-sm">FIELD NOTES · A SOUND JOURNAL</p>
          <QSearch
            bind:value={recordingQuery}
            layout="fullscreen"
            expressive
            placeholder="Find a soundscape"
            aria-label="Find a soundscape"
            status={`${matchingRecordings.length} recordings found`}
          >
            {#snippet children({ close })}
              <div class="q-pa-md">
                <h6 class="q-mb-sm">Listen a little closer.</h6>
                <p>Search by sound or location. Bookmark a few places for later.</p>
              </div>
              <QList tag="ul" role="list" expressive aria-label="Field recordings">
                {#each matchingRecordings as recording (recording.title)}
                  <QItem tag="li">
                    <QItemSection action onclick={() => handleSelectRecording(recording, close)}>
                      {#snippet leading()}<QIcon
                          aria-hidden="true"
                          name={recording.icon}
                          size={32}
                        />{/snippet}
                      {recording.title}
                      {#snippet line1()}{recording.location} · {recording.duration}{/snippet}
                    </QItemSection>
                    <QItemSection type="side">
                      <QIconBtn
                        icon={savedTitles.includes(recording.title)
                          ? "bookmark_added"
                          : "bookmark_add"}
                        flat
                        type="button"
                        aria-label={`Save ${recording.title}`}
                        selected={savedTitles.includes(recording.title)}
                        onclick={(event) => handleBookmarkRecording(event, recording.title)}
                      />
                    </QItemSection>
                  </QItem>
                {:else}
                  <QItem tag="li">
                    <QItemSection>Nothing here yet. Try “rain”, “harbour”, or “train”.</QItemSection
                    >
                  </QItem>
                {/each}
              </QList>
            {/snippet}
          </QSearch>
          <div class="search-detail q-mt-lg" aria-live="polite">
            <QIcon aria-hidden="true" name={selectedRecording.icon} size={40} />
            <div>
              <div class="title-medium">{selectedRecording.title}</div>
              <p class="q-my-sm">{selectedRecording.description}</p>
              <span class="label-medium"
                >{selectedRecording.location} · {selectedRecording.duration}</span
              >
            </div>
          </div>
          <div class="q-mt-lg">
            <div class="label-large q-mb-sm">Saved for later ({savedTitles.length})</div>
            <div class="flex q-gap-sm">
              {#each savedTitles as title (title)}
                <QChip
                  kind="input"
                  label={title}
                  trailingIcon="close"
                  onTrailingIconClick={() => toggleSavedRecording(title)}
                />
              {:else}
                <span class="body-medium"
                  >Open search and bookmark a recording to start your shortlist.</span
                >
              {/each}
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        <p>
          The default placeholder and accessible labels follow the language pack and
          <code>translations.search</code> configured with <code>Quaff.init()</code>. Use
          <code>placeholder</code> and <code>labels</code> to override them for an individual search.
        </p>
        <p class="q-mt-md">
          Give each search a meaningful <code>aria-label</code>. QSearch manages the search field,
          opening and closing the view, focus restoration, and the clear action. Your application
          supplies filtering and result content through the <code>children</code> snippet; use
          <code>status</code> for a short result-count announcement.
        </p>
        <p class="q-mt-md">
          Press Enter to submit a query and Escape to close the view. Tab reaches filters and result
          actions. The examples reuse <code>QList</code> and <code>QItem</code> for arrow-key
          navigation inside a result list. Call the snippet's <code>close</code> function after choosing
          a result when the next step belongs outside search.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .search-demo {
    max-width: 42rem;
    padding: clamp(1rem, 4vw, 2rem);
    border-radius: 1.75rem;
    color: var(--on-surface);
    background: var(--surface-container-low);
  }

  .search-demo--recordings {
    background: var(--secondary-container);
    color: var(--on-secondary-container);
  }

  .search-detail {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }
</style>
