<script lang="ts">
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";
  import type { QTooltipProps } from "./props";

  let {
    // At this point, target should be guaranteed to be a DOM element
    target,
    position = "bottom",
    offset = { x: 0, y: 0 },
    children,
    ...props
  }: QTooltipProps<HTMLElement> = $props();

  let tooltipEl = $state<HTMLDivElement>();

  onMount(() => {
    setTimeout(() => {
      if (tooltipEl) {
        tooltipEl.style.opacity = "1";
      }
    }, 50);
  });

  const tooltipPosition: Record<"top" | "left", number> | undefined = $derived.by(() => {
    if (!target || !tooltipEl) {
      return;
    }

    const anchorRect = target.getBoundingClientRect();

    // 0.5rem offset so the tooltip is not stuck to the anchor
    const defaultOffset = position.includes("-") ? 0 : 8;

    const top = position.includes("top")
      ? anchorRect.top - tooltipEl.offsetHeight + (offset.y || 0) - defaultOffset
      : position.includes("bottom")
        ? anchorRect.bottom + (offset.y || 0) + defaultOffset
        : anchorRect.top + anchorRect.height / 2 - tooltipEl.offsetHeight / 2 + (offset.y || 0);

    const left = position.includes("left")
      ? anchorRect.left - tooltipEl.offsetWidth + (offset.x || 0) - defaultOffset
      : position.includes("right")
        ? anchorRect.right + (offset.x || 0) + defaultOffset
        : anchorRect.left + anchorRect.width / 2 - tooltipEl.offsetWidth / 2 + (offset.x || 0);

    return { top, left };
  });

  const styles = $derived(
    tooltipPosition && { top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }
  );

  Q.classes("q-tooltip", {
    classes: [props.class],
  });
</script>

<div
  bind:this={tooltipEl}
  {...props}
  class="q-tooltip"
  {...Q.classes}
  style:top={styles?.top}
  style:left={styles?.left}
  style:transform="unset"
  transition:scale|global={{ duration: 100 }}
>
  {@render children?.()}
</div>
