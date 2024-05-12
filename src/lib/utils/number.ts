export function isNumber(input: unknown): input is number | `${number}` {
  return typeof input === "number" || !isNaN(Number(input));
}

export function between(value: number, min: number, max: number) {
  return max <= min ? min : Math.min(max, Math.max(min, value));
}
