import { getContext, hasContext, setContext } from "svelte";

export function setIndex(index: number) {
  setContext("index", {
    index: () => {
      index++;
      return index;
    },
  });

  return index;
}

export function getIndex() {
  if (!hasContext("index")) {
    return undefined;
  }

  const { index } = getContext<{
    index: () => number;
  }>("index");

  return index();
}
