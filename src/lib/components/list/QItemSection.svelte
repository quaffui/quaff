<script lang="ts">
  import { stringifyClasses, stringifyStyles } from "$lib/utils/props";
  import { type QItemSectionProps } from "./props";

  export let thumbnail: QItemSectionProps["thumbnail"] = false,
    video: QItemSectionProps["video"] = false,
    icon: QItemSectionProps["icon"] = false,
    avatar: QItemSectionProps["avatar"] = false;

  $: classes = stringifyClasses([
    `q-item__section`,
    icon
      ? "q-item__section--icon"
      : avatar
      ? "q-item__section--avatar"
      : thumbnail
      ? "q-item__section--thumbnail"
      : video
      ? "q-item__section--video"
      : undefined,
  ]);

  $: styles = stringifyStyles({});
</script>

<div class={classes}>
  <slot />
</div>

<style lang="sass">
  .q-item__section
    &--video
      width: 114px
      height: 64px
</style>
