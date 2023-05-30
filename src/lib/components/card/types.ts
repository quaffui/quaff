import { type UseAlignProps } from "$composables/use-align.js";
import { type DefaultProps } from "$utils/types";

export interface QCardProps extends DefaultProps {
  bordered: boolean;
  fill?: string | boolean;
  flat: boolean;
  round: boolean;
  title?: string;
}

export interface QCardSectionProps extends DefaultProps {
  horizontal: boolean;
}

export interface QCardActionsProps extends UseAlignProps, DefaultProps {
  vertical: boolean;
}
