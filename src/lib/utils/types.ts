export interface NativeProps {
  userClasses?: string | null;
  userStyles?: string | null;
}

export const NativePropsDefaults: NativeProps = {
  userClasses: undefined,
  userStyles: undefined,
};

export type QuaffSizes = "none" | "xs" | "sm" | "md" | "lg" | "xl";

export type CssUnit = "px" | "%" | "em" | "ex" | "ch" | "rem" | "vw" | "vh" | "vmin" | "vmax";

export type CssValue = `${number}${CssUnit}`;

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
  default?: unknown;
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

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
