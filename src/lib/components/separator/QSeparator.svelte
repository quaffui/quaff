<script lang="ts">
  import { createClasses, createStyles } from "$utils/props";
  import type { QSeparatorProps } from "./props";

  export let spacing: QSeparatorProps["spacing"] = "none",
    inset: QSeparatorProps["inset"] = false,
    vertical: QSeparatorProps["vertical"] = false,
    color: QSeparatorProps["color"] = undefined,
    size: QSeparatorProps["size"] = "1px",
    text: QSeparatorProps["text"] = undefined,
    textAlign: QSeparatorProps["textAlign"] = vertical === true ? "middle" : "center",
    userClasses: QSeparatorProps["userClasses"] = undefined,
    userStyles: QSeparatorProps["userStyles"] = undefined;
  export { userClasses as class };
  export { userStyles as style };

  $: spacingClass =
    (spacing === "sm"
      ? "small-"
      : spacing === "md"
      ? "medium-"
      : spacing === "lg"
      ? "large-"
      : "") + "divider";

  let orientationClass: "vertical" | "horizontal";
  $: orientationClass = vertical === true ? "vertical" : "horizontal";

  $: orientationStyle =
    vertical === true
      ? {
          width: size,
        }
      : {
          height: size,
        };

  $: insetStyle =
    inset === true
      ? vertical === true
        ? { paddingBlock: "16px" }
        : { paddingInline: "16px" }
      : undefined;

  $: containerStyle = createStyles({
    ...insetStyle,
    display: "flex",
    alignItems: "center",
    flexDirection: vertical === true ? "column" : undefined,
    [vertical === true ? "height" : "width"]: "100%",
  });

  $: classes = createClasses([
    "q-separator",
    "q-separator--" + orientationClass,
    spacingClass,
    color,
    userClasses,
  ]);

  $: style = createStyles(
    {
      ...orientationStyle,
    },
    userStyles
  );
</script>

{#if text !== undefined}
  <div class="q-separator__wrapper" style={containerStyle}>
    {#if (vertical === true && textAlign !== "top") || (vertical === false && textAlign !== "left")}
      <hr class={classes} {style} aria-orientation={orientationClass} />
    {/if}
    <div class={vertical ? "q-py-sm" : "q-px-sm"}>{text}</div>
    {#if (vertical === true && textAlign !== "bottom") || (vertical === false && textAlign !== "right")}
      <hr class={classes} {style} aria-orientation={orientationClass} />
    {/if}
  </div>
{:else}
  <div class="q-separator__wrapper" style={containerStyle}>
    <hr class={classes} {style} aria-orientation={orientationClass} />
  </div>
{/if}

<style lang="scss">
  .q-separator {
    background-color: var(--outline);
    border: none;
    flex: 1 1 auto;
  }
</style>
