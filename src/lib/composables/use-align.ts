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

const alignMap = {
  left: "start",
  center: "center",
  right: "end",
  between: "between",
  around: "around",
  evenly: "evenly",
  // @todo - justify-stretch isn't possible
  stretch: "stretch",
} as const;

export function useAlign(align: UseAlignOptions = "top left") {
  const alignments = align
    .split(" ")
    .map((entry) => {
      const val = alignMap[entry as keyof typeof alignMap];
      return val ? `justify-${val}` : false;
    })
    .filter((entry) => typeof entry === "string");

  return ["flex", ...alignments].join(" ");
}
