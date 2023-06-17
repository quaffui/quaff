<script lang="ts">
  import { QRadio } from "$lib";
  import { QRadioDocs } from "$lib/components/radio/docs";
  import ApiDoc from "$lib/components/private/ApiDoc.svelte";
  import ApiDocSection from "$lib/components/private/ApiDocSection.svelte";
  let selectedValue = "option1";
</script>

<ApiDoc QComponentDocs={QRadioDocs} usagePath="radio">
  <QRadio slot="display" value="option1" selected={selectedValue} label="Option 1" />

  <div slot="usage">
    <ApiDocSection title="Radio Group">
      <QRadio class="q-ma-sm" value="option1" bind:selected={selectedValue} label="Option 1" />
      <QRadio class="q-ma-sm" value="option2" bind:selected={selectedValue} label="Option 2" />
    </ApiDocSection>

    <ApiDocSection title="Disabled Radio Button">
      <QRadio class="q-ma-sm" value="option3" label="Option 3" disable />
    </ApiDocSection>
  </div>
</ApiDoc>
