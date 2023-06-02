export const useSizeDefaults = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 38,
  xl: 46,
};

export interface useSizeProps {
  size?: string;
}

export default function <T extends useSizeProps>(props: T, sizes = useSizeDefaults) {
  // return sizeStyle
  return {
    fontSize:
      props.size !== undefined
        ? props.size in sizes
          ? `${sizes[props.size as keyof typeof sizes]}px`
          : props.size
        : null,
  };
}
