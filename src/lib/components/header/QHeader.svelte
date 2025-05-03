<script lang="ts">
  import { getContext, onDestroy, onMount, untrack } from "svelte";
  import QToolbar from "$components/toolbar/QToolbar.svelte";
  import { QContext } from "$lib/classes/QContext.svelte";
  import QScrollObserver from "$lib/classes/QScrollObserver.svelte";
  import type { AppbarContext } from "$components/layout/QLayout.svelte";
  import type { QLayoutProps } from "$components/layout/props";
  import type { QHeaderProps } from "./props";

  const headerIdentifier = Date.now();

  let {
    elevated = false,
    inset = false,
    reveal = false,
    revealOffset = 250,
    height = 64,
    children,
    ...props
  }: QHeaderProps = $props();

  let headerEl: HTMLElement;

  const headerContext = QContext.get<AppbarContext>("QHeader");
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>("view");
  if (!headerContext || !layoutView) {
    throw new Error("QHeader should be used inside QLayout");
  }

  const scroll = $derived(
    reveal ? new QScrollObserver(`.q-header--${headerIdentifier} ~ .q-layout__content`) : undefined
  );
  const offset = $derived(scroll ? scroll.position - height : undefined);
  // Collapse the header `${reavealOffset}px` below the top of layout content when scrolling down
  const collapsed = $derived(reveal && scroll?.direction === "down" && offset! - revealOffset > 0);

  const leftOffset = () => layoutView.value.charAt(0) === "l";
  const rightOffset = () => layoutView.value.charAt(2) === "r";

  $effect.pre(() => {
    untrack(() => headerContext).updateEntries({ height, collapsed, ready: true });
  });

  onMount(() => {
    if (headerContext) {
      setTimeout(() => {
        headerEl.style.transition = "all 0.3s";
      }, 100);
    }
  });

  onDestroy(() => {
    untrack(() => headerContext).updateEntries({ height: 0, collapsed: false, ready: false });
  });

  Q.classes("q-header", {
    bemClasses: {
      [headerIdentifier]: true,
      elevated,
      collapsed,
      "offset-left": leftOffset(),
      "offset-right": rightOffset(),
    },
    classes: [props.class],
    isCustomComponent: true,
  });
</script>

<header
  bind:this={headerEl}
  {...props}
  class="q-header"
  style:--header-height="{height}px"
  data-quaff
>
  <QToolbar {inset}>
    {@render children?.()}
  </QToolbar>
</header>
