import { parse } from "svelte/compiler";
import type { Expression } from "estree";

type FiniteValue = string | number;

const TEMPLATE_DELIMITER_PATTERN = /\\[\s\S]|`/g;
const MAX_TEMPLATE_DELIMITERS = 64;
const MAX_TEMPLATE_VARIANTS = 256;

export function collectTemplateCandidates(code: string): Set<string> {
  const candidates = new Set<string>();
  const delimiters = collectTemplateDelimiters(code);

  for (let start = 0; start < delimiters.length; start++) {
    const template = findTemplateExpression(code, delimiters, start);

    if (!template) {
      continue;
    }

    const values = getFiniteValues(template.expression) ?? [];
    values.forEach((value) => candidates.add(String(value)));
    start = template.end;
  }

  return candidates;
}

function collectTemplateDelimiters(code: string) {
  const delimiters: number[] = [];

  for (const match of code.matchAll(TEMPLATE_DELIMITER_PATTERN)) {
    if (match[0] === "`") {
      delimiters.push(match.index);
    }
  }

  return delimiters;
}

function findTemplateExpression(code: string, delimiters: number[], start: number) {
  const limit = Math.min(delimiters.length, start + MAX_TEMPLATE_DELIMITERS);

  for (let end = start + 1; end < limit; end++) {
    const template = code.slice(delimiters[start], delimiters[end] + 1);
    const expression = parseTemplate(template);

    if (expression) {
      return { end, expression };
    }
  }
}

function parseTemplate(template: string) {
  try {
    const root = parse(`<script>const value = ${template};</script>`, { modern: true });
    const declaration = root.instance?.content.body[0];

    if (
      root.instance?.content.body.length !== 1 ||
      declaration?.type !== "VariableDeclaration" ||
      declaration.declarations.length !== 1
    ) {
      return;
    }

    const expression = declaration.declarations[0].init;

    return expression?.type === "TemplateLiteral" ? expression : undefined;
  } catch {
    // Source files can contain unfinished templates while the development server runs.
    return;
  }
}

function getFiniteValues(expression: Expression | null | undefined): FiniteValue[] | undefined {
  if (!expression) {
    return;
  }

  switch (expression.type) {
    case "Literal":
      return typeof expression.value === "string" || typeof expression.value === "number"
        ? [expression.value]
        : undefined;
    case "ConditionalExpression": {
      const consequent = getFiniteValues(expression.consequent);
      const alternate = getFiniteValues(expression.alternate);

      if (!consequent || !alternate) {
        return;
      }

      const variants = [...new Set([...consequent, ...alternate])];

      return variants.length <= MAX_TEMPLATE_VARIANTS ? variants : undefined;
    }
    case "BinaryExpression": {
      if (expression.operator !== "+" || expression.left.type === "PrivateIdentifier") {
        return;
      }

      const left = getFiniteValues(expression.left);
      const right = getFiniteValues(expression.right);

      return combineValues(left, right, addFiniteValues);
    }
    case "TemplateLiteral": {
      let variants = [expression.quasis[0].value.cooked ?? expression.quasis[0].value.raw];

      for (let index = 0; index < expression.expressions.length; index++) {
        const values = getFiniteValues(expression.expressions[index]);
        const combined = combineValues(variants, values, (left, right) => String(left) + right);

        if (!combined) {
          return;
        }

        const suffix = expression.quasis[index + 1].value;
        variants = combined.map((value) => value + (suffix.cooked ?? suffix.raw));
      }

      return variants;
    }
    default:
      return;
  }
}

function addFiniteValues(left: FiniteValue, right: FiniteValue) {
  if (typeof left === "number" && typeof right === "number") {
    return left + right;
  }

  return String(left) + right;
}

function combineValues(
  left: FiniteValue[] | undefined,
  right: FiniteValue[] | undefined,
  combine: (left: FiniteValue, right: FiniteValue) => FiniteValue
) {
  if (!left || !right || left.length * right.length > MAX_TEMPLATE_VARIANTS) {
    return;
  }

  return [...new Set(left.flatMap((prefix) => right.map((suffix) => combine(prefix, suffix))))];
}
