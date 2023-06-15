import { getContext, setContext } from "svelte";

export function setIndex(index: number) {
  setContext("index", {
    index: () => {
      index++;
      return index;
    },
  });
}

export function getIndex() {
  const { index } = getContext<{
    index: () => number;
  }>("index");

  return index();
}
