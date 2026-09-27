<script lang="ts">
  import { QSplitBtnDocs } from "#components/split-button/docs.js";
  import type { QSplitBtnProps } from "#components/split-button/props.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { pageMeta } from "#docs/metadata.js";
  import { useMeta } from "#lib/meta.js";
  import { QBtn, QIcon, QItem, QItemSection, QList, QSelect, QSplitBtn, QSwitch } from "#lib";
  import snippets from "./docs.snippets.js";

  useMeta(
    pageMeta(
      "QSplitBtn — Split Button",
      "Pair a primary action with a menu of related choices using QSplitBtn for Svelte. Explore variants, sizes, loading states, icons, and keyboard controls."
    )
  );

  docsCtx.set({ snippets, componentDocs: QSplitBtnDocs });

  const VARIANTS = ["filled", "tonal", "elevated", "outlined"];
  const SIZES = ["xs", "sm", "md", "lg", "xl"];
  const RIPPLES = [
    { label: "Default ripple", value: "default" },
    { label: "Tertiary ripple", value: "tertiary" },
    { label: "No ripple", value: "off" },
  ];
  let variant = $state<NonNullable<QSplitBtnProps["variant"]>>("filled");
  let size = $state<NonNullable<QSplitBtnProps["size"]>>("sm");
  let expanded = $state(false);
  let shouldUseCustomIcon = $state(false);
  let rippleMode = $state("default");
  let loading = $state(false);
  let disabled = $state(false);
  let shouldIncludeTrimMarks = $state(false);
  let lastAction = $state("Choose the main action or a menu alternative.");
  let loadingAction = $state("No print requested.");
</script>

{#snippet renderPrintIcon()}
  <svg class="print-icon block" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6v-7Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet renderPrintMenu()}
  <QList role="presentation">
    <QItem clickable role="menuitem" onclick={() => (lastAction = "Monochrome proof requested.")}>
      <QItemSection type="avatar"><QIcon name="contrast" aria-hidden="true" /></QItemSection>
      <QItemSection>Print in monochrome</QItemSection>
    </QItem>
    <QItem clickable role="menuitem" onclick={() => (lastAction = "PDF export requested.")}>
      <QItemSection type="avatar"><QIcon name="download" aria-hidden="true" /></QItemSection>
      <QItemSection>Export as PDF</QItemSection>
    </QItem>
  </QList>
{/snippet}

