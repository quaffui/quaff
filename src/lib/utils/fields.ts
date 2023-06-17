export function textWidth(element: HTMLElement, font: string): number {
  if (element.offsetWidth > 0) return element.offsetWidth;
  let _canvas = (
    document.querySelector("canvas[data-quaff]") as HTMLCanvasElement | null
  )?.getContext("2d");

  if (!_canvas) {
    const canvasElement = document.createElement("canvas");
    canvasElement.style.display = "none";
    canvasElement.setAttribute("data-quaff", "");
    document.body.append(canvasElement);
    _canvas = canvasElement.getContext("2d");
  }

  _canvas!.font = font;
  return _canvas!.measureText(element.textContent!).width;
}
