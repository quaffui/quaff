<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import QIcon from "../icon/QIcon.svelte";
  import QCircularProgress from "../progress/QCircularProgress.svelte";
  import type { QBtnProps } from "./props";

  export let icon: QBtnProps["icon"] = undefined,
    label: QBtnProps["label"] = undefined,
    disable: QBtnProps["disable"] = false,
    loading: QBtnProps["loading"] = false,
    unelevated: QBtnProps["unelevated"] = false,
    outline: QBtnProps["outline"] = false,
    rectangle: QBtnProps["rectangle"] = false,
    flat: QBtnProps["flat"] = false,
    to: QBtnProps["to"] = undefined,
    size: QBtnProps["size"] = undefined,
    userClasses: QBtnProps["userClasses"] = undefined;
  export { userClasses as class };

  let tag: "a" | "div";
  $: tag = to !== undefined ? "a" : "div";

  $: classes = createClasses(
    [
      unelevated && "unelevated",
      rectangle && "rectangle",
      outline && "outlined",
      flat && "flat",
      !$$slots.default && !label && "circle",
      size && size !== "md" && size,
    ],
    {
      component: "QBtn",
      userClasses,
    }
  );
</script>

<svelte:element
  this={tag}
  role="button"
  href={to}
  class={classes}
  aria-disabled={disable || undefined}
  tabindex={disable ? -1 : 0}
  {...$$restProps}
  on:click
>
  {#if icon && !loading}
    <QIcon name={icon} class="q-btn__icon" />
  {/if}

  {#if loading}
    <QCircularProgress indeterminate class="q-btn__loader" />
  {/if}

  {#if label}
    <span>{label}</span>
  {/if}
  <slot />
</svelte:element>
