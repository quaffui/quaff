<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import { QBtnDocs } from "$lib/components/button/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
</script>

<QDocs QComponentDocs={QBtnDocs} usagePath="button">
  <QBtn slot="display" icon="star">Star me on Github</QBtn>

  <div slot="usage">
    <QDocsSection title="Default Buttons">
      <QBtn class="q-ma-sm" icon="favorite" label="Using Label" />

      <QBtn class="q-ma-sm">
        <span>Using</span><span style="color: blue">slot</span>
      </QBtn>
    </QDocsSection>

    <QDocsSection title="Loading State Buttons">
      <QBtn class="q-ma-sm" label="loading" loading />

      <QBtn class="q-ma-sm" icon="refresh" loading />
    </QDocsSection>

    <QDocsSection title="Disabled State Buttons">
      <QBtn class="q-ma-sm" icon="add" label="Disabled" disable />

      <QBtn class="q-ma-sm" disable>
        <span>Disabled</span><span style="color: gray">Button</span>
      </QBtn>
    </QDocsSection>

    <QDocsSection title="Button Variants">
      <QBtn class="q-ma-sm" label="Unelevated" unelevated />

      <QBtn class="q-ma-sm" label="Outline" outline />

      <QBtn class="q-ma-sm" label="Round" round />

      <QBtn class="q-ma-sm" label="Flat" flat />
    </QDocsSection>

    <QDocsSection title="Size">
      <QBtn class="q-ma-sm" size="sm" label="Small" unelevated />
      <QBtn class="q-ma-sm" label="Medium" unelevated />
      <QBtn class="q-ma-sm" size="lg" label="Large" unelevated />
      <QBtn class="q-ma-sm" size="xl" label="Extra Large" unelevated />
    </QDocsSection>

    <QDocsSection title="Button with Router Link">
      <QBtn class="q-ma-sm" icon="open_in_new" label="With router link" to="/layout" />
    </QDocsSection>
  </div>
</QDocs>
