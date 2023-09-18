import type { HTMLAttributes } from "svelte/elements";
import { NativePropsDefaults } from "$lib/utils";
import type { NativeProps } from "$lib/utils";

export interface QRadioProps extends NativeProps, HTMLAttributes<HTMLLabelElement> {
  value: string;
  label?: string;
  selected?: unknown;
  disable?: boolean;
}

export const QRadioPropsDefaults: QRadioProps = {
  value: "",
  label: "",
  selected: undefined,
  disable: false,
  ...NativePropsDefaults,
};
