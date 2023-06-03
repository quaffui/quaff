<script lang="ts">
  import { createClasses, createStyles } from "$lib/utils/props";
  import type { QAvatarProps } from "./props";

  export let shape: QAvatarProps["shape"] = "circle",
    size: QAvatarProps["size"] = "md",
    src: QAvatarProps["src"],
    video: QAvatarProps["video"] = false,
    userClasses: QAvatarProps["userClasses"] = undefined,
    userStyles: QAvatarProps["userStyles"] = undefined;
  export { userClasses as class };
  export { userStyles as style };

  $: shapeClass = createClasses([
    shape === "circle" && "circle",
    shape === "rounded" && "round",
    shape.includes("top") && "top-round",
    shape.includes("bottom") && "bottom-round",
    shape.includes("left") && "left-round",
    shape.includes("right") && "right-round",
  ]);

  $: sizeClass =
    size === "xs"
      ? "tiny"
      : size === "sm"
      ? "small"
      : size === "md"
      ? video === true || shape.includes("round")
        ? "medium"
        : ""
      : size === "lg"
      ? "large"
      : size === "xl"
      ? "extra"
      : undefined;

  $: classes = createClasses([shapeClass, sizeClass, userClasses]);

  $: style =
    sizeClass === undefined
      ? createStyles(
          {
            width: size,
            height: size,
          },
          userStyles
        )
      : userStyles;
</script>

{#if video === true}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video class={classes} {style} autoplay loop playsinline {...$$restProps}>
    <source {src} type="video/mp4" />
  </video>
{:else}
  <!-- svelte-ignore a11y-missing-attribute -->
  <img class={classes} {style} {src} {...$$restProps} />
{/if}
