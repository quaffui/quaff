<script lang="ts">
  import { QSeparatorHorizontalDocs, QSeparatorVerticalDocs } from "#components/separator/docs.js";
  import type {
    QSeparatorHorizontalProps,
    QSeparatorVerticalProps,
  } from "#components/separator/props.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { pageMeta } from "#docs/metadata.js";
  import { QSelect, QSeparator, QSwitch } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import snippets from "./docs.snippets.js";

  useMeta(
    pageMeta(
      "QSeparator — Divider",
      "Separate content with QSeparator for Svelte. Try horizontal and vertical dividers, text labels, inset spacing, custom colors, and decorative separators."
    )
  );

  docsCtx.set({ snippets, componentDocs: [QSeparatorHorizontalDocs, QSeparatorVerticalDocs] });

  const INSETS = [
    { label: "Full width", value: "none" },
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
    { label: "Both", value: "both" },
  ];
  const SPACING = ["none", "xs", "sm", "md", "lg", "xl"];
  const COLORS = [
    { label: "Outline variant", value: "outline-variant" },
    { label: "Primary", value: "primary" },
    { label: "Tertiary", value: "tertiary" },
    { label: "Custom CSS color", value: "#ad7050" },
  ];
  const THICKNESSES = [
    { label: "1px · default", value: 1 },
    { label: "2px · number", value: 2 },
    { label: "4px · CSS value", value: "4px" },
  ];

  let inset = $state<"none" | "left" | "right" | "both">("none");
  let spacing = $state<NonNullable<QSeparatorHorizontalProps["spacing"]>>("md");
  let hasText = $state(true);
  let textAlign = $state<NonNullable<QSeparatorHorizontalProps["textAlign"]>>("center");
  let color = $state("tertiary");
  let thickness = $state<NonNullable<QSeparatorHorizontalProps["size"]>>(2);
  let verticalTextAlign = $state<NonNullable<QSeparatorVerticalProps["textAlign"]>>("middle");
  let hasVerticalInset = $state(false);
</script>

