<script lang="ts">
  import { base, resolve } from "$app/paths";
  import { QBtnDocs } from "$components/button/docs";
  import type { QBtnProps } from "$components/button/props";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QBtn, QInput, QSelect, QSwitch } from "$lib";

  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QBtn — Button",
      "Create Material 3 buttons in Svelte with QBtn. Explore filled, outlined, text, and expressive styles, loading states, icons, and toggle buttons."
    )
  );

  docsCtx.set({ snippets, componentDocs: QBtnDocs });

  const VARIANTS = ["elevated", "filled", "tonal", "outlined", "flat"];
  const SIZES = [
    { label: "Default · 40px", value: "default" },
    ...["xs", "sm", "md", "lg", "xl"].map((value) => ({ label: value, value })),
  ];
  const ICONS = {
    symbol: "article",
    image: `img:${base}/logo.svg`,
    snippet: bookmarkIcon,
    none: undefined,
  } satisfies Record<string, QBtnProps["icon"]>;
  const COLORS = [
    { label: "Variant default", value: "default" },
    ...["primary", "secondary", "tertiary"].map((value) => ({ label: value, value })),
  ];

  let heroSelected = $state(false);
  let variantFeedback = $state("Press a button to try its interaction.");
  let variantClicks = $state(0);
  let standardSelected = $state(false);
  let expressiveSelected = $state(false);
  let expressive = $state(true);
  let variant = $state<NonNullable<QBtnProps["variant"]>>("outlined");
  let size = $state<NonNullable<QBtnProps["size"]> | "default">("default");
  let shape = $state<NonNullable<QBtnProps["shape"]>>("round");
  let rectangle = $state(false);
  let color = $state("default");
  let iconMode = $state<keyof typeof ICONS>("symbol");
  let rippleMode = $state("default");
  let unelevated = $state(false);
  let previewClicks = $state(0);
  let publishing = $state(false);
  let publishFeedback = $state("Ready to publish.");
  let title = $state("Field notes");
  let formFeedback = $state("Edit the title, then submit or reset the form.");
  const hasContainerColor = $derived(variant === "filled" || variant === "tonal");

  $effect(() => {
    if (!publishing) {
      return;
    }

    const timer = setTimeout(() => {
      publishing = false;
      publishFeedback = "Note published.";
    }, 1600);

    return () => clearTimeout(timer);
  });

  function tryVariant(name: string) {
    variantClicks += 1;
    variantFeedback = `${name} pressed · ${variantClicks} clicks`;
  }

  function publish() {
    if (publishing) {
      return;
    }

    publishing = true;
    publishFeedback = "Publishing…";
  }

  function saveTitle(event: SubmitEvent) {
    event.preventDefault();

    if (title.trim()) {
      formFeedback = `Saved “${title.trim()}”.`;
    }
  }

  function resetTitle(event: Event) {
    event.preventDefault();
    title = "Field notes";
    formFeedback = "Title reset to “Field notes”.";
  }
</script>

