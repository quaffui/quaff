export function isActivationKey(e: KeyboardEvent) {
  return e.code === "Enter" || e.code === "Space";
}
