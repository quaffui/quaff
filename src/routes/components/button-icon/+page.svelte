<script lang="ts">
  import { QIconBtnDocs } from "$components/button/docs";
  import type { QIconBtnProps } from "$components/button/props";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QIconBtn, QSelect, QSwitch } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QIconBtn — Icon Button",
      "Add compact icon actions with QIconBtn for Svelte. Explore Material 3 variants, toggle states, expressive shapes, sizes, and loading feedback."
    )
  );

  docsCtx.set({ snippets, componentDocs: QIconBtnDocs });

  const SEGMENTS = ["Station ident", "Community stories", "Closing theme"];
  const SIZES = ["xs", "sm", "md", "lg", "xl"];
  const VARIANTS = ["flat", "filled", "tonal", "outlined", "elevated"];
  const RIPPLE_MODES = [
    { label: "Default ripple", value: "default" },
    { label: "Tertiary ripple", value: "tertiary" },
    { label: "No ripple", value: "off" },
  ];

  let segmentIndex = $state(0);
  let isPlaying = $state(false);
  let isMonitoring = $state(false);
  let isMuted = $state(false);
  let isBookmarked = $state(false);
  let expressive = $state(true);
  let size = $state<NonNullable<QIconBtnProps["size"]>>("md");
  let shape = $state<NonNullable<QIconBtnProps["shape"]>>("round");
  let width = $state<NonNullable<QIconBtnProps["width"]>>("default");
  let variant = $state<NonNullable<QIconBtnProps["variant"]>>("tonal");
  let color = $state("primary");
  let shouldUseCustomIcon = $state(false);
  let isUnelevated = $state(false);
  let rippleMode = $state("default");
  let previewClickCount = $state(0);
  let isPreparingSheet = $state(false);
  let isSheetReady = $state(false);
  const hasContainerColor = $derived(variant === "filled" || variant === "tonal");
  const sheetStatus = $derived.by(() => {
    if (isPreparingSheet) {
      return "Preparing the cue sheet…";
    }

    if (isSheetReady) {
      return "Cue sheet ready. Its status link is enabled.";
    }

    return "Prepare the sheet to try loading and enable its link.";
  });

  $effect(() => {
    if (!isPreparingSheet) {
      return;
    }

    const timer = setTimeout(() => {
      isSheetReady = true;
      isPreparingSheet = false;
    }, 1200);

    return () => clearTimeout(timer);
  });
</script>

