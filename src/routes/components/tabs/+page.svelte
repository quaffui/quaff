<script lang="ts">
  import QTab from "$components/tabs/QTab.svelte";
  import QTabs from "$components/tabs/QTabs.svelte";
  import { QTabsDocs, QTabDocs } from "$components/tabs/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";

  let activeTab = $state("hello");
</script>

<QDocs componentDocs={[QTabsDocs, QTabDocs]}>
  {#snippet usage()}
    <div>
      <QDocsSection title="Primary Tabs">
        <QTabs bind:value={activeTab}>
          <QTab name="hello">Hello</QTab>
          <QTab name="world">World</QTab>
          <QTab name="foo">Foo</QTab>
          <QTab name="bar">Bar</QTab>
        </QTabs>
      </QDocsSection>

      <QDocsSection title="Secondary Tabs">
        <QTabs bind:value={activeTab} variant="secondary">
          <QTab name="hello">Hello</QTab>
          <QTab name="foo">Foo</QTab>
          <QTab name="world">World</QTab>
          <QTab name="bar">Bar</QTab>
        </QTabs>
      </QDocsSection>

      <QDocsSection title="Vertical Tabs">
        <QTabs bind:value={activeTab} variant="vertical">
          <QTab icon="favorite" name="foo">Foo</QTab>
          <QTab icon="star" name="bar">Bar</QTab>
          <QTab icon="home" name="hello">Hello</QTab>
          <QTab icon="help" name="world">World</QTab>
        </QTabs>
      </QDocsSection>

      <QDocsSection title="Icons">
        <QTabs bind:value={activeTab}>
          <QTab icon="favorite" name="foo">Foo</QTab>
          <QTab icon="home" name="hello">Hello</QTab>
          <QTab icon="star" name="bar">Bar</QTab>
          <QTab icon="help" name="world">World</QTab>
        </QTabs>
      </QDocsSection>

      <QDocsSection title="Router links">
        <QTabs>
          <QTab name="home" icon="home" to="/">Home</QTab>
          <QTab name="components" icon="grid_view" to="/components">Components</QTab>
          <QTab name="utils" icon="construction" to="/utils">Utils</QTab>
          <QTab name="dev" icon="code" to="/dev">Dev</QTab>
          <QTab name="layout" icon="dashboard_customize" to="/layout">Layout tests</QTab>
        </QTabs>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
