<script lang="ts">
  import { QChip, QSeparator } from "$lib";
  import { QChipDocs } from "$components/chip/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";
</script>

<QDocs componentDocs={QChipDocs}>
  <QChip slot="display" elevated icon="img:/cocktail.jpg" label="Cocktail" />

  <div slot="usage">
    <QDocsSection {snippets} title="Default">
      <div class="flex q-gap-lg items-center">
        <QChip class="bg-green" label="Green Chip" />
        <QChip class="error" label="Error Chip" />
        <QChip class="primary" label="Primary Chip" />
        <QChip class="primary-container" label="Primary Container Chip" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Chip Sizes">
      <div class="flex q-gap-lg items-center">
        <QChip label="Small Chip" size="sm" icon="mail" />
        <QChip label="Medium Chip" size="md" icon="mail" />
        <QChip label="Large Chip" size="lg" icon="mail" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Chip designs">
      <div class="flex q-gap-lg items-center">
        <QChip icon="map" label="Assist (default)" />
        <QChip kind="filter" icon="filter_list" label="Filter" />
        <QChip kind="input" icon="edit" trailingIcon="close" label="Input" />
        <QChip kind="suggestion" icon="help" label="Suggestion" />
        <QChip disabled icon="warning" label="Disabled" />
      </div>
      <QSeparator text="Elevated designs" textAlign="left" spacing="lg" />
      <div class="flex q-gap-lg items-center">
        <QChip elevated icon="map" label="Assist (default)" />
        <QChip elevated kind="filter" icon="filter_list" label="Filter" />
        <QChip elevated kind="input" icon="edit" trailingIcon="close" label="Input" />
        <QChip elevated kind="suggestion" icon="help" label="Suggestion" />
        <QChip elevated disabled icon="warning" label="Disabled" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Chips with Images">
      <div class="flex q-gap-lg items-center">
        <QChip icon="img:/cocktail.jpg" label="Leading avatar" />
        <QChip kind="filter" elevated icon="img:/cocktail.jpg" label="Filter elevated" />
        <QChip kind="input" icon="img:/cocktail.jpg" label="Input chip with avatar" />
      </div>
    </QDocsSection>
  </div>
</QDocs>
