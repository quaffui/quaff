import { convertCase } from "./string";

export function createStyles(
  styleObj: Record<string, string | number | null | undefined>,
  userStyles?: string
) {
  const stylesArray = Object.entries(styleObj);
  const upperCaseRE = /[A-Z]/g;
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

interface CreateClassOptions {
  component?: string;
  userClasses?: string;
}

export function createClasses(classes: any[], options: CreateClassOptions = {}): string {
  const filtered = classes.filter(Boolean);

  let formattedClasses = options.component
    ? filtered.map((c) => `${convertCase(options.component!, "pascal", "kebab")}--${c}`)
    : filtered;

  let withUserClasses = options.userClasses
    ? [...formattedClasses, options.userClasses]
    : formattedClasses;

  return options.component
    ? [convertCase(options.component!, "pascal", "kebab"), ...withUserClasses].join(" ")
    : withUserClasses.join(" ");
}

/* export function createClasses(...classes: (string | [string, boolean])[]) {
  let finalClasses: string[] = [];
  for (const val of classes) {
    if (typeof val === "string") {
      finalClasses.push(val);
    } else {
      const [userClasses, shouldAdd] = val;

      if (shouldAdd) {
        finalClasses.push(userClasses);
      }
    }
  }

  return finalClasses.length !== 0 ? finalClasses.filter(Boolean).join(" ") : undefined;
} */
