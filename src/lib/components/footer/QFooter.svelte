<script lang="ts">
  import { useSize } from "$lib/composables";
  import QContext from "$lib/classes/QContext.svelte";
  import type { LayoutContext } from "../layout/QLayout.svelte";
  import type { QFooterProps } from "./props";

  let {
    value = $bindable(true),
    border = false,
    elevate = false,
    height,
    children,
    ...props
  }: QFooterProps = $props();

  const ctx = QContext.get<LayoutContext>("layout");

  Q.classes("q-footer", {
    bemClasses: {
      bordered: border,
      elevated: elevate,
      fixed: ctx?.value?.footer?.fixed,
    },
    classes: [props.class],
  });

  const heightStyle = $derived(!ctx ? useSize(height).style : null);
</script>

{#if value}
  <footer {...props} class="q-footer" {...Q.classes} style:height={heightStyle}>
    <nav>
      {@render children?.()}
    </nav>
  </footer>
{/if}
