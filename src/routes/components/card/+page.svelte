<script lang="ts">
  import { base } from "$app/paths";
  import { QCardActionsDocs, QCardDocs, QCardSectionDocs } from "$components/card/docs";
  import type { QCardActionsProps } from "$components/card/props";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QAvatar, QBtn, QCard, QCardActions, QCardSection, QIcon, QSelect, QSwitch } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QCardDocs, QCardSectionDocs, QCardActionsDocs] });

  const FILLED_CARDS = [
    { fill: true, icon: "bookmark", title: "Saved ideas", value: "12", detail: "For a rainy day" },
    {
      fill: "primary",
      icon: "park",
      title: "Fresh air",
      value: "42 min",
      detail: "A little time outside",
    },
    {
      fill: "secondary",
      icon: "auto_stories",
      title: "Reading streak",
      value: "7 days",
      detail: "One chapter at a time",
    },
    {
      fill: "tertiary",
      icon: "task_alt",
      title: "Little victories",
      value: "4 of 5",
      detail: "Things off your mind",
    },
  ] as const;
  const ALIGNMENTS = [
    { label: "Start", value: "left" },
    { label: "Center", value: "center" },
    { label: "End", value: "right" },
    { label: "Between", value: "between" },
    { label: "Around", value: "around" },
    { label: "Evenly", value: "evenly" },
  ];

  let isWorkshopSaved = $state(false);
  let isRecipeVisible = $state(false);
  let isStoryLiked = $state(false);
  let actionAlignment = $state<NonNullable<QCardActionsProps["align"]>>("right");
  let hasVerticalActions = $state(false);
  let hasRoundedCorners = $state(false);
  let isBagSaved = $state(false);
  let isInBasket = $state(false);
</script>

