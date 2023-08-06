<script lang="ts">
  import { createClasses, createStyles } from "$lib/utils/props";
  import { isNumber } from "$lib/utils/types";
  import type { QIconProps } from "./props";

  export let size: QIconProps["size"] = "md",
    name: QIconProps["name"] = undefined,
    type: QIconProps["type"] = "outlined",
    fill: QIconProps["fill"] = false,
    svg: QIconProps["svg"] = undefined,
    img: QIconProps["img"] = undefined,
    imgAttributes: QIconProps["imgAttributes"] = {},
    color: QIconProps["color"] = undefined,
    userClasses: QIconProps["userClasses"] = undefined,
    userStyles: QIconProps["userStyles"] = undefined;
  export { userClasses as class, userStyles as style };

  $: sizeStyle = isNumber(size) ? `${size}px` : undefined;

  $: classes = createClasses([type, fill && "fill", size], {
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
