<script lang="ts">
  import { QCard, QCardSection, QCardActions, QBtn } from "$lib";
  import { QCardDocs, QCardSectionDocs, QCardActionsDocs } from "$lib/components/card/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";
</script>

<QDocs componentDocs={[QCardDocs, QCardSectionDocs, QCardActionsDocs]}>
  {#snippet display()}
    <QCard title="Default Card">
      <QCardSection>This is a card with a default configuration.</QCardSection>
    </QCard>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection {snippets} title="Card Variants">
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

      <QDocsSection {snippets} title="Card with different sections">
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

      <QDocsSection {snippets} title="Card with fill color">
        <QCard class="q-ma-sm" title="Card with fill color" fill>
          <QCardSection>This is a card with a fill color.</QCardSection>
        </QCard>
        <QCard class="q-ma-sm" title="Card with primary fill color" fill="primary">
          <QCardSection>This is a card with a primary fill color.</QCardSection>
        </QCard>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
