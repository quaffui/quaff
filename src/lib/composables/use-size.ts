export const useSizeClasses = {
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
