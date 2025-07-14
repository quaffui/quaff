<script lang="ts">
  import { useSize } from "$composables";
  import { setupTooltipContext } from "$utils";
  import type { QAvatarProps } from "./props";

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

  const uid = $props.id();
  setupTooltipContext(`.q-avatar--${uid}`);

  const qSize = $derived(useSize(size, "q-avatar"));

  Q.classes("q-avatar", {
    bemClasses: {
      [shape]: true,
      [uid]: true,
    },
    classes: [qSize.class, props.class],
  });
</script>

<div {...props} class="q-avatar" style:--size={qSize.style}>
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
