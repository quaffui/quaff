<script lang="ts">
  import { onMount } from "svelte";
  import type { HorizontalPositions, QTooltipProps, VerticalPositions } from "./props";

  let {
    value = false,
    anchor = "bottom center",
    self = "top center",
    offset = [14, 14],
    // delay = 0,
    // hideDelay = 0,
    // persistent = false,
    maxHeight,
    maxWidth,
    children,
    ...props
  }: QTooltipProps = $props();

  // const canHide = $derived(value && !persistent);

  let tooltipEl = $state<HTMLDivElement>();

  function getAnchorEl() {
    if (!tooltipEl) {
      return null;
    }

    let anchorEl = tooltipEl.parentElement;
    while (anchorEl) {
      if (
        Array.from(anchorEl.classList).some(
          (className) => className.startsWith("q-") && className.includes("__")
        )
      ) {
        // It's a Quaff sub-component, we can skip it
        anchorEl = anchorEl.parentElement;
      } else {
        break;
      }
    }

    return anchorEl;
  }

  function splitPosition(pos: string) {
    return pos.split(" ") as [VerticalPositions, HorizontalPositions];
  }

  function handleAnchor<T extends VerticalPositions | HorizontalPositions>(pos: T) {
    let offsetToUse = ["left", "center", "right"].includes(pos) ? offset[0] : offset[1];

    if (pos === "top" || pos === "left") {
      return `-${offsetToUse}px`;
    }

    if (pos === "bottom" || pos === "right") {
      return `calc(100% + ${offsetToUse}px)`;
    }

    return "50%";
  }

  function handleSelfPosition<T extends VerticalPositions | HorizontalPositions>(pos: T): string {
    if (pos === "top" || pos === "left") {
      return "0";
    }

    if (pos === "bottom" || pos === "right") {
      return "-100%";
    }

    return "-50%";
  }

  const anchorPosition = $derived.by(() => {
    const [anchorY, anchorX] = splitPosition(anchor);
    const top = handleAnchor(anchorY);
    const left = handleAnchor(anchorX);

    return {
      top,
      left,
    };
  });

  const selfPosition = $derived.by(() => {
    const [selfY, selfX] = splitPosition(self);
    const translateX = handleSelfPosition(selfX);
    const translateY = handleSelfPosition(selfY);

    return {
      translateX,
      translateY,
    };
  });

  export function show() {
    value = true;
  }

  export function hide() {
    value = false;
  }

  export function toggle() {
    value = !value;
  }

  onMount(() => {
    const anchorEl = getAnchorEl();

    if (anchorEl) {
      if (anchorEl.style.position === "static") {
        anchorEl.style.position = "relative";
      }
      anchorEl.addEventListener("mouseenter", show);
      anchorEl.addEventListener("mouseleave", hide);
    }
  });

  Q.classes("q-tooltip", {
    bemClasses: {
      active: value,
    },
    classes: [props.class],
  });
</script>

<div
  bind:this={tooltipEl}
  {...props}
  class="q-tooltip"
  {...Q.classes}
  style:top={anchorPosition.top}
  style:left={anchorPosition.left}
  style:translate="{selfPosition.translateX}
  {selfPosition.translateY}"
  style:max-height={maxHeight}
  style:max-width={maxWidth}
>
  {@render children?.()}
</div>
