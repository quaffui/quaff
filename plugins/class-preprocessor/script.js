/**
 * Converts the given value to a conditional string empty if it's false
 *
 * @param {string} value
 * @return {string}
 */
function conditionalString(value) {
  return `{${value} ? \` \${${value}}\` : ''}`;
}

/**
 * Converts the given data to a svelte class: shorthand attribute
 *
 * @param {import("./types").ComponentName} componentName
 * @param {string} key
 * @param {string} value
 * @returns
 */
function classShorthand(componentName, key, value) {
  return `class:${componentName}--${key}={${value}}`;
}

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
    const { start, end } = expression;

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

    const bemClasses = options.properties.find((prop) => prop?.key?.name === "bemClasses");
    const classes = options.properties.find((prop) => prop?.key?.name === "classes");
    // Svelte doesn't accept `class:` directives on custom components
    const customComponent = options.properties.find(
      (prop) => prop?.key?.name === "isCustomComponent"
    );

    const componentName = handleComponentName(component);
    const isCustomComponent = handleCustomComponent(customComponent);

    scriptDefs[componentName] = {
      start,
      end,
      classes: [],
      bemClasses: [],
    };

    handleClasses(classes?.value, scriptDefs[componentName].classes, source);
    handleBemClasses(
      bemClasses?.value,
      scriptDefs[componentName].bemClasses,
      scriptDefs[componentName].classes,
      componentName,
      isCustomComponent,
      source
    );
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
 * @param {import("estree-walker").Node | undefined} customComponent
 * @returns
 */
function handleCustomComponent(customComponent) {
  if (!customComponent) {
    return false;
  }

  if (
    customComponent.type !== "Property" ||
    customComponent.value.type !== "Literal" ||
    typeof customComponent.value.value !== "boolean"
  ) {
    throw new Error("The customComponent property should be a boolean literal.");
  }

  return customComponent.value;
}

/**
 *
 * @param {import("estree-walker").Node | undefined} staticClasses
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

  for (const cls of staticClasses.elements) {
    if (cls?.type === "Literal") {
      if (typeof cls.value !== "string") {
        throw new Error("The static class literals should be strings.");
      }

      if (cls.value.length) {
        classes.push(` ${cls.value}`);
      }
    } else if (cls?.type === "Identifier") {
      classes.push(conditionalString(cls.name));
    } else if (cls?.type === "ArrowFunctionExpression") {
      const { body } = cls;

      if (body.type === "Identifier") {
        classes.push(conditionalString(body.name));
      } else if (body.type === "MemberExpression") {
        const result = handleMemberExpression(body);
        classes.push(conditionalString(result));
      } else {
        throw new Error(
          "Arrow function expressions should only have an Identifier or a MemberExpression in their body."
        );
      }
    } else if (cls?.type === "MemberExpression") {
      const result = handleMemberExpression(cls);
      classes.push(conditionalString(result));
    } else if (cls?.type === "TemplateLiteral") {
      const template = source.slice(cls.start, cls.end).replaceAll("`", "").replace("${", "{");
      classes.push(` ${template}`);
    } else if (cls?.type === "LogicalExpression") {
      const left = source.slice(cls.left.start, cls.left.end);
      const right = source.slice(cls.right.start, cls.right.end);

      if (cls.operator === "||") {
        classes.push(`{${left} ? \` \${${left}}\` : ${right} ? \` \${${right}}\` : ''}`);
      } else if (cls.operator === "&&") {
        classes.push(`{${left} ? ' ' + ${right} : ''}`);
      } else {
        classes.push(`{${left} !== null && ${left} !== undefined ? \` \${${right}}\` : ''}`);
      }
    }
  }
}

/**
 *
 * @param {import("estree-walker").Node | undefined} dynamicClasses
 * @param {string[]} classes
 * @param {string[]} staticClasses
 * @param {import("./types").ComponentName} componentName
 * @param {boolean} isCustomComponent
 * @param {string} source
 */
function handleBemClasses(
  dynamicClasses,
  classes,
  staticClasses,
  componentName,
  isCustomComponent,
  source
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

    const { key, value } = prop;
    const val = source.slice(value.start, value.end);

    if (key.type === "Identifier") {
      if (prop.computed) {
        const cls = (withDollar) => `${componentName}--${withDollar ? "$" : ""}{${key.name}}`;
        staticClasses.push(val === "true" ? ` ${cls(false)}` : `{${val} ? \` ${cls(true)}\` : ''}`);
      } else {
        if (isCustomComponent) {
          staticClasses.push(`{${val} ? \` ${componentName}--${key.name}\` : ''}`);
        } else {
          classes.push(classShorthand(componentName, key.name, val));
        }
      }
    } else if (key.type === "Literal" && typeof key.value === "string") {
      if (isCustomComponent) {
        staticClasses.push(`{${val} ? \` ${componentName}--${key.value}\` : ''}`);
      } else {
        classes.push(classShorthand(componentName, key.value, val));
      }
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
