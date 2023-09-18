<script lang="ts">
  import { useSize } from "$lib/composables";
  import type { QIconProps } from "./props";

  export let size: QIconProps["size"] = "md",
    name: QIconProps["name"] = undefined,
    type: QIconProps["type"] = "outlined",
    filled: QIconProps["filled"] = false,
    svg: QIconProps["svg"] = undefined,
    img: QIconProps["img"] = undefined,
    imgAttributes: QIconProps["imgAttributes"] = {},
    color: QIconProps["color"] = undefined,
    userClasses: QIconProps["userClasses"] = "";
  export { userClasses as class };

  $: sizeObj = useSize(size);

  $: sizeClass = sizeObj.class && sizeObj.class !== "md" ? `q-icon--${sizeObj.class}` : "";

  $: imgAttrs = {
    alt: "Quaff Image Icon",
    ...imgAttributes,
  };
</script>

<i
  class="q-icon q-icon--{type} {sizeClass} {color ? `text-${color}` : ''} {userClasses}"
  class:q-icon--filled={filled}
  style:--size={sizeObj.style}
  {...$$restProps}
>
  {#if name !== undefined}
    {name}
  {:else if img !== undefined}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src={img} {...imgAttrs} />
  {:else if svg !== undefined}
    <slot />
  {/if}
</i>
