<script lang="ts">
  import type { QTooltipProps } from "./props";

  let { value, position = "bottom", children, ...props }: QTooltipProps = $props();

  Q.classes("q-tooltip", {
    bemClasses: {
      active: value,
      [position]: true,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-tooltip" {...Q.classes}>
  {@render children?.()}
</div>