{#snippet bookmarkIcon()}
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 4h12v17l-6-4-6 4V4Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

<QDocs>
  {#snippet display()}
    <div class="hero surface q-pa-lg text-center">
      <QBtn expressive filled icon="bookmark" label="Save note" bind:selected={heroSelected} />
      <p class="body-small q-ma-none q-mt-md" role="status">
        {heroSelected ? "Saved" : "Not saved"}
      </p>
    </div>
  {/snippet}

  {#snippet usage()}
    <div class="examples">
      <QDocsSection title="Variants">
        {#snippet sectionDescription()}
          Choose an emphasis for your action. Labeled buttons default to elevated; use
          <code>filled</code>, <code>tonal</code>, <code>outlined</code> or <code>flat</code> for
          another variant. An explicit <code>variant</code> takes precedence over these boolean props.
        {/snippet}

        <div class="example surface q-pa-lg">
          <div class="flex items-center q-gap-md" role="group" aria-label="Button variants">
            <QBtn label="Elevated" onclick={() => tryVariant("Elevated")} />
            <QBtn filled label="Filled" onclick={() => tryVariant("Filled")} />
            <QBtn tonal label="Tonal" onclick={() => tryVariant("Tonal")} />
            <QBtn outlined label="Outlined" onclick={() => tryVariant("Outlined")} />
            <QBtn flat label="Flat" onclick={() => tryVariant("Flat")} />
          </div>
          <p class="feedback body-small text-on-surface-variant q-ma-none q-mt-lg" role="status">
            {variantFeedback}
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Standard and Expressive">
        {#snippet sectionDescription()}
          Press and hold to compare the motion, then release to toggle selection. Bind
          <code>selected</code> to control the pressed state; flat labeled buttons do not toggle.
        {/snippet}

        <div class="comparison q-gap-md">
          <div class="example surface q-pa-lg">
            <p class="label-medium q-ma-none q-mb-lg">Standard</p>
            <QBtn
              expressive={false}
              outlined
              icon="bookmark"
              label="Save note"
              bind:selected={standardSelected}
            />
            <p class="feedback body-small text-on-surface-variant q-ma-none q-mt-lg" role="status">
              {standardSelected ? "Selected" : "Not selected"}
            </p>
          </div>
          <div class="example surface q-pa-lg">
            <p class="label-medium q-ma-none q-mb-lg">Expressive</p>
            <QBtn
              expressive
              outlined
              icon="bookmark"
              label="Save note"
              bind:selected={expressiveSelected}
            />
            <p class="feedback body-small text-on-surface-variant q-ma-none q-mt-lg" role="status">
              {expressiveSelected ? "Selected" : "Not selected"}
            </p>
          </div>
        </div>
        <p class="body-medium q-mt-md">
          Set <code>expressive</code> per button or enable it globally with
          <code>Quaff.init({`{ expressive: true }`})</code>. The standard example explicitly sets
          <code>{"expressive={false}"}</code> to override that global setting. Keep the default focus
          ring; keyboard users can activate buttons with Enter or Space.
        </p>
      </QDocsSection>

      <QDocsSection title="Playground">
        {#snippet sectionDescription()}
          Explore sizes, shapes, icons and ripples on one button. Standard mode uses
          <code>rectangle</code>; expressive mode uses <code>shape</code>.
        {/snippet}

        <div class="playground surface">
          <div class="preview flex column flex-center q-gap-lg q-px-lg">
            <QBtn
              {expressive}
              {variant}
              size={size === "default" ? undefined : size}
              {shape}
              {rectangle}
              color={hasContainerColor || color === "default" ? undefined : color}
              {unelevated}
              icon={ICONS[iconMode]}
              noRipple={rippleMode === "none"}
              rippleColor={rippleMode === "tertiary" ? "tertiary" : undefined}
              onclick={() => (previewClicks += 1)}>Read issue</QBtn
            >
            <p class="body-small q-ma-none text-on-surface-variant" role="status">
              Pressed {previewClicks} times
            </p>
          </div>
          <div
            class="settings items-start q-gap-lg q-pa-lg"
            role="group"
            aria-label="Playground settings"
          >
            <QSelect outlined label="Variant" options={VARIANTS} bind:value={variant} />
            <QSelect outlined label="Size" options={SIZES} bind:value={size} emitValue />
            <QSelect
              outlined
              label="Icon source"
              options={Object.keys(ICONS)}
              bind:value={iconMode}
            />
            <QSelect
              outlined
              label="Text color"
              options={COLORS}
              bind:value={color}
              emitValue
              disabled={hasContainerColor}
              displayValue={hasContainerColor ? "Variant default" : undefined}
            />
            <QSelect
              outlined
              label="Ripple"
              options={["default", "tertiary", "none"]}
              bind:value={rippleMode}
            />
            {#if expressive}
              <QSelect
                outlined
                label="Expressive shape"
                options={["round", "squared"]}
                bind:value={shape}
              />
            {:else}
              <QSwitch label="Rectangular shape" bind:value={rectangle} />
            {/if}
            <QSwitch label="Expressive styling" bind:value={expressive} />
            <QSwitch label="Remove elevation" bind:value={unelevated} />
          </div>
        </div>
        <p class="body-medium q-mt-md">
          The default minimum height is 40px in both modes. Explicit sizes use each mode’s scale:
          <code>md</code> is 40px standard and 56px expressive. Icons accept a Material Symbol, an
          <code>img:</code> URL or a snippet. This button uses children instead of
          <code>label</code>.
          <code>color</code> sets the text and default ripple color; this example preserves the matching
          foreground for filled and tonal variants.
        </p>
      </QDocsSection>

      <QDocsSection title="Loading and Disabled">
        {#snippet sectionDescription()}
          <code>loading</code> replaces the leading icon with a spinner. It does not block
          <code>onclick</code>, so guard repeated requests in your handler. <code>disabled</code>
          prevents interaction and removes the button from keyboard navigation.
        {/snippet}

        <div class="example surface q-pa-lg">
          <div class="flex items-center q-gap-md">
            <QBtn
              filled
              icon="publish"
              label="Publish note"
              loading={publishing}
              aria-busy={publishing}
              onclick={publish}
            />
            <QBtn outlined icon="schedule" label="Schedule note" disabled />
          </div>
          <p class="feedback body-small text-on-surface-variant q-ma-none q-mt-lg" role="status">
            {publishFeedback}
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Forms and Links">
        {#snippet sectionDescription()}
          Buttons forward native attributes such as <code>type</code>, <code>name</code> and
          <code>form</code>. Try submitting with Enter, resetting the value, or following the link.
        {/snippet}

        <form class="example surface q-pa-lg" onsubmit={saveTitle} onreset={resetTitle}>
          <QInput
            outlined
            label="Issue title"
            name="title"
            bind:value={title}
            required
            maxlength={48}
          />
          <div class="flex items-center q-gap-md q-mt-md">
            <QBtn type="submit" filled label="Save title" disabled={!title.trim()} />
            <QBtn type="reset" outlined label="Reset" />
            <QBtn to="#variants" flat icon="arrow_upward" label="Back to variants" />
          </div>
          <p class="feedback body-small text-on-surface-variant q-ma-none q-mt-lg" role="status">
            {formFeedback}
          </p>
        </form>
        <p class="body-medium q-mt-md">
          <code>to</code> or <code>href</code> renders an anchor; <code>target</code> and
          <code>replace</code> control navigation. Use <code>tag</code> only when you need a custom
          element and can preserve its semantics. For dedicated icon-only controls, see
          <a class="q-docs-link" href={resolve("/components/button-icon", {})}>QIconBtn</a>.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style lang="scss">
  @use "$css/mixins";

  .examples :global(.q-docs-section__header h5) {
    overflow-wrap: anywhere;
  }

  .hero {
    max-width: 100%;
    max-height: 100%;
    overflow: auto;
    border-radius: 24px;
  }

  .example,
  .playground {
    border-radius: 20px;
  }

  .feedback {
    overflow-wrap: anywhere;
  }

  .comparison {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  }

  .preview {
    min-height: 240px;
    padding-block: 32px;
  }

  .settings {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    border-block-start: 1px solid var(--outline-variant);
    border-radius: 0;

    :global(.q-switch__label) {
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }

  @include mixins.up-to-sm {
    .example,
    .settings,
    .preview {
      @include mixins.padding("a-md");
    }
  }
</style>
