export interface SliderSegment {
  active: boolean;
  end: number;
  gapEnd?: boolean;
  gapStart?: boolean;
  start: number;
}

export interface SliderStop {
  active: boolean;
  position: number;
}

export function clampSliderValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function snapSliderValue(
  value: number,
  min: number,
  max: number,
  step: number,
  origin = min
) {
  const clamped = clampSliderValue(value, min, max);

  if (step <= 0 || clamped === min || clamped === max) {
    return clamped;
  }

  const precision = Math.max(
    decimalPlaces(min),
    decimalPlaces(max),
    decimalPlaces(origin),
    decimalPlaces(step)
  );
  const snapped = clampSliderValue(origin + Math.round((clamped - origin) / step) * step, min, max);
  const closest = [min, max].reduce(
    (best, endpoint) => (Math.abs(endpoint - clamped) < Math.abs(best - clamped) ? endpoint : best),
    snapped
  );
  return +closest.toFixed(precision);
}

export function sliderNativeStep(step: number, min: number, max: number) {
  if (step <= 0 || !Number.isFinite(step)) {
    return "any";
  }

  const precision = Math.min(
    12,
    Math.max(decimalPlaces(step), decimalPlaces(min), decimalPlaces(max))
  );
  const factor = 10 ** precision;
  const stepUnits = Math.abs(Math.round(step * factor));
  const spanUnits = Math.abs(Math.round((max - min) * factor));

  if (stepUnits === 0 || !Number.isSafeInteger(stepUnits) || !Number.isSafeInteger(spanUnits)) {
    return "any";
  }

  return greatestCommonDivisor(stepUnits, spanUnits) / factor;
}

export function sliderPosition(value: number, min: number, max: number, reverse: boolean) {
  const position = max === min ? 0 : (clampSliderValue(value, min, max) - min) / (max - min);
  return reverse ? 1 - position : position;
}

export function sliderSegments(
  positions: number[],
  centered: boolean,
  reverse: boolean
): SliderSegment[] {
  if (positions.length === 2) {
    const [start, end] = [...positions].sort((a, b) => a - b);

    return buildSliderSegments(start, end, true, true);
  }

  const position = positions[0];
  const origin = centered ? 0.5 : reverse ? 1 : 0;
  const start = Math.min(position, origin);
  const end = Math.max(position, origin);

  return buildSliderSegments(start, end, position === start, position === end, position !== origin);
}

function buildSliderSegments(
  start: number,
  end: number,
  gapStart: boolean,
  gapEnd: boolean,
  includeActive = true
): SliderSegment[] {
  const segments: SliderSegment[] = [];

  if (start > 0) {
    segments.push({ active: false, start: 0, end: start, gapEnd: gapStart });
  }

  if (includeActive) {
    segments.push({ active: true, start, end, gapStart, gapEnd });
  }

  if (end < 1) {
    segments.push({ active: false, start: end, end: 1, gapStart: gapEnd });
  }

  return segments;
}

export function sliderStops(
  min: number,
  max: number,
  interval: number,
  reverse: boolean,
  activeStart: number,
  activeEnd: number
): SliderStop[] {
  if (interval <= 0 || max <= min) {
    return [];
  }

  const intervalCount = Math.floor((max - min) / interval);

  if (intervalCount > 1000) {
    return [];
  }

  const values = Array.from({ length: intervalCount + 1 }, (_, index) => min + index * interval);

  if (Math.abs((values.at(-1) ?? min) - max) > Number.EPSILON * Math.max(1, Math.abs(max))) {
    values.push(max);
  }

  return values.map((value) => {
    const position = sliderPosition(value, min, max, reverse);
    return {
      position,
      active: position >= activeStart && position <= activeEnd,
    };
  });
}

function decimalPlaces(value: number) {
  const [coefficient, exponent = "0"] = String(value).toLowerCase().split("e");
  return Math.max(0, (coefficient.split(".")[1] ?? "").length - Number(exponent));
}

function greatestCommonDivisor(first: number, second: number) {
  while (second !== 0) {
    [first, second] = [second, first % second];
  }

  return first;
}
