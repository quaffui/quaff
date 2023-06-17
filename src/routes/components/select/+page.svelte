<script lang="ts">
  import { QSelect, QBtn } from "$lib";
  import { QSelectDocs } from "$components/select/docs";
  import ApiDoc from "$lib/components/private/ApiDoc.svelte";
  import ApiDocSection from "$lib/components/private/ApiDocSection.svelte";

  let options = ["Cats", "Dogs", "Capybaras"];
  let value = "";
  let select = "";
  let selectMultiple: string[] = [];
</script>

<ApiDoc QComponentDocs={QSelectDocs} usagePath="select">
  <QSelect slot="display" label="Favorite animal" {options} {value} />

  <div class="s12 q-pa-md">
    <div class="heading">
      <h4 class="q-my-xl">Usage</h4>
      <QBtn rounded icon="code" outline />
    </div>

    <ApiDocSection title="State">
      <QSelect bind:value={select} {options} label="Default" class="q-mt-md" />
      <QSelect bind:value={select} {options} label="Disabled" class="q-mt-md" disable />
      <QSelect bind:value={selectMultiple} {options} label="Multiple" class="q-mt-md" multiple />
    </ApiDocSection>

    <ApiDocSection title="Style">
      <QSelect bind:value={select} {options} label="Bordered" class="q-mt-md" bordered />
      <QSelect bind:value={select} {options} label="Rounded" class="q-mt-md" rounded />
      <QSelect bind:value={select} {options} label="Outlined" class="q-mt-md" outlined />
      <QSelect bind:value={select} {options} label="Filled" class="q-mt-md" filled />
    </ApiDocSection>

    <ApiDocSection title="Validation and Hints">
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
    </ApiDocSection>

    <ApiDocSection title="Slots">
      <QSelect bind:value={select} {options} label="Prepended Icon">
        <i slot="prepend">favorite</i>
      </QSelect>
      <QSelect bind:value={select} {options} label="Appended Icon">
        <i slot="append">list</i>
      </QSelect>
    </ApiDocSection>
  </div>
</ApiDoc>

<style lang="scss">
  .heading {
    display: flex;
    align-items: center;
  }
</style>
