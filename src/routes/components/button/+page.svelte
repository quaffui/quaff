<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import { QBtnDocs } from "$lib/components/button/docs";
  import ApiDoc from "$lib/components/private/ApiDoc.svelte";
  import ApiDocSection from "$lib/components/private/ApiDocSection.svelte";
</script>

<ApiDoc QComponentDocs={QBtnDocs} usagePath="button">
  <QBtn slot="display" icon="star">Star me on Github</QBtn>

  <div slot="usage">
    <ApiDocSection title="Default Buttons">
      <QBtn class="q-ma-sm" icon="favorite" label="Using Label" />

      <QBtn class="q-ma-sm">
        <span>Using</span><span style="color: blue">slot</span>
      </QBtn>
    </ApiDocSection>

    <ApiDocSection title="Loading State Buttons">
      <QBtn class="q-ma-sm" label="loading" loading />

      <QBtn class="q-ma-sm" icon="refresh" loading />
    </ApiDocSection>

    <ApiDocSection title="Disabled State Buttons">
      <QBtn class="q-ma-sm" icon="add" label="Disabled" disable />

      <QBtn class="q-ma-sm" disable>
        <span>Disabled</span><span style="color: gray">Button</span>
      </QBtn>
    </ApiDocSection>

    <ApiDocSection title="Button Variants">
      <QBtn class="q-ma-sm" label="Unelevated" unelevated />

      <QBtn class="q-ma-sm" label="Outline" outline />

      <QBtn class="q-ma-sm" label="Round" round />

      <QBtn class="q-ma-sm" label="Flat" flat />
    </ApiDocSection>

    <ApiDocSection title="Button with Router Link">
      <QBtn class="q-ma-sm" icon="open_in_new" label="With router link" to="/layout" />
    </ApiDocSection>
  </div>
</ApiDoc>
