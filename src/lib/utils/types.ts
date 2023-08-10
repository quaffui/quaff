export interface NativeProps {
  userClasses?: string;
  userStyles?: string;
}

export const NativePropsDefaults: NativeProps = {
  userClasses: undefined,
  userStyles: undefined,
};

export type QuaffSizes = "xs" | "sm" | "md" | "lg" | "xl";

export type CSSUnit = "px" | "%" | "em" | "ex" | "ch" | "rem" | "vw" | "vh" | "vmin" | "vmax";

export type CSSValue = `${number}${CSSUnit}`;

export interface QComponentDocs {
  name: string;
  description: string;
  docs: {
    props: QComponentProp[];
    slots: QComponentSlot[];
    methods: QComponentMethod[];
    events: QComponentEvent[];
  };
}

export interface QComponentProp {
  name: string;
  type: string;
  default?: any;
  description: string;
  clickableType?: boolean;
  optional?: boolean;
}

export interface QComponentSlot {
  name: string;
  description: string;
}

export interface QComponentType {
  name: string;
  description: string;
}

export interface QComponentEvent {
  name: string;
  type: string;
  description: string;
}

export interface QComponentMethod {
  name: string;
  type: string;
  description: string;
}

export function isNumber(input: any): input is number {
  return typeof input === "number" || !isNaN(Number(input));
}
