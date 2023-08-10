<script lang="ts">
  import { useSize } from "$lib/composables/use-size";
  import { createClasses, createStyles } from "$lib/utils/props";
  import type { QAvatarProps } from "./props";

  export let shape: QAvatarProps["shape"] = "circle",
    size: QAvatarProps["size"] = "md",
    src: QAvatarProps["src"] = undefined,
    video: QAvatarProps["video"] = false,
    userClasses: QAvatarProps["userClasses"] = undefined,
    userStyles: QAvatarProps["userStyles"] = undefined;
  export { userClasses as class };
  export { userStyles as style };

  $: sizeObj = useSize(size);

  $: shapeClass = createClasses([
    shape === "circle" && "circle",
    shape === "rounded" && "round",
    shape!.includes("top") && "top-round",
    shape!.includes("bottom") && "bottom-round",
    shape!.includes("left") && "left-round",
    shape!.includes("right") && "right-round",
  ]);

  $: classes = createClasses([shapeClass, sizeObj.class], {
    component: "q-avatar",
    userClasses,
  });

  $: style = createStyles(
    {
      width: sizeObj.style,
      height: sizeObj.style,
    },
    userStyles
  );
</script>

{#if video === true}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video class={classes} {style} autoplay loop playsinline {...$$restProps} on:click>
    <source {src} type="video/mp4" />
  </video>
{:else if src !== undefined}
  <!-- svelte-ignore a11y-missing-attribute -->
  <img class={classes} {style} {src} {...$$restProps} on:click />
{:else}
  <div class={classes} {style} {...$$restProps} on:click>
    <slot />
  </div>
{/if}
