<script lang="ts">
  import { QCard, QCardSection, QCardActions, QBtn } from "$lib";
  import { QCardDocs, QCardSectionDocs, QCardActionsDocs } from "$lib/components/card/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";
</script>

<QDocs {snippets} componentDocs={[QCardDocs, QCardSectionDocs, QCardActionsDocs]}>
  {#snippet display()}
    <QCard title="Default Card">
      <QCardSection>This is a card with a default configuration.</QCardSection>
    </QCard>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Card Variants">
        {#snippet sectionDescription()}
          Cards can be customized with different visual styles to match your design needs. These
          include bordered, flat, and rounded variants.
        {/snippet}

        <QCard class="q-ma-sm" title="Bordered Card" bordered>
          <QCardSection>This is a card with a border.</QCardSection>
        </QCard>

        <QCard class="q-ma-sm" title="Flat Card" flat>
          <QCardSection>This is a flat card.</QCardSection>
        </QCard>

        <QCard class="q-ma-sm" title="Round Card" rounded>
          <QCardSection>This is a round card.</QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Card with different sections">
        {#snippet sectionDescription()}
          Cards can contain multiple sections, including horizontal layouts that use the built-in
          12-column grid system. This makes it easy to create complex content structures.
        {/snippet}

        <QCard class="q-ma-sm" title="Card with Horizontal Section">
          <QCardSection horizontal>
            <div class="col-6">This is a card with a horizontal section.</div>
            <div class="col-6">It uses a 12 columns grid system.</div>
          </QCardSection>
          <QCardSection horizontal>
            <div class="col-4">Another horizontal section.</div>
            <div class="col-4">Second part of the section.</div>
            <div class="col-4">A horizontal section in 3 parts.</div>
          </QCardSection>
        </QCard>

        <QCard class="q-ma-sm" title="Card with Actions">
          <QCardSection>This is a card with actions.</QCardSection>
          <QCardActions>
            <QBtn label="Button 1" />
            <QBtn label="Button 2" />
          </QCardActions>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Card with fill color">
        {#snippet sectionDescription()}
          Cards can have different background colors using the <code>fill</code> property. You can use
          a boolean value for the default fill color, or specify one of the theme colors: primary, secondary,
          or tertiary.
        {/snippet}

        <QCard class="q-ma-sm" title="Card with fill color" fill>
          <QCardSection>This is a card with a fill color.</QCardSection>
        </QCard>
        <QCard class="q-ma-sm" title="Card with primary fill color" fill="primary">
          <QCardSection>This is a card with a primary fill color.</QCardSection>
        </QCard>
        <QCard class="q-ma-sm" title="Card with secondary fill color" fill="secondary">
          <QCardSection>This is a card with a secondary fill color.</QCardSection>
        </QCard>
        <QCard class="q-ma-sm" title="Card with tertiary fill color" fill="tertiary">
          <QCardSection>This is a card with a tertiary fill color.</QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Card Actions Alignment">
        {#snippet sectionDescription()}
          The QCardActions component supports different alignment options for buttons and other
          action elements. You can align items to the start, center, end, between, around, or
          evenly.
        {/snippet}

        <QCard class="q-ma-sm" title="Default Actions (start)">
          <QCardSection>Actions are aligned to the left by default</QCardSection>
          <QCardActions>
            <QBtn label="Action 1" />
            <QBtn label="Action 2" />
          </QCardActions>
        </QCard>

        <QCard class="q-ma-sm" title="Center-aligned Actions">
          <QCardSection>But they can also be centered</QCardSection>
          <QCardActions align="center">
            <QBtn label="Action 1" />
            <QBtn label="Action 2" />
          </QCardActions>
        </QCard>

        <QCard class="q-ma-sm" title="End-aligned Actions">
          <QCardSection>Aligned to the right</QCardSection>
          <QCardActions align="right">
            <QBtn label="Action 1" />
            <QBtn label="Action 2" />
          </QCardActions>
        </QCard>

        <QCard class="q-ma-sm" title="End-aligned Actions">
          <QCardSection>With space between</QCardSection>
          <QCardActions align="between">
            <QBtn label="Action 1" />
            <QBtn label="Action 2" />
          </QCardActions>
        </QCard>

        <QCard class="q-ma-sm" title="End-aligned Actions">
          <QCardSection>Or with space around</QCardSection>
          <QCardActions align="around">
            <QBtn label="Action 1" />
            <QBtn label="Action 2" />
          </QCardActions>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Vertical Card Actions">
        {#snippet sectionDescription()}
          Card actions can also be arranged vertically instead of the default horizontal layout.
          This is useful when you have many actions or when space is limited horizontally.
        {/snippet}

        <QCard class="q-ma-sm" title="Vertical Actions">
          <QCardSection>These actions are stacked vertically.</QCardSection>
          <QCardActions vertical>
            <QBtn label="Action 1" class="q-mb-sm" />
            <QBtn label="Action 2" class="q-mb-sm" />
            <QBtn label="Action 3" />
          </QCardActions>
        </QCard>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
