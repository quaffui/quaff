<script lang="ts">
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QHeader, QHeaderTitle, QIcon, QIconBtn, QInput, QLayout } from "$lib";
  import { QHeaderDocs, QHeaderTitleDocs } from "$lib/components/header/docs";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QHeaderDocs, QHeaderTitleDocs] });
</script>

<svelte:head>
  <title>{pageTitle("QHeader")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QLayout class="surface" style="height: 100%; width: 75%; min-width: unset; min-height: unset">
      {#snippet header()}
        <QHeader elevated>
          <QHeaderTitle>My App Header</QHeaderTitle>
        </QHeader>
      {/snippet}

      {#snippet content()}
        <div class="text-center q-py-lg">Page content goes here.</div>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Usage">
        {#snippet sectionDescription()}
          QHeader is a top app bar for navigation, titles, and actions. It works on its own and also
          integrates with QLayout when rendered through the layout's header snippet.
        {/snippet}
        <QHeader bordered>
          <QIconBtn flat icon="menu" aria-label="Menu" />
          <QHeaderTitle>Basic Header</QHeaderTitle>
          <QIconBtn flat icon="more_vert" aria-label="More options" />
        </QHeader>
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
                  <QHeaderTitle>Elevated Header</QHeaderTitle>
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
                  <QHeaderTitle>Bordered Header</QHeaderTitle>
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
                <QHeaderTitle>Tall Header (100px)</QHeaderTitle>
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
          style="height: 300px; overflow: hidden; border: 1px solid var(--outline-variant, #ccc);"
        >
          <QLayout view="hHh Lpr fFf" style="min-height: 300px;">
            {#snippet header()}
              <QHeader reveal revealOffset={50}>
                <QHeaderTitle>Reveal Header</QHeaderTitle>
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
          railbar. By default, <code>QHeaderTitle</code> grows horizontally. Use its
          <code>shrink</code> prop when the title should keep its natural width.
        {/snippet}
        <div
          class="example-boundary"
          style="height: 300px; overflow: hidden; border: 1px solid var(--outline-variant);"
        >
          <QLayout view="hHh Lpr fFf" style="min-height: 300px;">
            {#snippet header()}
              <QHeader inset class="justify-start">
                <QHeaderTitle shrink>Inset Header</QHeaderTitle>
              </QHeader>
            {/snippet}

            {#snippet content()}
              <div class="text-center q-py-lg">Content</div>
            {/snippet}
          </QLayout>
        </div>

        <div
          class="example-boundary q-mt-md"
          style="height: 300px; overflow: hidden; border: 1px solid var(--outline-variant);"
        >
          <QLayout view="hHh Lpr fFf" style="min-height: 300px;">
            {#snippet header()}
              <QHeader class="justify-start">
                <QHeaderTitle shrink>Not Inset Header</QHeaderTitle>
              </QHeader>
            {/snippet}

            {#snippet content()}
              <div class="text-center q-py-lg">Content</div>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Navigation and Actions">
        {#snippet sectionDescription()}
          QHeader typically contains various elements like titles, buttons, and spacers.
        {/snippet}
        <div class="example-boundary" style="height: 200px;">
          <QLayout view="hHh Lpr fFf" style="min-height: 200px;">
            {#snippet header()}
              <QHeader elevated>
                <QIconBtn flat icon="menu" aria-label="Menu" />
                <QHeaderTitle>App Title</QHeaderTitle>
                <div style="flex-grow: 1;"></div>
                <QIconBtn flat icon="search" aria-label="Search" />
                <QIconBtn flat icon="more_vert" aria-label="More options" />
              </QHeader>
            {/snippet}
            {#snippet content()}
              <div class="text-center q-py-lg">Content</div>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Search">
        {#snippet sectionDescription()}
          QHeaderTitle gives central content 8dp of inline space, matching the app bar search
          layout.
        {/snippet}
        <QHeader bordered>
          <QIconBtn flat icon="arrow_back" aria-label="Back" />
          <QHeaderTitle class="q-mx-auto" style="max-width: 45rem;">
            <QInput value="Search" dense rounded style="width: 100%;">
              {#snippet prepend()}
                <QIcon name="search" />
              {/snippet}
            </QInput>
          </QHeaderTitle>
          <QIconBtn flat icon="account_circle" aria-label="Account" />
        </QHeader>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .example-boundary {
    border: 1px dashed var(--outline-variant, #1976d2); /* Corrected CSS variable */
    position: relative; /* For QLayout container behavior */
  }
</style>
