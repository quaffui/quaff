<script lang="ts">
  import type { QCardProps } from "./props";

  let {
    fill = false,
    flat = false,
    bordered = false,
    rounded = false,
    children,
    ...props
  }: QCardProps = $props();

  type ColorOptions = "primary" | "secondary" | "tertiary";

  const colorOptions: ColorOptions[] = ["primary", "secondary", "tertiary"] as const;

  const color = $derived.by(() => {
    if (fill) {
      return typeof fill === "boolean" || !colorOptions.includes(fill as ColorOptions)
        ? "surface-variant"
        : fill;
    }

    return "surface";
  });

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
