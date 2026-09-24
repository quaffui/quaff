export type QTimeDialMeasurement = ReturnType<typeof measureTimeDial>;

/** Measure the visible dial, keeping its requirements independent of the input layout. */
export function measureTimeDial(picker: HTMLElement) {
  const range = document.createRange();
  const labels = Array.from(
    picker.querySelectorAll<HTMLButtonElement>(".q-time__dial-option:not([inert])")
  ).map((option) => {
    range.selectNodeContents(option);
    return { rect: range.getBoundingClientRect(), option };
  });
  const doLabelsFit = labels.every(({ rect, option }, index) => {
    if (rect.width > option.clientWidth + 1 || rect.height > option.clientHeight + 1) {
      return false;
    }

    return !labels.some(
      ({ rect: other }, otherIndex) =>
        otherIndex > index &&
        rect.right > other.left &&
        other.right > rect.left &&
        rect.bottom > other.top &&
        other.bottom > rect.top
    );
  });

  const controls = picker.querySelector<HTMLElement>(".q-time__controls");
  const doControlsFit = !controls || controls.scrollWidth <= controls.clientWidth + 1;

  return {
    width: Math.max(picker.offsetWidth, picker.scrollWidth),
    height: Math.max(picker.offsetHeight, picker.scrollHeight),
    isHorizontal: picker.classList.contains("q-time__picker--horizontal"),
    doesContentFit: doLabelsFit && doControlsFit && picker.scrollWidth <= picker.clientWidth + 1,
  };
}
