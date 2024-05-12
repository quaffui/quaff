<script lang="ts">
  import { useSize } from "$lib/composables";
  import { ripple } from "$lib/helpers";
  import { isActivationKey } from "$lib/utils";
  import { QIcon } from "$lib";
  import type { QChipProps } from "./props";

  export let content: QChipProps["content"] = undefined,
    icon: QChipProps["icon"] = undefined,
    iconRight: QChipProps["iconRight"] = undefined,
    disable: QChipProps["disable"] = false,
    responsive: QChipProps["responsive"] = false,
    vertical: QChipProps["vertical"] = false,
    round: QChipProps["round"] = false,
    outlined: QChipProps["outlined"] = false,
    noRipple: QChipProps["noRipple"] = false,
    size: QChipProps["size"] = "md",
    tabindex: QChipProps["tabindex"] = undefined,
    href: QChipProps["href"] = undefined,
    userClasses: QChipProps["userClasses"] = "";
  export { userClasses as class };

  let qChip: HTMLAnchorElement;

  $: img = icon?.startsWith("img:") ? icon.slice(4) : undefined;
  $: imgRight = iconRight?.startsWith("img:") ? iconRight.slice(4) : undefined;

  $: sizeObj = useSize(size);

  $: tab = disable ? -1 : tabindex ?? 0;

  function stopIfDisabled(e: MouseEvent) {
    if (disable) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!isActivationKey(e)) {
      return;
    }

    e.preventDefault();

    let click = new MouseEvent("click");
    qChip.dispatchEvent(click);
  }
</script>

<a
  bind:this={qChip}
  use:ripple={{
    disable: noRipple || disable,
    color: outlined ? undefined : "var(--on-secondary)",
  }}
  aria-disabled={disable || undefined}
  class="q-chip {sizeObj.class && sizeObj.class !== 'md'
    ? `q-chip--${sizeObj.class}`
    : ''} {userClasses}"
  class:q-chip--vertical={vertical}
  class:q-chip--rounded={round}
  class:q-chip--bordered={outlined || disable}
  {href}
  tabindex={tab}
  on:keydown={onKeyDown}
  on:click={stopIfDisabled}
  on:click
  {...$$restProps}
>
  {#if $$slots.leading}
    <slot name="leading" />
  {:else if img}
    <img
      class="q-chip__img"
      class:q-chip__img--responsive={responsive}
      src={img}
      alt="{content || 'Slotted'} chip"
    />
  {:else if icon}
    <QIcon name={icon} class="q-chip__icon" />
  {/if}
  {#if content}
    {content}
  {:else}
    <slot />
  {/if}
  {#if $$slots.trailing}
    <slot name="trailing" />
  {:else if imgRight}
    <img
      class="q-chip__img q-chip__img--trailing"
      class:q-chip__img--responsive={responsive}
      src={imgRight}
      alt="{content || 'Slotted'} chip"
    />
  {:else if iconRight}
    <QIcon name={iconRight} class="q-chip__icon" />
  {/if}
</a>
