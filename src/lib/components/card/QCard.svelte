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

  const colorOptions: (typeof fill)[] = ["primary", "secondary", "tertiary"];

  const color = $derived.by(() => {
    if (fill) {
      return colorOptions.includes(fill) ? `${fill}-container` : "surface-variant";
    }
    return "surface";
  });

  Q.classes("q-card", {
    bemClasses: {
      flat,
      bordered,
      rounded,
    },
    classes: [color, props.class],
  });
</script>

<article {...props} class="q-card" data-quaff>
  {@render children?.()}
</article>
