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

    const top = calculatePosition(target, tooltipEl, "y");
    const left = calculatePosition(target, tooltipEl, "x");

    return { top, left };
  });

  const styles = $derived(
    tooltipPosition && { top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }
  );

  function calculatePosition(anchor: HTMLElement, tooltip: HTMLElement, axis: "x" | "y") {
    const anchorRect = anchor.getBoundingClientRect();

    const anchorPosition = {
      start: axis === "x" ? "left" : "top",
      end: axis === "x" ? "right" : "bottom",
    } as const;
    const anchorDimension = axis === "x" ? "width" : "height";
    const tooltipDimension = axis === "x" ? "offsetWidth" : "offsetHeight";

    const offsetToUse = offset[axis];
    // 0.5rem offset so the tooltip is not stuck to the anchor
    const defaultOffset = position.includes("-") ? 0 : 8;

    return position.includes(anchorPosition.start)
      ? anchorRect[anchorPosition.start] -
          tooltip[tooltipDimension] +
          (offsetToUse || 0) -
          defaultOffset
      : position.includes(anchorPosition.end)
        ? anchorRect[anchorPosition.end] + (offsetToUse || 0) + defaultOffset
        : anchorRect[anchorPosition.start] +
          anchorRect[anchorDimension] / 2 -
          tooltip[tooltipDimension] / 2 +
          (offsetToUse || 0);
  }

  Q.classes("q-tooltip", {
    classes: [props.class],
  });
</script>

<div
  bind:this={tooltipEl}
  {...props}
  class="q-tooltip"
  style:top={styles?.top}
  style:left={styles?.left}
  style:transform="unset"
  transition:scale|global={{ duration: 100 }}
>
  {@render children?.()}
</div>
