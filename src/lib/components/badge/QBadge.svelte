<script lang="ts">
  import type { QBadgeProps } from "./props";

  // #region:    --- Props
  let { label, floating = false, children, ...props }: QBadgeProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const displayedLabel = $derived.by(() => {
    if (typeof label !== "number") {
      return label;
    }

    return label > 999 ? "999+" : Math.max(0, label);
  });
  // #endregion: --- Derived values

  Q.classes("q-badge", {
    bemClasses: { floating },
    classes: [props.class],
  });
</script>

<span
  {...props}
  class="q-badge"
  role={props.role ?? (props["aria-label"] || props["aria-labelledby"] ? "img" : undefined)}
  data-quaff
>
  {#if label !== undefined}
    {displayedLabel}
  {:else}
    {@render children?.()}
  {/if}
</span>
