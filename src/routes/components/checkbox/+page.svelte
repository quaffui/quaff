<script lang="ts">
  import { QCheckbox } from "$lib";
  import { QCheckboxDocs } from "$lib/components/checkbox/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  let value1 = false;
</script>

<QDocs QComponentDocs={QCheckboxDocs} usagePath="checkbox">
  <QCheckbox slot="display" label="I agree to the terms and conditions" bind:value={value1} />

  <div slot="usage">
    <QDocsSection title="Default Checkbox">
      <QCheckbox class="q-ma-sm" bind:value={value1} />
      <QCheckbox class="q-ma-sm" label="With label" bind:value={value1} />
    </QDocsSection>

    <QDocsSection title="Checked Checkbox">
      <QCheckbox class="q-ma-sm" label="Checkbox checked by default" value={true} />
    </QDocsSection>

    <QDocsSection title="Disabled">
      <QCheckbox class="q-ma-sm" label="Checkbox with disable prop" value={true} disable />
    </QDocsSection>
  </div>
</QDocs>
