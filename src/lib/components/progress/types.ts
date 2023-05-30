import { type DefaultProps } from "$utils/types";

export interface QLinearProgressProps extends DefaultProps {
  value: number;
  from: "left" | "right";
  rounded: boolean;
}
