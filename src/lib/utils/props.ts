import { convertCase } from "./string";

export function createStyles(
  styleObj: Record<string, string | number | boolean | null | undefined>,
  userStyles?: string | null
) {
  const stylesArray = Object.entries(styleObj);
  const toJoin: string[] = [];

  for (const [styleName, styleVal] of stylesArray) {
    if (styleVal === undefined || styleVal === null || styleVal === false) {
      continue;
    }

    toJoin.push(`${convertCase(styleName, "camel", "kebab")}: ${styleVal}`);
  }

  if (userStyles) {
    toJoin.push(userStyles);
  }

  if (toJoin.length === 0) {
    return null;
  }

  return toJoin.join("; ");
}

interface CreateClassesOptions {
  component?: string;
  element?: string;
  userClasses?: string | null;
  quaffClasses?: unknown[];
}

export function createClasses(
  modifiers: unknown[],
  options: CreateClassesOptions = { userClasses: "", quaffClasses: [] }
): string {
  const userClasses = options.userClasses?.trim();
  const quaffClasses = options.quaffClasses?.length && createClasses(options.quaffClasses);
  const baseClasses = `${quaffClasses || ""} ${userClasses || ""}`.trim();

  const component = options.component;
  let element: string | undefined;

  if (component && options.element) {
    element = `${component}__${options.element}`;
  }

  const filteredModifiers = modifiers.filter(Boolean);

  const withModifiers = component
    ? filteredModifiers.map((modifier) => `${element || component}--${modifier}`)
    : filteredModifiers;

  return [element || component, ...withModifiers, baseClasses].filter(Boolean).join(" ").trim();
}
