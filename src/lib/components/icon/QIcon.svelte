<svelte:options runes={true} />

<script lang="ts">
  import type { QIconProps } from "./props";
  import { useSize } from "$lib/composables/useSize";

  let {
    size = "md",
    name,
    type = "outlined",
    filled = false,
    svg,
    img,
    imgAttributes = {},
    color,
    children,
    ...props
  }: QIconProps = $props();

  const qSize = $derived(useSize(size, "q-icon"));

  const imgAttrs = $derived({
    alt: "Quaff Image Icon",
    ...imgAttributes,
  });

  const typeClass = $derived(`q-icon--${type}`);

  __Quaff__.classes("q-icon", {
    bemClasses: {
      filled,
    },
    classes: [typeClass, color && `text-${color}`, qSize.class, props.class],
  });
</script>

<i {...props} class="q-icon" {...__Quaff__.classes} style:--size={qSize.style}>
  {#if name !== undefined}
    {name}
  {:else if img !== undefined}
    <img src={img} {...imgAttrs} />
  {:else if svg !== undefined}
    {@render children?.()}
  {/if}
</i>

<style lang="scss">
  @import "./QIcon.scss";
</style>
