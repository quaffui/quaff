export function capitalize(str: string, eachWord: boolean = false) {
  const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return eachWord ? str.split(" ").map(cap).join(" ") : cap(str);
}

export function uncapitalize(str: string, eachWord: boolean = false) {
  const uncap = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);

  return eachWord ? str.split(" ").map(uncap).join(" ") : uncap(str);
}

const cases = {
  camel: "",
  pascal: "",
  kebab: "-",
  snake: "_",
};

function convertToPascalCase(str: string, delimeter: string) {
  return str
    .split(delimeter)
    .map((word) => capitalize(word))
    .join("");
}

function convertToCamelCase(str: string, delimeter: string) {
  return str
    .split(delimeter)
    .map((word, index) => (index === 0 ? word : capitalize(word)))
    .join("");
}

function convertToKebabSnakeCase(str: string, caseType: keyof typeof cases) {
  return str
    .split("")
    .map((letter) => (/[A-Z]/.test(letter) ? `${cases[caseType]}${letter.toLowerCase()}` : letter))
    .join("");
}

export function convertCase(str: string, fromCase: keyof typeof cases, toCase: keyof typeof cases) {
  switch (fromCase) {
    case "camel":
      if (toCase === "pascal") {
        return capitalize(str);
      }
      if (toCase === "kebab" || toCase === "snake") {
        return convertToKebabSnakeCase(str, toCase);
      }
      break;
    case "pascal":
      let uncap = uncapitalize(str);
      if (toCase === "camel") {
        return uncap;
      }
      if (toCase === "kebab" || toCase === "snake") {
        return convertToKebabSnakeCase(uncap, toCase);
      }
      break;
    case "snake":
      if (toCase === "kebab") {
        return str.replaceAll("_", "-");
      }
      if (toCase === "camel") {
        return convertToCamelCase(str, "_");
      }
      if (toCase === "pascal") {
        return convertToPascalCase(str, "_");
      }
      break;
    case "kebab":
      if (toCase === "snake") {
        return str.replaceAll("-", "_");
      }
      if (toCase === "camel") {
        return convertToCamelCase(str, "-");
      }
      if (toCase === "pascal") {
        return convertToPascalCase(str, "-");
      }
      break;
    default:
      return str;
  }

  return str;
}

export function extractImgSrc(prop?: string) {
  return prop?.startsWith("img:") ? prop.slice(4) : undefined
}

export function textWidth(element: HTMLElement, font: string): number {
  if (element.offsetWidth > 0) return element.offsetWidth;
  let _canvas = (
    document.querySelector("canvas[data-quaff]") as HTMLCanvasElement | null
  )?.getContext("2d");

  if (!_canvas) {
    const canvasElement = document.createElement("canvas");
    canvasElement.style.display = "none";
    canvasElement.setAttribute("data-quaff", "");
    document.body.append(canvasElement);
    _canvas = canvasElement.getContext("2d");
  }

  _canvas!.font = font;
  return _canvas!.measureText(element.textContent!).width;
}
