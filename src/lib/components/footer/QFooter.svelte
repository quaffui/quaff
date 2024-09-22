<script lang="ts">
  import { useSize } from "$lib/composables";
  import QContext from "$lib/classes/QContext.svelte";
  import type { AppbarContext, LayoutContext } from "../layout/QLayout.svelte";
  import type { QFooterProps } from "./props";
  import { getContext, onDestroy, onMount, untrack } from "svelte";
  import type { QLayoutProps } from "$components/layout/props";
  import QScrollObserver from "$lib/classes/QScrollObserver.svelte";

  let {
    value = $bindable(true),
    border = false,
    reveal = false,
    revealOffset = 250,
    height = 80,
    children,
    ...props
  }: QFooterProps = $props();

  const ctx = QContext.get<LayoutContext>("layout");

  const footerContext = QContext.get<AppbarContext>("QFooter");
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>("view");

  if (!footerContext || !layoutView) {
    throw new Error("QFooter should be used inside QLayout");
  }

  const ID = Date.now();

  const scroll = new QScrollObserver(`.q-footer--${ID} ~ .q-layout__content`);

  let contentScrollHeight = $state(0);

  const offset = $derived(scroll.position + height);
  const collapsed = $derived(
    reveal && scroll.direction === "up" && offset + revealOffset < contentScrollHeight
  );

  const leftOffset = () => layoutView.value.charAt(0) === "l";
  const rightOffset = () => layoutView.value.charAt(2) === "r";

  $effect.pre(() => {
    untrack(() => footerContext).updateEntries({ height, collapsed });
  });

  onMount(() => {
    const content = document.querySelector(`.q-footer--${ID} ~ .q-layout__content`);

    contentScrollHeight = content ? content.scrollHeight - content.clientHeight : 0;
  });

  onDestroy(() => {
    untrack(() => footerContext).updateEntries({ height: 0, collapsed: false });
  });

  const heightStyle = $derived(!ctx ? useSize(height).style : null);

  Q.classes("q-footer", {
    bemClasses: {
      collapsed,
      "offset-left": leftOffset(),
      "offset-right": rightOffset(),
      [ID]: true,
    },
    classes: [props.class],
  });
</script>

{#if value}
  <footer {...props} class="q-footer" {...Q.classes} style:height={heightStyle}>
    <nav>
      {@render children?.()}
    </nav>
  </footer>
{/if}
