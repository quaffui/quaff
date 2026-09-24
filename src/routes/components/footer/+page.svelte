<script lang="ts">
  import { QFooterDocs } from "$components/footer/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QCard, QFooter, QIcon, QIconBtn, QLayout, QSwitch } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QFooterDocs });

  const JOURNAL_PAGES = [
    {
      title: "Take the slow road",
      text: "A little fresh air. A turn you have never taken. No rush to get home.",
      icon: "landscape",
      color: "primary-container",
    },
    {
      title: "Find your quiet corner",
      text: "A shady spot, a good book, and the whole afternoon ahead of you.",
      icon: "park",
      color: "tertiary-container",
    },
    {
      title: "Stay for the sunset",
      text: "The best part of the day might be the part you did not plan.",
      icon: "wb_twilight",
      color: "secondary-container",
    },
  ] as const;
  const STOPS = [
    {
      time: "09:00",
      title: "Coffee first",
      text: "A flat white and a seat by the window.",
      icon: "local_cafe",
    },
    {
      time: "10:00",
      title: "The riverside path",
      text: "Follow the water past the old boathouse.",
      icon: "water",
    },
    {
      time: "11:30",
      title: "Market morning",
      text: "Pick up fresh bread and something sweet.",
      icon: "storefront",
    },
    {
      time: "13:00",
      title: "Lunch on the lawn",
      text: "Find a sunny patch and unpack your picnic.",
      icon: "park",
    },
    {
      time: "15:00",
      title: "A small detour",
      text: "Browse the bookshop around the corner.",
      icon: "auto_stories",
    },
    {
      time: "17:00",
      title: "The long way home",
      text: "One last loop around the lake.",
      icon: "directions_walk",
    },
  ] as const;

  let journalPageIndex = $state(0);
  let isStudioFooterVisible = $state(true);
  let hasStudioFooterBorder = $state(true);
  let isStayReserved = $state(false);

  const journalPage = $derived(JOURNAL_PAGES[journalPageIndex]);
</script>

<svelte:head>
  <title>{pageTitle("QFooter")}</title>
</svelte:head>

<QDocs
  docDescription="Keep helpful links and actions within reach with a footer that stays visible or follows the scroll."
