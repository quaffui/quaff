export type JustifyOptions =
  | "left"
  | "center"
  | "right"
  | "between"
  | "around"
  | "evenly"
  | "stretch";

export type AlignOptions = "top" | "middle" | "bottom";

export interface UseAlignProps {
  align?:
    | `${AlignOptions}`
    | `${JustifyOptions}`
    | `${AlignOptions} ${JustifyOptions}`
    | `${JustifyOptions} ${AlignOptions}`;
}

export default function useAlign<T extends UseAlignProps & { vertical?: boolean }>(props: T) {
  const align = props.align === undefined ? "top left" : props.align;

  const alignClass = align
    .split(" ")
    .map((a) => `${a}-align`)
    .join(" ");

  return ["between", "around", "evenly", "stretch"].some((alignment) =>
    align.split(" ").includes(alignment)
  )
    ? `flex ${alignClass}`
    : `${alignClass}`;
}
