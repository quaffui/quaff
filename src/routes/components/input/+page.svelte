<script lang="ts">
  import { QIcon, QInput } from "$lib";
  import { QInputDocs } from "$lib/components/input/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let input = "";
</script>

<QDocs QComponentDocs={QInputDocs}>
  <QInput slot="display" bind:value={input} label="Default" class="q-mt-md" />

  <div slot="usage">
    <QDocsSection {snippets} title="State">
      <QInput bind:value={input} label="Default" class="q-mt-md" />
      <QInput bind:value={input} label="Disabled" class="q-mt-md" disable />
    </QDocsSection>

    <QDocsSection {snippets} title="Styles">
      <QInput bind:value={input} label="Bordered" class="q-mt-md" bordered />
      <QInput bind:value={input} label="Rounded" class="q-mt-md" rounded />
      <QInput bind:value={input} label="Outlined" class="q-mt-md" outlined />
      <QInput bind:value={input} label="Filled" class="q-mt-md" filled />
    </QDocsSection>

    <QDocsSection {snippets} title="Dense">
      <QInput bind:value={input} label="Dense" class="q-mt-md" bordered dense />
    </QDocsSection>

    <QDocsSection {snippets} title="Validation and Hints">
      <QInput bind:value={input} label="With Hint" class="q-mt-md" hint="This is a hint" />
      <QInput
        bind:value={input}
        label="Error State"
        class="q-mt-md"
        error
        errorMessage="A custom error message"
      />
    </QDocsSection>

    <QDocsSection {snippets} title="Slots">
      <QInput bind:value={input} label="Prepended Icon">
        <QIcon slot="prepend" name="search" />
      </QInput>
      <QInput bind:value={input} label="Appended Icon" class="q-mt-md">
        <QIcon slot="append" name="list" />
      </QInput>
    </QDocsSection>
  </div>
</QDocs>
