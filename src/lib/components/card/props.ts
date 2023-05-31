import { UseAlignPropsDefaults, type UseAlignProps } from "$composables/use-align.js";
import { NativePropsDefaults, type NativeProps } from "$utils/types";

export interface QCardProps extends NativeProps {
  bordered: boolean;
  fill?: string | boolean;
  flat: boolean;
  round: boolean;
  title?: string;
}

export const QCardPropsDefaults: QCardProps = {
  bordered: false,
  fill: undefined,
  flat: false,
  round: false,
  title: undefined,
  ...NativePropsDefaults,
};

export interface QCardSectionProps extends NativeProps {
  horizontal: boolean;
}

export const QCardSectionPropsDefaults: QCardSectionProps = {
  horizontal: false,
  ...NativePropsDefaults,
};

export interface QCardActionsProps extends UseAlignProps, NativeProps {
  vertical: boolean;
}

export const QCardActionsProps: QCardActionsProps = {
  vertical: false,
  ...UseAlignPropsDefaults,
  ...NativePropsDefaults,
};
