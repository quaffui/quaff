<script lang="ts">
  import type { QCardProps, QCardFillColors } from "./props";

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

  // #region:    --- Non-reactive variables
  const colorOptions: QCardFillColors[] = ["primary", "secondary", "tertiary"] as const;
  // #endregion: --- Non-reactive variables

  // #region:    --- Derived values
  const color = $derived.by(() => {
    if (fill) {
      return fill === true || !colorOptions.includes(fill as QCardFillColors)
        ? "surface-variant"
        : fill;
    }

    return "surface";
  });
  // #endregion: --- Derived values

  Q.classes("q-card", {
    bemClasses: {
      flat,
      bordered,
      rounded,
      fill,
      [color]: fill && color !== "surface",
    },
    classes: [props.class],
  });
</script>

<article {...props} class="q-card" data-quaff>
  {@render children?.()}
</article>
