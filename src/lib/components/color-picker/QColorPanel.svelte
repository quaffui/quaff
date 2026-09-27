<script lang="ts">
  import { untrack } from "svelte";
  import QBtn from "$components/button/QBtn.svelte";
  import QBtnToggle from "$components/button-group/QBtnToggle.svelte";
  import QInput from "$components/input/QInput.svelte";
  import QSlider from "$components/slider/QSlider.svelte";
  import QColorField from "./QColorField.svelte";
  import { colorToRgb, formatColor, parseColor, type Color } from "./color";
  import type { QColorFormat, QColorPickerLabels } from "./props";

  let {
    value = $bindable(),
    format,
    alpha,
    disabled,
    readonly,
    labels,
    onapply,
    oncancel,
  }: {
    value?: string | null;
    format: QColorFormat;
    alpha: boolean;
    disabled: boolean;
    readonly: boolean;
    labels: QColorPickerLabels;
    onapply?: () => void;
    oncancel?: () => void;
  } = $props();

  const DEFAULT_COLOR: Color = { hue: 266, saturation: 51, brightness: 64, alpha: 1 };
  const FORMAT_OPTIONS = [
    { label: "HEX", value: "hex" },
    { label: "RGB", value: "rgb" },
  ];
  const componentId = $props.id();
  const errorId = `q-color-error-${componentId}`;
  let color = $state<Color>(untrack(() => parseColor(value) ?? { ...DEFAULT_COLOR }));
  let entryFormat = $state<QColorFormat>(untrack(() => format));
  let hexText = $state(untrack(() => formatColor(color, "hex", alpha)));
  let channels = $state<(number | string)[]>(untrack(() => Object.values(colorToRgb(color))));
  let hasInputError = $state(false);
  let lastEmitted: string | undefined;
  const preview = $derived(formatColor(color, "rgb", alpha));
  const opaquePreview = $derived(formatColor(color, "rgb"));
  const channelLabels = $derived([labels.red, labels.green, labels.blue]);
  const canEdit = $derived(!disabled && !readonly);

  $effect(() => {
    const externalValue = value;
    const hasAlpha = alpha;

    untrack(() => {
      if (externalValue !== lastEmitted) {
        color = parseColor(externalValue, color) ?? { ...DEFAULT_COLOR };
        lastEmitted = undefined;
      }

      syncInputs(hasAlpha);
    });
  });

  function syncInputs(includeAlpha = alpha) {
    hexText = formatColor(color, "hex", includeAlpha);
    const { red, green, blue } = colorToRgb(color);
    channels = [red, green, blue];
    hasInputError = false;
  }

  function updateColor(nextColor: Color) {
    if (!canEdit) {
      return;
    }

    color = alpha ? nextColor : { ...nextColor, alpha: 1 };
    lastEmitted = formatColor(color, format, alpha);
    value = lastEmitted;
    syncInputs();
  }

  function commitText() {
    if (!canEdit) {
      return;
    }

    let parsed: Color | undefined;

    if (entryFormat === "hex") {
      parsed = parseColor(hexText, color);
    } else if (channels.every((channel) => channel !== "" && Number.isInteger(Number(channel)))) {
      parsed = parseColor(`rgba(${channels.join(", ")}, ${color.alpha})`, color);
    }

    hasInputError = !parsed;

    if (parsed) {
      updateColor(parsed);
    }
  }

  function handleTextKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitText();
    }
  }

  function setEntryFormat(nextFormat: unknown) {
    if (nextFormat === "hex" || nextFormat === "rgb") {
      entryFormat = nextFormat;
      syncInputs();
    }
  }
</script>

<QColorField {color} {labels} {disabled} {readonly} oncolor={updateColor} />

<div class="q-color-picker__control">
  <span class="q-color-picker__control-label">{labels.hue}</span>
  <QSlider
    class="q-color-picker__hue"
    value={color.hue}
    max={360}
    dir="ltr"
    aria-label={labels.hue}
    labelValue={`${Math.round(color.hue)}°`}
    {disabled}
    {readonly}
    oninput={(event) => updateColor({ ...color, hue: event.currentTarget.valueAsNumber })}
  />
</div>

{#if alpha}
  <div class="q-color-picker__control">
    <span class="q-color-picker__control-label">{labels.opacity}</span>
    <QSlider
      class="q-color-picker__opacity"
      style={`--q-color-opaque: ${opaquePreview}`}
      value={Math.round(color.alpha * 100)}
      aria-label={labels.opacity}
      labelValue={`${Math.round(color.alpha * 100)}%`}
      dir="ltr"
      {disabled}
      {readonly}
      oninput={(event) => updateColor({ ...color, alpha: event.currentTarget.valueAsNumber / 100 })}
    />
  </div>
{/if}

<div class="q-color-picker__formats">
  <span class="q-color-picker__swatch" style:--q-color-preview={preview} aria-hidden="true"></span>
  <QBtnToggle
    options={FORMAT_OPTIONS}
    bind:value={() => entryFormat, setEntryFormat}
    expressive={false}
    {disabled}
    aria-label={labels.format}
  />
</div>

{#if entryFormat === "hex"}
  <QInput
    bind:value={hexText}
    label="HEX"
    dir="ltr"
    outlined
    {disabled}
    {readonly}
    spellcheck={false}
    autocomplete="off"
    aria-invalid={hasInputError || undefined}
    aria-describedby={hasInputError ? errorId : undefined}
    error={hasInputError}
    onchange={commitText}
    onkeydown={handleTextKeydown}
  />
{:else}
  <div class="q-color-picker__channels">
    {#each channelLabels as label, index (label)}
      <QInput
        bind:value={channels[index]}
        {label}
        type="number"
        dir="ltr"
        min={0}
        max={255}
        step={1}
        outlined
        {disabled}
        {readonly}
        aria-invalid={hasInputError || undefined}
        aria-describedby={hasInputError ? errorId : undefined}
        error={hasInputError}
        onchange={commitText}
        onkeydown={handleTextKeydown}
      />
    {/each}
  </div>
{/if}

<p id={errorId} class="q-color-picker__error" role="status" aria-atomic="true">
  {hasInputError ? labels.invalidColor : ""}
</p>

{#if onapply}
  <!-- Keep blur validation from moving an action before its pointer click completes. -->
  <div class="q-color-picker__actions">
    <QBtn
      type="button"
      flat
      label={labels.cancel}
      onpointerdown={(event) => event.preventDefault()}
      onclick={oncancel}
    />
    <QBtn
      type="button"
      flat
      label={labels.apply}
      disabled={!canEdit}
      onpointerdown={(event) => event.preventDefault()}
      onclick={() => {
        commitText();

        if (!hasInputError) {
          onapply?.();
        }
      }}
    />
  </div>
{/if}
