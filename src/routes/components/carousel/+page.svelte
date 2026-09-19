<script lang="ts">
  import { QCarouselDocs } from "$components/carousel/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QCarousel } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QCarouselDocs] });

  const items = [
    { title: "Colorful drinks with mint", src: "/cocktail.jpg", ratio: 3 / 2 },
    { title: "Green drink with lime and mint", src: "/lime-mint-drink.jpg", ratio: 1229 / 1536 },
    { title: "Orange drink with ice", src: "/cocktail-close-up.jpg", ratio: 2 / 3 },
    { title: "Citrus drink at sunset", src: "/citrus-drink-sunset.jpg", ratio: 1536 / 1052 },
    { title: "Orange swirls", src: "/cocktail-close-up-2.jpg", ratio: 2 / 3 },
    { title: "Iced drink with lime", src: "/iced-lime-drink.jpg", ratio: 2 / 3 },
  ];

  let value = $state(0);
  let selected = $state("");
</script>

<svelte:head>
  <title>{pageTitle("QCarousel")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QCarousel {items} height="14rem" itemWidth={200} aria-label="Drink photo preview">
      {#snippet children({ item })}
        <img class="carousel-image" src={item.src} alt={item.title} />
      {/snippet}
    </QCarousel>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Multi-browse">
        {#snippet sectionDescription()}
          The default layout gives several items room while masking items at the edges. Items grow
          into view as you scroll. Bind <code>value</code> to the prominent item's zero-based index.
          Set <code>onselect</code> to make each slide a button; its content must then contain no other
          interactive elements.
        {/snippet}

        <QCarousel
          {items}
          bind:value
          itemLabel={(item) => item.title}
          onselect={(item) => (selected = item.title)}
          aria-label="Browse drink photos"
        >
          {#snippet children({ item })}
            <img class="carousel-image" src={item.src} alt="" />
          {/snippet}
        </QCarousel>
        <p>Prominent photo: {value + 1} of {items.length}</p>
        <p role="status">{selected ? `Selected: ${selected}` : "Choose a photo to select it."}</p>
      </QDocsSection>

      <QDocsSection title="Uncontained">
        {#snippet sectionDescription()}
          Items retain their width as they scroll past the container edge. This layout scrolls
          freely by default; set <code>snap</code> to align items after scrolling.
        {/snippet}

        <QCarousel {items} variant="uncontained" aria-label="Uncontained drink photos">
          {#snippet children({ item })}
            <img class="carousel-image" src={item.src} alt={item.title} />
          {/snippet}
        </QCarousel>
      </QDocsSection>

      <QDocsSection title="Uncontained Multi-aspect">
        {#snippet sectionDescription()}
          Preserve different image proportions with <code>aspectRatio</code>. Ratios are constrained
          between portrait 9:16 and landscape 16:9; all items share the same height.
        {/snippet}

        <QCarousel
          {items}
          variant="uncontained-multi-aspect"
          aspectRatio={(item) => item.ratio}
          aria-label="Drink photos with different proportions"
        >
          {#snippet children({ item })}
            <img class="carousel-image" src={item.src} alt={item.title} />
          {/snippet}
        </QCarousel>
      </QDocsSection>

      <QDocsSection title="Hero">
        {#snippet sectionDescription()}
          A large leading item highlights one image while a smaller trailing item invites further
          browsing. Contained layouts snap to an item by default.
        {/snippet}

        <QCarousel
          {items}
          variant="hero"
          itemWidth={640}
          height="20rem"
          style="max-width: 40rem;"
          aria-label="Featured drink photos"
        >
          {#snippet children({ item })}
            <img class="carousel-image" src={item.src} alt={item.title} />
          {/snippet}
        </QCarousel>
      </QDocsSection>

      <QDocsSection title="Centered Hero">
        {#snippet sectionDescription()}
          Center the featured item with glimpses of neighboring images on both sides. Use
          <code>alignment="center"</code> with multi-browse for a centered group instead.
        {/snippet}

        <QCarousel
          {items}
          variant="centered-hero"
          value={1}
          itemWidth={640}
          height="20rem"
          style="max-width: 40rem;"
          aria-label="Centered featured drink photos"
        >
          {#snippet children({ item })}
            <img class="carousel-image" src={item.src} alt={item.title} />
          {/snippet}
        </QCarousel>
      </QDocsSection>

      <QDocsSection title="Full-screen">
        {#snippet sectionDescription()}
          Present one item at a time with vertical scrolling and mandatory snapping. Use this layout
          for portrait screens; choose another variant for landscape layouts. The default height is <code
            >100svh</code
          >, reduced to <code>28rem</code> in this embedded example.
        {/snippet}

        <div style="max-width: 20rem; margin-inline: auto;">
          <QCarousel
            {items}
            variant="full-screen"
            height="28rem"
            aria-label="Full-screen drink photos"
          >
            {#snippet children({ item })}
              <img class="carousel-image" src={item.src} alt={item.title} />
            {/snippet}
          </QCarousel>
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        {#snippet sectionDescription()}
          Give each carousel an <code>aria-label</code> or <code>aria-labelledby</code>, and provide
          meaningful alternative text for images. Previous and next buttons allow navigation without
          dragging. When an item is focused, use arrow keys to browse and Home or End to reach the
          first or last item. Full-screen carousels use Up and Down. Native links and controls
          inside non-actionable slides retain their keyboard behavior.
        {/snippet}

        <p>
          There is no automatic rotation. Scrolling respects the reduced-motion preference. Keep the
          default controls or provide equivalent accessible navigation when setting
          <code>controls={false}</code>. Translate navigation and position announcements through
          <code>labels</code>.
        </p>
        <p>
          The optional <code>showAll</code> snippet can link to a separate vertical collection. See
          the
          <a href="https://m3.material.io/components/carousel/specs">Material 3 carousel specs</a>.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
