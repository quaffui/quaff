<script lang="ts">
  import QToolbar from "$components/toolbar/QToolbar.svelte";
  import QContext from "$lib/classes/QContext.svelte";
  import QScrollObserver from "$lib/classes/QScrollObserver.svelte";
  import { getContext, untrack } from "svelte";
  import type { AppbarContext } from "$components/layout/QLayout.svelte";
  import type { QHeaderProps } from "./props";
  import type { QLayoutProps } from "$components/layout/props";

  let {
    elevated = false,
    inset = false,
    reveal = false,
    revealOffset = 250,
    height = 64,
    children,
    ...props
  }: QHeaderProps = $props();

  const headerContext = QContext.get<AppbarContext>("QHeader");
  const layoutView = getContext<{ value: NonNullable<QLayoutProps["view"]> }>("view");

  if (!headerContext || !layoutView) {
    throw new Error("QHeader should be used inside QLayout");
  }

  const scroll = new QScrollObserver();

  const offset = $derived(scroll.position - height);
  const collapsed = $derived(reveal && scroll.direction === "down" && offset - revealOffset > 0);

  const leftOffset = () => layoutView.value.charAt(0) === "l";
  const rightOffset = () => layoutView.value.charAt(2) === "r";

  $effect.pre(() => {
    untrack(() => headerContext).updateEntries({ height, collapsed });
  });

  Q.classes("q-header", {
    bemClasses: {
      elevated,
      inset,
      collapsed,
      "offset-left": leftOffset(),
      "offset-right": rightOffset(),
    },
    classes: [props.class],
    isCustomComponent: true,
  });
</script>

<QToolbar {...props} class="q-header" role="header" {...Q.classes}>
  {@render children?.()}
</QToolbar>
