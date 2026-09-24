<script lang="ts">
  import { resolve } from "$app/paths";
  import { QBottomSheetDocs } from "$components/bottom-sheet/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QAvatar,
    QBottomSheet,
    QBtn,
    QCard,
    QIcon,
    QItem,
    QItemSection,
    QList,
    QSelect,
    QSwitch,
  } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QBottomSheetDocs });

  let isPreviewOpen = $state(true);
  let isStandardOpen = $state(true);
  let isStandardExpanded = $state(false);
  let isSaved = $state(false);
  let isModalOpen = $state(false);
  let isPreferencesOpen = $state(false);
  let selectedPlace = $state("Riverside Café");
  let travelMode = $state("walking");
  let hasNotifications = $state(true);

  const places = [
    {
      name: "Riverside Café",
      description: "Coffee & pastries",
      distance: "8 min walk",
      icon: "local_cafe",
      color: "tertiary-container",
    },
    {
      name: "The Botanist",
      description: "Brunch in the courtyard",
      distance: "12 min walk",
      icon: "local_florist",
      color: "primary-container",
    },
    {
      name: "Market Garden",
      description: "Seasonal food & fresh flowers",
      distance: "15 min walk",
      icon: "storefront",
      color: "secondary-container",
    },
  ] as const;
  const travelModes = [
    {
      label: "Walking",
      value: "walking",
      icon: "directions_walk" as const,
      route: "Take the scenic route",
    },
    {
      label: "Cycling",
      value: "cycling",
      icon: "directions_bike" as const,
      route: "Follow the cycle paths",
    },
    {
      label: "Public transport",
      value: "transit",
      icon: "tram" as const,
      route: "Find a nearby stop",
    },
  ];
  const selectedStop = $derived(places.find((place) => place.name === selectedPlace) ?? places[0]);
  const selectedTravelMode = $derived(
    travelModes.find((mode) => mode.value === travelMode) ?? travelModes[0]
  );

  function choosePlace(place: string) {
    selectedPlace = place;
    isModalOpen = false;
  }
</script>

