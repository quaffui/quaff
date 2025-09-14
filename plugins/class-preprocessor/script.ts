import { MemberExpression } from "estree";
import type { Node as ESNode } from "estree-walker";
import type { Node, Script, ClassesDefinition, ComponentName } from "./types.js";

type Property = Node<"Property"> & { value: Node & Node<"Property">["value"] };

/**
 * Grabs, if needed, the classes definitions in the script.
 *
 * Each definition is identified by its ID, which corresponds to the main class
 * of the element which will get those classes.
 */
export function prepareScript(instance: Script, source: string, namespace: string) {
  const scriptDefs: Record<string, ClassesDefinition> = {};

  for (const node of instance.content.body) {
    if (node.type !== "ExpressionStatement") {
      continue;
    }

    const { expression } = node;
    if (expression.type !== "CallExpression" || expression.callee.type !== "MemberExpression") {
      continue;
    }

    const { object, property } = expression.callee;
    if (object.type !== "Identifier" || property.type !== "Identifier") {
      continue;
    }
    if (object.name !== namespace || property.name !== "classes") {
      continue;
    }

    // We found an instance definition
    // We grab the start and end of the expression so we can remove it from the script
    const { start, end } = expression as Node<"SimpleCallExpression">;

    if (expression.arguments.length !== 2) {
      throw new Error("The ${namespace}.classes function takes exactly 2 arguments");
    }

    const [component, options] = expression.arguments;

    if (component.type !== "Literal") {
      throw new Error(
        "The ${namespace}.classes 1st argument should be a Literal containing the name of the component"
      );
    }

    if (options.type !== "ObjectExpression") {
      throw new Error("The ${namespace}.classes 2nd argument should be an object");
    }

    if (options.properties.some((prop) => prop.type === "SpreadElement")) {
      throw new Error(
        "The ${namespace}.classes 2nd argument doesn't take SpreadElements as a property"
      );
    }

    const bemClasses = options.properties.find(
      (prop) =>
        prop.type !== "SpreadElement" &&
        prop.key.type === "Identifier" &&
        prop.key.name === "bemClasses"
    ) as Property | undefined;
    const classes = options.properties.find(
      (prop) =>
        prop.type !== "SpreadElement" &&
        prop.key.type === "Identifier" &&
        prop.key.name === "classes"
    ) as Property | undefined;

    const componentName = handleComponentName(component);

    scriptDefs[componentName] = {
      start,
      end,
      classes: [`"${componentName}"`],
    };

    handleClasses(classes?.value, scriptDefs[componentName].classes, source);
    handleBemClasses(bemClasses?.value, scriptDefs[componentName].classes, componentName, source);
  }

  return scriptDefs;
}

function handleComponentName(component: ESNode) {
  if (component.type !== "Literal") {
    throw new Error("The component name should be a literal.");
  }

  const componentName = component.value;
  if (!componentName || typeof componentName !== "string") {
    throw new Error("The component name should be a string and not empty.");
  }

  if (!componentName.startsWith("q-")) {
    throw new Error('The component name should start with "q-"');
  }

  return componentName as ComponentName;
}

function handleClasses(staticClasses: Node | undefined, classes: string[], source: string) {
  if (!staticClasses) {
    return;
  }

  if (staticClasses.type !== "ArrayExpression") {
    throw new Error("The static classes should be an array of values");
  }

  type StaticClass = Node & (typeof staticClasses.elements)[0];

  for (const cls of staticClasses.elements as Node & StaticClass[]) {
    if (cls?.type === "Literal") {
      if (typeof cls.value !== "string") {
        throw new Error("The static class literals should be strings.");
      }

      if (cls.value.length) {
        // Normal class string, quote it so it's seen as a string in the result code
        classes.push(`"${cls.value}"`);
      }
    } else if (cls?.type === "Identifier") {
      // Class that comes from a variable, no quotes needed
      // so it's seen as an identifier in the result code
      classes.push(cls.name);
    } else if (cls?.type === "ArrowFunctionExpression") {
      // Class written like () => ...
      const { body } = cls;

      if (body.type === "Identifier") {
        // Class that comes from a variable, no quotes needed
        // so it's seen as an identifier in the result code
        classes.push(body.name);
      } else if (body.type === "MemberExpression") {
        // Class like variable.nested.in.object, we need to convert it to a string
        const result = handleMemberExpression(body);
        // No quotes needed so it's seen as identifiers in the result code
        classes.push(result);
      } else {
        throw new Error(
          "Arrow function expressions should only have an Identifier or a MemberExpression in their body."
        );
      }
    } else if (cls?.type === "MemberExpression") {
      // Class like variable.nested.in.object, we need to convert it to a string
      const result = handleMemberExpression(cls);
      // No quotes needed so it's seen as identifiers in the result code
      classes.push(result);
    } else if (cls?.type === "TemplateLiteral") {
      // Class like `class-with-${variable}`
      classes.push(source.slice(cls.start, cls.end));
    } else if (cls?.type === "LogicalExpression") {
      // Class like var1 || var2, var1 && "static-class", etc.
      // we push it as it is
      const left = cls.left as Node<"Expression">;
      const right = cls.right as Node<"Expression">;

      const expr = source.slice(left.start, right.end);
      classes.push(expr);
    }
  }
}

function handleBemClasses(
  dynamicClasses: Node | undefined,
  classes: string[],
  componentName: ComponentName,
  source: string
) {
  if (!dynamicClasses) {
    return;
  }

  if (dynamicClasses.type !== "ObjectExpression") {
    throw new Error("Dynamic classes should be inside an object");
  }

  for (const prop of dynamicClasses.properties) {
    if (prop.type !== "Property") {
      throw new Error("The dynamic classes can't be spread.");
    }

    const { key, value } = prop as Node<"Property"> & {
      key: Node & Node<"Property">["key"];
      value: Node & Node<"Property">["value"];
    };
    const val = source.slice(value.start, value.end);

    /**
     * Prefixes the class with the component name
     *
     * @param suffix the class name
     * @param computed wether the property is computed or not
     * @returns the class name prefixed with the component name
     */
    const bem = (suffix: string, computed = false) =>
      computed ? `\`${componentName}--$\{${suffix}}\`` : `"${componentName}--${suffix}"`;

    if (key.type === "Identifier") {
      if (prop.computed) {
        // Class of the form { [variable]: true } or { [variable]: condition }
        classes.push(val === "true" ? bem(key.name, true) : `(${val}) && ${bem(key.name, true)}`);
      } else {
        classes.push(`(${val}) && ${bem(key.name)}`);
      }
    } else if (key.type === "Literal" && typeof key.value === "string") {
      classes.push(`(${val}) && ${bem(key.value)}`);
    } else {
      throw new Error("Dynamic classes keys should be Identifiers.");
    }
  }
}

function handleMemberExpression(node: MemberExpression): string {
  const { object, property } = node;

  if (property.type !== "Identifier") {
    throw new Error("All the members of a member expression should be identifiers.");
  }

  if (object.type === "MemberExpression") {
    return `${handleMemberExpression(object)}.${property.name}`;
  } else if (object.type === "Identifier") {
    return `${object.name}.${property.name}`;
  }

  throw new Error("All the members of a member expression should be identifiers.");
}
