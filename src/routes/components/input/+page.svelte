<script lang="ts">
  import { QIcon, QInput } from "$lib";
  import { QInputDocs } from "$lib/components/input/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let input = "";
</script>

<QDocs {snippets} componentDocs={QInputDocs}>
  {#snippet display()}
    <QInput bind:value={input} label="Default" class="q-mt-md" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="State">
        <QInput bind:value={input} label="Default" class="q-mt-md" />
        <QInput bind:value={input} label="Disabled" class="q-mt-md" disable />
        <QInput bind:value={input} label="Disabled" class="q-mt-md" disable outlined />
      </QDocsSection>

      <QDocsSection title="Styles">
        <QInput bind:value={input} label="Default" class="q-mt-md" />
        <QInput bind:value={input} label="Rounded" class="q-mt-md" rounded />
        <QInput bind:value={input} label="Outlined" class="q-mt-md" outlined />
        <QInput bind:value={input} label="Filled" class="q-mt-md" filled />
      </QDocsSection>

      <QDocsSection title="Dense">
        <QInput bind:value={input} label="Dense" class="q-mt-md" dense />
      </QDocsSection>

      <QDocsSection title="Validation and Hints">
        <QInput bind:value={input} label="With Hint" class="q-mt-md" hint="This is a hint" />
        <QInput
          bind:value={input}
          label="Error State"
          class="q-mt-md"
          error
          errorMessage="A custom error message"
        />
      </QDocsSection>

      <QDocsSection title="Snippets">
        <QInput bind:value={input} label="Prepended Icon">
          {#snippet prepend()}
            <QIcon name="search" />
          {/snippet}
        </QInput>
        <QInput bind:value={input} label="Appended Icon" class="q-mt-md">
          {#snippet append()}
            <QIcon name="list" />
          {/snippet}
        </QInput>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
