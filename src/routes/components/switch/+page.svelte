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
      <QDocsSection snippet={snippets["Default Toggle"]} title="Default Toggle">
        <QSwitch bind:value={toggle} class="q-ma-sm" />
      </QDocsSection>

      <QDocsSection snippet={snippets["Toggle with label"]} title="Toggle with label">
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

      <QDocsSection
        snippet={snippets["Toggle with label position"]}
        title="Toggle with label position"
      >
        <QSwitch bind:value={toggle} class="q-ma-sm" label="Right label (default)" />
        <QSwitch bind:value={toggle} class="q-ma-sm" labelPosition="left" label="Left label" />
      </QDocsSection>

      <QDocsSection snippet={snippets["Disabled state"]} title="Disabled state">
        <QSwitch bind:value={toggle} class="q-ma-sm" disabled label="Disable" />
        <QSwitch
          bind:value={toggle}
          showOnlyCheckedIcon
          class="q-ma-sm"
          disabled
          label="Disable with check icon"
        />
        <QSwitch bind:value={toggle} icons class="q-ma-sm" disabled label="Disable with icons" />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
