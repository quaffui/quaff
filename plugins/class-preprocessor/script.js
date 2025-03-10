/**
 * @template {string | undefined} [T=undefined]
 * @typedef {import("./types").Node<T>} Node
 */

/**
 * Grabs, if needed, the classes definitions in the script.
 *
 * Each definition is identified by its ID, which corresponds to the main class
 * of the element which will get those classes.
 *
 * @param {import("./types").Script} instance
 * @param {string} source
 * @param {string} namespace
 * @returns
 */
export function prepareScript(instance, source, namespace) {
  /** @type {Record<`q-${string}`, import("./types").ClassesDefinition>} */
  const scriptDefs = {};

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
    const { start, end } = /** @type {Node<"SimpleCallExpression">} */ (expression);

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

    /**
     * @typedef {Node<"Property"> & { value: Node & Node<"Property">["value"] }} Property
     */

    const bemClasses = /** @type {Property | undefined} */ (
      options.properties.find(
        (prop) =>
          prop.type !== "SpreadElement" &&
          prop.key.type === "Identifier" &&
          prop.key.name === "bemClasses"
      )
    );
    const classes = /** @type {Property | undefined} */ (
      options.properties.find(
        (prop) =>
          prop.type !== "SpreadElement" &&
          prop.key.type === "Identifier" &&
          prop.key.name === "classes"
      )
    );

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

/**
 *
 * @param {import("estree-walker").Node} component
 * @returns
 */
function handleComponentName(component) {
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

  return /** @type {import("./types").ComponentName} */ (componentName);
}

/**
 *
 * @param {Node | undefined} staticClasses
 * @param {string[]} classes
 * @param {string} source
 */
function handleClasses(staticClasses, classes, source) {
  if (!staticClasses) {
    return;
  }

  if (staticClasses.type !== "ArrayExpression") {
    throw new Error("The static classes should be an array of values");
  }

  for (const cls of /** @type {(Node & typeof staticClasses.elements[0])[]} */ (
    staticClasses.elements
  )) {
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
      const left = /** @type {Node<"Expression">} */ (cls.left);
      const right = /** @type {Node<"Expression">} */ (cls.right);

      const expr = source.slice(left.start, right.end);
      classes.push(expr);
    }
  }
}

/**
 *
 * @param {Node | undefined} dynamicClasses
 * @param {string[]} classes
 * @param {import("./types").ComponentName} componentName
 * @param {string} source
 */
function handleBemClasses(dynamicClasses, classes, componentName, source) {
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

    const { key, value } =
      /** @type {Node<"Property"> & { key: Node & Node<"Property">["key"] } & { value: Node & Node<"Property">["value"] }} */ (
        prop
      );
    const val = source.slice(value.start, value.end);

    /**
     * Prefixes the class with the component name
     *
     * @param {string} suffix the class name
     * @param {boolean} [computed = false] wether the property is computed or not
     * @returns {string} the class name prefixed with the component name
     */
    const bem = (suffix, computed) =>
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

/**
 *
 * @param {import("estree-walker").Node & { type: "MemberExpression" }} node
 * @returns {string}
 */
function handleMemberExpression(node) {
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
