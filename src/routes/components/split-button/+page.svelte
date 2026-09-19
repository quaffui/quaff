<script lang="ts">
  import { QSplitBtnDocs } from "$components/split-button/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QItem, QItemSection, QList, QSplitBtn } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QSplitBtnDocs });

  const variants = ["filled", "tonal", "elevated", "outlined"] as const;
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const heights = { xs: 2, sm: 2.5, md: 3.5, lg: 6, xl: 8.5 };
  let isMenuExpanded = $state(false);
  let previewStatus = $state("Ready to send");
  let actionStatus = $state("Ready to save");
  let variantStatus = $state("Choose an action");
  let sizeStatus = $state("Choose an action");
  let stateStatus = $state("Choose a download action");
</script>

<svelte:head>
  <title>{pageTitle("QSplitBtn")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QSplitBtn
      label="Send"
      icon="send"
      menuLabel="More send options"
      onclick={() => (previewStatus = "Message sent")}
    >
      <QList role="presentation">
        <QItem clickable role="menuitem" onclick={() => (previewStatus = "Message scheduled")}>
          <QItemSection>Schedule send</QItemSection>
        </QItem>
        <QItem clickable role="menuitem" onclick={() => (previewStatus = "Draft saved")}>
          <QItemSection>Save draft</QItemSection>
        </QItem>
      </QList>
    </QSplitBtn>
    <p class="q-mt-md" aria-live="polite">{previewStatus}</p>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Primary Action and Menu">
      {#snippet sectionDescription()}
        <p>
          The leading button performs your primary <code>onclick</code> action. The trailing button
          opens the built-in menu containing the <code>children</code> snippet. Give
          <code>menuLabel</code> a contextual name, such as “More save options”.
        </p>
        <p>
          <code>QSplitBtn</code> always uses Material 3 Expressive styling, independently of the
          global expressive setting. It defaults to the <code>filled</code> variant and
          <code>sm</code> size. Bind <code>expanded</code> when you need to read or control the menu's
          open state.
        </p>
      {/snippet}

      <QSplitBtn
        label="Save"
        icon="save"
        menuLabel="More save options"
        bind:expanded={isMenuExpanded}
        onclick={() => (actionStatus = "Saved")}
      >
        <QList role="presentation">
          <QItem clickable role="menuitem" onclick={() => (actionStatus = "Saved a copy")}>
            <QItemSection>Save a copy</QItemSection>
          </QItem>
          <QItem clickable role="menuitem" onclick={() => (actionStatus = "Exported as PDF")}>
            <QItemSection>Export as PDF</QItemSection>
          </QItem>
        </QList>
      </QSplitBtn>
      <p class="q-mt-md" aria-live="polite">{actionStatus}</p>
      <p>Menu: {isMenuExpanded ? "open" : "closed"}</p>
    </QDocsSection>

    <QDocsSection title="Variants">
      {#snippet sectionDescription()}
        Choose <code>filled</code>, <code>tonal</code>, <code>elevated</code>, or
        <code>outlined</code>. Both halves share the variant. Opening the menu changes the trailing
        button's shape and rotates its icon while preserving its color.
      {/snippet}

      <div class="flex q-gap-lg" style="flex-wrap: wrap;">
        {#each variants as variant (variant)}
          <QSplitBtn
            {variant}
            label={variant}
            menuLabel={`More ${variant} save options`}
            onclick={() => (variantStatus = `Saved with ${variant}`)}
          >
            <QList role="presentation">
              <QItem
                clickable
                role="menuitem"
                onclick={() => (variantStatus = `Saved a copy with ${variant}`)}
              >
                <QItemSection>Save a copy</QItemSection>
              </QItem>
            </QList>
          </QSplitBtn>
        {/each}
      </div>
      <p class="q-mt-md" aria-live="polite">{variantStatus}</p>
    </QDocsSection>

    <QDocsSection title="Sizes">
      {#snippet sectionDescription()}
        Five expressive sizes set both buttons' height: <code>xs</code> (2rem),
        <code>sm</code> (2.5rem), <code>md</code> (3.5rem), <code>lg</code> (6rem), and
        <code>xl</code> (8.5rem). Small sizes retain a larger interaction target. Large examples can be
        scrolled horizontally.
      {/snippet}

      <div class="flex column q-gap-lg">
        {#each sizes as size (size)}
          <div class="split-size-example">
            <p class="q-mb-sm">{size.toUpperCase()} · {heights[size]}rem</p>
            <div class="split-example-scroll">
              <QSplitBtn
                {size}
                label="Share"
                icon="share"
                menuLabel={`More ${size} sharing options`}
                onclick={() => (sizeStatus = `Shared from ${size}`)}
              >
                <QList role="presentation">
                  <QItem
                    clickable
                    role="menuitem"
                    onclick={() => (sizeStatus = `Link copied from ${size}`)}
                  >
                    <QItemSection>Copy link</QItemSection>
                  </QItem>
                </QList>
              </QSplitBtn>
            </div>
          </div>
        {/each}
      </div>
      <p class="q-mt-md" aria-live="polite">{sizeStatus}</p>
    </QDocsSection>

    <QDocsSection title="Disabled, Loading, and Icon-only">
      {#snippet sectionDescription()}
        <p>
          <code>disabled</code> disables both actions. <code>loading</code> displays a progress
          indicator in the leading button. An icon-only primary action needs its own
          <code>aria-label</code>, separately from the trailing button's <code>menuLabel</code>.
        </p>
      {/snippet}

      <div class="flex q-gap-lg" style="flex-wrap: wrap;">
        <QSplitBtn label="Save" disabled menuLabel="More disabled save options">
          <QList role="presentation">
            <QItem clickable role="menuitem"><QItemSection>Save a copy</QItemSection></QItem>
          </QList>
        </QSplitBtn>
        <QSplitBtn label="Saving" loading menuLabel="More saving options">
          <QList role="presentation">
            <QItem clickable role="menuitem" onclick={() => (stateStatus = "Save status checked")}>
              <QItemSection>Check save status</QItemSection>
            </QItem>
          </QList>
        </QSplitBtn>
        <QSplitBtn
          icon="download"
          aria-label="Download file"
          menuLabel="More download options"
          onclick={() => (stateStatus = "File downloaded")}
        >
          <QList role="presentation">
            <QItem clickable role="menuitem" onclick={() => (stateStatus = "PDF downloaded")}>
              <QItemSection>Download PDF</QItemSection>
            </QItem>
          </QList>
        </QSplitBtn>
      </div>
      <p class="q-mt-md" aria-live="polite">{stateStatus}</p>
    </QDocsSection>

    <QDocsSection title="Attributes and Keyboard" noCode>
      {#snippet sectionDescription()}
        <p>
          Native attributes and event handlers, including <code>type</code>, <code>name</code>,
          <code>value</code>, and <code>aria-label</code>, apply to the primary button. Link props
          such as <code>href</code> also apply to the primary action. <code>class</code>,
          <code>style</code>, and <code>dir</code> apply to the outer split-button container.
        </p>
        <p>
          Tab moves between the two buttons; Space or Enter activates the focused button. The menu
          trigger announces its expanded state. Use <code>QList</code> with
          <code>role="presentation"</code> and clickable <code>QItem</code> elements with
          <code>role="menuitem"</code> for menu actions and arrow-key navigation. Selecting an action
          closes the menu, and Escape dismisses it.
        </p>
        <p>
          See the Material 3 split-button
          <a href="https://m3.material.io/components/split-button/specs">specifications</a>,
          <a href="https://m3.material.io/components/split-button/guidelines">usage guidelines</a>,
          and
          <a href="https://m3.material.io/components/split-button/accessibility"
            >accessibility guidance</a
          >.
        </p>
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .split-size-example {
    width: 100%;
  }

  .split-example-scroll {
    overflow-x: auto;
    padding: 0.5rem;
  }
</style>
