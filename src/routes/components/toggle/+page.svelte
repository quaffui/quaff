<script lang="ts">
  import QToggle from "$lib/components/toggle/QToggle.svelte";
  import { QToggleDocs } from "$lib/components/toggle/docs";
  import ApiDoc from "$lib/components/private/ApiDoc.svelte";
  import ApiDocSection from "$lib/components/private/ApiDocSection.svelte";

  let toggle = false;
</script>

<ApiDoc QComponentDocs={QToggleDocs} usagePath="toggle">
  <QToggle slot="display" bind:value={toggle} class="q-ma-sm" />

  <div slot="usage">
    <ApiDocSection title="Default Toggle">
      <QToggle bind:value={toggle} class="q-ma-sm" />
    </ApiDocSection>

    <ApiDocSection title="Toggle with label">
      <QToggle bind:value={toggle} class="q-ma-sm" label="With label" />
      <QToggle bind:value={toggle} class="q-ma-sm" icon="favorite" label="With icon" />
    </ApiDocSection>

    <ApiDocSection title="Toggle with label position">
      <QToggle bind:value={toggle} class="q-ma-sm" leftLabel label="Left label" />
      <QToggle bind:value={toggle} class="q-ma-sm" rightLabel label="Right label" />
    </ApiDocSection>

    <ApiDocSection title="Disabled state">
      <QToggle bind:value={toggle} class="q-ma-sm" disable label="Disable" />
    </ApiDocSection>
  </div>
</ApiDoc>
