<script lang="ts">
  import { useSize } from "$lib/composables";
  import type { QAvatarProps } from "./props";

  export let shape: QAvatarProps["shape"] = "circle",
    size: QAvatarProps["size"] = "md",
    src: QAvatarProps["src"] = undefined,
    video: QAvatarProps["video"] = false,
    userClasses: QAvatarProps["userClasses"] = "";
  export { userClasses as class };

  $: sizeObj = useSize(size);
</script>

{#if video === true}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    class="q-avatar {sizeObj.class ? `q-avatar--${sizeObj.class}` : ''} {userClasses}"
    class:q-avatar--circle={shape === "circle"}
    class:q-avatar--round={shape === "rounded"}
    class:q-avatar--top-round={shape?.includes("top")}
    class:q-avatar--bottom-round={shape?.includes("bottom")}
    class:q-avatar--left-round={shape?.includes("left")}
    class:q-avatar--right-round={shape?.includes("right")}
    style:width={sizeObj.style}
    style:height={sizeObj.style}
    autoplay loop playsinline {...$$restProps} on:click>
    <source {src} type="video/mp4" />
  </video>
{:else if src !== undefined}
  <!-- svelte-ignore a11y-missing-attribute -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <img
    class="q-avatar {sizeObj.class ? `q-avatar--${sizeObj.class}` : ''} {userClasses}"
    class:q-avatar--circle={shape === "circle"}
    class:q-avatar--round={shape === "rounded"}
    class:q-avatar--top-round={shape?.includes("top")}
    class:q-avatar--bottom-round={shape?.includes("bottom")}
    class:q-avatar--left-round={shape?.includes("left")}
    class:q-avatar--right-round={shape?.includes("right")}
    style:width={sizeObj.style}
    style:height={sizeObj.style}
    {src} {...$$restProps} on:click />
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="q-avatar {sizeObj.class ? `q-avatar--${sizeObj.class}` : ''} {userClasses}"
    class:q-avatar--circle={shape === "circle"}
    class:q-avatar--round={shape === "rounded"}
    class:q-avatar--top-round={shape?.includes("top")}
    class:q-avatar--bottom-round={shape?.includes("bottom")}
    class:q-avatar--left-round={shape?.includes("left")}
    class:q-avatar--right-round={shape?.includes("right")}
    style:width={sizeObj.style}
    style:height={sizeObj.style}
    {...$$restProps} on:click>
    <slot />
  </div>
{/if}
