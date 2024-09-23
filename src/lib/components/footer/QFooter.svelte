<script lang="ts">
  import { getContext, onDestroy, onMount, untrack } from "svelte";
  import QContext from "$lib/classes/QContext.svelte";
  import QScrollObserver from "$lib/classes/QScrollObserver.svelte";
  import type { QLayoutProps } from "$components/layout/props";
  import type { AppbarContext } from "../layout/QLayout.svelte";
  import type { QFooterProps } from "./props";
  import QToolbar from "$components/toolbar/QToolbar.svelte";

  const ID = Date.now();

  let {
    value = $bindable(true),
    bordered = false,
    reveal = false,
    revealOffset = 250,
    height = 80,
    children,
    ...props
  }: QFooterProps = $props();

  const footerContext = QContext.get<AppbarContext>("QFooter");
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>("view");

  if (!footerContext || !layoutView) {
    throw new Error("QFooter should be used inside QLayout");
  }

  const scroll = $derived(
    reveal ? new QScrollObserver(`.q-footer--${ID} ~ .q-layout__content`) : undefined
  );
  let contentScrollHeight = $state(0);

  const offset = $derived(scroll ? scroll.position + height : undefined);
  // Collapse the footer `${reavealOffset}px` above the bottom of layout content when scrolling up
  const collapsed = $derived(
    reveal && scroll?.direction === "up" && offset! + revealOffset < contentScrollHeight
  );

  const leftOffset = () => layoutView.value.charAt(8) === "l";
  const rightOffset = () => layoutView.value.charAt(10) === "r";

  $effect.pre(() => {
    untrack(() => footerContext).updateEntries({ height, collapsed });
  });

  onMount(() => {
    // Calculating the layout content's height
    const content = document.querySelector(`.q-footer--${ID} ~ .q-layout__content`);

    contentScrollHeight = content ? content.scrollHeight - content.clientHeight : 0;
  });

  onDestroy(() => {
    untrack(() => footerContext).updateEntries({ height: 0, collapsed: false });
  });

  Q.classes("q-footer", {
    bemClasses: {
      [ID]: true,
      collapsed,
      bordered,
      "offset-left": leftOffset(),
      "offset-right": rightOffset(),
    },
    classes: [props.class],
  });
</script>

{#if value}
  <footer {...props} class="q-footer" {...Q.classes} style:--footer-height="{height}px">
    <QToolbar>
      {@render children?.()}
    </QToolbar>
  </footer>
{/if}
