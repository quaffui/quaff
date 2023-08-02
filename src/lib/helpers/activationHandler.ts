interface Options {
  disable: boolean | undefined;
  callback: (e: MouseEvent | KeyboardEvent) => void;
}

export function activationHandler(node: HTMLElement, { disable, callback }: Options) {
  function handleEvent(event: MouseEvent | KeyboardEvent) {
    if (disable) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (event instanceof KeyboardEvent) {
      if (!["Enter", "Space"].includes(event.code)) return;
    }

    event.preventDefault();
    callback(event);
  }

  node.addEventListener("click", handleEvent);
  node.addEventListener("keydown", handleEvent);

  return {
    destroy() {
      node.removeEventListener("click", handleEvent);
      node.removeEventListener("keydown", handleEvent);
    },
  };
}