{#snippet renderFaderIcon()}
  <svg class="fader-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    ><path d="M5 3v18M12 3v18M19 3v18" stroke="currentColor" stroke-width="2" /><path
      d="M2 8h6m1 8h6m1-10h6"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
    /></svg
  >
{/snippet}

<QDocs docDescription="Put a clear action behind a compact, recognizable symbol.">
  {#snippet display()}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users must be able to scroll the preview when text is enlarged.) -->
    <div
      class="radio-preview surface q-pa-lg text-on-surface text-center"
      role="region"
      aria-label="Radio controls preview"
      tabindex="0"
    >
      <div class="label-medium text-tertiary">BOROUGH 92 · COMMUNITY RADIO</div>
      <h2 class="title-large q-mt-xs q-mb-lg">Play or pause</h2>
      <QIconBtn
        expressive
        filled
        size="lg"
        icon={isPlaying ? "pause" : "play_arrow"}
        aria-label={isPlaying ? "Pause rehearsal preview" : "Play rehearsal preview"}
        onclick={() => (isPlaying = !isPlaying)}
      />
      <p class="body-medium q-mt-md q-mb-none" role="status">{isPlaying ? "Playing" : "Paused"}</p>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Actions and Toggles">
      {#snippet sectionDescription()}
        Give each icon button an action-oriented <code>aria-label</code>. Use <code>onclick</code>
        for actions such as play or skip. Bind <code>selected</code> for toggles; it updates
        <code>aria-pressed</code> automatically. Keep a toggle's label stable as its state changes. These
        controls update local state without playing audio.
      {/snippet}

      <div class="broadcast-desk q-pa-lg text-on-surface">
        <h3 class="title-large q-mt-none q-mb-lg">{SEGMENTS[segmentIndex]}</h3>
        <div class="flex items-center q-gap-lg" role="group" aria-label="Rehearsal controls">
          <QIconBtn
            expressive
            size="md"
            filled
            icon={isPlaying ? "pause" : "play_arrow"}
            aria-label={isPlaying ? "Pause rehearsal" : "Play rehearsal"}
            onclick={() => (isPlaying = !isPlaying)}
          />
          <QIconBtn
            icon="skip_next"
            aria-label="Next segment"
            onclick={() => (segmentIndex = (segmentIndex + 1) % SEGMENTS.length)}
          />
          <QIconBtn
            tonal
            icon="headphones"
            aria-label="Headphone monitor"
            bind:selected={isMonitoring}
          />
          <QIconBtn
            expressive
            outlined
            icon="volume_off"
            aria-label="Mute desk output"
            bind:selected={isMuted}
          />
          <QIconBtn icon="bookmark" aria-label="Bookmark rehearsal" bind:selected={isBookmarked} />
        </div>
        <p class="body-medium text-on-surface-variant q-mt-lg q-mb-none" role="status">
          {isPlaying ? "Playing" : "Paused"} · {isMonitoring ? "Headphones on" : "Headphones off"} ·
          {isMuted ? "Muted" : "Output on"} · {isBookmarked ? "Bookmarked" : "Not bookmarked"}
        </p>
      </div>
      <p class="body-medium q-mt-lg q-mb-none">
        Icon-only buttons default to the <code>flat</code> variant. <code>filled</code>,
        <code>tonal</code> and <code>outlined</code> are shorthand for the matching
        <code>variant</code> values, as used on the controls above. An explicit <code>variant</code>
        takes precedence.
      </p>
    </QDocsSection>

    <QDocsSection title="Sizes, Shapes and Variants">
      {#snippet sectionDescription()}
        Try <code>expressive</code> sizes, <code>width</code> and <code>shape</code> on one button.
        Baseline defaults to <code>md</code> and expressive to <code>sm</code>, both 40px; explicit
        size names use their mode's scale. Expressive mode inherits
        <code>Quaff.init()</code>
        when omitted. Custom icon snippets can replace a Material Symbol.
      {/snippet}

      <div class="console-controls q-gap-md q-mb-lg">
        <QSelect label="Button variant" options={VARIANTS} bind:value={variant} outlined />
        <QSelect label="Button size" options={SIZES} bind:value={size} outlined />
        <QSelect
          label="Button width"
          options={["narrow", "default", "wide"]}
          bind:value={width}
          disabled={!expressive}
          outlined
        />
        <QSelect
          label="Button shape"
          options={["round", "squared"]}
          bind:value={shape}
          disabled={!expressive}
          outlined
        />
        <QSelect
          label="Icon color"
          options={["primary", "secondary", "tertiary"]}
          bind:value={color}
          disabled={hasContainerColor}
          outlined
        />
        <QSelect
          label="Ripple feedback"
          options={RIPPLE_MODES}
          bind:value={rippleMode}
          emitValue
          outlined
        />
        <QSwitch label="Expressive styling" bind:value={expressive} />
        <QSwitch label="Use a custom icon" bind:value={shouldUseCustomIcon} />
        <QSwitch
          label="Remove elevation"
          bind:value={isUnelevated}
          disabled={variant !== "elevated"}
        />
      </div>
      <div class="cue-console flex items-center q-gap-lg q-pa-lg text-on-surface">
        <div class="cue-button-stage q-pa-md">
          <QIconBtn
            {expressive}
            {size}
            {width}
            {shape}
            {variant}
            color={hasContainerColor ? undefined : color}
            unelevated={variant === "elevated" && isUnelevated}
            icon={shouldUseCustomIcon ? renderFaderIcon : "graphic_eq"}
            noRipple={rippleMode === "off"}
            rippleColor={rippleMode === "tertiary" ? "tertiary" : undefined}
            aria-label="Try icon button"
            onclick={() => (previewClickCount += 1)}
          />
        </div>
        <p class="body-medium q-ma-none" role="status">Pressed {previewClickCount} times</p>
      </div>
      <p class="body-medium q-mt-lg q-mb-none">
        Baseline icon buttons are circular; expressive buttons support
        <code>shape="squared"</code>. Turn off the ripple with <code>noRipple</code>, or set
        <code>rippleColor</code> to a theme or CSS color. The <code>unelevated</code> prop removes the
        elevated variant's shadow. The icon color control applies to flat, outlined and elevated buttons;
        filled and tonal buttons keep their matching foreground color.
      </p>
    </QDocsSection>

    <QDocsSection title="Loading, Disabled and Links">
      {#snippet sectionDescription()}
        Set <code>loading</code> to replace the icon with a progress indicator and
        <code>disabled</code>
        to prevent another activation while work is pending. Add <code>href</code> or
        <code>to</code>
        to render a navigation link. Preparing the cue sheet enables the status link below.
      {/snippet}

      <div class="sheet-card q-pa-lg text-on-surface">
        <div class="flex items-center q-gap-md" role="group" aria-label="Cue sheet actions">
          <QIconBtn
            variant="tonal"
            icon="playlist_add_check"
            aria-label="Prepare cue sheet"
            loading={isPreparingSheet}
            disabled={isPreparingSheet}
            onclick={() => {
              isSheetReady = false;
              isPreparingSheet = true;
            }}
          />
          <QIconBtn
            icon="description"
            aria-label="View cue sheet status"
            href="#radio-cue-sheet"
            disabled={!isSheetReady}
          />
          <QIconBtn icon="help" aria-label="Read button documentation" to="/components/button" />
        </div>
        <p
          id="radio-cue-sheet"
          class="cue-sheet body-medium q-mt-md q-mb-none"
          role="status"
          tabindex="-1"
        >
          {sheetStatus}
        </p>
      </div>
      <p class="body-medium q-mt-lg q-mb-none">
        Tab focuses an enabled button; Space or Enter activates it. Links retain normal link
        behavior. Disabled actions do not run their click handler. Keep a visible focus indicator
        and provide accessible names for custom icons too.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .radio-preview,
  .broadcast-desk,
  .cue-console,
  .sheet-card {
    border-radius: 24px;
    background: var(--surface-container-low);
    overflow-wrap: anywhere;
  }

  .radio-preview {
    width: 100%;
    max-width: 352px;
    max-height: 100%;
    overflow: auto;
  }

  .fader-icon {
    width: var(--q-btn-icon-size, 24px);
    height: var(--q-btn-icon-size, 24px);
    flex: none;
    border-radius: 0;
  }

  .console-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 224px), 1fr));
    align-items: start;
  }

  .cue-button-stage {
    display: grid;
    place-items: safe center;
    flex: 1 1 176px;
    min-width: 0;
    min-height: 192px;
    overflow: auto;
    border-radius: 20px;
    background: var(--surface-container-high);
  }

  .cue-sheet {
    scroll-margin-block: 96px;
  }

  .cue-sheet:focus {
    outline: 3px solid var(--secondary);
    outline-offset: 4px;
  }
</style>
