<script lang="ts">
  import QToggle from "$lib/components/toggle/QToggle.svelte";
  import { QToggleDocs } from "$lib/components/toggle/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let toggle = false;
</script>

<QDocs componentDocs={QToggleDocs}>
  {#snippet display()}
    <QToggle bind:value={toggle} class="q-ma-sm" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection {snippets} title="Default Toggle">
        <QToggle bind:value={toggle} class="q-ma-sm" />
      </QDocsSection>

      <QDocsSection {snippets} title="Toggle with label">
        <QToggle bind:value={toggle} class="q-ma-sm" label="With label" />
        <QToggle bind:value={toggle} class="q-ma-sm" icon="favorite" label="With icon" />
      </QDocsSection>

      <QDocsSection {snippets} title="Toggle with label position">
        <QToggle bind:value={toggle} class="q-ma-sm" leftLabel label="Left label" />
        <QToggle bind:value={toggle} class="q-ma-sm" label="Right label" />
      </QDocsSection>

      <QDocsSection {snippets} title="Disabled state">
        <QToggle bind:value={toggle} class="q-ma-sm" disable label="Disable" />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
