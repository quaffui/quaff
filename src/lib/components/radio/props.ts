import type { NativeProps } from "$lib/utils/types";
import { NativePropsDefaults } from "$lib/utils/types";
import type { HTMLAttributes } from "svelte/elements";

export interface QRadioProps extends NativeProps, HTMLAttributes<HTMLLabelElement> {
  value: string;
  label?: string;
  selected?: any;
  disable?: boolean;
}

export const QRadioPropsDefaults: QRadioProps = {
  value: "",
  label: "",
  selected: undefined,
  disable: false,
  ...NativePropsDefaults,
};
