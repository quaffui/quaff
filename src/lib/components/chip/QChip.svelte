<script lang="ts">
  import { activationHandler } from "$lib/helpers/activationHandler";
  import { createClasses } from "$lib/utils/props";
  import { createEventDispatcher } from "svelte";
  import QIcon from "../icon/QIcon.svelte";
  import type { QChipProps } from "./props";
  import { useSize } from "$lib/composables/use-size";

  export let content: QChipProps["content"] = undefined,
    icon: QChipProps["icon"] = undefined,
    iconRight: QChipProps["iconRight"] = undefined,
    disable: QChipProps["disable"] = false,
    responsive: QChipProps["responsive"] = false,
    vertical: QChipProps["vertical"] = false,
    round: QChipProps["round"] = false,
    outlined: QChipProps["outlined"] = false,
    size: QChipProps["size"] = "md",
    tabindex: QChipProps["tabindex"] = undefined,
    href: QChipProps["href"] = undefined,
    userClasses: QChipProps["userClasses"] = undefined;
  export { userClasses as class };

  const emit = createEventDispatcher();

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
</script>

<a
  use:activationHandler={{ disable, callback: (e) => emit("activated", e) }}
  {href}
  class={classes}
  tabindex={tab}
  {...$$restProps}
  aria-disabled={disable || undefined}
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
