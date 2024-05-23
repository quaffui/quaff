<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import { QBtnDocs } from "$lib/components/button/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";

  import snippets from "./docs.snippets";
</script>

<QDocs componentDocs={QBtnDocs}>
  {#snippet display()}
    <QBtn icon="star">Star me on Github</QBtn>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection {snippets} title="Default Buttons">
        <QBtn class="q-ma-sm" icon="favorite" label="Using Label" />

        <QBtn class="q-ma-sm q-gap-md">
          <span>Using</span>
          <span style="color: blue">slot</span>
        </QBtn>
      </QDocsSection>

      <QDocsSection {snippets} title="Loading State Buttons">
        <QBtn class="q-ma-sm" label="loading" loading />

        <QBtn class="q-ma-sm" icon="refresh" loading />
      </QDocsSection>

      <QDocsSection {snippets} title="Disabled State Buttons">
        <QBtn class="q-ma-sm" icon="add" label="Disabled" disabled />

        <QBtn class="q-ma-sm" disabled>
          <span>Disabled</span><span style="color: gray">Button</span>
        </QBtn>

        <QBtn
          class="q-ma-sm"
          label="Click me"
          disabled
          onclick={() => alert("What's this sorcery?!")}
        />
      </QDocsSection>

      <QDocsSection {snippets} title="Button Variants">
        <QBtn class="q-ma-sm" label="Elevated (default)" />

        <QBtn class="q-ma-sm" label="Unelevated" unelevated />

        <QBtn class="q-ma-sm" label="Tonal" design="tonal" />

        <QBtn class="q-ma-sm" label="Outlined" design="outlined" />

        <QBtn class="q-ma-sm" label="Flat" design="flat" />

        <QBtn class="q-ma-sm" label="With image" icon="img:/cocktail.jpg" />
      </QDocsSection>

      <QDocsSection {snippets} title="Size">
        <QBtn class="q-ma-sm" size="sm" label="Small" unelevated />
        <QBtn class="q-ma-sm" label="Medium" unelevated />
        <QBtn class="q-ma-sm" size="lg" label="Large" unelevated />
        <QBtn class="q-ma-sm" size="xl" label="Extra Large" unelevated />
      </QDocsSection>

      <QDocsSection {snippets} title="Button with Router Link">
        <QBtn class="q-ma-sm" icon="open_in_new" label="With router link" to="/layout" />
        <QBtn class="q-ma-sm" icon="open_in_new" label="With router link" to="/layout" disabled />
      </QDocsSection>

      <QDocsSection {snippets} title="Events">
        <QBtn class="q-ma-sm" label="Click me" onclick={() => alert("Omg you did it")} />
        <QBtn class="q-ma-sm" label="Click me" onclick={() => alert("Omg you did it")} disabled />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
