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

    if (upperCaseRE.test(styleName)) {
      styleName = styleName.replace(upperCaseRE, "-$&").toLowerCase();
    }

    toJoin.push(`${styleName}: ${styleVal}`);
  }

  userStyles && toJoin.push(userStyles);

  if (toJoin.length === 0) {
    return null;
  }

  return toJoin.join("; ");
}

export function createClasses(classes: any[]) {
  return classes.filter(Boolean).join(" ");
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
