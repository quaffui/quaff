<script lang="ts">
  import { QSelect, QBtn, QIcon } from "$lib";
  import { QSelectDocs } from "$components/select/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let options = ["Cats", "Dogs", "Capybaras"];
  let value = "";
  let select = "";
  let selectMultiple: string[] = [];
</script>

<QDocs componentDocs={QSelectDocs}>
  <QSelect slot="display" label="Favorite animal" {options} {value} />

  <div class="s12 q-pa-md">
    <div class="heading">
      <h4 class="q-my-xl">Usage</h4>
      <QBtn icon="code" design="outlined" />
    </div>

    <QDocsSection {snippets} title="State">
      <QSelect bind:value={select} {options} label="Default" class="q-mt-md" />
      <QSelect bind:value={select} {options} label="Disabled" class="q-mt-md" disable />
      <QSelect bind:value={selectMultiple} {options} label="Multiple" class="q-mt-md" multiple />
    </QDocsSection>

    <QDocsSection {snippets} title="Style">
      <QSelect bind:value={select} {options} label="Default" class="q-mt-md" />
      <QSelect bind:value={select} {options} label="Rounded" class="q-mt-md" rounded />
      <QSelect bind:value={select} {options} label="Outlined" class="q-mt-md" outlined />
      <QSelect bind:value={select} {options} label="Filled" class="q-mt-md" filled />
    </QDocsSection>

    <QDocsSection {snippets} title="Dense">
      <QSelect bind:value={select} {options} label="Dense" class="q-mt-md" outlined dense />
    </QDocsSection>

    <QDocsSection {snippets} title="Validation and Hints">
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

    <QDocsSection {snippets} title="Snippets">
      <QSelect bind:value={select} {options} label="Prepended Icon">
        {#snippet prepend()}
          <QIcon name="favorite" />
        {/snippet}
      </QSelect>
      <QSelect bind:value={select} {options} label="Appended Icon" class="q-mt-md">
        {#snippet append()}
          <QIcon name="list" />
        {/snippet}
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
