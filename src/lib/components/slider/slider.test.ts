import { expect, it } from "vitest";
import { buildSliderStops, snapSliderValue } from "./slider";

it.each([96, 160, 300, 800, 1200])(
  "spaces selectable fine-step stops evenly across a %spx axis",
  (trackLength) => {
    const stops = buildSliderStops(0, 100, 0.001, false, 0, 0.41, trackLength);
    const offsets = stops.map(({ position }) => position * trackLength);
    const spacings = offsets.slice(1).map((offset, index) => offset - offsets[index]);
    const expectedActiveStops = stops.filter((stop) => stop.position <= 0.41);

    expect(stops.length).toBeGreaterThan(2);
    expect(stops.length).toBeLessThanOrEqual(Math.floor(trackLength / 8) + 1);
    expect(offsets[0]).toBe(0);
    expect(offsets.at(-1)).toBe(trackLength);
    expect(Math.min(...spacings)).toBeGreaterThanOrEqual(8 - 0.0001);
    expect(Math.max(...spacings) - Math.min(...spacings)).toBeLessThan(0.0001);
    expect(stops.filter((stop) => stop.isActive)).toEqual(expectedActiveStops);

    for (const stop of stops) {
      const value = stop.position * 100;

      expect(snapSliderValue(value, 0, 100, 0.001)).toBeCloseTo(value);
    }
  }
);

it.each([
  [0, 100, 2, Array.from({ length: 51 }, (_, index) => index * 2)],
  [0, 10, 3, [0, 3, 6, 9, 10]],
  [0.1, 0.4, 0.1, [0.1, 0.2, 0.3, 0.4]],
  [0, 0.9, 0.3, [0, 0.3, 0.6, 0.9]],
  [0, 0.3, 0.1, [0, 0.1, 0.2, 0.3]],
  [0, 1, 2, [0, 1]],
] as const)(
  "preserves sparse stops and endpoints from %s to %s with interval %s",
  (min, max, interval, expected) => {
    const stops = buildSliderStops(min, max, interval, false, 0, 1, 448);

    expect(stops).toHaveLength(expected.length);

    for (const [index, value] of expected.entries()) {
      expect(min + stops[index].position * (max - min)).toBeCloseTo(value);
    }
  }
);

it("reduces marker density by retaining selectable steps through both endpoints", () => {
  const stops = buildSliderStops(0, 100, 1, false, 0, 1, 300);
  const values = stops.map((stop) => stop.position * 100);

  expect(values).toHaveLength(26);

  for (const [index, value] of values.entries()) {
    expect(value).toBeCloseTo(index * 4);
  }
});

it.each([101, 103, 100_003])(
  "retains endpoints for a dense prime-sized range of %s intervals",
  (max) => {
    const stops = buildSliderStops(0, max, 1, false, 0, 1, 300);

    expect(stops.map((stop) => stop.position)).toEqual([0, 1]);
  }
);

it.each([1e-20, Number.MIN_VALUE])(
  "retains finite endpoints when interval %s exceeds safe subdivision precision",
  (interval) => {
    const stops = buildSliderStops(0, 100, interval, false, 0, 1, 300);

    expect(stops.map((stop) => stop.position)).toEqual([0, 1]);
  }
);

it.each([
  [10.01, 10, 448],
  [10.25, 0.1, 300],
  [101.5, 1, 300],
] as const)(
  "keeps the partial maximum %s selectable without crowded endpoint markers",
  (max, interval, trackLength) => {
    const stops = buildSliderStops(0, max, interval, false, 0, 1, trackLength);
    const offsets = stops.map((stop) => stop.position * trackLength);
    const spacings = offsets.slice(1).map((offset, index) => offset - offsets[index]);

    expect(stops[0].position).toBe(0);
    expect(stops.at(-1)?.position).toBe(1);
    expect(Math.min(...spacings)).toBeGreaterThanOrEqual(8 - 0.0001);

    for (const stop of stops) {
      const value = stop.position * max;

      expect(snapSliderValue(value, 0, max, interval)).toBeCloseTo(value);
    }
  }
);

it("reverses limited stops while retaining the active range", () => {
  const forward = buildSliderStops(0, 100, 1, false, 0.25, 0.75, 300);
  const reversed = buildSliderStops(0, 100, 1, true, 0.25, 0.75, 300);

  expect(reversed).toHaveLength(forward.length);

  for (const [index, stop] of forward.entries()) {
    expect(reversed[index].position).toBeCloseTo(1 - stop.position);
    expect(reversed[index].isActive).toBe(stop.isActive);
  }
});

it("waits for a measurable track and leaves continuous sliders without ticks", () => {
  expect(buildSliderStops(0, 100, 1, false, 0, 0.5, 0)).toEqual([]);
  expect(buildSliderStops(0, 100, 0, false, 0, 0.5, 300)).toEqual([]);
});
