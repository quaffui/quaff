<script lang="ts">
  import { stringifyClasses, stringifyStyles } from "$lib/utils/props";
  import { QAvatarPropsDefault, type QAvatarProps } from "./props";

  export let shape: QAvatarProps["shape"] = "circle",
    size: QAvatarProps["size"] = "md",
    src: QAvatarProps["src"] = "https://www.beercss.com/beer-and-woman.jpg",
    video: QAvatarProps["video"] = false,
    userClasses: QAvatarProps["userClasses"] = undefined,
    userStyles: QAvatarProps["userStyles"] = undefined;
  export { userClasses as class };
  export { userStyles as style };

  $: shapeClass = stringifyClasses([
    shape === "circle" && "circle",
    shape === "rounded" && "round",
    shape.includes("top") && "top-round",
    shape.includes("bottom") && "bottom-round",
    shape.includes("left") && "left-round",
    shape.includes("right") && "right-round",
  ]);

  $: if (video === true && src === QAvatarPropsDefault.src) {
    src = "https://www.beercss.com/dance.mp4";
  }

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

  $: classes = stringifyClasses([shapeClass, sizeClass, userClasses]);

  $: style =
    sizeClass === undefined
      ? stringifyStyles(
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