<QDocs>
  {#snippet display()}
    <div class="split-preview surface full-width overflow-auto q-pa-lg">
      <h2 class="title-medium q-mt-none q-mb-md">Print a proof</h2>
      <QSplitBtn
        label="Print proof"
        icon="print"
        menuLabel="More preview print options"
        onclick={() => (lastAction = "Color proof requested.")}
      >
        {@render renderPrintMenu()}
      </QSplitBtn>
      <p class="body-small text-on-surface-variant q-mt-md q-mb-none">
        {lastAction}
      </p>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Primary Action and Menu">
      {#snippet sectionDescription()}
        The leading button runs the primary <code>onclick</code> action. The trailing button opens
        related actions supplied through
        <code>children</code>. Give that menu a contextual
        <code>menuLabel</code>. Try printing in color, choosing monochrome, or exporting a PDF.
      {/snippet}

      <div class="split-example surface full-width q-pa-lg">
        <QSplitBtn
          label="Print proof"
          icon="print"
          menuLabel="More print options"
          onclick={() => (lastAction = "Color proof requested.")}
        >
          <QList role="presentation">
            <QItem
              clickable
              role="menuitem"
              onclick={() => (lastAction = "Monochrome proof requested.")}
            >
              <QItemSection>Print in monochrome</QItemSection>
            </QItem>
            <QItem clickable role="menuitem" onclick={() => (lastAction = "PDF export requested.")}>
              <QItemSection>Export as PDF</QItemSection>
            </QItem>
          </QList>
        </QSplitBtn>
        <p class="body-medium q-mt-md q-mb-none" role="status">{lastAction}</p>
      </div>
    </QDocsSection>

    <QDocsSection title="Variants, Sizes and Icons">
      {#snippet sectionDescription()}
        QSplitBtn always uses expressive styling. It defaults to <code>filled</code>
        and
        <code>sm</code>; both halves share their variant and size. An
        <code>icon</code>
        can be an icon name or a snippet. Bind <code>expanded</code> to observe or control the menu.
      {/snippet}

      <div class="split-options flex items-start q-gap-md q-mb-md">
        <QSelect
          label="Button variant"
          options={VARIANTS}
          bind:value={variant}
          outlined
          class="min-width-0"
        />
        <QSelect
          label="Button size"
          options={SIZES}
          bind:value={size}
          outlined
          class="min-width-0"
        />
        <QSelect
          label="Ripple feedback"
          options={RIPPLES}
          bind:value={rippleMode}
          emitValue
          outlined
          class="min-width-0"
        />
      </div>
      <QSwitch label="Custom print icon" bind:value={shouldUseCustomIcon} class="q-mb-md" />
      <div class="split-example full-width overflow-auto bg-surface-container-high">
        <div class="action-stage flex no-wrap flex-center q-pa-lg">
          <QSplitBtn
            {variant}
            {size}
            label="Print proof"
            icon={shouldUseCustomIcon ? renderPrintIcon : "print"}
            menuLabel="More styled print options"
            bind:expanded
            noRipple={rippleMode === "off"}
            rippleColor={rippleMode === "tertiary" ? "tertiary" : undefined}
            onclick={() => (lastAction = "Color proof requested.")}
          >
            {@render renderPrintMenu()}
          </QSplitBtn>
        </div>
      </div>
      <div class="flex items-center q-gap-md q-mt-md">
        <QBtn variant="outlined" label="Open print options" onclick={() => (expanded = true)} />
        <QBtn variant="outlined" label="Close print options" onclick={() => (expanded = false)} />
        <span class="body-small">Menu: {expanded ? "open" : "closed"}.</span>
      </div>
      <p class="body-medium q-mt-md q-mb-none">{lastAction}</p>
      <p class="body-medium">
        Opening the menu changes the trailing button's shape and rotates its icon. Large sizes
        scroll within this preview. <code>noRipple</code> and
        <code>rippleColor</code> configure both halves.
      </p>
    </QDocsSection>

    <QDocsSection title="Loading and Disabled">
      {#snippet sectionDescription()}
        <code>loading</code> replaces the leading icon while keeping the menu available. Prevent
        duplicate work in your action handlers; this example also disables its print menu item while
        loading. <code>disabled</code> disables both halves.
      {/snippet}

      <div class="flex q-gap-md q-mb-md">
        <QSwitch label="Loading" bind:value={loading} />
        <QSwitch label="Disabled" bind:value={disabled} />
      </div>
      <div class="split-example surface full-width q-pa-lg">
        <QSplitBtn
          label="Print proof"
          icon="print"
          menuLabel="More loading example print options"
          {loading}
          {disabled}
          aria-busy={loading}
          onclick={() => {
            if (!loading) {
              loadingAction = "Color proof requested.";
            }
          }}
        >
          <QList role="presentation">
            <QItem
              clickable
              role="menuitem"
              disabled={loading}
              onclick={() => (loadingAction = "Monochrome proof requested.")}
            >
              <QItemSection>Print in monochrome</QItemSection>
            </QItem>
          </QList>
        </QSplitBtn>
        <p class="body-medium q-mt-md q-mb-none" role="status">
          {loadingAction}
        </p>
      </div>
    </QDocsSection>

    <QDocsSection title="Icon-only Links">
      {#snippet sectionDescription()}
        Omit <code>label</code> for an icon-only leading button and provide its own
        <code>aria-label</code>, separately from <code>menuLabel</code>. Use
        <code>href</code>
        or
        <code>to</code> for navigation; its menu actions remain independent.
      {/snippet}

      <div class="split-example surface full-width q-pa-lg">
        <QSplitBtn
          icon="description"
          aria-label="View proof details"
          menuLabel="More proof details options"
          href="#proof-details"
          variant="tonal"
        >
          <QList role="presentation">
            <QItem
              clickable
              role="menuitem"
              onclick={() => (shouldIncludeTrimMarks = !shouldIncludeTrimMarks)}
            >
              <QItemSection
                >{shouldIncludeTrimMarks ? "Remove trim marks" : "Include trim marks"}</QItemSection
              >
            </QItem>
          </QList>
        </QSplitBtn>
        <div id="proof-details" class="proof-details q-mt-lg" tabindex="-1">
          <h3 class="title-medium q-mt-none q-mb-sm">Proof details</h3>
          <p class="body-medium q-ma-none">
            A4 sheet · Color · {shouldIncludeTrimMarks ? "Trim marks included" : "No trim marks"}
          </p>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Menu Content and Keyboard" noCode>
      {#snippet sectionDescription()}
        <p>
          Use <code>QList</code> with <code>role="presentation"</code> and clickable
          <code>QItem</code> children with <code>role="menuitem"</code> for keyboard menu navigation.
          Tab moves between the two buttons; Space or Enter activates them. Arrow keys navigate menu actions,
          selection closes the menu, and Escape dismisses it. The trigger announces its expanded state.
        </p>
        <p>
          Native attributes and event handlers, including <code>type</code>,
          <code>name</code>,
          <code>value</code> and <code>aria-label</code>, apply to the primary button. Use
          <code>type="submit"</code> for a form action. <code>class</code>,
          <code>style</code>
          and
          <code>dir</code> apply to the container.
        </p>
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  code {
    overflow-wrap: anywhere;
  }

  .split-preview,
  .split-example {
    max-width: 640px;
    border-radius: 24px;
    overflow-wrap: anywhere;
  }

  .split-preview {
    max-width: 352px;
    max-height: 100%;
  }

  .split-options {
    max-width: 640px;
  }

  .split-options :global(.q-field) {
    flex: 1 1 160px;
  }

  .action-stage {
    width: max-content;
    min-width: 100%;
    min-height: 112px;
  }

  .print-icon {
    width: var(--q-btn-icon-size, 24px);
    height: var(--q-btn-icon-size, 24px);
    flex: none;
  }

  .proof-details {
    scroll-margin-block: 96px;
  }

  .proof-details:focus {
    outline: 3px solid var(--secondary);
    outline-offset: 4px;
  }
</style>
