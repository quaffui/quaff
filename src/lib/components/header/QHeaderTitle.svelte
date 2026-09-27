<!--
@component
QHeaderTitle positions a title or central control within QHeader.
-->

<script lang="ts">
  import type { QHeaderTitleProps } from "./props";

  let { shrink = false, subtitle, align, children, ...props }: QHeaderTitleProps = $props();

  Q.classes("q-header-title", {
    bemClasses: {
      shrink,
      subtitle: !!subtitle,
      "align-start": align === "start",
      "align-center": align === "center",
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-header-title" data-quaff>
  {#if subtitle}
    <div class="q-header-title__text">{@render children?.()}</div>
    <div class="q-header-title__subtitle">
      {#if typeof subtitle === "string"}
        {subtitle}
      {:else}
        {@render subtitle()}
      {/if}
    </div>
  {:else}
    {@render children?.()}
  {/if}
</div>
