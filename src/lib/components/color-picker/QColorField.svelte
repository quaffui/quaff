<script lang="ts">
  import { clamp, type Color } from "./color";
  import type { QColorPickerLabels } from "./props";

  let {
    color,
    labels,
    disabled,
    readonly,
    oncolor,
  }: {
    color: Color;
    labels: QColorPickerLabels;
    disabled: boolean;
    readonly: boolean;
    oncolor: (color: Color) => void;
  } = $props();

  let saturationInput: HTMLInputElement;
  let pointerId: number | undefined;
  let initialColor: Color;
  const axes = $derived([
    { key: "saturation" as const, label: labels.saturation },
    { key: "brightness" as const, label: labels.brightness },
  ]);

  function updatePointer(event: PointerEvent & { currentTarget: HTMLDivElement }) {
    if (disabled || readonly || event.pointerId !== pointerId) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();

    if (bounds.width && bounds.height) {
      oncolor({
        ...color,
        saturation: clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100),
        brightness: clamp(100 - ((event.clientY - bounds.top) / bounds.height) * 100, 0, 100),
      });
    }
  }

  function startPointer(event: PointerEvent & { currentTarget: HTMLDivElement }) {
    if (disabled || readonly || !event.isPrimary || event.button !== 0) {
      return;
    }

    event.preventDefault();
    pointerId = event.pointerId;
    initialColor = { ...color };
    event.currentTarget.setPointerCapture(pointerId);
    saturationInput.focus({ preventScroll: true });
    updatePointer(event);
  }

  function finishPointer(event: PointerEvent & { currentTarget: HTMLDivElement }) {
    if (event.pointerId !== pointerId) {
      return;
    }

    if (event.type === "pointercancel" && !disabled && !readonly) {
      oncolor(initialColor);
    }

    pointerId = undefined;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeydown(event: KeyboardEvent, axis: "saturation" | "brightness") {
    const step = event.shiftKey ? 10 : 1;
    const values: Record<string, number> = {
      ArrowRight: color[axis] + step,
      ArrowUp: color[axis] + step,
      ArrowLeft: color[axis] - step,
      ArrowDown: color[axis] - step,
      PageUp: color[axis] + 10,
      PageDown: color[axis] - 10,
      Home: 0,
      End: 100,
    };
    const nextValue = values[event.key];

    if (nextValue === undefined) {
      return;
    }

    event.preventDefault();

    if (!disabled && !readonly) {
      oncolor({ ...color, [axis]: clamp(nextValue, 0, 100) });
    }
  }
</script>

<div class="q-color-picker__axes" aria-hidden="true">
  {#each axes as axis (axis.key)}
    <span>{axis.label} {Math.round(color[axis.key])}%</span>
  {/each}
</div>

<div
  class="q-color-picker__field"
  role="group"
  aria-label={labels.colorField}
  dir="ltr"
  style:--q-color-hue={color.hue}
  style:--q-color-x="{color.saturation}%"
  style:--q-color-y="{100 - color.brightness}%"
  onpointerdown={startPointer}
  onpointermove={updatePointer}
  onpointerup={finishPointer}
  onpointercancel={finishPointer}
  onlostpointercapture={() => {
    pointerId = undefined;
  }}
>
  {#each axes as axis, index (axis.key)}
    <input
      {@attach (element) => {
        if (index === 0) {
          saturationInput = element;
        }
      }}
      class="q-color-picker__axis"
      type="range"
      min="0"
      max="100"
      step="1"
      value={color[axis.key]}
      aria-label={axis.label}
      aria-valuetext={`${Math.round(color[axis.key])}%`}
      aria-orientation={axis.key === "brightness" ? "vertical" : "horizontal"}
      aria-readonly={readonly || undefined}
      {disabled}
      onkeydown={(event) => handleKeydown(event, axis.key)}
      oninput={(event) => {
        if (readonly || disabled) {
          event.currentTarget.value = String(color[axis.key]);
          return;
        }

        oncolor({ ...color, [axis.key]: event.currentTarget.valueAsNumber });
      }}
    />
  {/each}
  <span class="q-color-picker__thumb" aria-hidden="true"></span>
</div>
