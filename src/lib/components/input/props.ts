import { type NativeProps } from "$utils/types";

export interface QInputProps extends NativeProps {
  bordered: boolean;
  error: boolean;
  errorMessage?: string;
  filled: boolean;
  hint?: string;
  label?: string;
  outlined: boolean;
  rounded: boolean;
  value: string;
}
export const QInputPropsDefaults = {
  bordered: false,
  error: false,
  errorMessage: undefined,
  filled: false,
  hint: undefined,
  label: undefined,
  outlined: false,
  rounded: false,
  value: "",
};
