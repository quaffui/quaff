<script lang="ts">
  import { createClasses, createStyles } from "$lib/utils/props";
  import { isNumber } from "$lib/utils/types";
  import { sizes } from "$lib/composables/use-size";
  import type { Size } from "$lib/composables/use-size";
  import type { QIconProps } from "./props";

  export let size: QIconProps["size"] = "md",
    name: QIconProps["name"] = undefined,
    type: QIconProps["type"] = "outlined",
    filled: QIconProps["filled"] = false,
    svg: QIconProps["svg"] = undefined,
    img: QIconProps["img"] = undefined,
    imgAttributes: QIconProps["imgAttributes"] = {},
    color: QIconProps["color"] = undefined,
    userClasses: QIconProps["userClasses"] = undefined,
    userStyles: QIconProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  let sizeStyle: string | undefined;

  $: {
    if (isNumber(size)) {
      sizeStyle = `${size}px`;
    } else if (typeof size === "string" && !sizes.includes(size as Size)) {
      sizeStyle = size;
    } else {
      sizeStyle = undefined;
    }
  }

  $: classes = createClasses([type, filled && "filled", sizes.includes(size as Size) && size], {
    component: "q-icon",
    userClasses,
    quaffClasses: [color && `text-${color}`],
  });

  $: style = createStyles(
    {
      "--size": sizeStyle,
    },
    userStyles
  );

  $: imgAttrs = {
    alt: "Quaff Image Icon",
    ...imgAttributes,
  };
</script>

<i class={classes} {style}>
  {#if name !== undefined}
    {name}
  {:else if img !== undefined}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src={img} {...imgAttrs} />
  {:else if svg !== undefined}
    <slot />
  {/if}
</i>
