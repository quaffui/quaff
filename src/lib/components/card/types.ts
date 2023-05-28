import { type UseAlignProps } from "$lib/composables/use-align.js";

export interface QCardProps {
  bordered: boolean;
  fill?: string | boolean;
  flat: boolean;
  round: boolean;
  title?: string;
}

export interface QCardSectionProps {
  horizontal: boolean;
}

export interface QCardActionsProps extends UseAlignProps {
  vertical: boolean;
}