<svelte:head>
  <title>{pageTitle("QBottomSheet")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <div class="q-bottom-sheet-preview">
      <QList class="tertiary-container">
        <QItem
          clickable
          aria-expanded={isPreviewOpen}
          aria-controls="preview-place-details"
          onclick={() => (isPreviewOpen = true)}
        >
          <QItemSection type="side">
            <QAvatar class="tertiary" aria-hidden="true">
              <QIcon name="local_cafe" />
            </QAvatar>
          </QItemSection>
          <QItemSection>
            {#snippet headline()}Coffee by the river{/snippet}
            {#snippet line1()}Your next stop on a morning walk{/snippet}
          </QItemSection>
        </QItem>
      </QList>
      <QBottomSheet
        id="preview-place-details"
        bind:value={isPreviewOpen}
        aria-label="Place details"
      >
        <h6 class="q-mb-sm">Riverside Café</h6>
        <div class="flex items-center q-gap-md q-mb-sm body-medium">
          <span class="flex items-center q-gap-xs">
            <QIcon name="star" class="text-tertiary" aria-hidden="true" />
            4.8
          </span>
          <span class="flex items-center q-gap-xs">
            <QIcon name="directions_walk" class="text-primary" aria-hidden="true" />
            8 min walk
          </span>
        </div>
        <p class="q-mb-none body-medium">Coffee and pastries by the water.</p>
        <QList dense class="secondary-container q-mt-lg">
          <QItem>
            <QItemSection>Flat white</QItemSection>
            <QItemSection type="trailingText">€3.80</QItemSection>
          </QItem>
          <QItem>
            <QItemSection>Almond croissant</QItemSection>
            <QItemSection type="trailingText">€3.20</QItemSection>
          </QItem>
        </QList>
      </QBottomSheet>
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Standard Bottom Sheet">
        {#snippet sectionDescription()}
          Standard sheets keep the rest of the page interactive. Place one inside a positioned
          container, then drag or select its handle to expand or collapse it.
        {/snippet}

        <div class="q-bottom-sheet-example surface-container-low">
          <div class="q-pa-md">
            <QCard fill="tertiary" class="q-mb-md flex items-center q-gap-md">
              <QAvatar size="lg" class="tertiary" aria-hidden="true">
                <QIcon name={selectedStop.icon} />
              </QAvatar>
              <div class="q-bottom-sheet-destination-copy">
                <div class="label-medium">Plan your visit · Saturday, 10:00</div>
                <h6 class="q-mb-xs">{selectedPlace}</h6>
                <div class="body-medium">{selectedStop.description} · {selectedStop.distance}</div>
              </div>
            </QCard>
            <div class="flex q-gap-sm">
              <QBtn
                variant="tonal"
                label={isSaved ? "Saved" : "Save place"}
                aria-pressed={isSaved}
                onclick={() => (isSaved = !isSaved)}
              />
              <QBtn
                variant="outlined"
                label={isStandardOpen ? "Hide nearby places" : "Nearby places"}
                onclick={() => (isStandardOpen = !isStandardOpen)}
              />
            </div>
          </div>
          <QBottomSheet
            bind:value={isStandardOpen}
            bind:expanded={isStandardExpanded}
            aria-labelledby="nearby-places-title"
          >
            <h6 id="nearby-places-title" class="q-mb-sm">Nearby places</h6>
            <p>Good food, a little fresh air, and somewhere new.</p>
            <QList>
              {#each places as place (place.name)}
                <QItem
                  clickable
                  active={selectedPlace === place.name}
                  onclick={() => choosePlace(place.name)}
                >
                  <QItemSection type="side">
                    <QAvatar class={place.color} aria-hidden="true">
                      <QIcon name={place.icon} />
                    </QAvatar>
                  </QItemSection>
                  <QItemSection>
                    {#snippet headline()}{place.name}{/snippet}
                    {#snippet line1()}{place.description} · {place.distance}{/snippet}
                  </QItemSection>
                  {#if selectedPlace === place.name}
                    <QItemSection type="side">
                      <QIcon name="check_circle" class="text-primary" aria-hidden="true" />
                    </QItemSection>
                  {/if}
                </QItem>
              {/each}
            </QList>
          </QBottomSheet>
        </div>
      </QDocsSection>

      <QDocsSection title="Modal Bottom Sheet">
        {#snippet sectionDescription()}
          Use <code>modal</code> for a focused task, especially on compact screens. Select an
          option, press Escape or select the scrim to close. On larger screens, consider a standard
          sheet or <a href={resolve("/components/dialog", {})}>QDialog</a>.
        {/snippet}

        <QBtn variant="tonal" label="Choose a place" onclick={() => (isModalOpen = true)} />
        <QBottomSheet bind:value={isModalOpen} modal aria-labelledby="choose-place-title">
          <h6 id="choose-place-title" class="q-mb-sm">Choose a place</h6>
          <QList>
            {#each places as place (place.name)}
              <QItem
                clickable
                active={selectedPlace === place.name}
                onclick={() => choosePlace(place.name)}
              >
                <QItemSection>{place.name}</QItemSection>
              </QItem>
            {/each}
          </QList>
        </QBottomSheet>
      </QDocsSection>

      <QDocsSection title="Composing with Other Components">
        {#snippet sectionDescription()}
          Add form controls and actions to your sheet. Give it an accessible name with
          <code>aria-label</code> or <code>aria-labelledby</code>.
        {/snippet}

        <QBtn
          variant="tonal"
          label="Travel preferences"
          onclick={() => (isPreferencesOpen = true)}
        />
        <QBottomSheet
          bind:value={isPreferencesOpen}
          modal
          aria-labelledby="travel-preferences-title"
        >
          <h6 id="travel-preferences-title" class="q-mb-lg">Travel preferences</h6>
          <div class="flex column q-gap-lg">
            <QCard fill="primary" class="flex items-center q-gap-md">
              <QAvatar size="lg" class="primary" aria-hidden="true">
                <QIcon name={selectedTravelMode.icon} />
              </QAvatar>
              <div class="q-bottom-sheet-destination-copy">
                <div class="label-medium">Your next stop</div>
                <div class="title-medium">{selectedPlace}</div>
                <div class="body-medium">{selectedTravelMode.route}</div>
              </div>
            </QCard>
            <QSelect
              bind:value={travelMode}
              options={travelModes}
              label="Travel mode"
              outlined
              emitValue
            />
            <QSwitch bind:value={hasNotifications} label="Journey reminders" />
            <p class="q-mb-none">
              {hasNotifications
                ? "We’ll remind you 15 minutes before your Saturday visit."
                : "Reminders are off for your Saturday visit."}
            </p>
            <div class="flex justify-end">
              <QBtn variant="tonal" label="Done" onclick={() => (isPreferencesOpen = false)} />
            </div>
          </div>
        </QBottomSheet>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .q-bottom-sheet-preview,
  .q-bottom-sheet-example {
    position: relative;
    width: 100%;
    max-width: 40rem;
    overflow: hidden;
    border-radius: 16px;
  }

  .q-bottom-sheet-preview {
    height: 320px;
    padding: 16px;
  }

  .q-bottom-sheet-example {
    height: 512px;
  }

  .q-bottom-sheet-destination-copy {
    flex: 1;
  }

  @media (width <= 640px) {
    .q-bottom-sheet-example {
      height: 576px;
    }
  }
</style>
