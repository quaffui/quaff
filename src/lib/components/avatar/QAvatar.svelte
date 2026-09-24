<!--
@component
Avatars can be used in many different ways as with icons or for user profile images/videos, for example. They can have many different shapes, the default one being a circle.
-->

<script lang="ts">
  import { useSize } from "$composables/useSize";
  import type { QEvent } from "$utils/types/quaff";
  import type { QAvatarProps } from "./props";

  // #region:    --- Props
  let {
    alt = "",
    shape = "circle",
    size = "sm",
    src,
    sources,
    video = false,
    paused = $bindable(false),
    children,
    videoAccessibility,
    ...props
  }: QAvatarProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const qSize = $derived(useSize(size, "q-avatar"));
  // #endregion: --- Derived values

  let videoElement = $state<HTMLVideoElement>();

  $effect(() => {
    if (videoElement) {
      updatePlayback(videoElement, paused);
    }
  });

  function syncPaused(event: QEvent<Event, HTMLVideoElement>) {
    paused = event.currentTarget.paused;
  }

  async function updatePlayback(element: HTMLVideoElement, shouldPause: boolean) {
    if (shouldPause) {
      element.pause();
      return;
    }

    try {
      await element.play();
    } catch {
      // Playback can be blocked or interrupted by pausing before loading finishes.
      if (element === videoElement) {
        paused = element.paused;
      }
    }
  }

  Q.classes("q-avatar", {
    bemClasses: { [shape]: true },
    classes: [qSize.class, props.class],
  });
</script>

<div {...props} class="q-avatar" style:--size={qSize.style} data-quaff>
  {#if video}
    <video
      bind:this={videoElement}
      autoplay={!paused}
      onplay={syncPaused}
      onpause={syncPaused}
      loop
      muted
      playsinline
    >
      {#if sources?.length}
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
