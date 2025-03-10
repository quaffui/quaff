<svelte:options runes={true} />

<script lang="ts">
  import { useSize } from "$lib/composables/useSize";
  import type { QAvatarProps } from "./props";

  let {
    alt,
    shape = "circle",
    size = "md",
    src,
    video = false,
    children,
    videoAccessibility,
    ...props
  }: QAvatarProps = $props();

  const qSize = $derived(useSize(size, "q-avatar"));
  const qShape = $derived(`q-avatar--${shape}`);

  Q.classes("q-avatar", {
    classes: [qShape, qSize.class, props.class],
  });
</script>

<div {...props} class="q-avatar" style:--size={qSize.style} data-quaff>
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
