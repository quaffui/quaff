<script lang="ts">
  import { QToolbarDocs } from "$components/toolbar/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QIcon, QInput, QToolbar, QToolbarTitle } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";
</script>

<svelte:head>
  <title>{pageTitle("QToolbar")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QToolbarDocs}>
  {#snippet display()}
    <QToolbar border>
      <QBtn flat icon="menu" />
      <QToolbarTitle>My Application</QToolbarTitle>
      <QBtn flat icon="search" />
      <QBtn flat icon="more_vert" />
    </QToolbar>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Toolbar">
        {#snippet sectionDescription()}
          QToolbar provides a container for top-level navigation and actions. Typically used in
          headers and footers, it contains navigation icons, titles, and action buttons.
        {/snippet}

        <QToolbar border class="q-mb-md">
          <QBtn flat icon="menu" />
          <QToolbarTitle>Basic Toolbar</QToolbarTitle>
          <QBtn flat icon="search" />
          <QBtn flat icon="more_vert" />
        </QToolbar>
      </QDocsSection>

      <QDocsSection title="Toolbar with Title">
        {#snippet sectionDescription()}
          Use QToolbarTitle to add a title to your toolbar. It automatically handles spacing and can
          shrink when needed to accommodate other toolbar elements.
        {/snippet}

        <QToolbar border class="q-mb-md">
          <QBtn flat icon="arrow_back" />
          <QToolbarTitle>Page Title</QToolbarTitle>
        </QToolbar>

        <QToolbar border class="q-mb-md">
          <QBtn flat icon="menu" />
          <QToolbarTitle shrink>Shrinkable Title</QToolbarTitle>
          <QBtn flat label="Action 1" />
          <QBtn flat label="Action 2" />
        </QToolbar>
      </QDocsSection>

      <QDocsSection title="Appearance Options">
        {#snippet sectionDescription()}
          Customize the toolbar appearance with props like <code>border</code>,
          <code>elevate</code>, and <code>inset</code>. These control the visual styling and spacing
          of the toolbar.
        {/snippet}

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Default</p>
          <QToolbar>
            <QBtn flat icon="menu" />
            <QToolbarTitle>Default</QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">With Border</p>
          <QToolbar border>
            <QBtn flat icon="menu" />
            <QToolbarTitle>Bordered</QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Elevated</p>
          <QToolbar elevate>
            <QBtn flat icon="menu" />
            <QToolbarTitle>Elevated</QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">With Inset Padding</p>
          <QToolbar inset>
            <QBtn flat icon="menu" />
            <QToolbarTitle>Inset</QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Custom color</p>
          <QToolbar class="primary-container">
            <QBtn flat icon="palette" />
            <QToolbarTitle>Primary-container toolbar</QToolbarTitle>
          </QToolbar>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Height">
        {#snippet sectionDescription()}
          Control the height of the toolbar using the <code>height</code> prop. The default height is
          64px.
        {/snippet}

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Default Height (64px)</p>
          <QToolbar border>
            <QBtn flat icon="menu" />
            <QToolbarTitle>Default Height</QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Compact Height (48px)</p>
          <QToolbar border height={48}>
            <QBtn flat icon="menu" />
            <QToolbarTitle>Compact</QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Tall Height (80px)</p>
          <QToolbar border height={80}>
            <QBtn flat icon="menu" />
            <QToolbarTitle>Tall</QToolbarTitle>
          </QToolbar>
        </div>
      </QDocsSection>

      <QDocsSection title="Common Toolbar Patterns">
        {#snippet sectionDescription()}
          Here are some common patterns for toolbar layouts used in applications.
        {/snippet}

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Navigation Drawer Menu</p>
          <QToolbar border>
            <QBtn flat icon="menu" />
            <QToolbarTitle>My App</QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Back Navigation</p>
          <QToolbar border>
            <QBtn flat icon="arrow_back" />
            <QToolbarTitle>Page Details</QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Search Bar</p>
          <QToolbar border>
            <QBtn flat icon="arrow_back" />
            <QToolbarTitle>
              <QInput value="how to center a div" dense rounded style="width: 33%;">
                {#snippet prepend()}
                  <QIcon name="search" />
                {/snippet}
              </QInput>
            </QToolbarTitle>
          </QToolbar>
        </div>

        <div class="q-mb-md">
          <p class="text-caption q-mb-xs">Action Buttons</p>
          <QToolbar border inset>
            <QToolbarTitle class="justify-start">Edit Document</QToolbarTitle>
            <QBtn flat label="Save" />
            <QBtn flat label="Cancel" />
          </QToolbar>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
