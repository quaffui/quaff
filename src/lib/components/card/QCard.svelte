<script lang="ts">
  import type { QCardProps } from "./props";

  // #region:    --- Props
  let {
    fill = false,
    flat = false,
    bordered = false,
    rounded = false,
    children,
    ...props
  }: QCardProps = $props();
  // #endregion: --- Props

  Q.classes("q-card", {
    bemClasses: {
      flat,
      bordered,
      rounded,
      fill,
      primary: fill === "primary",
      secondary: fill === "secondary",
      tertiary: fill === "tertiary",
    },
    classes: [props.class],
  });
</script>

<article {...props} class="q-card" data-quaff>
  {@render children?.()}
</article>
