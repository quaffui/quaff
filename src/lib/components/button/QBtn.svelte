<script lang="ts">
  import { useSize } from "$lib/composables";
  import { ripple } from "$lib/helpers";
  import { createClasses, isActivationKey } from "$lib/utils";
  import { QIcon, QCircularProgress } from "$lib";
  import type { QBtnProps } from "./props";

  export let icon: QBtnProps["icon"] = undefined,
    label: QBtnProps["label"] = undefined,
    disable: QBtnProps["disable"] = false,
    loading: QBtnProps["loading"] = false,
    unelevated: QBtnProps["unelevated"] = false,
    outline: QBtnProps["outline"] = false,
    round: QBtnProps["round"] = false,
    rectangle: QBtnProps["rectangle"] = false,
    noRipple: QBtnProps["noRipple"] = false,
    flat: QBtnProps["flat"] = false,
    to: QBtnProps["to"] = undefined,
    size: QBtnProps["size"] = undefined,
    userClasses: QBtnProps["userClasses"] = undefined;
  export { userClasses as class };

  type QBtn = HTMLAnchorElement | HTMLButtonElement;

  let qBtn: QBtn;

  let tag: "a" | "button";
  $: tag = to !== undefined ? "a" : "button";

  $: sizeObj = useSize(size);

  $: classes = createClasses(
    [
      unelevated && "unelevated",
      rectangle && "rectangle",
      outline && "outlined",
      flat && "flat",
      ((!$$slots.default && !label) || round) && "round",
      size !== "md" && sizeObj.class,
    ],
    {
      component: "q-btn",
      userClasses,
    }
  );

  function onKeyDown(e: KeyboardEvent) {
    if (!isActivationKey(e)) return;

    e.preventDefault();

    let click = new MouseEvent("click");
    qBtn.dispatchEvent(click);
  }
</script>

<svelte:element
  this={tag}
  bind:this={qBtn}
  use:ripple={{ disable: noRipple || disable }}
  role={tag === "a" ? "button" : undefined}
  href={to}
  class={classes}
  aria-disabled={disable || undefined}
  tabindex={disable ? -1 : 0}
  on:click
  on:keydown={onKeyDown}
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
