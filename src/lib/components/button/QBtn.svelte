<script lang="ts">
  import { useSize } from "$lib/composables";
  import { ripple } from "$lib/helpers";
  import { isActivationKey } from "$lib/utils";
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
    userClasses: QBtnProps["userClasses"] = "";
  export { userClasses as class };

  type QBtn = HTMLAnchorElement | HTMLButtonElement;

  let qBtn: QBtn;

  let tag: "a" | "button";
  $: tag = to !== undefined ? "a" : "button";

  $: sizeObj = useSize(size);

  $: sizeClass = sizeObj.class && sizeObj.class !== "md" ? `q-btn--${sizeObj.class}` : "";

  function stopIfDisabled(e: MouseEvent) {
    if (disable) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!isActivationKey(e)) return;

    e.preventDefault();

    let click = new MouseEvent("click");
    qBtn.dispatchEvent(click);
  }
</script>

<svelte:element
  this={tag}
  use:ripple={{ disable: noRipple || disable }}
  bind:this={qBtn}
  aria-disabled={disable || undefined}
  class="q-btn {sizeClass} {userClasses}"
  class:q-btn--unelevated={unelevated}
  class:q-btn--outlined={outline}
  class:q-btn--flat={flat}
  class:q-btn--rectangle={rectangle}
  class:q-btn--round={(!$$slots.default && !label) || round}
  href={to}
  role={tag === "a" ? "button" : undefined}
  tabindex={disable ? -1 : 0}
  on:keydown={onKeyDown}
  on:click={stopIfDisabled}
  on:click
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
