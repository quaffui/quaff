<script lang="ts">
  import { pageTitle } from "$helpers/pageTitle";
  import { QHeader, QToolbarTitle, QBtn, QLayout } from "$lib";
  import { QHeaderDocs } from "$lib/components/header/docs";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";
</script>

<svelte:head>
  <title>{pageTitle("QHeader")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QHeaderDocs}>
  {#snippet display()}
    <div class="example-boundary" style="width: 50%;">
      <QLayout view="hHh Lpr fFf" style="min-height: 200px;">
        {#snippet header()}
          <QHeader elevated>
            <QToolbarTitle>My App Header</QToolbarTitle>
          </QHeader>
        {/snippet}

        {#snippet content()}
          <div class="text-center q-py-lg">Page content goes here.</div>
        {/snippet}
      </QLayout>
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Usage">
        {#snippet sectionDescription()}
          QHeader is designed to be used within a QLayout component. It typically contains titles
          and buttons. It requires QLayout as a parent to function correctly. If you want to use it
          outside of QLayout, prefer using <code>QToolbar</code> instead.
        {/snippet}
        <div class="example-boundary" style="height: 200px;">
          <QLayout view="hHh Lpr fFf" style="min-height: 200px;">
            {#snippet header()}
              <QHeader>
                <QToolbarTitle>Basic Header</QToolbarTitle>
              </QHeader>
            {/snippet}
            {#snippet content()}
              <div class="text-center q-py-lg">Content</div>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Elevated and Bordered">
        {#snippet sectionDescription()}
          Use the <code>elevated</code> prop to add a shadow or the <code>bordered</code> prop to add
          a bottom border to the header.
        {/snippet}
        <div class="q-gutter-y-md">
          <div class="example-boundary" style="height: 200px;">
            <QLayout view="hHh Lpr fFf" style="min-height: 200px;">
              {#snippet header()}
                <QHeader elevated>
                  <QToolbarTitle>Elevated Header</QToolbarTitle>
                </QHeader>
              {/snippet}
              {#snippet content()}
                <div class="text-center q-py-lg">Content</div>
              {/snippet}
            </QLayout>
          </div>

          <div class="example-boundary q-mt-md" style="height: 200px;">
            <QLayout view="hHh Lpr fFf" style="min-height: 200px;">
              {#snippet header()}
                <QHeader bordered>
                  <QToolbarTitle>Bordered Header</QToolbarTitle>
                </QHeader>
              {/snippet}
              {#snippet content()}
                <div class="text-center q-py-lg">Content</div>
              {/snippet}
            </QLayout>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Height">
        {#snippet sectionDescription()}
          The <code>height</code> prop allows you to specify a custom height for the header in pixels.
        {/snippet}
        <div class="example-boundary" style="height: 250px;">
          <QLayout view="hHh Lpr fFf" style="min-height: 250px;">
            {#snippet header()}
              <QHeader height={100}>
                <QToolbarTitle>Tall Header (100px)</QToolbarTitle>
              </QHeader>
            {/snippet}
            {#snippet content()}
              <div class="text-center q-py-lg">Content for tall header</div>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Reveal on Scroll">
        {#snippet sectionDescription()}
          Set the <code>reveal</code> prop to true to make the header hide on scroll down and
          reappear on scroll up. The <code>revealOffset</code> prop controls when this behavior triggers.
        {/snippet}
        <div
          class="example-boundary"
          style="height: 300px; overflow: hidden; border: 1px solid var(--outline, #ccc);"
        >
          <QLayout view="hHh Lpr fFf" style="min-height: 300px;">
            {#snippet header()}
              <QHeader reveal revealOffset={50}>
                <QToolbarTitle>Reveal Header</QToolbarTitle>
              </QHeader>
            {/snippet}
            {#snippet content()}
              <div class="text-center q-py-lg" style="height: 600px">
                {#each { length: 30 }, i}
                  <div>Scrollable Content Line {i + 1}</div>
                {/each}
              </div>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Inset Header">
        {#snippet sectionDescription()}
          The <code>inset</code> prop adds a left padding to the header's content, making it appear
          inset from the left edge of the layout. This is useful for layouts with a left drawer or
          railbar. Note that by default, <code>QToolbarTitle</code> grows horizontally so the inset
          effect may not be visually apparent. You can use the <code>shrink</code> prop on QToolbarTitle
          to prevent it from growing.
        {/snippet}
        <div
          class="example-boundary"
          style="height: 300px; overflow: hidden; border: 1px solid var(--outline);"
        >
          <QLayout view="hHh Lpr fFf" style="min-height: 300px;">
            {#snippet header()}
              <QHeader inset class="justify-start">
                <QToolbarTitle shrink>Inset Header</QToolbarTitle>
              </QHeader>
            {/snippet}

            {#snippet content()}
              <div class="text-center q-py-lg">Content</div>
            {/snippet}
          </QLayout>
        </div>

        <div
          class="example-boundary q-mt-md"
          style="height: 300px; overflow: hidden; border: 1px solid var(--outline);"
        >
          <QLayout view="hHh Lpr fFf" style="min-height: 300px;">
            {#snippet header()}
              <QHeader class="justify-start">
                <QToolbarTitle shrink>Not Inset Header</QToolbarTitle>
              </QHeader>
            {/snippet}

            {#snippet content()}
              <div class="text-center q-py-lg">Content</div>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="With Toolbar Content">
        {#snippet sectionDescription()}
          QHeader typically contains various elements like titles, buttons, and spacers.
        {/snippet}
        <div class="example-boundary" style="height: 200px;">
          <QLayout view="hHh Lpr fFf" style="min-height: 200px;">
            {#snippet header()}
              <QHeader elevated>
                <QBtn flat round icon="menu" aria-label="Menu" />
                <QToolbarTitle>App Title</QToolbarTitle>
                <div style="flex-grow: 1;"></div>
                <QBtn flat round icon="search" aria-label="Search" />
                <QBtn flat round icon="more_vert" aria-label="More options" />
              </QHeader>
            {/snippet}
            {#snippet content()}
              <div class="text-center q-py-lg">Content</div>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .example-boundary {
    border: 1px dashed var(--outline, #1976d2); /* Corrected CSS variable */
    position: relative; /* For QLayout container behavior */
  }
</style>
