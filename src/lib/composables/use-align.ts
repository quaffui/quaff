export type JustifyOptions =
  | "left"
  | "center"
  | "right"
  | "between"
  | "around"
  | "evenly"
  | "stretch";

export type AlignOptions = "top" | "middle" | "bottom";

export type UseAlignOptions =
  | `${AlignOptions}`
  | `${JustifyOptions}`
  | `${AlignOptions} ${JustifyOptions}`
  | `${JustifyOptions} ${AlignOptions}`;

export interface UseAlignProps {
  align?: UseAlignOptions;
}

export const UseAlignPropsDefaults: UseAlignProps = {
  align: "top left",
};

export default function useAlign(align: UseAlignOptions = "top left") {
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
