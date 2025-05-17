<script lang="ts">
  import { getContext, onMount, untrack } from "svelte";
  import { QScrollObserver } from "$lib";
  import { QContext } from "$lib/classes/QContext.svelte";
  import { QLayoutCtxName } from "$utils";
  import type { QLayoutProps } from "$components/layout/props";
  import type { AppbarContext } from "../layout/QLayout.svelte";
  import type { QFooterProps } from "./props";

  let footerEl = $state<HTMLElement>();

  let {
    value = $bindable(true),
    bordered = false,
    reveal = false,
    revealOffset = 250,
    height = 80,
    children,
    ...props
  }: QFooterProps = $props();

  const uid = $props.id();

  const footerContext = QContext.get<AppbarContext>(QLayoutCtxName.footer);
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>(QLayoutCtxName.view);

  if (!footerContext || !layoutView) {
    throw new Error("QFooter should be used inside QLayout");
  }

  const scroll = $derived(
    reveal ? new QScrollObserver(`.q-footer--${uid} ~ .q-layout__content`) : undefined
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
    untrack(() => footerContext).updateEntries({ height, collapsed, ready: true });
  });

  onMount(() => {
    // Calculating the layout content's height
    const content = document.querySelector(`.q-footer--${uid} ~ .q-layout__content`);

    contentScrollHeight = content ? content.scrollHeight - content.clientHeight : 0;

    setTimeout(() => {
      if (footerEl) {
        footerEl.style.transition = "all 0.3s";
      }
    }, 100);

    return () => {
      footerContext.updateEntries({ height: 0, collapsed: false, ready: false });
    };
  });

  Q.classes("q-footer", {
    bemClasses: {
      [uid]: true,
      collapsed,
      bordered,
      "offset-left": leftOffset(),
      "offset-right": rightOffset(),
    },
    classes: [props.class],
  });
</script>

{#if value}
  <footer
    bind:this={footerEl}
    {...props}
    class="q-footer"
    style:--footer-height="{height}px"
    data-quaff
  >
    {@render children?.()}
  </footer>
{/if}
