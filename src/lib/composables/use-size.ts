export type Size = "xs" | "sm" | "md" | "lg" | "xl";

export const sizes: Size[] = ["xs", "sm", "md", "lg", "xl"];

// @todo change classes or deprecate
export const useSizeClasses: { [key in Size]: string } = {
  xs: "tiny",
  sm: "small",
  md: "",
  lg: "large",
  xl: "extra",
};

export interface useSizeProps {
  size?: string;
}

export default function (sizeProp: any) {
  // return sizeStyle
  return sizeProp in useSizeClasses
    ? useSizeClasses[sizeProp as keyof typeof useSizeClasses]
    : null;
}
