export interface SliderSegment {
  isActive: boolean;
  end: number;
  hasEndGap?: boolean;
  hasStartGap?: boolean;
  start: number;
}

export interface SliderStop {
  isActive: boolean;
  position: number;
}

const MIN_STOP_SPACING = 8;

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
    countDecimalPlaces(min),
    countDecimalPlaces(max),
    countDecimalPlaces(origin),
    countDecimalPlaces(step)
  );
  const snapped = clampSliderValue(origin + Math.round((clamped - origin) / step) * step, min, max);
  const closest = [min, max].reduce(
    (best, endpoint) => (Math.abs(endpoint - clamped) < Math.abs(best - clamped) ? endpoint : best),
    snapped
  );
  return +closest.toFixed(precision);
}

export function getSliderNativeStep(step: number, min: number, max: number) {
  if (step <= 0 || !Number.isFinite(step)) {
    return "any";
  }

  const precision = Math.min(
    12,
    Math.max(countDecimalPlaces(step), countDecimalPlaces(min), countDecimalPlaces(max))
  );
  const factor = 10 ** precision;
  const stepUnits = Math.abs(Math.round(step * factor));
  const spanUnits = Math.abs(Math.round((max - min) * factor));

  if (stepUnits === 0 || !Number.isSafeInteger(stepUnits) || !Number.isSafeInteger(spanUnits)) {
    return "any";
  }

  return getGreatestCommonDivisor(stepUnits, spanUnits) / factor;
}

export function getSliderPosition(value: number, min: number, max: number, isReversed: boolean) {
  const position = max === min ? 0 : (clampSliderValue(value, min, max) - min) / (max - min);
  return isReversed ? 1 - position : position;
}

export function getSliderSegments(
  positions: number[],
  isCentered: boolean,
  isReversed: boolean
): SliderSegment[] {
  if (positions.length === 2) {
    const [start, end] = [...positions].sort((a, b) => a - b);

    return buildSliderSegments(start, end, true, true);
  }

  const position = positions[0];
  let origin = isReversed ? 1 : 0;

  if (isCentered) {
    origin = 0.5;
  }

  const start = Math.min(position, origin);
  const end = Math.max(position, origin);

  return buildSliderSegments(start, end, position === start, position === end, position !== origin);
}

function buildSliderSegments(
  start: number,
  end: number,
  hasStartGap: boolean,
  hasEndGap: boolean,
  shouldIncludeActive = true
): SliderSegment[] {
  const segments: SliderSegment[] = [];

  if (start > 0) {
    segments.push({ isActive: false, start: 0, end: start, hasEndGap: hasStartGap });
  }

  if (shouldIncludeActive) {
    segments.push({ isActive: true, start, end, hasStartGap, hasEndGap });
  }

  if (end < 1) {
    segments.push({ isActive: false, start: end, end: 1, hasStartGap: hasEndGap });
  }

  return segments;
}

export function buildSliderStops(
  min: number,
  max: number,
  interval: number,
  isReversed: boolean,
  activeStart: number,
  activeEnd: number,
  trackLength: number
): SliderStop[] {
  if (interval <= 0 || max <= min || trackLength < MIN_STOP_SPACING) {
    return [];
  }

  return collectSliderStopValues(min, max, interval, trackLength).map((value) => {
    const position = getSliderPosition(value, min, max, isReversed);

    return {
      position,
      isActive: position >= activeStart && position <= activeEnd,
    };
  });
}

function collectSliderStopValues(min: number, max: number, interval: number, trackLength: number) {
  const intervalRatio = (max - min) / interval;
  const roundedIntervalCount = Math.round(intervalRatio);
  const hasFinalInterval =
    roundedIntervalCount === 0 ||
    Math.abs(intervalRatio - roundedIntervalCount) > Number.EPSILON * Math.max(1, intervalRatio);
  const intervalCount = hasFinalInterval ? Math.floor(intervalRatio) : roundedIntervalCount;

  if (!Number.isSafeInteger(intervalCount)) {
    return [min, max];
  }

  const steppedLength = ((intervalCount * interval) / (max - min)) * trackLength;
  const visibleIntervalCount = limitSliderStopIntervals(intervalCount, steppedLength);
  const stride = visibleIntervalCount > 0 ? intervalCount / visibleIntervalCount : 0;
  const values = Array.from(
    { length: visibleIntervalCount + 1 },
    (_, index) => min + index * stride * interval
  );

  if (!hasFinalInterval) {
    values[values.length - 1] = max;
    return values;
  }

  const finalSpacing = ((max - values[values.length - 1]) / (max - min)) * trackLength;

  if (finalSpacing < MIN_STOP_SPACING) {
    values.pop();
  }

  values.push(max);
  return values;
}

function limitSliderStopIntervals(intervalCount: number, trackLength: number) {
  let visibleIntervalCount = Math.min(intervalCount, Math.floor(trackLength / MIN_STOP_SPACING));

  while (visibleIntervalCount > 0 && intervalCount % visibleIntervalCount !== 0) {
    visibleIntervalCount--;
  }

  return visibleIntervalCount;
}

function countDecimalPlaces(value: number) {
  const [coefficient, exponent = "0"] = String(value).toLowerCase().split("e");
  return Math.max(0, (coefficient.split(".")[1] ?? "").length - Number(exponent));
}

function getGreatestCommonDivisor(first: number, second: number) {
  while (second !== 0) {
    [first, second] = [second, first % second];
  }

  return first;
}
