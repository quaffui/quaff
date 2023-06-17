import { type NativeProps } from "$utils/types";

export type QSelectOption = string | { label: string; value: string };

export interface QSelectProps extends NativeProps {
  value: string | string[];
  multiple?: boolean;
  options: QSelectOption[];
  bordered?: boolean;
  disable: boolean;
  error: boolean;
  errorMessage?: string;
  filled: boolean;
  hint?: string;
  label?: string;
  outlined?: boolean;
  rounded?: boolean;
}

export const QSelectPropsDefaults = {
  bordered: false,
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
