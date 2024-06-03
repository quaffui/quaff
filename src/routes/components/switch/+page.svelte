<script lang="ts">
  import QSwitch from "$lib/components/switch/QSwitch.svelte";
  import { QSwitchDocs } from "$lib/components/switch/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let toggle = $state(false);
</script>

<QDocs componentDocs={QSwitchDocs}>
  {#snippet display()}
    <QSwitch bind:value={toggle} class="q-ma-sm" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection {snippets} title="Default Toggle">
        <QSwitch bind:value={toggle} class="q-ma-sm" />
      </QDocsSection>

      <QDocsSection {snippets} title="Toggle with label">
        <QSwitch bind:value={toggle} class="q-ma-sm" label="With label" />
        <QSwitch bind:value={toggle} class="q-ma-sm" icons label="With default icons" />
        <QSwitch bind:value={toggle} class="q-ma-sm" showOnlyCheckedIcon label="Only check icon" />
        <QSwitch
          bind:value={toggle}
          class="q-ma-sm"
          uncheckedIcon="warning"
          label="Only uncheck icon"
        />
        <QSwitch
          bind:value={toggle}
          class="q-ma-sm"
          checkedIcon="favorite"
          label="With check icon"
        />
      </QDocsSection>

      <QDocsSection {snippets} title="Toggle with label position">
        <QSwitch bind:value={toggle} class="q-ma-sm" label="Right label (default)" />
        <QSwitch bind:value={toggle} class="q-ma-sm" labelPosition="left" label="Left label" />
      </QDocsSection>

      <QDocsSection {snippets} title="Disabled state">
        <QSwitch bind:value={toggle} class="q-ma-sm" disabled label="Disable" />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
