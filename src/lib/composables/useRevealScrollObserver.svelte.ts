import QScrollObserver from "$lib/classes/QScrollObserver.svelte";

export type RevealScrollBar = "header" | "footer";

/**
 * Manages a {@link QScrollObserver} for QHeader / QFooter `reveal` mode.
 * Observes the sibling `.q-layout__content` scroll area and tears down on disable or unmount.
 */
export function useRevealScrollObserver(bar: RevealScrollBar, uid: string, reveal: () => boolean) {
  let scroll = $state<QScrollObserver | undefined>();

  $effect(() => {
    if (!reveal()) {
      scroll = undefined;
      return;
    }

    const observer = new QScrollObserver(`.q-${bar}--${uid} ~ .q-layout__content`);
    scroll = observer;

    return () => {
      observer.destroy();
      scroll = undefined;
    };
  });

  return {
    get scroll() {
      return scroll;
    },
  };
}
