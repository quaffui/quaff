<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { createEventDispatcher } from "svelte";
  import QIcon from "../icon/QIcon.svelte";
  import QCircularProgress from "../progress/QCircularProgress.svelte";
  import type { QBtnProps } from "./props";
  import { activationHandler } from "$lib/helpers/activationHandler";

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

  const emit = createEventDispatcher();

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
      component: "q-btn",
      userClasses,
    }
  );
</script>

<svelte:element
  this={tag}
  use:activationHandler={{ disable, callback: (e) => emit("activated", e) }}
  role="button"
  href={to}
  class={classes}
  aria-disabled={disable || undefined}
  tabindex={disable ? -1 : 0}
  {...$$restProps}
>
  {#if icon && !loading}
    {#if icon.startsWith("img:")}
      <img
        src={icon.replace("img:", "")}
        class="q-btn__img q-btn__img--responsive"
        alt="{label || 'Slotted'} button"
      />
    {:else}
      <QIcon name={icon} class="q-btn__icon" />
    {/if}
  {/if}

  {#if loading}
    <QCircularProgress indeterminate class="q-btn__loader" />
  {/if}

  {#if label}
    <span>{label}</span>
  {/if}
  <slot />
</svelte:element>
