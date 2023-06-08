export interface NativeProps {
  userClasses?: string;
  userStyles?: string;
}

export const NativePropsDefaults: NativeProps = {
  userClasses: undefined,
  userStyles: undefined,
};

export function isNumber(input: any): input is number {
  return typeof input === "number" || !isNaN(parseInt(input, 10));
}
