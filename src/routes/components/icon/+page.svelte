<script lang="ts">
  import { asset } from "$app/paths";
  import { QIconDocs } from "#components/icon/docs.js";
  import type { QIconSizeOptions, QIconTypeOptions } from "#components/icon/props.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { QBtn, QIcon, QSelect, QSwitch } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import { pageMeta } from "#docs/metadata.js";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QIcon — Icon",
      "Display Material Symbols, images, and SVG icons with QIcon for Svelte. Customize size, color, and fill, with guidance for accessible icon labels."
    )
  );

  docsCtx.set({ snippets, componentDocs: QIconDocs });

  const TARGETS = [
    {
      name: "Moon",
      icon: "nightlight",
      detail: "Craters along the terminator",
      note: "Start with a low-power eyepiece.",
    },
    {
      name: "Stars",
      icon: "star",
      detail: "A sky full of double stars",
      note: "Let your eyes adjust to the darkness.",
    },
    {
      name: "Satellites",
      icon: "satellite_alt",
      detail: "Bright trails across the sky",
      note: "Watch the horizon with the naked eye.",
    },
  ] as const;
  const ICON_SIZES = [
    { label: "Extra small · xs", value: "xs" },
    { label: "Small · sm", value: "sm" },
    { label: "Medium · md", value: "md" },
    { label: "Large · lg", value: "lg" },
    { label: "Extra large · xl", value: "xl" },
    { label: "Number · 48", value: 48 },
    { label: "CSS length · 2em", value: "2em" },
  ];
  const ICON_COLORS = [
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Tertiary", value: "tertiary" },
    { label: "Custom CSS · #8871cc", value: "#8871cc" },
  ];
  const CONSTELLATION_SVG =
    '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m8 34 10-20 13 12 10-18" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8" cy="34" r="3"/><circle cx="18" cy="14" r="3"/><circle cx="31" cy="26" r="3"/><circle cx="41" cy="8" r="3"/></g></svg>';

  let targetName = $state("Moon");
  let iconType = $state<QIconTypeOptions>("outlined");
  let iconSize = $state<QIconSizeOptions>("xl");
  let iconColor = $state("primary");
  let isFilled = $state(false);
  let isSaved = $state(false);
  const target = $derived(TARGETS.find((item) => item.name === targetName) ?? TARGETS[0]);
</script>

