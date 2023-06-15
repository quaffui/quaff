export interface NativeProps {
  userClasses?: string;
  userStyles?: string;
}

export const NativePropsDefaults: NativeProps = {
  userClasses: undefined,
  userStyles: undefined,
};

export interface QComponentDocs {
  name: string;
  description: string;
  docs: {
    props: QComponentProp[];
    slots: QComponentSlot[];
    types: QComponentType[];
  };
}

export interface QComponentProp {
  name: string;
  type: string;
  default?: any;
  description: string;
  clickableType?: true;
  optional?: true;
}

export interface QComponentSlot {
  name: string;
  description: string;
}

export interface QComponentType {
  name: string;
  description: string;
}

export function isNumber(input: any): input is number {
  return typeof input === "number" || !isNaN(Number(input));
}
