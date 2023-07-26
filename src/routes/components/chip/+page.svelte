<script lang="ts">
  import { QChip } from "$lib";
  import { QChipDocs } from "$components/chip/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";
</script>

<QDocs QComponentDocs={QChipDocs}>
  <QChip slot="display" responsive icon="img:/cocktail.jpg" content="Cocktail" />

  <div slot="usage">
    <QDocsSection {snippets} title="Default">
      <div class="flex q-gap-lg middle-align">
        <QChip class="green" content="Green Chip" />
        <QChip class="error" content="Error Chip" />
        <QChip class="primary" content="Primary Chip" />
        <QChip class="primary-container" content="Primary Container Chip" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Chip Sizes">
      <div class="flex q-gap-lg middle-align">
        <QChip content="Small Chip" size="sm" />
        <QChip content="Medium Chip" />
        <QChip content="Large Chip" size="lg" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Chips with Icons">
      <div class="flex q-gap-lg middle-align">
        <QChip icon="check" content="Leading icon" />
        <QChip iconRight="close" content="Trailing icon" />
        <QChip icon="check" iconRight="close" content="Both icons" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Chips with Images">
      <div class="flex q-gap-lg middle-align">
        <QChip icon="img:/cocktail.jpg" content="Leading image" />
        <QChip iconRight="img:/cocktail.jpg" content="Trailing image" />
        <QChip icon="img:/cocktail.jpg" round content="Round with image" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Chip Types">
      <div class="flex q-gap-lg middle-align">
        <QChip content="Outlined Chip" outlined />
        <QChip content="Round Chip" round />
        <QChip content="Disabled Chip" disable />
        <QChip content="Vertical Chip" vertical icon="star" />
        <QChip content="Responsive Chip" responsive iconRight="img:/cocktail.jpg" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Chips with Custom Tabindex">
      <div class="flex q-gap-lg middle-align">
        <QChip tabindex="2" content="Tabindex 2 Chip" />
        <QChip tabindex="3" content="Tabindex 3 Chip" />
      </div>
    </QDocsSection>
  </div>
</QDocs>
