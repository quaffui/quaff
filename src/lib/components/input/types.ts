import { type DefaultProps } from "$utils/types";

export interface QInputProps extends DefaultProps {
  bordered: boolean;
  error: boolean;
  errorMessage?: string;
  filled: boolean;
  hint?: string;
  label?: string;
  outlined: boolean;
  rounded: boolean;
}
