<script lang="ts">
  import { QSelect, QBtn } from "$lib";
  import { QSelectDocs } from "$components/select/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";

  let options = ["Cats", "Dogs", "Capybaras"];
  let value = "";
  let select = "";
  let selectMultiple: string[] = [];
</script>

<QDocs QComponentDocs={QSelectDocs} usagePath="select">
  <QSelect slot="display" label="Favorite animal" {options} {value} />

  <div class="s12 q-pa-md">
    <div class="heading">
      <h4 class="q-my-xl">Usage</h4>
      <QBtn rounded icon="code" outline />
    </div>

    <QDocsSection title="State">
      <QSelect bind:value={select} {options} label="Default" class="q-mt-md" />
      <QSelect bind:value={select} {options} label="Disabled" class="q-mt-md" disable />
      <QSelect bind:value={selectMultiple} {options} label="Multiple" class="q-mt-md" multiple />
    </QDocsSection>

    <QDocsSection title="Style">
      <QSelect bind:value={select} {options} label="Bordered" class="q-mt-md" bordered />
      <QSelect bind:value={select} {options} label="Rounded" class="q-mt-md" rounded />
      <QSelect bind:value={select} {options} label="Outlined" class="q-mt-md" outlined />
      <QSelect bind:value={select} {options} label="Filled" class="q-mt-md" filled />
    </QDocsSection>

    <QDocsSection title="Validation and Hints">
      <QSelect
        bind:value={select}
        {options}
        label="With Hint"
        class="q-mt-md"
        hint="This is a hint"
      />
      <QSelect
        bind:value={select}
        {options}
        label="Error State"
        class="q-mt-md"
        error
        errorMessage="A custom error message"
      />
    </QDocsSection>

    <QDocsSection title="Slots">
      <QSelect bind:value={select} {options} label="Prepended Icon">
        <i slot="prepend">favorite</i>
      </QSelect>
      <QSelect bind:value={select} {options} label="Appended Icon">
        <i slot="append">list</i>
      </QSelect>
    </QDocsSection>
  </div>
</QDocs>

<style lang="scss">
  .heading {
    display: flex;
    align-items: center;
  }
</style>
