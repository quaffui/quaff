export function clickOutside(node: HTMLElement, onEventFunction: () => any) {
  const handleClick = (event: MouseEvent) => {
    let path = event.composedPath();

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

export function clickOutsideDialog(node: HTMLDialogElement, onEventFunction: () => any) {
  const handleClick = (event: MouseEvent) => {
    let rect = node.getBoundingClientRect();

    let isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientY <= rect.left + rect.width;

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
