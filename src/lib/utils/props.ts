import { convertCase } from "./string";

export function createStyles(
  styleObj: Record<string, string | number | null | undefined>,
  userStyles?: string
) {
  const stylesArray = Object.entries(styleObj);
  const toJoin: string[] = [];

  for (let [styleName, styleVal] of stylesArray) {
    if (styleVal === undefined || styleVal === null) {
      continue;
    }

    styleName = convertCase(styleName, "camel", "kebab");

    toJoin.push(`${styleName}: ${styleVal}`);
  }

  userStyles && toJoin.push(userStyles);

  if (toJoin.length === 0) {
    return null;
  }

  return toJoin.join("; ");
}

interface CreateClassesOptions {
  component?: string;
  element?: string;
  userClasses?: string;
  quaffClasses?: any[];
}

export function createClasses(
  modifiers: any[],
  options: CreateClassesOptions = { userClasses: "", quaffClasses: [] }
): string {
  const userClasses = options.userClasses?.trim();
  const quaffClasses = options.quaffClasses?.length && createClasses(options.quaffClasses);
  const baseClasses = `${quaffClasses || ""} ${userClasses || ""}`.trim();

  let component = options.component,
    element: string | undefined;

  if (component && options.element) {
    element = `${component}__${options.element}`;
  }

  const filteredModifiers = modifiers.filter(Boolean);

  let withModifiers = component
    ? filteredModifiers.map((modifier) => `${element || component}--${modifier}`)
    : filteredModifiers;

  return [element || component, ...withModifiers, baseClasses].filter(Boolean).join(" ").trim();
}
