<script lang="ts">
  import type { IconProps } from "./props";
  import { useSize } from "$lib/composables/use-size";

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
  }: IconProps = $props();

  const kSize = $derived(useSize(size, "q-icon"));

  const imgAttrs = $derived({
    alt: "Quaff Image Icon",
    ...imgAttributes,
  });

  const typeClass = $derived(`q-icon--${type}`);
  const colorClass = $derived(color ? `text-${color}` : "");

  Quaff.classes("q-icon", {
    bemClasses: {
      filled,
    },
    classes: [typeClass, color && `text-${color}`, kSize.class, props.class],
  });
</script>

<i {...props} class="q-icon" {...Quaff.classes} style:--size={kSize.style}>
  {#if name !== undefined}
    {name}
  {:else if img !== undefined}
    <img src={img} {...imgAttrs} />
  {:else if svg !== undefined}
    {@render children?.()}
  {/if}
</i>

<style lang="scss">
  @import "./icon.scss";
</style>
