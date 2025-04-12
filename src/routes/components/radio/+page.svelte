<script lang="ts">
  import { QRadio } from "$lib";
  import { QRadioDocs } from "$lib/components/radio/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let selectedValue = "option1";
</script>

<QDocs {snippets} componentDocs={QRadioDocs}>
  {#snippet display()}
    <QRadio value="option1" selected={selectedValue} label="Option 1" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Radio Group">
        <QRadio class="q-ma-sm" value="option1" bind:selected={selectedValue} label="Option 1" />
        <QRadio class="q-ma-sm" value="option2" bind:selected={selectedValue} label="Option 2" />
      </QDocsSection>

      <QDocsSection title="Disabled Radio Button">
        <QRadio class="q-ma-sm" value="option3" label="Option 3" disable />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
