<script lang="ts">
  import { QTab, QTabs, QCard, QCardSection, QBtn, QIcon, QList, QItem, QItemSection } from "$lib";
  import { QTabsDocs, QTabDocs } from "$components/tabs/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";

  let activeTab = $state("hello");
  let contentTab = $state("tab1");
  let sectionTab = $state("section1");
  let colorTab = $state("red");
  let mobileTab = $state("feed");
</script>

<QDocs {snippets} componentDocs={[QTabsDocs, QTabDocs]}>
  {#snippet display()}
    <QTabs bind:value={activeTab}>
      <QTab name="hello" icon="home">Home</QTab>
      <QTab name="world" icon="person">Profile</QTab>
      <QTab name="settings" icon="settings">Settings</QTab>
    </QTabs>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Tabs">
        {#snippet sectionDescription()}
          QTabs and QTab work together to create a tabbed interface. The <code>QTabs</code>
          component is the container, while each <code>QTab</code> represents a selectable option.
          Use the <code>bind:value</code> directive to track the currently selected tab.
        {/snippet}

        <div class="q-ma-sm">
          <QTabs bind:value={activeTab}>
            <QTab name="hello">Hello</QTab>
            <QTab name="world">World</QTab>
            <QTab name="foo">Foo</QTab>
            <QTab name="bar">Bar</QTab>
          </QTabs>
          <QCard bordered class="q-mt-md q-pa-md">
            <div>Active tab: <strong>{activeTab}</strong></div>
          </QCard>
        </div>
      </QDocsSection>

      <QDocsSection title="Tab Variants">
        {#snippet sectionDescription()}
          QTabs supports three variants: <code>primary</code> (default), <code>secondary</code>, and
          <code>vertical</code>. Each variant has a different visual style and layout. Prefer
          primary tabs for your main navigation.
        {/snippet}

        <div class="row q-gap-lg q-ma-sm">
          <div class="col-12">
            <h6 class="q-mb-sm">Primary Tabs (Default)</h6>
            <QTabs bind:value={activeTab} variant="primary">
              <QTab name="hello">Hello</QTab>
              <QTab name="world">World</QTab>
              <QTab name="foo">Foo</QTab>
              <QTab name="bar">Bar</QTab>
            </QTabs>
          </div>

          <div class="col-12">
            <h6 class="q-mb-sm">Secondary Tabs</h6>
            <QTabs bind:value={activeTab} variant="secondary">
              <QTab name="hello">Hello</QTab>
              <QTab name="world">World</QTab>
              <QTab name="foo">Foo</QTab>
              <QTab name="bar">Bar</QTab>
            </QTabs>
          </div>

          <div class="col-12 col-md-4">
            <h6 class="q-mb-sm">Vertical Tabs</h6>
            <QTabs bind:value={activeTab} variant="vertical">
              <QTab name="hello">Hello</QTab>
              <QTab name="world">World</QTab>
              <QTab name="foo">Foo</QTab>
              <QTab name="bar">Bar</QTab>
            </QTabs>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Tabs with Icons">
        {#snippet sectionDescription()}
          QTab components can include icons using the <code>icon</code> prop. Icons can be displayed
          along with text content or alone.
        {/snippet}

        <div class="q-ma-sm">
          <QTabs bind:value={activeTab}>
            <QTab icon="home" name="hello">Home</QTab>
            <QTab icon="person" name="world">Profile</QTab>
            <QTab icon="settings" name="foo">Settings</QTab>
            <QTab icon="help" name="bar">Help</QTab>
          </QTabs>

          <QTabs class="q-my-md" bind:value={activeTab} variant="vertical">
            <QTab icon="home" name="hello">Home</QTab>
            <QTab icon="person" name="world">Profile</QTab>
            <QTab icon="settings" name="foo">Settings</QTab>
            <QTab icon="help" name="bar">Help</QTab>
          </QTabs>

          <h6 class="q-my-md">Icons Only</h6>
          <QTabs bind:value={activeTab}>
            <QTab icon="home" name="hello" />
            <QTab icon="person" name="world" />
            <QTab icon="settings" name="foo" />
            <QTab icon="help" name="bar" />
          </QTabs>
        </div>
      </QDocsSection>

      <QDocsSection title="Tabs with Router Links">
        {#snippet sectionDescription()}
          Tabs can function as navigation links by adding the <code>to</code> prop. This renders the
          tab as an anchor element instead of a button, enabling seamless integration with your routing
          system.
        {/snippet}

        <div class="q-ma-sm">
          <QTabs>
            <QTab name="home" icon="home" to="/">Home</QTab>
            <QTab name="components" icon="grid_view" to="/components">Components</QTab>
            <QTab name="utils" icon="construction" to="/utils">Utils</QTab>
            <QTab name="dev" icon="code" to="/dev">Dev</QTab>
          </QTabs>
          <div class="q-pa-sm text-caption text-italic">
            Note: When using router links, the active tab is determined by the current route rather
            than the value prop.
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Customizing Appearance">
        {#snippet sectionDescription()}
          You can use <code>noSeparator</code> to remove the dividing line separating the tabs from the
          content.
        {/snippet}

        <QTabs bind:value={activeTab} noSeparator>
          <QTab name="hello">Hello</QTab>
          <QTab name="world">World</QTab>
          <QTab name="foo">Foo</QTab>
          <QTab name="bar">Bar</QTab>
        </QTabs>
      </QDocsSection>

      <QDocsSection title="Connecting Tabs to Content">
        {#snippet sectionDescription()}
          Tabs are typically used to toggle between different content sections. You can achieve this
          by binding the tabs' value to a variable and using that to conditionally display content.
        {/snippet}

        <QCard class="q-ma-sm">
          <QCardSection>
            <QTabs bind:value={contentTab}>
              <QTab name="tab1">First Tab</QTab>
              <QTab name="tab2">Second Tab</QTab>
              <QTab name="tab3">Third Tab</QTab>
            </QTabs>
          </QCardSection>

          <QCardSection>
            {#if contentTab === "tab1"}
              <h6>First Tab Content</h6>
              <p>This is the content for the first tab. It appears when tab1 is selected.</p>
            {:else if contentTab === "tab2"}
              <h6>Second Tab Content</h6>
              <p>This is the content for the second tab. It appears when tab2 is selected.</p>
            {:else if contentTab === "tab3"}
              <h6>Third Tab Content</h6>
              <p>This is the content for the third tab. It appears when tab3 is selected.</p>
            {/if}
          </QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Mobile Tab Navigation">
        {#snippet sectionDescription()}
          Tabs are commonly used for mobile navigation. Typically, these are placed at the bottom of
          the screen and feature icons with optional labels.
        {/snippet}

        <QCard class="q-ma-sm" style="max-width: 375px; margin: 0 auto;">
          <QCardSection style="height: 400px; position: relative;">
            <div class="absolute-center text-center">
              <h6>Mobile App Content</h6>
              <p>Current tab: {mobileTab}</p>
            </div>
            <div style="position: absolute; bottom: 0; left: 0; right: 0;">
              <QTabs bind:value={mobileTab} class="bg-surface">
                <QTab name="feed" icon="home"></QTab>
                <QTab name="search" icon="search"></QTab>
                <QTab name="notifications" icon="notifications"></QTab>
                <QTab name="profile" icon="person"></QTab>
              </QTabs>
            </div>
          </QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        {#snippet sectionDescription()}
          QTabs and QTab are built with accessibility in mind. They include proper ARIA attributes
          and support keyboard navigation for tab selection.
        {/snippet}

        <div class="q-ma-sm">
          <QList dense>
            <QItem>
              <QItemSection type="icon">
                <QIcon name="keyboard" />
              </QItemSection>
              <QItemSection>
                <strong>Tab Key:</strong> Moves focus to the next focusable element outside QTabs
              </QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="icon">
                <QIcon name="open_run" />
              </QItemSection>
              <QItemSection>
                <strong>Keyboard Arrows:</strong> Navigate between tabs when focus is on a tab
              </QItemSection>
            </QItem>

            <QItem>
              <QItemSection type="icon">
                <QIcon name="space_bar" />
              </QItemSection>
              <QItemSection>
                <strong>Space/Enter:</strong> Activate the focused tab
              </QItemSection>
            </QItem>
          </QList>

          <QTabs bind:value={activeTab} class="q-mt-md">
            <QTab name="hello">Try keyboard navigation</QTab>
            <QTab name="world">With these tabs</QTab>
            <QTab name="foo">Focus a tab</QTab>
            <QTab name="bar">Use arrows to move</QTab>
          </QTabs>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
