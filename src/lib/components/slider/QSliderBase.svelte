<script lang="ts">
  import { Spring, prefersReducedMotion } from "svelte/motion";
  import { useColor } from "$composables";
  import QIconSnippet from "$internal/QIconSnippet.svelte";
  import { useQuaffConfig } from "$internal/quaffConfig.svelte";
  import type { QEvent } from "$utils";
  import {
    getSliderNativeStep,
    getSliderPosition,
    getSliderSegments,
    buildSliderStops,
    snapSliderValue,
  } from "./slider";
  import type { QSliderProps } from "./props";

  type SliderInputEvent<T extends Event> = QEvent<T, HTMLInputElement>;

  const ADJUSTMENT_KEYS = [
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "End",
    "Home",
    "PageDown",
    "PageUp",
  ];

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
    expressive,
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
  // Retain the input mode after blur to choose the indicator's exit motion.
  let hasKeyboardInteraction = $state(false);
  let isPressed = $state(false);
  let isDragging = $state(false);
  let pointerId: number | undefined;
  let pointerBounds: DOMRect | undefined;
  let isPointerRtl = false;
  let hasPointerScrollIntent = false;
  let pointerStart: PointerSample | undefined;
  let pointerType: string | undefined;
  let pointerGrabOffset = 0;
  let hasPointerOverlap = false;
  let hasPointerStartedOnHandle = false;
  let pointerValueInitial: number | undefined;
  let pointerValueLast: number | undefined;
  let pointerVisualValue = $state<number>();
  let rootWidth = $state(0);
  let rootHeight = $state(0);
  let isSpacePressed = false;

  interface PointerSample {
    clientX: number;
    clientY: number;
  }

  const effectiveMax = $derived(max > min ? max : min + 1);
  const effectiveStep = $derived(Math.max(0, step));
  const quaffConfig = useQuaffConfig();
  const isExpressive = $derived(expressive ?? quaffConfig.expressive);
  const resolvedSize = $derived(isExpressive ? size : "xs");
  const isVertical = $derived(isExpressive && vertical);
  const rootLength = $derived(isVertical ? rootHeight : rootWidth);
  const hasIcon = $derived(
    isExpressive &&
      !range &&
      !centered &&
      icon !== undefined &&
      (resolvedSize === "md" || resolvedSize === "lg" || resolvedSize === "xl")
  );
  const markerInterval = $derived.by(() => {
    if (typeof markers === "number") {
      return Math.max(0, markers);
    }

    return markers ? effectiveStep : 0;
  });
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
  const targetPositions = $derived(
    visualValues.map((value) => getSliderPosition(value, min, effectiveMax, reverse))
  );
  // Smooth the shared geometry, keeping input events and bound values immediate.
  const positionMotion = Spring.of(() => targetPositions, {
    stiffness: 0.5,
    damping: 1,
    precision: 0.0001,
  });
  const positions = $derived(
    prefersReducedMotion.current ? targetPositions : positionMotion.current
  );
  const displayLabels = $derived(normalizedValues.map((value, index) => labels[index] ?? value));
  const segments = $derived(getSliderSegments(positions, centered && !range, reverse));
  const activeSegment = $derived(segments.find((segment) => segment.isActive));
  const stops = $derived(
    buildSliderStops(
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
          .filter((segment) => !segment.isActive)
          .flatMap((segment) => [
            ...(segment.start === 0 ? [0] : []),
            ...(segment.end === 1 ? [1] : []),
          ])
  );
  const activeTrackFraction = $derived(reverse ? 1 - positions[0] : positions[0]);
  const iconRequiredSpace = $derived(resolvedSize === "xl" ? 32 + 8 + 8 : 24 + 6 + 8);
  const isIconOnInactiveTrack = $derived(
    hasIcon &&
      (rootLength > 0
        ? rootLength * activeTrackFraction < iconRequiredSpace
        : activeTrackFraction < 0.25)
  );
  const isIconAtEnd = $derived(isIconOnInactiveTrack !== reverse);
  const hasOverlappingHandles = $derived(
    range &&
      positions.length === 2 &&
      (rootLength > 0
        ? Math.abs(positions[0] - positions[1]) * rootLength < 4
        : Math.abs(positions[0] - positions[1]) < 0.0001)
  );

  const parsedColor = $derived(useColor(color));
  const parsedTrackColor = $derived(useColor(trackColor));

  function constrainValue(index: number, value: number, stepValue = valueStep) {
    const next = [...normalizedValues];
    const lower = range && index === 1 ? next[0] : min;
    const upper = range && index === 0 ? next[1] : effectiveMax;
    return snapSliderValue(value, lower, upper, stepValue, min);
  }

  function getNativeStep(index: number) {
    const lower = range && index === 1 ? normalizedValues[0] : min;
    const upper = range && index === 0 ? normalizedValues[1] : effectiveMax;
    return getSliderNativeStep(valueStep, lower, upper);
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

  function handleNativeInput(event: SliderInputEvent<Event>, index: number) {
    if (readonly || disabled) {
      event.currentTarget.value = String(normalizedValues[index]);
      return;
    }

    const attempted = event.currentTarget.valueAsNumber;
    const current = normalizedValues[index];
    let next = constrainValue(index, attempted);

    if (valueStep > 0 && attempted !== current && next === current) {
      next = getNextKeyboardValue(index, attempted > current ? 1 : -1);
    }

    event.currentTarget.value = String(setValue(index, next));
    oninput?.(event as Parameters<NonNullable<typeof oninput>>[0]);
  }

  function handleNativeChange(event: SliderInputEvent<Event>) {
    if (readonly || disabled) {
      return;
    }

    onchange?.(event as Parameters<NonNullable<typeof onchange>>[0]);
  }

  function handlePointerDown(event: PointerEvent) {
    if (
      isPressed ||
      !event.isPrimary ||
      disabled ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }

    const sample = getLatestPointerSample(event);
    const pointerDownValue = getPointerValue(sample);
    const handle =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(".q-slider__handle")
        : null;
    const handleIndex = handle ? Number(handle.dataset.index) : NaN;
    hasPointerStartedOnHandle =
      Number.isInteger(handleIndex) && handleIndex >= 0 && handleIndex < normalizedValues.length;
    activeIndex = findClosestHandle(pointerDownValue);
    inputs[activeIndex]?.focus({ preventScroll: true });
    focusVisibleIndex = undefined;
    hasKeyboardInteraction = false;

    if (readonly) {
      return;
    }

    if (event.pointerType !== "touch") {
      event.preventDefault();
    }

    pointerId = event.pointerId;
    pointerType = event.pointerType;
    pointerBounds = root.getBoundingClientRect();
    isPointerRtl = getComputedStyle(root).direction === "rtl";
    hasPointerScrollIntent = false;
    pointerStart = sample;
    hasPointerOverlap =
      hasPointerStartedOnHandle && range && positions.length === 2 && positions[0] === positions[1];
    const handlePosition = reverse ? 1 - positions[activeIndex] : positions[activeIndex];
    const handleValue = min + handlePosition * (effectiveMax - min);
    pointerGrabOffset = hasPointerStartedOnHandle ? pointerDownValue - handleValue : 0;
    pointerValueInitial = normalizedValues[activeIndex];
    pointerValueLast = pointerValueInitial;
    isPressed = true;
    isDragging = false;
    root.setPointerCapture(event.pointerId);

    if (pointerType !== "touch" && !hasPointerStartedOnHandle) {
      updateFromPointer(sample);
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (!isPressed || event.pointerId !== pointerId) {
      return;
    }

    const sample = getLatestPointerSample(event);

    if (hasPointerScrollIntent) {
      return;
    }

    if (!isDragging && pointerStart) {
      const deltaX = sample.clientX - pointerStart.clientX;
      const deltaY = sample.clientY - pointerStart.clientY;
      const dragSlop = pointerType === "touch" ? 8 : 2;

      if (!hasPointerStartedOnHandle && Math.hypot(deltaX, deltaY) < dragSlop) {
        return;
      }

      const axisDelta = Math.abs(isVertical ? deltaY : deltaX);
      const crossAxisDelta = Math.abs(isVertical ? deltaX : deltaY);

      if (pointerType === "touch" && !hasPointerStartedOnHandle && crossAxisDelta > axisDelta) {
        hasPointerScrollIntent = true;
        return;
      }
    }

    if (hasPointerOverlap && pointerStart) {
      const direction = getPointerValue(sample) - getPointerValue(pointerStart);

      if (direction === 0) {
        return;
      }

      activeIndex = direction < 0 ? 0 : 1;
      hasPointerOverlap = false;
      inputs[activeIndex]?.focus({ preventScroll: true });
      focusVisibleIndex = undefined;
    }

    event.preventDefault();
    isDragging = true;
    updateFromPointer(sample);
  }

  function handlePointerUp(event: PointerEvent) {
    if (!isPressed || event.pointerId !== pointerId) {
      return;
    }

    if (hasPointerScrollIntent) {
      resetPointer();
      return;
    }

    if (hasPointerStartedOnHandle && !isDragging) {
      resetPointer();
      return;
    }

    const value = updateFromPointer(getLatestPointerSample(event));

    if (value !== pointerValueInitial) {
      dispatchInput(activeIndex, value, "change");
    }

    resetPointer();
  }

  function handlePointerCancel(event: PointerEvent) {
    if (event.pointerId === pointerId) {
      commitInterruptedPointer();
      resetPointer();
    }
  }

  function handleLostPointerCapture(event: PointerEvent) {
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

  function updateFromPointer(sample: PointerSample) {
    const value = getPointerValue(sample);
    pointerVisualValue = constrainValue(activeIndex, value, markerInterval);
    const next = constrainValue(activeIndex, value);

    if (next !== pointerValueLast) {
      pointerValueLast = next;
      dispatchInput(activeIndex, next, "input");
    }

    return next;
  }

  function resetPointer() {
    isPressed = false;
    isDragging = false;
    pointerId = undefined;
    pointerType = undefined;
    pointerGrabOffset = 0;
    hasPointerOverlap = false;
    hasPointerStartedOnHandle = false;
    pointerBounds = undefined;
    hasPointerScrollIntent = false;
    pointerStart = undefined;
    pointerValueInitial = undefined;
    pointerValueLast = undefined;
    pointerVisualValue = undefined;
  }

  function getLatestPointerSample(event: PointerEvent): PointerSample {
    const latest = event.getCoalescedEvents?.().at(-1) ?? event;
    return { clientX: latest.clientX, clientY: latest.clientY };
  }

  function getPointerValue(sample: PointerSample) {
    const bounds = pointerBounds ?? root.getBoundingClientRect();
    let position: number;

    if (isVertical) {
      position = 1 - (sample.clientY - bounds.top) / bounds.height;
    } else {
      position = (sample.clientX - bounds.left) / bounds.width;

      if (pointerBounds ? isPointerRtl : getComputedStyle(root).direction === "rtl") {
        position = 1 - position;
      }
    }

    if (reverse) {
      position = 1 - position;
    }

    return min + position * (effectiveMax - min) - pointerGrabOffset;
  }

  function findClosestHandle(value: number) {
    if (!range) {
      return 0;
    }

    const position = getSliderPosition(value, min, effectiveMax, reverse);
    const firstDistance = Math.abs(position - positions[0]);
    const secondDistance = Math.abs(position - positions[1]);

    if (firstDistance === secondDistance) {
      const isBeforeFirst = reverse ? position > positions[0] : position < positions[0];
      return isBeforeFirst ? 0 : 1;
    }

    return firstDistance < secondDistance ? 0 : 1;
  }

  function handleKeyDown(event: SliderInputEvent<KeyboardEvent>, index: number) {
    focusVisibleIndex = index;
    hasKeyboardInteraction = true;
    onkeydown?.(event as Parameters<NonNullable<typeof onkeydown>>[0]);

    if (event.defaultPrevented) {
      return;
    }

    if (readonly && ADJUSTMENT_KEYS.includes(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key === " ") {
      isSpacePressed = true;
      event.preventDefault();
      return;
    }

    if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      const direction = getKeyboardDirection(event.key);
      const next = isSpacePressed
        ? getLargerKeyboardValue(index, direction)
        : getNextKeyboardValue(index, direction);
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
      dispatchKeyboardValue(index, getLargerKeyboardValue(index, direction));
    }
  }

  function getNextKeyboardValue(index: number, direction: number) {
    const current = normalizedValues[index];

    if (valueStep <= 0) {
      return constrainValue(index, current + direction);
    }

    const relative = (current - min) / valueStep;
    const nearest = Math.round(relative);
    const isAligned =
      Math.abs(relative - nearest) <= Number.EPSILON * Math.max(1, Math.abs(relative)) * 4;
    let nextIndex = direction > 0 ? Math.ceil(relative) : Math.floor(relative);

    if (isAligned) {
      nextIndex = nearest + direction;
    }

    return constrainValue(index, min + nextIndex * valueStep);
  }

  function getLargerKeyboardValue(index: number, direction: number) {
    if (markerInterval > 0) {
      return getNextKeyboardValue(index, direction);
    }

    const interval = Math.max(valueStep || 1, (effectiveMax - min) / 10);
    const next = constrainValue(index, normalizedValues[index] + direction * interval);
    return next === normalizedValues[index] ? getNextKeyboardValue(index, direction) : next;
  }

  function dispatchKeyboardValue(index: number, value: number) {
    if (value === normalizedValues[index]) {
      return;
    }

    dispatchInput(index, value, "input");
    dispatchInput(index, value, "change");
  }

  function getKeyboardDirection(key: string) {
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

  function handleKeyUp(event: SliderInputEvent<KeyboardEvent>) {
    if (event.key === " ") {
      isSpacePressed = false;
    }

    onkeyup?.(event as Parameters<NonNullable<typeof onkeyup>>[0]);
  }

  function handleFocus(event: SliderInputEvent<FocusEvent>, index: number) {
    activeIndex = index;
    focusVisibleIndex = event.currentTarget.matches(":focus-visible") ? index : undefined;
    hasKeyboardInteraction = focusVisibleIndex !== undefined;
    onfocus?.(event as Parameters<NonNullable<typeof onfocus>>[0]);
  }

  function handleBlur(event: SliderInputEvent<FocusEvent>) {
    focusVisibleIndex = undefined;
    isSpacePressed = false;
    onblur?.(event as Parameters<NonNullable<typeof onblur>>[0]);
  }

  function isInTrackGap(position: number) {
    const centerClearance = rootLength > 0 ? 4 / rootLength : 0;

    if (centered && !range && Math.abs(position - 0.5) <= centerClearance) {
      return true;
    }

    if (!rootLength) {
      return positions.some((handlePosition) => Math.abs(position - handlePosition) < 0.0001);
    }

    let stopOffset = position * rootLength;

    if (position === 0) {
      stopOffset = 6;
    }

    if (position === 1) {
      stopOffset = rootLength - 6;
    }

    // Keep the 4px stop outside the 6px gap and the widest (4px) handle.
    return positions.some(
      (handlePosition) => Math.abs(stopOffset - handlePosition * rootLength) <= 10
    );
  }

  function isAtIcon(position: number) {
    return hasIcon && (isIconAtEnd ? position === 1 : position === 0);
  }

  function isHandleActive(index: number) {
    return focusVisibleIndex === index || (isPressed && activeIndex === index);
  }

  function getTrackGap(position: number, hasHandleGap = false) {
    if (!hasHandleGap && (!centered || range || position !== 0.5)) {
      return undefined;
    }

    // Overlapping handles need enough space for the wider, unpressed handle.
    const isCurrentHandleOnly = positions.every(
      (handlePosition, index) => handlePosition !== position || activeIndex === index
    );
    const width = isCurrentHandleOnly
      ? "--q-slider-interactive-handle-width"
      : "--q-slider-handle-width";
    const handleOffset = `calc(var(--q-slider-handle-track-gap) + var(${width}) / 2)`;

    if (hasHandleGap) {
      return handleOffset;
    }

    if (!rootLength) {
      return "2px";
    }

    // Merge the neutral gap with the handle gap when they meet.
    const distance = Math.abs(position - positions[0]) * rootLength;
    return `max(2px, calc(${handleOffset} - ${distance}px))`;
  }

  function getTrackCornerRadius(position: number) {
    if (!rootLength) {
      return "var(--q-slider-outer-radius)";
    }

    return `clamp(var(--q-slider-inner-radius), ${position * rootLength}px, var(--q-slider-outer-radius))`;
  }

  Q.classes("q-slider", {
    bemClasses: {
      active: isPressed || focusVisibleIndex !== undefined,
      centered: centered && !range,
      disabled,
      dragging: isDragging,
      expressive: isExpressive,
      keyboard: hasKeyboardInteraction,
      pressed: isPressed,
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
  bind:clientWidth={rootWidth}
  bind:clientHeight={rootHeight}
  dir={inputProps.dir}
  class="q-slider"
  {style}
  style:--q-slider-active-color={parsedColor}
  style:--q-slider-inactive-color={parsedTrackColor}
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerCancel}
  onlostpointercapture={handleLostPointerCapture}
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
      id={range && id ? `${id}-${["min", "max"][index]}` : id}
      min={range && index === 1 ? normalizedValues[0] : min}
      max={range && index === 0 ? normalizedValues[1] : effectiveMax}
      step={getNativeStep(index)}
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
      oninput={(event) => handleNativeInput(event, index)}
      onchange={handleNativeChange}
      onkeydown={(event) => handleKeyDown(event, index)}
      onkeyup={handleKeyUp}
      onfocus={(event) => handleFocus(event, index)}
      onblur={handleBlur}
    />
  {/each}

  <div
    class="q-slider__track"
    style:--q-slider-start-radius={getTrackCornerRadius(Math.min(...positions))}
    style:--q-slider-end-radius={getTrackCornerRadius(1 - Math.max(...positions))}
    aria-hidden="true"
  >
    {#each segments as segment, index (index)}
      <span
        class:active={segment.isActive}
        class:at-start={segment.start === 0}
        class:at-end={segment.end === 1}
        class:gap-start={segment.hasStartGap}
        class:gap-end={segment.hasEndGap}
        class="q-slider__segment"
        style:--q-slider-start={`${segment.start * 100}%`}
        style:--q-slider-end={`${segment.end * 100}%`}
        style:--q-slider-gap-start={getTrackGap(segment.start, segment.hasStartGap)}
        style:--q-slider-gap-end={getTrackGap(segment.end, segment.hasEndGap)}
      ></span>
    {/each}

    {#each stops as stop (stop.position)}
      {#if !isInTrackGap(stop.position) && !isAtIcon(stop.position)}
        <span
          class:active={stop.isActive}
          class:q-slider__stop--end={stop.position === 0 || stop.position === 1}
          class="q-slider__stop"
          style:--q-slider-position={`${stop.position * 100}%`}
        ></span>
      {/if}
    {/each}

    {#each endStops as position (position)}
      {#if !isInTrackGap(position) && !isAtIcon(position)}
        <span
          class="q-slider__stop q-slider__stop--end"
          style:--q-slider-position={`${position * 100}%`}
        ></span>
      {/if}
    {/each}

    {#if hasIcon}
      <span
        class:active={!isIconOnInactiveTrack}
        class:q-slider__icon--end={isIconAtEnd}
        class:q-slider__icon--start={!isIconAtEnd}
        class="q-slider__icon"
      >
        <QIconSnippet {icon} size={resolvedSize === "xl" ? "32px" : "24px"} />
      </span>
    {/if}
  </div>

  {#each positions as position, index (index)}
    <span
      class:active={isHandleActive(index)}
      class:focus-visible={focusVisibleIndex === index}
      class:pressed={isPressed && activeIndex === index}
      class:overlap={hasOverlappingHandles}
      class:top={activeIndex === index}
      class="q-slider__handle"
      data-index={index}
      style:--q-slider-position={`${position * 100}%`}
      aria-hidden="true"
    >
      {#if label}
        <span class:visible={isHandleActive(index)} class="q-slider__label">
          {displayLabels[index]}
        </span>
      {/if}
    </span>
  {/each}
</div>
