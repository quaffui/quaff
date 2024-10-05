<script lang="ts">
  import { QCheckbox } from "$lib";
  import { QCheckboxDocs } from "$lib/components/checkbox/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let value1 = false;
</script>

<QDocs componentDocs={QCheckboxDocs}>
  {#snippet display()}
    <QCheckbox label="I agree to the terms and conditions" bind:value={value1} />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection snippet={snippets["Default Checkbox"]} title="Default Checkbox">
        <QCheckbox class="q-ma-sm" bind:value={value1} />
        <QCheckbox class="q-ma-sm" label="With label" bind:value={value1} />
      </QDocsSection>

      <QDocsSection snippet={snippets["Checked Checkbox"]} title="Checked Checkbox">
        <QCheckbox class="q-ma-sm" label="Checkbox checked by default" value={true} />
      </QDocsSection>

      <QDocsSection snippet={snippets["Disabled"]} title="Disabled">
        <QCheckbox class="q-ma-sm" label="Checkbox with disable prop" value={true} disable />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
