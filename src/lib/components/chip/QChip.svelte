<script lang="ts">
  import { useSize } from "$lib/composables";
  import { ripple } from "$lib/helpers";
  import { createClasses, isActivationKey } from "$lib/utils";
  import { QIcon } from "..";
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
    userClasses: QChipProps["userClasses"] = undefined;
  export { userClasses as class };

  let qChip: HTMLAnchorElement

  $: img = icon?.startsWith("img:") ? icon.slice(4) : undefined;
  $: imgRight = iconRight?.startsWith("img:") ? iconRight.slice(4) : undefined;

  $: sizeObj = useSize(size);

  $: classes = createClasses(
    [
      vertical && "vertical",
      round && "rounded",
      (outlined || disable) && "bordered",
      size !== "md" && sizeObj.class,
    ],
    {
      component: "q-chip",
      userClasses,
    }
  );

  $: imgClass = createClasses([responsive && "responsive"], {
    component: "q-chip",
    element: "img",
  });

  $: tab = disable ? -1 : tabindex ?? 0;

  function onKeyDown(e: KeyboardEvent) {
    if (!isActivationKey(e)) return;

    e.preventDefault();

    let click = new MouseEvent("click");
    qChip.dispatchEvent(click);
  }
</script>

<a
  bind:this={qChip}
  use:ripple={{disable: noRipple || disable}}
  aria-disabled={disable || undefined}
  class={classes}
  {href}
  tabindex={tab}
  on:click
  on:keydown={onKeyDown}
  {...$$restProps}
>
  {#if $$slots.leading}
    <slot name="leading" />
  {:else if img}
    <img class={imgClass} src={img} alt="{content || 'Slotted'} chip" />
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
      class="{imgClass} q-chip__img--trailing"
      src={imgRight}
      alt="{content || 'Slotted'} chip"
    />
  {:else if iconRight}
    <QIcon name={iconRight} class="q-chip__icon" />
  {/if}
</a>
