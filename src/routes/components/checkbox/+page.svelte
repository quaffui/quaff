<script lang="ts">
  import { QCheckbox } from "$lib";
  import { QCheckboxDocs } from "$lib/components/checkbox/docs";
  import ApiDoc from "$lib/components/private/ApiDoc.svelte";
  import ApiDocSection from "$lib/components/private/ApiDocSection.svelte";
  let value1 = false;
</script>

<ApiDoc QComponentDocs={QCheckboxDocs} usagePath="checkbox">
  <QCheckbox slot="display" label="I agree to the terms and conditions" bind:value={value1} />

  <div slot="usage">
    <ApiDocSection title="Default Checkbox">
      <QCheckbox class="q-ma-sm" bind:value={value1} />
      <QCheckbox class="q-ma-sm" label="With label" bind:value={value1} />
    </ApiDocSection>

    <ApiDocSection title="Checked Checkbox">
      <QCheckbox class="q-ma-sm" label="Checkbox checked by default" value={true} />
    </ApiDocSection>

    <ApiDocSection title="Disabled">
      <QCheckbox class="q-ma-sm" label="Checkbox with disable prop" value={true} disable />
    </ApiDocSection>
  </div>
</ApiDoc>
