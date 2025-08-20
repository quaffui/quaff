<script lang="ts">
  import { useSize } from "$composables";
  import type { QIconProps } from "./props";

  // #region:    --- Props
  let {
    size = "md",
    name,
    type = "outlined",
    filled = false,
    svg,
    img,
    imgAttributes = {},
    color,
    children,
    ...props
  }: QIconProps = $props();
  // #endregion: --- Props

  // #region:    --- Derived values
  const qSize = $derived(useSize(size, "q-icon"));

  const parsedColor = $derived(color && `var(--${color.replace("#", "")}, ${color})`);

  const imgAttrs = $derived({
    alt: "Quaff Image Icon",
    ...imgAttributes,
  });

  const typeClass = $derived(`q-icon--${type}`);
  // #endregion: --- Derived values

  Q.classes("q-icon", {
    bemClasses: {
      filled,
    },
    classes: [typeClass, qSize.class, props.class],
  });
</script>

<i {...props} class="q-icon" style:--size={qSize.style} style:color={parsedColor} data-quaff>
  {#if name !== undefined}
    {name}
  {:else if img !== undefined}
    <img src={img} {...imgAttrs} />
  {:else if svg}
    {@html svg}
  {:else}
    {@render children?.()}
  {/if}
</i>
