<script lang="ts">
  import { QCard, QCardSection, QInput } from "$lib";
  import { QInputDocs } from "$lib/components/input/docs";
  import ApiDoc from "$lib/components/private/ApiDoc.svelte";
  import ApiDocSection from "$lib/components/private/ApiDocSection.svelte";
  let input = "";
</script>

<ApiDoc QComponentDocs={QInputDocs} usagePath="input">
  <QInput slot="display" bind:value={input} label="Default" class="q-mt-md" />

  <div slot="usage">
    <ApiDocSection title="State">
      <QInput bind:value={input} label="Default" class="q-mt-md" />
      <QInput bind:value={input} label="Disabled" class="q-mt-md" disable />
    </ApiDocSection>

    <ApiDocSection title="Styles">
      <QInput bind:value={input} label="Bordered" class="q-mt-md" bordered />
      <QInput bind:value={input} label="Rounded" class="q-mt-md" rounded />
      <QInput bind:value={input} label="Outlined" class="q-mt-md" outlined />
      <QInput bind:value={input} label="Filled" class="q-mt-md" filled />
    </ApiDocSection>

    <ApiDocSection title="Validation and Hints">
      <QInput bind:value={input} label="With Hint" class="q-mt-md" hint="This is a hint" />
      <QInput
        bind:value={input}
        label="Error State"
        class="q-mt-md"
        error
        errorMessage="A custom error message"
      />
    </ApiDocSection>

    <ApiDocSection title="Slots">
      <QInput bind:value={input} label="Prepended Icon">
        <i slot="prepend">search</i>
      </QInput>
      <QInput bind:value={input} label="Appended Icon">
        <i slot="append">list</i>
      </QInput>
    </ApiDocSection>
  </div>
</ApiDoc>
