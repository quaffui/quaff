<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import QIcon from "../icon/QIcon.svelte";
  import type { QChipProps } from "./props";

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

  $: img = icon?.startsWith("img:") ? icon.slice(4) : undefined;
  $: imgRight = iconRight?.startsWith("img:") ? iconRight.slice(4) : undefined;

  $: sizeClass = ["sm", "lg"].includes(size!) ? size : undefined;

  $: classes = createClasses(
    [vertical && "vertical", round && "rounded", (outlined || disable) && "bordered", sizeClass],
    {
      component: "q-chip",
      userClasses,
    }
  );

  $: imgClass = createClasses([responsive && "responsive"], {
    component: "q-chip",
    element: "img",
  });

  $: tab = typeof tabindex === "string" ? parseInt(tabindex, 10) : tabindex;
</script>

<a
  {href}
  class={classes}
  tabindex={tab}
  {...$$restProps}
  on:click
  aria-disabled={disable || undefined}
>
  {#if $$slots.leading}
    <slot name="leading" />
  {:else if img}
    <img class={imgClass} src={img} alt="Chip leading" />
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
    <img class="{imgClass} q-chip__img--trailing" src={imgRight} alt="Chip trailing" />
  {:else if iconRight}
    <QIcon name={iconRight} class="q-chip__icon" />
  {/if}
</a>
