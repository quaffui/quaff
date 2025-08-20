<script lang="ts">
  import { useSize } from "$composables";
  import type { QAvatarProps } from "./props";

  // #region:    --- Props
  let {
    alt,
    shape = "circle",
    size = "md",
    src,
    sources,
    video = false,
    children,
    videoAccessibility,
    ...props
  }: QAvatarProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const qSize = $derived(useSize(size, "q-avatar"));
  const qShape = $derived(`q-avatar--${shape}`);
  // #endregion: --- Derived values

  Q.classes("q-avatar", {
    classes: [qShape, qSize.class, props.class],
  });
</script>

<div {...props} class="q-avatar" style:--size={qSize.style} data-quaff>
  {#if video}
    <video autoplay loop muted playsinline>
      {#if sources && sources.length > 0}
        {#each sources as { src, type } (type)}
          <source {src} {type} />
        {/each}
      {:else if src}
        <source {src} type="video/mp4" />
      {/if}

      {@render videoAccessibility?.()}
    </video>
  {:else if src}
    <img {src} {alt} />
  {:else}
    {@render children?.()}
  {/if}
</div>
