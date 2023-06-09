<script lang="ts">
  import { createClasses } from "$lib/utils/props";
  import { type QChipProps } from "./props";

  export let content: QChipProps["content"] = undefined,
    icon: QChipProps["icon"] = undefined,
    iconRight: QChipProps["iconRight"] = undefined,
    disable: QChipProps["disable"] = false,
    responsive: QChipProps["responsive"] = false,
    vertical: QChipProps["vertical"] = false,
    round: QChipProps["round"] = false,
    outlined: QChipProps["outlined"] = false,
    size: QChipProps["size"] = "medium",
    tabindex: QChipProps["tabindex"] = undefined,
    href: QChipProps["href"] = "javascript:void(0)",
    userClasses: QChipProps["userClasses"] = undefined;
  export { userClasses as class };

  $: img = icon?.startsWith("img:") ? icon.slice(4) : undefined;
  $: imgRight = iconRight?.startsWith("img:") ? iconRight.slice(4) : undefined;

  $: sizeClass = ["small", "large"].includes(size) ? size : undefined;

  $: classes = createClasses([
    "q-chip",
    "chip",
    disable && "disabled",
    vertical && "vertical",
    round && "round",
    (outlined || disable) && "border",
    sizeClass,
    userClasses,
  ]);

  $: imgClass = createClasses([responsive && "responsive"]);

  $: tab = typeof tabindex === "string" ? parseInt(tabindex, 10) : tabindex;
</script>

<a {href} class={classes} tabindex={tab} {...$$restProps} on:click aria-disabled={disable}>
  {#if $$slots.leading}
    <slot name="leading" />
  {:else if img}
    <img class={imgClass} src={img} alt="Chip leading" />
  {:else if icon}
    <i class="small">{icon}</i>
  {/if}
  {#if content}
    {content}
  {:else}
    <slot />
  {/if}
  {#if $$slots.trailing}
    <slot name="trailing" />
  {:else if imgRight}
    <img class={imgClass} src={imgRight} alt="Chip trailing" />
  {:else if iconRight}
    <i class="small">{iconRight}</i>
  {/if}
</a>

<style lang="scss">
  .q-chip.disabled {
    border-color: var(--on-surface);
    opacity: 50%;
    pointer-events: none;
  }
</style>