<QDocs>
  {#snippet display()}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users must be able to scroll the preview when text is enlarged.) -->
    <div
      class="observatory surface overflow-auto"
      role="region"
      aria-label="Night Atlas preview"
      tabindex="0"
    >
      <div class="sky-art primary-container relative-position overflow-hidden" aria-hidden="true">
        <span class="orbit absolute border"></span>
        <QIcon name="nightlight" size={64} color="primary" filled />
        <span class="small-star absolute"><QIcon name="star" size={20} color="tertiary" /></span>
      </div>
      <div class="q-pa-lg">
        <div class="label-small text-primary">NIGHT ATLAS · FIELD NOTES</div>
        <h2 class="title-large q-mt-sm q-mb-xs">A little closer to the sky</h2>
        <p class="body-medium text-on-surface-variant q-ma-none">An icon for every discovery.</p>
      </div>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Observe the Sky">
      {#snippet sectionDescription()}
        Use <code>name</code> for Material Symbols. Try the three <code>type</code> families,
        <code>filled</code>, theme or CSS <code>color</code>, and named, numeric or CSS
        <code>size</code> values.
      {/snippet}
      <div class="observation-grid q-gap-lg">
        <div class="observation bg-surface-container-low">
          <div class="eyepiece bg-surface-container-high" aria-hidden="true">
            <QIcon
              name={target.icon}
              type={iconType}
              size={iconSize}
              color={iconColor}
              filled={isFilled}
            />
          </div>
          <div class="label-small text-primary q-mt-lg">TONIGHT'S TARGET</div>
          <h3 class="headline-small q-mt-xs q-mb-sm">{target.name}</h3>
          <p class="body-large q-ma-none">{target.detail}</p>
          <p class="body-medium text-on-surface-variant q-mb-none">{target.note}</p>
        </div>
        <div class="controls min-width-0 q-gap-md">
          <QSelect
            label="Observation"
            options={TARGETS.map((item) => item.name)}
            bind:value={targetName}
            outlined
          />
          <QSelect
            label="Icon family"
            options={["outlined", "rounded", "sharp"]}
            bind:value={iconType}
            outlined
          />
          <QSelect
            label="Icon size"
            options={ICON_SIZES}
            bind:value={iconSize}
            emitValue
            outlined
          />
          <QSelect
            label="Icon color"
            options={ICON_COLORS}
            bind:value={iconColor}
            emitValue
            outlined
          />
          <QSwitch label="Filled symbol" bind:value={isFilled} />
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Field Guide Legend">
      {#snippet sectionDescription()}
        Pair color with text so meaning is never color alone. The <code>color</code> prop and
        utilities such as <code>text-tertiary</code> both work. These icons are decorative because the
        adjacent labels carry their meaning.
      {/snippet}
      <div class="legend-grid q-gap-md">
        <div class="legend-item primary-container column no-wrap q-gap-md q-pa-lg">
          <QIcon name="visibility" color="primary" size="lg" aria-hidden="true" />
          <div>
            <h3 class="title-medium q-ma-none">Naked eye</h3>
            <p class="body-medium q-mt-xs q-mb-none">Find the brightest constellations.</p>
          </div>
        </div>
        <div class="legend-item secondary-container column no-wrap q-gap-md q-pa-lg">
          <QIcon name="zoom_in" color="secondary" size="lg" aria-hidden="true" />
          <div>
            <h3 class="title-medium q-ma-none">Binoculars</h3>
            <p class="body-medium q-mt-xs q-mb-none">Explore wide fields of stars.</p>
          </div>
        </div>
        <div class="legend-item tertiary-container column no-wrap q-gap-md q-pa-lg">
          <QIcon name="center_focus_strong" class="text-tertiary" size="lg" aria-hidden="true" />
          <div>
            <h3 class="title-medium q-ma-none">Telescope</h3>
            <p class="body-medium q-mt-xs q-mb-none">Take a closer look at the Moon.</p>
          </div>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Images and Custom Artwork">
      {#snippet sectionDescription()}
        Use <code>img</code> with <code>imgAttributes</code> for image attributes, or supply SVG as
        children. The <code>svg</code> prop renders a string as HTML: only pass trusted SVG content.
      {/snippet}
      <div class="source-list bg-surface-container-low q-py-sm q-px-lg">
        <div class="source-row flex no-wrap items-center no-border-radius q-gap-lg q-py-lg">
          <QIcon
            img={asset("docs/observatory-patch.svg")}
            size={56}
            imgAttributes={{ alt: "Night Atlas observatory emblem", width: 56, height: 56 }}
          />
          <div class="min-width-0">
            <h3 class="title-medium q-ma-none">The observatory patch</h3>
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
              An image with its own alternative text.
            </p>
          </div>
        </div>
        <div class="source-row flex no-wrap items-center no-border-radius q-gap-lg q-py-lg">
          <QIcon size={56} color="secondary" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="m9 19 23-10 6 14-23 10Z" fill="currentColor" />
              <path
                d="m24 30-8 14m8-14 8 14m-8-14v14"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>
          </QIcon>
          <div class="min-width-0">
            <h3 class="title-medium q-ma-none">A telescope of our own</h3>
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
              SVG children inherit the icon color and size.
            </p>
          </div>
        </div>
        <div class="source-row flex no-wrap items-center no-border-radius q-gap-lg q-py-lg">
          <QIcon svg={CONSTELLATION_SVG} size={56} color="tertiary" aria-hidden="true" />
          <div class="min-width-0">
            <h3 class="title-medium q-ma-none">Connect the dots</h3>
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
              A trusted SVG string from our field guide.
            </p>
          </div>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Accessibility">
      {#snippet sectionDescription()}
        An icon with an <code>aria-label</code> is exposed as an image. Inside an icon-only button,
        label the button and hide the decorative icon with <code>aria-hidden</code>.
      {/snippet}
      <div
        class="log-entry bg-surface-container-low flex items-center justify-between q-gap-lg q-pa-lg"
      >
        <div class="entry-title flex no-wrap items-center min-width-0 q-gap-md">
          <QIcon name="cloud_off" size="lg" color="primary" aria-label="Clear sky" />
          <div>
            <h3 class="title-medium q-ma-none">Evening observation</h3>
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
              North terrace · Field note 014
            </p>
          </div>
        </div>
        <QBtn variant="tonal" aria-label="Save observation" bind:selected={isSaved}>
          <QIcon
            name={isSaved ? "bookmark_added" : "bookmark_add"}
            filled={isSaved}
            aria-hidden="true"
          />
        </QBtn>
        <p class="save-status body-medium q-ma-none" role="status">
          {isSaved
            ? "Observation saved to your field notes."
            : "Save this observation for your next clear night."}
        </p>
      </div>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .observatory {
    width: min(100%, 340px);
    max-height: 100%;
    border-radius: 24px;
  }
  .sky-art {
    display: grid;
    place-items: center;
    height: 136px;
  }
  .orbit {
    width: 210px;
    height: 90px;
    border-radius: 50%;
    rotate: -24deg;
  }
  .small-star {
    inset-block-start: 24px;
    inset-inline-end: 48px;
  }
  .observation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  }
  .observation {
    padding: 32px;
    border-radius: 24px;
  }
  .eyepiece {
    display: grid;
    place-items: center;
    min-height: 112px;
    width: 112px;
    max-width: 100%;
    border-radius: 32px;
  }
  .controls {
    display: grid;
    align-content: start;
  }
  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  }
  .legend-item {
    border-radius: 24px;
  }
  .source-list {
    border-radius: 24px;
  }
  .source-row + .source-row {
    border-block-start: 1px solid var(--outline-variant);
  }
  .source-row > div {
    overflow-wrap: anywhere;
  }
  .source-row :global(.q-icon) {
    flex-shrink: 0;
  }
  .log-entry {
    border-radius: 24px;
  }
  .entry-title {
    flex: 1 1 220px;
  }
  .save-status {
    flex-basis: 100%;
  }
  @media (max-width: 700px) {
    .observation-grid,
    .legend-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .observation {
      padding: 24px;
    }
    .source-list {
      padding-inline: 16px;
    }
    .source-row {
      gap: 16px;
    }
  }
</style>
