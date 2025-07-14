<script lang="ts">
  import { setupTooltipContext } from "$utils";
  import type { QCardProps } from "./props";

  let {
    fill = false,
    flat = false,
    bordered = false,
    rounded = false,
    children,
    ...props
  }: QCardProps = $props();

  const uid = $props.id();
  const componentId = `q-card--${uid}`;

  setupTooltipContext(componentId);

  type ColorOptions = "primary" | "secondary" | "tertiary";

  const colorOptions: ColorOptions[] = ["primary", "secondary", "tertiary"] as const;

  const color = $derived.by(() => {
    if (fill) {
      return fill === true || !colorOptions.includes(fill as ColorOptions)
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
      [componentId]: true,
    },
    classes: [props.class],
  });
</script>

<article {...props} class="q-card">
  {@render children?.()}
</article>
