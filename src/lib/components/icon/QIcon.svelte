<script lang="ts">
  import { useSize } from "$lib/composables";
  import { createClasses, createStyles } from "$lib/utils";
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

  $: sizeObj = useSize(size);

  $: classes = createClasses([type, filled && "filled", sizeObj.class], {
    component: "q-icon",
    userClasses,
    quaffClasses: [color && `text-${color}`],
  });

  $: style = createStyles(
    {
      "--size": sizeObj.style,
    },
    userStyles
  );

  $: imgAttrs = {
    alt: "Quaff Image Icon",
    ...imgAttributes,
  };
</script>

<i class={classes} {style} {...$$restProps}>
  {#if name !== undefined}
    {name}
  {:else if img !== undefined}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src={img} {...imgAttrs} />
  {:else if svg !== undefined}
    <slot />
  {/if}
</i>
