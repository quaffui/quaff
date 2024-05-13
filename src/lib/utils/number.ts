export function isNumber(input: unknown): input is number | `${number}` {
  return typeof input === "number" || !isNaN(Number(input));
}

export function between(value: number, min: number, max: number) {
  if (max < min) {
    console.warn(`max (${max}) should not be smaller than min (${min}).`);
  }
  return max <= min ? min : Math.min(max, Math.max(min, value));
}
