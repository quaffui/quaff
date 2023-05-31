<script lang="ts">
  import { stringifyClasses, stringifyStyles } from "$utils/props";
  import { type QSeparatorProps } from "./props";

  export let spacing: QSeparatorProps["spacing"] = "none",
    inset: QSeparatorProps["inset"] = false,
    vertical: QSeparatorProps["vertical"] = false,
    color: QSeparatorProps["color"] = undefined,
    size: QSeparatorProps["size"] = "1px",
    text: QSeparatorProps["text"] = undefined,
    textAlign: QSeparatorProps["textAlign"] = vertical === true ? "middle" : "center",
    className: QSeparatorProps["className"] = undefined,
    styleName: QSeparatorProps["styleName"] = undefined;
  export { className as class };
  export { styleName as style };

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
          flex: "1 1 auto",
        }
      : {
          height: size,
          flex: "1 1 auto",
        };

  $: insetStyle =
    inset === true
      ? vertical === true
        ? { paddingBlock: "16px" }
        : { paddingInline: "16px" }
      : undefined;

  $: containerStyle = stringifyStyles({
    ...insetStyle,
    display: "flex",
    alignItems: "center",
    flexDirection: vertical === true ? "column" : undefined,
    [vertical === true ? "height" : "width"]: "100%",
  });

  $: classes = stringifyClasses([
    "q-separator",
    "q-separator--" + orientationClass,
    spacingClass,
    color,
    className,
  ]);

  $: style = stringifyStyles(
    {
      ...orientationStyle,
      backgroundColor: "var(--outline)",
      border: "none",
    },
    styleName
  );
</script>

{#if text !== undefined}
  <div style={containerStyle}>
    {#if (vertical === true && textAlign !== "top") || (vertical === false && textAlign !== "left")}
      <hr class={classes} {style} aria-orientation={orientationClass} />
    {/if}
    <div class={vertical ? "q-py-sm" : "q-px-sm"}>{text}</div>
    {#if (vertical === true && textAlign !== "bottom") || (vertical === false && textAlign !== "right")}
      <hr class={classes} {style} aria-orientation={orientationClass} />
    {/if}
  </div>
{:else}
  <div style={containerStyle}>
    <hr class={classes} {style} aria-orientation={orientationClass} />
  </div>
{/if}
