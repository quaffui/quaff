<script lang="ts">
  import { QSelect, QBtn, QIcon } from "$lib";
  import { QSelectDocs } from "$components/select/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let options = ["Cats", "Dogs", "Capybaras"];
  let value = $state("");
  let select = $state("");
  let selectMultiple: string[] = $state([]);
  const displayValue = $derived.by(() => {
    if (!selectMultiple.length) {
      return "None";
    }

    if (selectMultiple.length > 1) {
      const firstParts = selectMultiple.slice(0, -1);
      const lastPart = selectMultiple.at(-1);
      return `${firstParts.join(", ")} and ${lastPart}`;
    }

    return selectMultiple[0];
  });
</script>

<QDocs componentDocs={QSelectDocs}>
  {#snippet display()}
    <QSelect label="Favorite animal" {options} {value} />
  {/snippet}

  <div class="s12 q-pa-md">
    <div class="heading">
      <h4 class="q-my-xl">Usage</h4>
      <QBtn icon="code" variant="outlined" />
    </div>

    <QDocsSection snippet={snippets["State"]} title="State">
      <QSelect bind:value={select} {options} label="Default" class="q-mt-md" />
      <QSelect bind:value={select} {options} label="Disabled" class="q-mt-md" disable />
      <QSelect bind:value={selectMultiple} {options} label="Multiple" class="q-mt-md" multiple />
      <QSelect
        bind:value={selectMultiple}
        {displayValue}
        {options}
        label="Multiple with displayValue"
        class="q-mt-md"
        multiple
      />
    </QDocsSection>

    <QDocsSection snippet={snippets["Style"]} title="Style">
      <QSelect bind:value={select} {options} label="Default" class="q-mt-md" />
      <QSelect bind:value={select} {options} label="Rounded" class="q-mt-md" rounded />
      <QSelect bind:value={select} {options} label="Outlined" class="q-mt-md" outlined />
      <QSelect bind:value={select} {options} label="Filled" class="q-mt-md" filled />
    </QDocsSection>

    <QDocsSection snippet={snippets["Dense"]} title="Dense">
      <QSelect bind:value={select} {options} label="Dense" class="q-mt-md" outlined dense />
    </QDocsSection>

    <QDocsSection snippet={snippets["Validation and Hints"]} title="Validation and Hints">
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

    <QDocsSection snippet={snippets["Snippets"]} title="Snippets">
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
