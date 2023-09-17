export function clickOutside(node: HTMLElement, onEventFunction: () => unknown) {
  const handleClick = (event: MouseEvent) => {
    const path = event.composedPath();

    if (!path.includes(node)) {
      onEventFunction();
    }
  };

  document.addEventListener("click", handleClick);

  return {
    destroy() {
      document.removeEventListener("click", handleClick);
    },
  };
}

export function clickOutsideDialog(node: HTMLDialogElement, onEventFunction: () => unknown) {
  const handleClick = (event: MouseEvent) => {
    if (!node.open) return;
    const rect = node.getBoundingClientRect();

    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;

    if (isInDialog === false && node.open === true) {
      onEventFunction();
    }
  };

  document.addEventListener("click", handleClick);

  return {
    destroy() {
      document.removeEventListener("click", handleClick);
    },
  };
}