>
  {#snippet display()}
    <QLayout class="footer-layout footer-preview surface">
      {#snippet content()}
        <div class="q-pa-md" aria-live="polite">
          <div class="label-medium text-on-surface-variant">WEEKEND JOURNAL</div>
          <div class="journal-art {journalPage.color}" aria-hidden="true">
            <QIcon name={journalPage.icon} size="3rem" />
          </div>
          <h2 class="title-large q-mb-sm">{journalPage.title}</h2>
          <p class="body-medium q-mb-none">{journalPage.text}</p>
        </div>
      {/snippet}
      {#snippet footer()}
        <QFooter bordered class="justify-between">
          <span class="label-large">{journalPageIndex + 1} / {JOURNAL_PAGES.length}</span>
          <div class="flex q-gap-sm">
            <QIconBtn
              icon="arrow_back"
              aria-label="Previous journal page"
              disabled={journalPageIndex === 0}
              onclick={() => journalPageIndex--}
            />
            <QIconBtn
              icon="arrow_forward"
              variant="tonal"
              aria-label="Next journal page"
              disabled={journalPageIndex === JOURNAL_PAGES.length - 1}
              onclick={() => journalPageIndex++}
            />
          </div>
        </QFooter>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Links and Visibility">
        {#snippet sectionDescription()}
          Place <code>QFooter</code> in a layout's <code>footer</code> snippet for links, credits,
          or actions. Use <code>value</code> to show or hide it and <code>bordered</code> to add a top
          border.
        {/snippet}

        <div class="flex q-gap-lg q-mb-md">
          <QSwitch label="Show footer" bind:value={isStudioFooterVisible} />
          <QSwitch label="Footer border" bind:value={hasStudioFooterBorder} />
        </div>
        <QLayout class="footer-layout surface">
          {#snippet content()}
            <div class="studio-content q-pa-md">
              <section id="acme-about">
                <div class="studio-art q-mb-sm" aria-hidden="true">
                  <span class="primary-container"><QIcon name="interests" size="2rem" /></span>
                  <span class="secondary-container"><QIcon name="palette" size="2rem" /></span>
                  <span class="tertiary-container"><QIcon name="code" size="2rem" /></span>
                </div>
                <h6 class="q-mb-sm">Small studio. Big ideas.</h6>
                <p class="body-medium q-mb-none">
                  Friendly design for ambitious ideas, from first sketch to launch.
                </p>
              </section>
              <section id="acme-work">
                <div class="label-medium text-tertiary">OUR WORK</div>
                <h6 class="q-mb-sm">A fresh look for a local favorite</h6>
                <p class="body-medium q-mb-none">
                  A new identity and a cheerful little website for the neighborhood bakery.
                </p>
              </section>
              <section id="acme-contact">
                <div class="label-medium text-tertiary">SAY HELLO</div>
                <h6 class="q-mb-sm">Good things start with a conversation.</h6>
                <p class="body-medium q-mb-none">
                  Visit our studio Monday to Friday, 9–5. There is always room for one more at the
                  table.
                </p>
              </section>
            </div>
          {/snippet}
          {#snippet footer()}
            <QFooter
              value={isStudioFooterVisible}
              bordered={hasStudioFooterBorder}
              height={128}
              class="studio-footer"
            >
              <div class="studio-footer-main">
                <div class="flex items-center q-gap-sm">
                  <span class="studio-mark secondary" aria-hidden="true">
                    <QIcon name="interests" />
                  </span>
                  <div>
                    <div class="title-medium">Acme Studio</div>
                    <div class="body-small">Good ideas, made real.</div>
                  </div>
                </div>
                <nav class="studio-links label-large" aria-label="Acme Studio footer">
                  <a href="#acme-about">About</a>
                  <a href="#acme-work">Work</a>
                  <a href="#acme-contact">Contact</a>
                </nav>
              </div>
              <div class="studio-fine-print body-small">
                <span>© Acme Studio</span>
                <span>Made with care.</span>
              </div>
            </QFooter>
          {/snippet}
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Custom Height">
        {#snippet sectionDescription()}
          The default height is 80px. Pass a number to <code>height</code> to set it in pixels, for example
          when the footer needs a summary and an action.
        {/snippet}

        <QLayout class="footer-layout booking-layout surface">
          {#snippet content()}
            <div class="q-pa-md">
              <QCard fill="tertiary" class="flex items-center q-gap-md q-mb-md">
                <QIcon name="cabin" size="3rem" aria-hidden="true" />
                <div class="stay-copy">
                  <h6 class="q-mb-none">Woodland Cabin</h6>
                </div>
              </QCard>
              <div class="flex q-gap-md body-medium">
                <span class="flex items-center q-gap-sm">
                  <QIcon name="bed" aria-hidden="true" /> 2 guests
                </span>
                <span class="flex items-center q-gap-sm">
                  <QIcon name="forest" aria-hidden="true" /> Forest views
                </span>
              </div>
              <p class="q-mt-md q-mb-none body-medium" aria-live="polite">
                {isStayReserved
                  ? "Demo stay reserved. Time to pack a good book."
                  : "Two nights away, with breakfast and no alarm clock."}
              </p>
            </div>
          {/snippet}
          {#snippet footer()}
            <QFooter height={112} bordered class="justify-between">
              <div>
                <div class="title-large">€180</div>
                <div class="body-small text-on-surface-variant">2 nights · total</div>
              </div>
              <QBtn
                variant="tonal"
                label={isStayReserved ? "Cancel" : "Reserve"}
                onclick={() => (isStayReserved = !isStayReserved)}
              />
            </QFooter>
          {/snippet}
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Reveal on Scroll">
        {#snippet sectionDescription()}
          <code>reveal</code> hides the footer while scrolling down and shows it when scrolling up.
          It also returns near the bottom; <code>revealOffset</code> sets that distance in pixels. Scroll
          through the day below to try it.
        {/snippet}

        <QLayout class="footer-layout surface">
          {#snippet content()}
            <div class="q-pa-lg">
              <div class="label-medium text-tertiary">ONE DAY, NO RUSH</div>
              <h6 id="trailmark-top" class="q-mb-lg">A day by the water</h6>
              <ol class="itinerary">
                {#each STOPS as stop (stop.time)}
                  <li class="flex q-gap-md">
                    <div class="stop-icon secondary-container" aria-hidden="true">
                      <QIcon name={stop.icon} />
                    </div>
                    <div>
                      <div class="label-medium text-on-surface-variant">{stop.time}</div>
                      <div class="title-medium">{stop.title}</div>
                      <p class="body-medium q-mt-xs q-mb-none">{stop.text}</p>
                    </div>
                  </li>
                {/each}
              </ol>
            </div>
          {/snippet}
          {#snippet footer()}
            <QFooter reveal revealOffset={96} bordered class="justify-between primary-container">
              <span class="flex items-center q-gap-sm title-medium">
                <QIcon name="landscape" aria-hidden="true" /> Trailmark
              </span>
              <a class="footer-link label-large" href="#trailmark-top">Back to top</a>
            </QFooter>
          {/snippet}
        </QLayout>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  :global(.footer-layout) {
    max-width: 50rem;
    height: 22rem;
    border: 0.0625rem solid var(--outline-variant);
    border-radius: 1.5rem;
  }

  :global(.footer-preview) {
    max-width: 24rem;
    height: 100%;
  }

  .journal-art {
    display: grid;
    place-items: center;
    width: 5.5rem;
    height: 3.5rem;
    margin-block: 0.5rem;
    border-radius: 3.5rem 3.5rem 1rem 1rem;
  }

  .studio-content {
    display: grid;
    gap: 3rem;
  }

  .studio-art {
    display: flex;
    gap: 0.5rem;
  }

  .studio-art span {
    display: grid;
    width: 3rem;
    height: 3rem;
    place-items: center;
    border-radius: 1rem;
  }

  :global(.studio-footer) {
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: 0.5rem;
    padding-block: 0.75rem;
    white-space: normal;
  }

  .studio-footer-main,
  .studio-fine-print {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1rem;
  }

  .studio-mark {
    display: grid;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    border-radius: 0.75rem;
  }

  .studio-links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .studio-links a,
  .footer-link {
    color: inherit;
    text-underline-offset: 0.1875rem;
  }

  .studio-fine-print {
    padding-top: 0.5rem;
    border-top: 0.0625rem solid color-mix(in srgb, currentColor 20%, transparent);
  }

  :global(.booking-layout) {
    height: 25rem;
  }

  .stay-copy {
    flex: 1;
    min-width: 0;
  }

  .itinerary {
    display: grid;
    gap: 2.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .stop-icon {
    display: grid;
    flex: none;
    width: 3rem;
    height: 3rem;
    place-items: center;
    border-radius: 50%;
  }
</style>
