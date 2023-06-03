export function clickOutside(node: HTMLElement, onEventFunction: () => any) {
  const handleClick = (event: Event) => {
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
