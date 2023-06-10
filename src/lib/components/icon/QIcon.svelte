<script lang="ts">
  import useSize from "$lib/composables/use-size";
  import { createClasses } from "$lib/utils/props";
  import type { QIconProps } from "./props";

  export let size: QIconProps["size"] = "md",
    name: QIconProps["name"] = undefined,
    type: QIconProps["type"] = "outlined",
    fill: QIconProps["fill"] = false,
    svg: QIconProps["svg"] = undefined,
    img: QIconProps["img"] = undefined,
    imgAttributes: QIconProps["imgAttributes"] = {},
    color: QIconProps["color"] = undefined,
    userClasses: QIconProps["userClasses"] = undefined;
  export { userClasses as class };

  $: classes = createClasses([
    "q-icon",
    `q-icon__${type}`,
    fill && "fill",
    useSize(size),
    color && `${color}-text`,
    userClasses,
  ]);

  $: imgAttrs = {
    alt: "Quaff Image Icon",
    ...imgAttributes,
  };
</script>

<i class={classes}>
  {#if name !== undefined}
    {name}
  {:else if img !== undefined}
    <img src={img} {...imgAttrs} />
  {:else if svg !== undefined}
    <slot />
  {/if}
</i>

<style lang="scss">
  .q-icon {
    &__outlined {
      --font-icon: "Material Symbols Outlined";
    }
    &__rounded {
      --font-icon: "Material Symbols Rounded";
    }
    &__sharp {
      --font-icon: "Material Symbols Sharp";
    }
  }
</style>