<QDocs>
  {#snippet display()}
    <div class="separator-preview full-width overflow-auto surface q-pa-lg">
      <h2 class="title-medium q-ma-none">Bakery receipt</h2>
      <QSeparator text="ORDER 028" spacing="md" />
      <div class="flex items-center justify-between q-gap-md body-medium">
        <span>2 × Cardamom bun</span>
        <span>€7.00</span>
      </div>
      <QSeparator spacing="md" />
      <p class="body-small text-on-surface-variant q-ma-none">Collection at the counter</p>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Horizontal Spacing and Insets">
      {#snippet sectionDescription()}
        A plain separator spans its container. Use <code>spacing</code> for the margin around the
        line and <code>inset</code> for a 16px inset on the left, right, or both sides.
        <code>inset</code> is shorthand for <code>inset="both"</code>. Both lines below share the
        selected settings.
      {/snippet}

      <div class="separator-controls flex items-center q-gap-md q-mb-md">
        <QSelect
          class="min-width-0"
          label="Divider inset"
          bind:value={inset}
          options={INSETS}
          emitValue
          outlined
        />
        <QSelect
          class="min-width-0"
          label="Divider spacing"
          bind:value={spacing}
          options={SPACING}
          outlined
        />
      </div>
      <div class="separator-example full-width surface q-pa-lg">
        <h3 class="title-medium q-ma-none">Order 028</h3>
        <QSeparator inset={inset === "none" ? false : inset} {spacing} />
        <div class="flex column q-gap-sm body-medium">
          <div class="flex justify-between q-gap-md">
            <span>Country sourdough</span><span>€6.50</span>
          </div>
          <div class="flex justify-between q-gap-md">
            <span>2 × Cardamom bun</span><span>€7.00</span>
          </div>
        </div>
        <QSeparator inset={inset === "none" ? false : inset} {spacing} />
        <div class="flex justify-between q-gap-md title-medium">
          <span>Total</span><span>€13.50</span>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Text, Color and Thickness">
      {#snippet sectionDescription()}
        Add <code>text</code> and choose <code>textAlign</code>: <code>left</code>,
        <code>center</code>, or <code>right</code>. <code>color</code> accepts theme names and CSS
        colors; <code>size</code> sets line thickness using a number in pixels or a CSS length.
      {/snippet}

      <div class="separator-controls flex items-center q-gap-md q-mb-md">
        <QSelect
          class="min-width-0"
          label="Text alignment"
          bind:value={textAlign}
          options={["left", "center", "right"]}
          disabled={!hasText}
          outlined
        />
        <QSelect
          class="min-width-0"
          label="Line color"
          bind:value={color}
          options={COLORS}
          emitValue
          outlined
        />
        <QSelect
          class="min-width-0"
          label="Line thickness"
          bind:value={thickness}
          options={THICKNESSES}
          emitValue
          outlined
        />
      </div>
      <QSwitch label="Show divider text" bind:value={hasText} class="q-mb-md" />
      <div class="separator-example full-width surface q-pa-lg">
        <p class="body-medium q-ma-none">Bread and rolls</p>
        <QSeparator
          text={hasText ? "SWEET BAKES" : undefined}
          {textAlign}
          {color}
          size={thickness}
          spacing="lg"
        />
        <p class="body-medium q-ma-none">Cardamom buns and apricot galettes</p>
      </div>
    </QDocsSection>

    <QDocsSection title="Vertical Dividers">
      {#snippet sectionDescription()}
        Use <code>vertical</code> between columns in a container with enough height. Vertical text
        alignment is <code>top</code>, <code>middle</code>, or <code>bottom</code>. For vertical
        dividers, <code>inset="left"</code> trims the top,
        <code>inset="right"</code> trims the bottom, and <code>inset</code> trims both. Vertical
        <code>spacing</code> adds horizontal margins to the line.
      {/snippet}

      <div class="separator-controls flex items-center q-gap-md q-mb-md">
        <QSelect
          class="min-width-0"
          label="Vertical text alignment"
          bind:value={verticalTextAlign}
          options={["top", "middle", "bottom"]}
          outlined
        />
        <QSwitch label="Inset both ends" bind:value={hasVerticalInset} />
      </div>
      <div class="separator-example full-width surface q-pa-lg">
        <div class="vertical-example">
          <div class="column no-wrap min-width-0 flex-center q-py-md text-center">
            <h3 class="title-medium q-mt-none q-mb-sm">Eat in</h3>
            <p class="body-medium text-on-surface-variant q-ma-none">Served on a plate</p>
          </div>
          <QSeparator
            vertical
            text="or"
            textAlign={verticalTextAlign}
            inset={hasVerticalInset}
            spacing="sm"
            style="height: auto"
          />
          <div class="column no-wrap min-width-0 flex-center q-py-md text-center">
            <h3 class="title-medium q-mt-none q-mb-sm">Take away</h3>
            <p class="body-medium text-on-surface-variant q-ma-none">Wrapped in paper</p>
          </div>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Decorative Lines and Accessibility">
      {#snippet sectionDescription()}
        Separators render native <code>&lt;hr&gt;</code> elements with the matching
        <code>aria-orientation</code>. Their text complements real headings; it does not replace
        them. Use <code>aria-hidden="true"</code> for a purely decorative line, and keep essential information
        outside it.
      {/snippet}
      <div class="separator-example full-width tertiary-container q-pa-lg">
        <QSeparator text="✦" color="on-tertiary-container" size="2px" inset aria-hidden="true" />
        <h3 class="title-medium q-mt-md q-mb-sm">Allergen information</h3>
        <p class="body-medium q-ma-none">Ask at the counter before ordering.</p>
      </div>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .separator-controls :global(.q-switch) {
    max-width: 100%;
  }

  .separator-preview,
  .separator-example {
    max-width: 640px;
    border-radius: 24px;
    overflow-wrap: anywhere;
  }

  .separator-preview {
    max-width: 352px;
    max-height: 100%;
  }

  .separator-controls {
    max-width: 640px;
  }

  .separator-controls :global(.q-select) {
    flex: 1 1 160px;
  }

  .vertical-example {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    min-height: 200px;
  }
</style>
