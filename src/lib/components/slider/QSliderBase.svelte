<script lang="ts">
  import { onMount } from "svelte";
  import { useColor } from "$composables";
  import QIconSnippet from "$internal/QIconSnippet.svelte";
  import { quaffConfig } from "$internal/quaffConfig";
  import type { QEvent } from "$utils";
  import {
    sliderNativeStep,
    sliderPosition,
    sliderSegments,
    sliderStops,
    snapSliderValue,
  } from "./slider";
  import type { QSliderProps } from "./props";

  type SliderInputEvent<T extends Event> = QEvent<T, HTMLInputElement>;

  interface Props extends Omit<QSliderProps, "centered" | "labelValue" | "value"> {
    ariaLabels?: (string | undefined)[];
    centered?: boolean;
    labels: (string | number | undefined)[];
    onvalues: (values: number[]) => void;
    range?: boolean;
    values: number[];
  }

  let {
    values,
    onvalues,
    range = false,
    centered = false,
    labels,
    ariaLabels = [],
    min = 0,
    max = 100,
    step = 1,
    markers = false,
    label = false,
    vertical = false,
    reverse = false,
    readonly = false,
    disabled = false,
    expressive = false,
    size = "xs",
    color = "primary",
    trackColor = "secondary-container",
    icon,
    class: userClass,
    style,
    id,
    name,
    autofocus,
    tabindex,
    oninput,
    onchange,
    onkeydown,
    onkeyup,
    onfocus,
    onblur,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    ...inputProps
  }: Props = $props();

  let root: HTMLDivElement;
  let inputs = $state<HTMLInputElement[]>([]);
  let activeIndex = $state(0);
  let focusVisibleIndex = $state<number>();
  let pressed = $state(false);
  let dragging = $state(false);
  let pointerId: number | undefined;
  let pointerBounds: DOMRect | undefined;
  let pointerRtl = false;
  let pointerScrollIntent = false;
  let pointerStart: PointerSample | undefined;
  let pendingPointer: PointerSample | undefined;
  let pointerFrame: number | undefined;
  let pointerType: string | undefined;
  let pointerGrabOffset = 0;
  let pointerRangeOverlap = false;
  let pointerStartedOnHandle = false;
  let pointerValueInitial: number | undefined;
  let pointerValueLast: number | undefined;
  let pointerVisualValue = $state<number>();
  let rootLength = $state(0);
  let spacePressed = false;

  interface PointerSample {
    clientX: number;
    clientY: number;
  }

  const effectiveMax = $derived(max > min ? max : min + 1);
  const effectiveStep = $derived(Math.max(0, step));
  const isExpressive = $derived(expressive || quaffConfig.expressive);
  const resolvedSize = $derived(isExpressive ? size : "xs");
  const isVertical = $derived(isExpressive && vertical);
  const hasIcon = $derived(
    isExpressive &&
      !range &&
      !centered &&
      icon !== undefined &&
      (resolvedSize === "md" || resolvedSize === "lg" || resolvedSize === "xl")
  );
  const markerInterval = $derived(
    Math.max(0, typeof markers === "number" ? markers : markers ? effectiveStep : 0)
  );
  const valueStep = $derived(markerInterval || effectiveStep);

  const normalizedValues = $derived.by(() => {
    const next = values.map((value) => snapSliderValue(value, min, effectiveMax, valueStep, min));
    return range ? next.sort((a, b) => a - b).slice(0, 2) : next.slice(0, 1);
  });
  const visualValues = $derived.by(() => {
    const next = [...normalizedValues];

    if (pointerVisualValue !== undefined) {
      next[activeIndex] = pointerVisualValue;
    }

    return next;
  });
  const positions = $derived(
    visualValues.map((value) => sliderPosition(value, min, effectiveMax, reverse))
  );
  const displayLabels = $derived(normalizedValues.map((value, index) => labels[index] ?? value));
  const segments = $derived(sliderSegments(positions, centered && !range, reverse));
  const activeSegment = $derived(segments.find((segment) => segment.active));
  const stops = $derived(
    sliderStops(
      min,
      effectiveMax,
      markerInterval,
      reverse,
      activeSegment?.start ?? positions[0],
      activeSegment?.end ?? positions[0]
    )
  );
  const endStops = $derived(
    markerInterval > 0
      ? []
      : segments
          .filter((segment) => !segment.active)
          .flatMap((segment) => [
            ...(segment.start === 0 ? [0] : []),
            ...(segment.end === 1 ? [1] : []),
          ])
  );
  const iconOnInactiveTrack = $derived(
    hasIcon &&
      (rootLength > 0
        ? rootLength * ((visualValues[0] - min) / (effectiveMax - min)) <
          (resolvedSize === "xl" ? 32 + 8 + 6 : 24 + 6 + 6)
        : (visualValues[0] - min) / (effectiveMax - min) < 0.25)
  );
  const iconAtEnd = $derived(iconOnInactiveTrack !== reverse);
  const handlesOverlap = $derived(
    range &&
      positions.length === 2 &&
      (rootLength > 0
        ? Math.abs(positions[0] - positions[1]) * rootLength < 4
        : Math.abs(positions[0] - positions[1]) < 0.0001)
  );

  const parsedColor = $derived(useColor(color));
  const parsedTrackColor = $derived(useColor(trackColor));

  onMount(() => {
    const updateRootLength = () => {
      rootLength = isVertical ? root.clientHeight : root.clientWidth;
    };

    updateRootLength();
    const observer = new ResizeObserver(updateRootLength);
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelPointerFrame();
    };
  });

  function constrainValue(index: number, value: number, stepValue = valueStep) {
    const next = [...normalizedValues];
    const lower = range && index === 1 ? next[0] : min;
    const upper = range && index === 0 ? next[1] : effectiveMax;
    return snapSliderValue(value, lower, upper, stepValue, min);
  }

  function nativeStepValue(index: number) {
    const lower = range && index === 1 ? normalizedValues[0] : min;
    const upper = range && index === 0 ? normalizedValues[1] : effectiveMax;
    return sliderNativeStep(valueStep, lower, upper);
  }

  function setValue(index: number, value: number) {
    const next = [...normalizedValues];
    next[index] = constrainValue(index, value);
    onvalues(next);
    return next[index];
  }

  function dispatchInput(index: number, value: number, type: "input" | "change") {
    const input = inputs[index];

    if (!input) {
      return;
    }

    input.value = String(value);
    input.dispatchEvent(new Event(type, { bubbles: true }));
  }

  function onNativeInput(event: SliderInputEvent<Event>, index: number) {
    if (readonly || disabled) {
      event.currentTarget.value = String(normalizedValues[index]);
      return;
    }

    const attempted = event.currentTarget.valueAsNumber;
    const current = normalizedValues[index];
    let next = constrainValue(index, attempted);

    if (valueStep > 0 && attempted !== current && next === current) {
      next = nextKeyboardValue(index, attempted > current ? 1 : -1);
    }

    event.currentTarget.value = String(setValue(index, next));
    oninput?.(event as Parameters<NonNullable<typeof oninput>>[0]);
  }

  function onNativeChange(event: SliderInputEvent<Event>) {
    if (readonly || disabled) {
      return;
    }

    onchange?.(event as Parameters<NonNullable<typeof onchange>>[0]);
  }

  function onPointerDown(event: PointerEvent) {
    if (
      pressed ||
      !event.isPrimary ||
      disabled ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    const sample = latestPointerSample(event);
    const pointerDownValue = pointerValue(sample);
    const handle =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(".q-slider__handle")
        : null;
    const handleIndex = handle ? Number(handle.dataset.index) : NaN;
    pointerStartedOnHandle =
      Number.isInteger(handleIndex) && handleIndex >= 0 && handleIndex < normalizedValues.length;
    activeIndex = range
      ? closestHandle(pointerDownValue)
      : pointerStartedOnHandle
        ? handleIndex
        : 0;
    focusVisibleIndex = undefined;
    inputs[activeIndex]?.focus({ preventScroll: true });

    if (readonly) {
      return;
    }

    if (event.pointerType !== "touch") {
      event.preventDefault();
    }

    pointerId = event.pointerId;
    pointerType = event.pointerType;
    pointerBounds = root.getBoundingClientRect();
    pointerRtl = getComputedStyle(root).direction === "rtl";
    pointerScrollIntent = false;
    pointerStart = sample;
    pointerRangeOverlap =
      pointerStartedOnHandle &&
      range &&
      normalizedValues.length === 2 &&
      normalizedValues[0] === normalizedValues[1];
    pointerGrabOffset = pointerStartedOnHandle
      ? pointerDownValue - normalizedValues[activeIndex]
      : 0;
    pointerValueInitial = normalizedValues[activeIndex];
    pointerValueLast = pointerValueInitial;
    pressed = true;
    dragging = false;
    root.setPointerCapture(event.pointerId);

    if (pointerType !== "touch" && !pointerStartedOnHandle) {
      updateFromPointer(sample);
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (!pressed || event.pointerId !== pointerId) {
      return;
    }

    const sample = latestPointerSample(event);

    if (pointerScrollIntent) {
      return;
    }

    if (!dragging && pointerStart) {
      const deltaX = sample.clientX - pointerStart.clientX;
      const deltaY = sample.clientY - pointerStart.clientY;
      const dragSlop = pointerType === "touch" ? 8 : 2;

      if (Math.hypot(deltaX, deltaY) < dragSlop) {
        return;
      }

      const axisDelta = Math.abs(isVertical ? deltaY : deltaX);
      const crossAxisDelta = Math.abs(isVertical ? deltaX : deltaY);

      if (pointerType === "touch" && crossAxisDelta > axisDelta) {
        pointerScrollIntent = true;
        return;
      }

      if (pointerRangeOverlap) {
        const direction = pointerValue(sample) - normalizedValues[activeIndex];

        if (direction === 0) {
          return;
        }

        activeIndex = direction < 0 ? 0 : 1;
        pointerRangeOverlap = false;
        inputs[activeIndex]?.focus({ preventScroll: true });
      }
    }

    event.preventDefault();
    dragging = true;
    pendingPointer = sample;

    if (pointerFrame === undefined) {
      pointerFrame = requestAnimationFrame(flushPointerFrame);
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (!pressed || event.pointerId !== pointerId) {
      return;
    }

    if (pointerScrollIntent) {
      resetPointer();
      return;
    }

    cancelPointerFrame();

    if (pointerStartedOnHandle && !dragging) {
      resetPointer();
      return;
    }

    const value = updateFromPointer(latestPointerSample(event));

    if (value !== pointerValueInitial) {
      dispatchInput(activeIndex, value, "change");
    }

    resetPointer();
  }

  function onPointerCancel(event: PointerEvent) {
    if (event.pointerId === pointerId) {
      commitInterruptedPointer();
      resetPointer();
    }
  }

  function onLostPointerCapture(event: PointerEvent) {
    if (event.pointerId === pointerId) {
      commitInterruptedPointer();
      resetPointer();
    }
  }

  function commitInterruptedPointer() {
    if (
      pointerValueInitial !== undefined &&
      pointerValueLast !== undefined &&
      pointerValueLast !== pointerValueInitial
    ) {
      dispatchInput(activeIndex, pointerValueLast, "change");
    }
  }

  function flushPointerFrame() {
    pointerFrame = undefined;
    const sample = pendingPointer;
    pendingPointer = undefined;

    if (sample && pressed) {
      updateFromPointer(sample);
    }
  }

  function cancelPointerFrame() {
    if (pointerFrame !== undefined) {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = undefined;
    }

    pendingPointer = undefined;
  }

  function updateFromPointer(sample: PointerSample) {
    const value = pointerValue(sample);
    pointerVisualValue = constrainValue(activeIndex, value, markerInterval);
    const next = constrainValue(activeIndex, value);

    if (next !== pointerValueLast) {
      pointerValueLast = next;
      dispatchInput(activeIndex, next, "input");
    }

    return next;
  }

  function resetPointer() {
    cancelPointerFrame();
    pressed = false;
    dragging = false;
    pointerId = undefined;
    pointerType = undefined;
    pointerGrabOffset = 0;
    pointerRangeOverlap = false;
    pointerStartedOnHandle = false;
    pointerBounds = undefined;
    pointerScrollIntent = false;
    pointerStart = undefined;
    pointerValueInitial = undefined;
    pointerValueLast = undefined;
    pointerVisualValue = undefined;
  }

  function latestPointerSample(event: PointerEvent): PointerSample {
    const latest = event.getCoalescedEvents?.().at(-1) ?? event;
    return { clientX: latest.clientX, clientY: latest.clientY };
  }

  function pointerValue(sample: PointerSample) {
    const bounds = pointerBounds ?? root.getBoundingClientRect();
    let position: number;

    if (isVertical) {
      position = 1 - (sample.clientY - bounds.top) / bounds.height;
    } else {
      position = (sample.clientX - bounds.left) / bounds.width;

      if (pointerBounds ? pointerRtl : getComputedStyle(root).direction === "rtl") {
        position = 1 - position;
      }
    }

    if (reverse) {
      position = 1 - position;
    }

    return min + position * (effectiveMax - min) - pointerGrabOffset;
  }

  function closestHandle(value: number) {
    if (!range) {
      return 0;
    }

    const firstDistance = Math.abs(value - normalizedValues[0]);
    const secondDistance = Math.abs(value - normalizedValues[1]);
    return firstDistance === secondDistance
      ? value < normalizedValues[0]
        ? 0
        : 1
      : firstDistance < secondDistance
        ? 0
        : 1;
  }

  function onKeyDown(event: SliderInputEvent<KeyboardEvent>, index: number) {
    focusVisibleIndex = index;
    onkeydown?.(event as Parameters<NonNullable<typeof onkeydown>>[0]);

    if (event.defaultPrevented) {
      return;
    }

    const adjustmentKey = [
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "End",
      "Home",
      "PageDown",
      "PageUp",
    ];

    if (readonly && adjustmentKey.includes(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key === " ") {
      spacePressed = true;
      event.preventDefault();
      return;
    }

    if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      const direction = keyboardDirection(event.key);
      const next = spacePressed
        ? largerKeyboardValue(index, direction)
        : nextKeyboardValue(index, direction);
      dispatchKeyboardValue(index, next);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = constrainValue(index, event.key === "Home" ? -Infinity : Infinity);
      dispatchKeyboardValue(index, next);
      return;
    }

    if (event.key === "PageDown" || event.key === "PageUp") {
      event.preventDefault();
      const direction = event.key === "PageUp" ? 1 : -1;
      dispatchKeyboardValue(index, largerKeyboardValue(index, direction));
    }
  }

  function nextKeyboardValue(index: number, direction: number) {
    const current = normalizedValues[index];

    if (valueStep <= 0) {
      return constrainValue(index, current + direction);
    }

    const relative = (current - min) / valueStep;
    const nearest = Math.round(relative);
    const isAligned =
      Math.abs(relative - nearest) <= Number.EPSILON * Math.max(1, Math.abs(relative)) * 4;
    const nextIndex = isAligned
      ? nearest + direction
      : direction > 0
        ? Math.ceil(relative)
        : Math.floor(relative);
    return constrainValue(index, min + nextIndex * valueStep);
  }

  function largerKeyboardValue(index: number, direction: number) {
    if (markerInterval > 0) {
      return nextKeyboardValue(index, direction);
    }

    const interval = Math.max(valueStep || 1, (effectiveMax - min) / 10);
    const next = constrainValue(index, normalizedValues[index] + direction * interval);
    return next === normalizedValues[index] ? nextKeyboardValue(index, direction) : next;
  }

  function dispatchKeyboardValue(index: number, value: number) {
    if (value === normalizedValues[index]) {
      return;
    }

    dispatchInput(index, value, "input");
    dispatchInput(index, value, "change");
  }

  function keyboardDirection(key: string) {
    let direction = key === "ArrowRight" || key === "ArrowUp" ? 1 : -1;

    if (!isVertical && (key === "ArrowLeft" || key === "ArrowRight") && isRtl()) {
      direction *= -1;
    }

    if (reverse) {
      direction *= -1;
    }

    return direction;
  }

  function isRtl() {
    return getComputedStyle(root).direction === "rtl";
  }

  function onKeyUp(event: SliderInputEvent<KeyboardEvent>) {
    if (event.key === " ") {
      spacePressed = false;
    }

    onkeyup?.(event as Parameters<NonNullable<typeof onkeyup>>[0]);
  }

  function onFocus(event: SliderInputEvent<FocusEvent>, index: number) {
    activeIndex = index;
    focusVisibleIndex = event.currentTarget.matches(":focus-visible") ? index : undefined;
    onfocus?.(event as Parameters<NonNullable<typeof onfocus>>[0]);
  }

  function onBlur(event: SliderInputEvent<FocusEvent>) {
    focusVisibleIndex = undefined;
    spacePressed = false;
    onblur?.(event as Parameters<NonNullable<typeof onblur>>[0]);
  }

  function isAtHandle(position: number) {
    return positions.some((handlePosition) => Math.abs(position - handlePosition) < 0.0001);
  }

  function isAtIcon(position: number) {
    return hasIcon && (iconAtEnd ? position === 1 : position === 0);
  }

  Q.classes("q-slider", {
    bemClasses: {
      centered: centered && !range,
      disabled,
      dragging,
      expressive: isExpressive,
      pressed,
      range,
      readonly,
      reverse,
      vertical: isVertical,
      "with-label": label,
    },
    classes: [`q-slider--${resolvedSize}`, userClass],
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions (the native range inputs provide slider semantics) -->
<div
  bind:this={root}
  class="q-slider"
  {style}
  style:--q-slider-active-color={parsedColor}
  style:--q-slider-inactive-color={parsedTrackColor}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerCancel}
  onlostpointercapture={onLostPointerCapture}
  data-quaff
>
  {#each normalizedValues as currentValue, index (index)}
    <!-- svelte-ignore a11y_autofocus (forwards the native input attribute to the first handle) -->
    <input
      bind:this={inputs[index]}
      {...inputProps}
      class="q-slider__input"
      style:--q-slider-position={`${positions[index] * 100}%`}
      type="range"
      id={range && id ? `${id}-${index === 0 ? "min" : "max"}` : id}
      min={range && index === 1 ? normalizedValues[0] : min}
      max={range && index === 0 ? normalizedValues[1] : effectiveMax}
      step={nativeStepValue(index)}
      value={currentValue}
      {name}
      {disabled}
      autofocus={autofocus && index === 0}
      tabindex={disabled ? -1 : tabindex}
      aria-label={ariaLabels[index] ?? ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      aria-orientation={isVertical ? "vertical" : "horizontal"}
      aria-readonly={readonly || undefined}
      aria-valuetext={labels[index] === undefined ? undefined : String(displayLabels[index])}
      oninput={(event) => onNativeInput(event, index)}
      onchange={onNativeChange}
      onkeydown={(event) => onKeyDown(event, index)}
      onkeyup={onKeyUp}
      onfocus={(event) => onFocus(event, index)}
      onblur={onBlur}
    />
  {/each}

  <div class="q-slider__track" aria-hidden="true">
    {#each segments as segment, index (index)}
      <span
        class:active={segment.active}
        class:at-start={segment.start === 0}
        class:at-end={segment.end === 1}
        class:gap-start={segment.gapStart}
        class:gap-end={segment.gapEnd}
        class="q-slider__segment"
        style:--q-slider-start={`${segment.start * 100}%`}
        style:--q-slider-end={`${segment.end * 100}%`}
      ></span>
    {/each}

    {#each stops as stop (stop.position)}
      {#if !isAtHandle(stop.position) && !isAtIcon(stop.position)}
        <span
          class:active={stop.active}
          class:q-slider__stop--end={stop.position === 0 || stop.position === 1}
          class="q-slider__stop"
          style:--q-slider-position={`${stop.position * 100}%`}
        ></span>
      {/if}
    {/each}

    {#each endStops as position (position)}
      {#if !isAtHandle(position) && !isAtIcon(position)}
        <span
          class="q-slider__stop q-slider__stop--end"
          style:--q-slider-position={`${position * 100}%`}
        ></span>
      {/if}
    {/each}

    {#if hasIcon}
      <span
        class:active={!iconOnInactiveTrack}
        class:q-slider__icon--end={iconAtEnd}
        class:q-slider__icon--start={!iconAtEnd}
        class="q-slider__icon"
      >
        <QIconSnippet {icon} size={resolvedSize === "xl" ? "2rem" : "1.5rem"} />
      </span>
    {/if}
  </div>

  {#each positions as position, index (index)}
    <span
      class:active={focusVisibleIndex === index || (pressed && activeIndex === index)}
      class:focus-visible={focusVisibleIndex === index}
      class:pressed={pressed && activeIndex === index}
      class:overlap={handlesOverlap}
      class:top={activeIndex === index}
      class="q-slider__handle"
      data-index={index}
      style:--q-slider-position={`${position * 100}%`}
      aria-hidden="true"
    >
      {#if label}
        <span
          class:visible={focusVisibleIndex === index || (pressed && activeIndex === index)}
          class="q-slider__label"
        >
          {displayLabels[index]}
        </span>
      {/if}
    </span>
  {/each}
</div>
