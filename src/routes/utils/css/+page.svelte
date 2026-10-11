<script lang="ts">
  import { resolve } from "$app/paths";
  import { QCodeBlock } from "#lib";
  import { QDocs, QDocsSection } from "#docs";
  import { pageMeta } from "#docs/metadata.js";
  import { useMeta } from "#lib/meta.js";

  useMeta(
    pageMeta(
      "CSS Helpers",
      "Compose Svelte layouts with Quaff CSS helpers for alignment, spacing, sizing, scrolling, responsive visibility, and Material 3 surface colors."
    )
  );

  const HELPER_GROUPS = [
    [
      "Sizing",
      "full-width, full-height, fit",
      "Fill the parent's width, height, or both. Margins stay unchanged.",
    ],
    [
      "Shrinking",
      "min-width-0, min-height-0",
      "Let flex or grid children shrink below their content size.",
    ],
    ["Wrapping", "wrap, no-wrap, reverse-wrap", "Control flex wrapping."],
    [
      "Alignment",
      "items-*, justify-*, self-*, content-*",
      "Align children, individual items, or wrapped lines.",
    ],
    [
      "Order",
      "order-first, order-last, order-none",
      "Change visual order; reading and keyboard order stay unchanged.",
    ],
    [
      "Display",
      "block, inline-block, hidden, invisible",
      "Set display, remove an element, or hide it while keeping its space.",
    ],
    [
      "Scrolling",
      "scroll, overflow-auto, scroll-x, scroll-y",
      "Scroll only when content exceeds the available space.",
    ],
    [
      "Clipping",
      "overflow-hidden, overflow-hidden-y, no-scroll",
      "Clip overflow on both axes or just vertically.",
    ],
    [
      "Truncation",
      "ellipsis, ellipsis-2-lines, ellipsis-3-lines",
      "Shorten overflowing text to one, two, or three lines.",
    ],
    [
      "Position",
      "relative-position, absolute, fixed",
      "Set positioning; add -full, -center, an edge, or a corner.",
    ],
    [
      "Interaction",
      "non-selectable, no-pointer-events, all-pointer-events, cursor-*",
      "Control selection, pointer events, and the cursor.",
    ],
    [
      "Resets",
      "no-margin, no-padding, no-border, no-border-radius, no-box-shadow, no-transition",
      "Clear one style. border-radius-inherit follows the parent's corners.",
    ],
  ] as const;
</script>

<QDocs
  docName="CSS Helpers"
  docDescription="Compose layouts and common styles with shared classes."
>
  {#snippet display()}
    <div class="surface-container-low full-width q-pa-lg">
      <h2 class="title-large q-mb-xs">Shared styles</h2>
      <p class="body-medium text-on-surface-variant">Layout, spacing, and color.</p>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Layout" noCode>
      {#snippet sectionDescription()}
        <p>
          Quaff follows Material 3 first. Familiar names ease migration, but the grid, breakpoints,
          typography, and colors keep Quaff's M3 behavior. Layout helpers use CSS layers rather than <code
            >!important</code
          >, so your app styles can override them.
        </p>
      {/snippet}
      <p class="q-mb-md">
        <code>flex</code> creates a wrapping flex container; <code>column</code> creates a vertical
        one without wrapping. Combine <code>flex column</code> for a wrapping column. Add
        <code>no-wrap</code> to prevent wrapping, <code>inline</code> for inline flex, or
        <code>reverse</code> to reverse direction. <code>row</code> remains a
        <a class="q-docs-link" href={resolve("/layout/grid")}>12-column CSS grid</a>.
      </p>
      <QCodeBlock
        language="html"
        code={`<div class="flex no-wrap items-center q-gap-md">
  <div class="min-width-0">Content</div>
  <button>Action</button>
</div>`}
        copiable
      />
      <dl class="q-mt-lg">
        {#each HELPER_GROUPS as [name, classes, description] (name)}
          <dt class="title-small q-mt-md">{name}</dt>
          <dd>
            <code class="q-docs-code">{classes}</code>
            <p class="body-medium q-mt-xs">{description}</p>
          </dd>
        {/each}
      </dl>
      <p class="q-mt-md">
        Alignment suffixes are <code>start/center/end</code>. <code>items-*</code> and
        <code>self-*</code> also support <code>baseline/stretch</code>;
        <code>justify-*</code> adds <code>between/around/evenly</code>, and
        <code>content-*</code> adds <code>stretch/between/around</code>. Cursor suffixes are
        <code>pointer/not-allowed/inherit/none</code>.
      </p>
    </QDocsSection>

    <QDocsSection title="Spacing" noCode>
      {#snippet sectionDescription()}
        <p>
          Use <code>q-p*</code> for padding and <code>q-m*</code> for margins. Directions are
          <code>t/r/b/l</code> for individual sides, <code>x/y</code> for both axes, and
          <code>a</code> for all sides.
        </p>
      {/snippet}
      <p>
        Sizes are <code>none/xs/sm/md/lg/xl</code>: 0/4/8/16/24/48px. Margins also accept
        <code>auto</code>; padding and gaps do not. Use <code>q-gap-*</code> for both gaps,
        <code>q-gap-x-*</code> for column gaps, and <code>q-gap-y-*</code> for row gaps.
      </p>
      <QCodeBlock
        class="q-mt-md"
        language="html"
        code={`<div class="flex q-pa-md q-mx-auto q-gap-x-md q-gap-y-sm">
  ...
</div>`}
        copiable
      />
    </QDocsSection>

    <QDocsSection title="Colors and Text" noCode>
      {#snippet sectionDescription()}
        <p>
          Paired classes such as <code>primary-container</code> and
          <code>surface-container-low</code> set a background and its readable text color.
          <code>bg-*</code>, <code>text-*</code>, and <code>border-*</code> set just one color.
        </p>
      {/snippet}
      <p>
        Surface roles include <code>surface-dim</code>, <code>surface-bright</code>, and
        <code>surface-container</code>, with <code>-lowest/-low/-high/-highest</code> variants. See
        <a class="q-docs-link" href={resolve("/colors")}>colors</a>
        and
        <a class="q-docs-link" href={resolve("/utils/typography")}>typography</a> for palettes and text
        styles.
      </p>
    </QDocsSection>

    <QDocsSection title="Responsive Visibility" noCode>
      {#snippet sectionDescription()}
        <p>
          Use <code>xs/sm/md/lg/xl</code> to show content at one size, or
          <code>xs-hide/sm-hide/md-hide/lg-hide/xl-hide</code> to hide it there.
          <code>lt-md</code> shows below medium; <code>gt-sm</code> shows above small. All use
          Quaff's <a class="q-docs-link" href={resolve("/layout/grid")}>M3 breakpoints</a>.
          <code>print-only</code>
          and <code>print-hide</code> control print visibility.
        </p>
      {/snippet}
      <QCodeBlock
        language="html"
        code={`<span class="lt-sm">Compact label</span>
<span class="gt-xs">Full label</span>`}
        copiable
      />
    </QDocsSection>
    <p>
      Using CSS pruning? Keep runtime-built names in your
      <a class="q-docs-link" href={resolve("/utils/assets")}>CSS safelist</a>.
    </p>
  {/snippet}
</QDocs>

<style>
  code {
    overflow-wrap: anywhere;
  }
</style>
