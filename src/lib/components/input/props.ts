import type { NativeProps } from "$lib/utils";
import type { HTMLAttributes } from "svelte/elements";

export interface QInputProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  dense?: boolean;
  disable?: boolean;
  error?: boolean;
  errorMessage?: string;
  filled?: boolean;
  hint?: string;
  label?: string;
  outlined?: boolean;
  rounded?: boolean;
  value: string;
}

export const QInputPropsDefaults = {
  dense: false,
  disable: false,
  error: false,
  errorMessage: undefined,
  filled: false,
  hint: undefined,
  label: undefined,
  outlined: false,
  rounded: false,
  value: "",
};
