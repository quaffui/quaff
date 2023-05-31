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

export const UseAlignPropsDefaults: UseAlignProps = {
  align: "top left",
};

export default function useAlign(align: UseAlignProps["align"] = "top left") {
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