<svelte:head>
  <title>{pageTitle("QCard")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QCard class="workshop-card">
      <div class="print-art secondary-container" aria-hidden="true">
        <span class="print-sheet secondary"><QIcon name="filter_vintage" size="3rem" /></span>
        <span class="print-sheet primary"><QIcon name="wb_sunny" size="3rem" /></span>
        <span class="print-sheet tertiary"><QIcon name="waves" size="3rem" /></span>
      </div>
      <QCardSection>
        <div class="label-medium text-on-surface-variant">THE LITTLE PRINT CLUB</div>
        <h2 class="headline-small q-my-xs">Print a little joy</h2>
        <p class="body-medium q-ma-none">Saturday, 10:30 · Paper Room</p>
      </QCardSection>
      <QCardActions align="between middle" aria-label="Workshop actions">
        <span class="label-large">All materials included</span>
        <QBtn
          variant="tonal"
          icon={isWorkshopSaved ? "bookmark_added" : "bookmark_add"}
          label="Save"
          bind:selected={isWorkshopSaved}
        />
      </QCardActions>
    </QCard>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Card Variants">
        {#snippet sectionDescription()}
          Cards have elevation by default. Use <code>bordered</code> for an outline or
          <code>flat</code> to remove the shadow.
        {/snippet}

        <div class="card-grid">
          <QCard class="example-card">
            <div class="label-medium text-on-surface-variant">ELEVATED</div>
            <QCardSection class="flex items-center justify-between q-gap-md q-my-lg">
              <div>
                <h6 class="title-medium">A window of sunshine</h6>
                <div class="display-small q-mt-sm">21°</div>
              </div>
              <div class="sun-shape primary-container" aria-hidden="true">
                <QIcon name="light_mode" size="2.5rem" />
              </div>
            </QCardSection>
            <p class="body-medium text-on-surface-variant q-ma-none">
              A good afternoon to take the long way home.
            </p>
          </QCard>

          <QCard class="example-card" bordered>
            <div class="label-medium text-on-surface-variant">BORDERED</div>
            <QCardSection class="q-my-lg">
              <QIcon name="backpack" class="text-tertiary q-mb-sm" size="2rem" aria-hidden="true" />
              <h6 class="title-large">Travel light</h6>
              <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
                The essentials for a day away.
              </p>
            </QCardSection>
            <div class="packing-list body-medium">
              <span><QIcon name="check" size="1.125rem" aria-hidden="true" /> Water bottle</span>
              <span><QIcon name="check" size="1.125rem" aria-hidden="true" /> A good book</span>
            </div>
          </QCard>

          <QCard class="example-card" flat>
            <div class="label-medium text-on-surface-variant">FLAT</div>
            <QCardSection class="q-my-lg">
              <div class="book-spines" aria-hidden="true">
                <span class="primary-container"></span>
                <span class="tertiary-container"></span>
                <span class="secondary-container"></span>
              </div>
              <h6 class="title-large q-mt-md">Just one more chapter</h6>
            </QCardSection>
            <p class="body-medium text-on-surface-variant q-ma-none">
              Three short reads for a quiet weekend.
            </p>
          </QCard>
        </div>
      </QDocsSection>

      <QDocsSection title="Media and Horizontal Sections">
        {#snippet sectionDescription()}
          Combine images and text with a <code>horizontal</code> section. Grid classes let the content
          stack on smaller screens.
        {/snippet}

        <QCard class="recipe-card" bordered>
          <QCardSection horizontal class="q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <img
                class="recipe-image"
                src={`${base}/lime-mint-drink.jpg`}
                alt="A green drink garnished with fresh mint and a slice of lime"
                width="1229"
                height="1536"
                loading="lazy"
              />
            </div>
            <div class="col-12 col-sm-8">
              <div class="label-medium text-tertiary">SOMETHING REFRESHING</div>
              <h6 class="headline-small q-my-sm">Mint, lime & a little fizz</h6>
              <p class="body-medium text-on-surface-variant">
                A bright, alcohol-free cooler for slow afternoons.
              </p>
              <div class="flex items-center q-gap-lg q-my-lg body-medium">
                <span class="flex items-center q-gap-xs"
                  ><QIcon name="schedule" size="1.25rem" aria-hidden="true" /> 5 minutes</span
                >
                <span class="flex items-center q-gap-xs"
                  ><QIcon name="local_bar" size="1.25rem" aria-hidden="true" /> Serves one</span
                >
              </div>
              <QBtn
                variant="tonal"
                label={isRecipeVisible ? "Hide recipe" : "Show recipe"}
                aria-expanded={isRecipeVisible}
                aria-controls="card-cooler-recipe"
                onclick={() => (isRecipeVisible = !isRecipeVisible)}
              />
            </div>
          </QCardSection>
          <QCardSection
            id="card-cooler-recipe"
            hidden={!isRecipeVisible}
            class="q-mt-lg body-medium"
          >
            <ol class="recipe-steps q-ma-none">
              <li>Gently muddle six mint leaves with the juice of half a lime.</li>
              <li>Add ice and a teaspoon of sugar syrup.</li>
              <li>Top with sparkling water, stir, and add a slice of lime.</li>
            </ol>
          </QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Structured Card Content">
        {#snippet sectionDescription()}
          Use sections for a byline, heading, and supporting text. Add <code>rounded</code> for softer
          corners.
        {/snippet}

        <QCard class="story-card" fill="secondary" rounded>
          <QCardSection class="story-byline">
            <QAvatar size="sm" class="secondary" aria-hidden="true">ML</QAvatar>
            <div>
              <div class="title-medium">Maya Lee</div>
              <div class="body-small">The balcony journal · 2 min read</div>
            </div>
            <QIcon name="potted_plant" size="2.5rem" aria-hidden="true" />
          </QCardSection>
          <QCardSection class="q-my-lg">
            <h6 class="headline-small q-mb-sm">A tiny garden, five floors up</h6>
            <p class="body-large q-ma-none">
              Three pots, a handful of herbs, and a sunny corner. Sometimes a little green is all it
              takes.
            </p>
          </QCardSection>
          <QCardActions align="right" aria-label="Story actions">
            <QBtn
              variant="flat"
              color="inherit"
              label={isStoryLiked ? "Unlike" : "Like"}
              onclick={() => (isStoryLiked = !isStoryLiked)}
            >
              {#snippet icon()}
                <QIcon
                  name="favorite"
                  filled={isStoryLiked}
                  class="q-btn__icon"
                  size="1.25rem"
                  aria-hidden="true"
                />
              {/snippet}
            </QBtn>
          </QCardActions>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Fill Colors">
        {#snippet sectionDescription()}
          Use <code>fill</code> for a neutral surface, or choose <code>primary</code>,
          <code>secondary</code>, or <code>tertiary</code>. Each includes a matching text color.
        {/snippet}

        <div class="card-grid">
          {#each FILLED_CARDS as card (card.title)}
            <QCard fill={card.fill}>
              <QCardSection class="flex items-center justify-between q-gap-sm">
                <span class="label-large">{card.title}</span>
                <QIcon name={card.icon} aria-hidden="true" />
              </QCardSection>
              <QCardSection class="q-mt-lg">
                <div class="headline-large">{card.value}</div>
                <p class="body-medium q-mt-xs q-mb-none">{card.detail}</p>
              </QCardSection>
            </QCard>
          {/each}
        </div>
      </QDocsSection>

      <QDocsSection title="Card Actions">
        {#snippet sectionDescription()}
          Set <code>align</code> on <code>QCardActions</code> to position its buttons, or use
          <code>vertical</code> to stack them. Try saving the bag or adding it to your basket.
        {/snippet}

        <div class="actions-example">
          <div class="action-controls">
            <QSelect
              label="Action alignment"
              options={ALIGNMENTS}
              bind:value={actionAlignment}
              outlined
              emitValue
            />
            <QSwitch label="Vertical actions" bind:value={hasVerticalActions} />
            <QSwitch label="Rounded corners" bind:value={hasRoundedCorners} />
          </div>
          <QCard class="bag-card" rounded={hasRoundedCorners}>
            <QCardSection class="flex items-center q-gap-lg">
              <div class="bag-art tertiary-container" aria-hidden="true">
                <QIcon name="backpack" size="3.5rem" />
              </div>
              <div>
                <div class="label-medium text-on-surface-variant">PACK LESS. WANDER MORE.</div>
                <h6 class="title-large q-my-xs">The day-away bag</h6>
                <p class="body-medium q-ma-none">Sand · 18 litres · €48</p>
              </div>
            </QCardSection>
            <p class="body-medium text-on-surface-variant q-mt-md q-mb-sm" aria-live="polite">
              {isInBasket
                ? "Your bag is in the basket."
                : "Room for the essentials, and a little adventure."}
            </p>
            <QCardActions
              align={actionAlignment}
              vertical={hasVerticalActions}
              aria-label="Shopping actions"
            >
              <QBtn
                variant="flat"
                label={isBagSaved ? "Unsave" : "Save for later"}
                onclick={() => (isBagSaved = !isBagSaved)}
              />
              <QBtn
                variant="tonal"
                icon={isInBasket ? "remove_shopping_cart" : "add_shopping_cart"}
                label={isInBasket ? "Remove from basket" : "Add to basket"}
                onclick={() => (isInBasket = !isInBasket)}
              />
            </QCardActions>
          </QCard>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: 1.25rem;
  }

  :global(.workshop-card) {
    width: 100%;
    max-width: 22.5rem;
  }

  .print-art {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 6.5rem;
    overflow: hidden;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .print-sheet {
    display: grid;
    place-items: center;
    width: 4.5rem;
    height: 5.5rem;
    flex: none;
    border-radius: 0.25rem;
    rotate: -12deg;
  }

  .print-sheet + .print-sheet {
    margin-inline-start: -0.75rem;
    rotate: 8deg;
  }

  .print-sheet:last-child {
    rotate: 20deg;
  }

  :global(.example-card) {
    min-width: 0;
  }

  .sun-shape {
    display: grid;
    place-items: center;
    flex: none;
    width: 4.5rem;
    height: 4.5rem;
    border-radius: 50%;
  }

  .packing-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .packing-list span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .book-spines {
    display: flex;
    align-items: flex-end;
    gap: 0.25rem;
    height: 4.5rem;
  }

  .book-spines span {
    width: 1.25rem;
    height: 100%;
    border-radius: 0.25rem;
    border-block: 0.375rem solid currentColor;
  }

  .book-spines span:nth-child(2) {
    height: 80%;
    rotate: -8deg;
  }

  :global(.recipe-card) {
    max-width: 48rem;
  }

  .recipe-image {
    display: block;
    width: 100%;
    height: 15rem;
    object-fit: cover;
    border-radius: 0.5rem;
  }

  .recipe-steps {
    padding-inline-start: 1.25rem;
  }

  .recipe-steps li + li {
    margin-top: 0.5rem;
  }

  :global(.story-card) {
    max-width: 30rem;
  }

  :global(.story-byline) {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 1rem;
  }

  .actions-example {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 1.5rem;
    max-width: 60rem;
  }

  .action-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1 1 14rem;
    min-width: 0;
  }

  :global(.bag-card) {
    flex: 2 1 24rem;
    min-width: 0;
  }

  .bag-art {
    display: grid;
    place-items: center;
    flex: none;
    width: 5rem;
    height: 6rem;
    border-radius: 1.5rem 1.5rem 0.5rem 0.5rem;
  }
</style>
