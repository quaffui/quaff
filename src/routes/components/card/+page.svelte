<script lang="ts">
  import { QCard, QCardSection, QCardActions, QBtn } from "$lib";
  import { QCardDocs, QCardSectionDocs, QCardActionsDocs } from "$lib/components/card/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import ApiDocSection from "$lib/components/private/QDocsSection.svelte";
</script>

<QDocs QComponentDocs={[QCardDocs, QCardSectionDocs, QCardActionsDocs]} usagePath="card">
  <QCard slot="display" title="Default Card">
    <QCardSection>This is a card with a default configuration.</QCardSection>
  </QCard>

  <div slot="usage">
    <ApiDocSection title="Card Variants">
      <QCard class="q-ma-sm" title="Bordered Card" bordered>
        <QCardSection>This is a card with a border.</QCardSection>
      </QCard>

      <QCard class="q-ma-sm" title="Flat Card" flat>
        <QCardSection>This is a flat card.</QCardSection>
      </QCard>

      <QCard class="q-ma-sm" title="Round Card" round>
        <QCardSection>This is a round card.</QCardSection>
      </QCard>
    </ApiDocSection>

    <ApiDocSection title="Card with different sections">
      <QCard class="q-ma-sm" title="Card with Horizontal Section">
        <QCardSection horizontal>This is a card with a horizontal section.</QCardSection>
      </QCard>

      <QCard class="q-ma-sm" title="Card with Actions">
        <QCardSection>This is a card with actions.</QCardSection>
        <QCardActions>
          <QBtn label="Button 1" />
          <QBtn label="Button 2" />
        </QCardActions>
      </QCard>
    </ApiDocSection>

    <ApiDocSection title="Card with fill color">
      <QCard class="q-ma-sm" title="Card with fill color" fill="#00aaff">
        <QCardSection>This is a card with a fill color.</QCardSection>
      </QCard>
    </ApiDocSection>
  </div>
</QDocs>
