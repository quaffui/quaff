import type { NativeProps } from "$lib/utils/types";
import { NativePropsDefaults } from "$lib/utils/types";

export interface QRadioProps extends NativeProps {
  value: string;
  label: string;
  selected: any;
}

export const QRadioPropsDefaults: QRadioProps = {
  value: "",
  label: "",
  selected: undefined,
  ...NativePropsDefaults,
};
