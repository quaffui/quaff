<svelte:options runes={true} />

<script lang="ts">
  import { useSize } from "$lib/composables/useSize";
  import type { AvatarProps } from "./props";

  let {
    alt,
    shape = "circle",
    size = "md",
    src,
    video = false,
    children,
    videoAccessibility,
    ...props
  }: AvatarProps = $props();

  const kSize = $derived(useSize(size, "q-avatar"));
  const kShape = $derived(`q-avatar--${shape}`);

  __Quaff__.classes("q-avatar", {
    classes: [kShape, kSize.class, props.class],
  });
</script>

<div {...props} class="q-avatar" {...__Quaff__.classes} style:--size={kSize.style}>
  {#if video}
    <video>
      <source {src} type="video/mp4" />
      <track kind="captions" />
      {@render videoAccessibility?.()}
    </video>
  {:else if src !== undefined}
    <img {src} {alt} />
  {:else}
    {@render children?.()}
  {/if}
</div>

<style lang="scss">
  @import "./avatar.scss";
</style>
