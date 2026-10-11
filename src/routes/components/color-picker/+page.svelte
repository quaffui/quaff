<script lang="ts">
  import { resolve } from "$app/paths";
  import { QColorPickerDocs } from "#components/color-picker/docs.js";
  import { QDocs, QDocsSection } from "#docs";
  import QLanguageExample from "#docs/QLanguageExample.svelte";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { QColorPicker } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import { pageMeta } from "#docs/metadata.js";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QColorPicker — Color Picker",
      "Choose HEX and RGB colors with QColorPicker for Svelte. Try editable fields, an inline visual editor, opacity controls, and localized labels."
    )
  );

  docsCtx.set({ snippets, componentDocs: QColorPickerDocs });

  let displayColor = $state<string | null>("#6750A4");
  let fieldColor = $state<string | null>("#387C69");
  let maskedColor = $state<string | null>(null);
  let clubColor = $state<string | null>("#E4653D");
  let annotationColor = $state<string | null>("rgba(255, 196, 0, 0.35)");
  let customColor = $state<string | null>("#3265A8");
</script>

<QDocs>
  {#snippet display()}
    <div class="field-preview q-pa-lg surface-container-low">
      <p class="label-large q-mt-none q-mb-md">Make it your color</p>
      <QColorPicker bind:value={displayColor} label="Accent color" outlined />
      <p class="body-small q-mt-md q-mb-none">Type a color or open the swatch to explore.</p>
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Editable field">
        {#snippet sectionDescription()}
          Type a HEX or RGB value and press Enter or leave the field to commit it. Open the swatch
          for a popup: Apply saves its draft; Cancel, Escape, or clicking outside discards it.
          Invalid input keeps the last valid value.
        {/snippet}

        <div class="field-example">
          <QColorPicker bind:value={fieldColor} label="Project accent" outlined />
          <p class="value-preview">Saved value: <code>{fieldColor ?? "No color selected"}</code></p>
        </div>
        <p>
          <code>format="hex"</code> is the default output format. Set <code>format="rgb"</code>
          to emit RGB instead. Switching the editor's HEX/RGB tabs does not change that choice. Both input
          formats are accepted; named colors, HSL, and CSS variables are not.
        </p>
      </QDocsSection>

      <QDocsSection title="Filled mask">
        {#snippet sectionDescription()}
          Use <code>fillMask</code> with <code>mask</code> to keep empty positions visible while
          editing. Masked fields use HEX even with <code>format="rgb"</code>. Fill all six positions
          to commit; with <code>alpha</code>, use eight positions to edit opacity or six to preserve
          it.
        {/snippet}

        <div class="field-example">
          <QColorPicker
            bind:value={maskedColor}
            label="Optional accent"
            hint="Enter six HEX digits (0–9 or A–F)."
            mask="\#XXXXXX"
            format="rgb"
            fillMask
            outlined />
          <p class="value-preview">
            Saved value: <code>{maskedColor ?? "No color selected"}</code>
          </p>
        </div>
      </QDocsSection>

      <QDocsSection title="Inline editor">
        {#snippet sectionDescription()}
          Use <code>inline</code> for immediate updates without Apply or Cancel. Give this cycling
          club's next poster a new accent; the artwork changes while its text keeps a fixed,
          readable color. The <code>hint</code>, <code>error</code>, <code>errorMessage</code>,
          masks, and field styles apply only to the text field in popup mode.
        {/snippet}

        <div class="editor-layout items-start q-gap-lg">
          <QColorPicker bind:value={clubColor} inline label="Cycling club accent" />
          <article
            class="ride-poster column no-wrap q-gap-lg q-pa-lg"
            style:--club-accent={clubColor ?? "#E4653D"}>
            <p class="poster-eyebrow q-ma-none">Sunday cycle club · No. 07</p>
            <h6 class="poster-title q-ma-none">Long way.<br />Good company.</h6>
            <svg
              class="ride-art block full-width"
              viewBox="0 0 360 170"
              fill="none"
              aria-hidden="true">
              <g
                stroke="var(--club-accent)"
                stroke-width="9"
                stroke-linecap="round"
                stroke-linejoin="round">
                <circle cx="80" cy="112" r="45" />
                <circle cx="280" cy="112" r="45" />
                <path
                  d="M80 112 133 37 180 112H80M133 37h115l-68 75M280 112 243 21h-24M133 37l-6-12" />
              </g>
              <path d="M111 17h32c5 0 6 7 1 8l-16 4-17-5c-4-1-4-7 0-7Z" fill="var(--club-accent)" />
              <circle cx="180" cy="112" r="10" fill="#242824" />
            </svg>
            <div class="poster-details flex justify-between q-gap-md q-pt-md">
              <p class="q-ma-none"><strong>09:00 Sunday</strong><br />Riverside coffee stop</p>
              <p class="q-ma-none">32 km<br />All paces welcome</p>
            </div>
            <p class="poster-color flex items-center justify-between q-gap-sm q-ma-none">
              Poster accent <code>{clubColor}</code>
            </p>
          </article>
        </div>
        <p>
          The color field exposes separate native range controls for Saturation and Brightness. Tab
          to either axis, then use the arrow keys, Shift + Arrow for steps of 10, and Home or End
          for its limits. Hue and optional opacity also support keyboard editing.
        </p>
      </QDocsSection>

      <QDocsSection title="Opacity">
        {#snippet sectionDescription()}
          Enable <code>alpha</code> to edit opacity. HEX output includes an alpha byte; RGB output
          uses <code>rgba()</code>. Try a translucent highlight over the photo below.
        {/snippet}

        <div class="editor-layout items-start q-gap-lg">
          <QColorPicker
            bind:value={annotationColor}
            inline
            alpha
            format="rgb"
            label="Photo annotation color" />
          <figure class="annotation-preview q-ma-none overflow-hidden border surface-container-low">
            <div class="annotation-photo relative-position">
              <img
                class="block full-width"
                src="/cocktail.jpg"
                alt="A citrus cocktail with ice and mint" />
              <div
                class="annotation-highlight absolute"
                style:background-color={annotationColor ?? "transparent"}
                aria-hidden="true">
              </div>
              <span class="annotation-label absolute q-py-xs q-px-sm">Selected region</span>
            </div>
            <figcaption class="column no-wrap items-start q-gap-sm q-pa-md">
              <strong>Photo notes</strong>
              <span>Adjust opacity to keep the details visible.</span>
              <code>{annotationColor}</code>
            </figcaption>
          </figure>
        </div>
      </QDocsSection>

      <QDocsSection title="States and customization">
        {#snippet sectionDescription()}
          Use familiar field props such as <code>filled</code>, <code>outlined</code>,
          <code>rounded</code>, <code>dense</code>, and <code>hint</code>. Use <code>mask</code> for
          fixed-format entry, as in the six-digit HEX example below. Override translations with
          <code>labels</code>.
        {/snippet}

        <div class="state-examples q-gap-lg">
          <QColorPicker
            bind:value={customColor}
            label="Campaign accent"
            hint="Enter six HEX digits (0–9 or A–F)."
            mask="\#XXXXXX"
            outlined
            rounded
            labels={{ chooseColor: "Choose campaign accent", apply: "Use accent" }} />
          <QColorPicker value="#A9B7A3" label="Disabled" disabled filled />
          <QColorPicker value="#6750A4" label="Readonly" readonly outlined />
        </div>
      </QDocsSection>

      <QDocsSection title="Localization" noCode>
        {#snippet sectionDescription()}
          Picker labels, actions, and validation messages follow Quaff's language. Switch languages
          below, or see <a class="q-docs-link" href={resolve("/utils/quaff#language")}
            >language configuration and available locales</a
          >. In right-to-left layouts, the surrounding interface follows the document direction; the
          color field and its numeric axes stay left-to-right.
        {/snippet}

        <QLanguageExample>
          <QColorPicker value="#548C78B3" inline alpha />
        </QLanguageExample>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .field-preview {
    width: min(100%, 336px);
    border-radius: 24px;
  }

  .field-example {
    max-width: 400px;
  }

  .value-preview {
    overflow-wrap: anywhere;
  }

  .editor-layout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
    max-width: 800px;
  }

  .ride-poster {
    border: 1px solid #dbded2;
    border-radius: 8px;
    color: #242824;
    background: #f5f3e9;
  }

  .poster-eyebrow {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08rem;
    text-transform: uppercase;
  }

  .poster-title {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.08rem;
    overflow-wrap: anywhere;
  }

  .ride-art {
    height: auto;
  }

  .poster-details {
    border-block-start: 1px solid #b9beb3;
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .poster-color {
    font-size: 0.75rem;
  }

  .ride-poster .poster-color code {
    color: #242824;
    background: #e5e7dc;
  }

  .annotation-preview {
    border-radius: 16px;
  }

  .annotation-photo img {
    aspect-ratio: 4 / 3;
    object-fit: cover;
  }

  .annotation-highlight {
    inset: 20% 18%;
    border: 2px solid white;
    border-radius: 8px;
  }

  .annotation-label {
    inset-block-start: 8px;
    inset-inline-start: 8px;
    max-width: calc(100% - 16px);
    border-radius: 4px;
    color: #242824;
    background: #fff;
    font-size: 0.75rem;
  }

  .annotation-preview figcaption {
    overflow-wrap: anywhere;
  }

  .annotation-preview figcaption code {
    max-width: 100%;
  }

  .state-examples {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  }
</style>
