/**
 * Prepares the positions to be able to modify the markup
 *
 * @export
 * @param {import("./types").Fragment} fragment
 * @param {import("./types").ComponentName} component
 * @param {import("./types").Use[]} uses
 * @param {string} namespace
 */
export function prepareMarkup(fragment, component, uses, namespace) {
  for (const node of fragment.nodes) {
    if (node.type === "IfBlock") {
      prepareMarkup(node.consequent, component, uses, namespace);

      if (node.alternate) {
        prepareMarkup(node.alternate, component, uses, namespace);
      }

      continue;
    } else if (node.type === "AwaitBlock") {
      /** @type {"pending" | "then" | "catch"} */
      let awaitKey;
      for (awaitKey of ["pending", "then", "catch"]) {
        let frag = node[awaitKey];
        if (frag) {
          prepareMarkup(frag, component, uses, namespace);
        }
      }

      continue;
    } else if (node.type === "EachBlock" || node.type === "SnippetBlock") {
      prepareMarkup(node.body, component, uses, namespace);

      continue;
    }

    if (node.fragment) {
      prepareMarkup(node.fragment, component, uses, namespace);
    }

    if (!("attributes" in node)) {
      continue;
    }

    /** @type {(typeof node.attributes[0]) & { type: "Attribute" }} */
    const classAttribute = node.attributes.find(
      (attr) => attr.type === "Attribute" && attr.name === "class"
    );

    if (
      !classAttribute ||
      !Array.isArray(classAttribute.value) ||
      classAttribute.value.length !== 1
    ) {
      continue;
    }

    const cls = classAttribute.value[0];
    if (cls.type !== "Text" || cls.data !== component) {
      continue;
    }
    // Possible element to add classes on

    // Check for `{...${namespace}.classes}` attribute
    const quaffClassesAttr = node.attributes.find(
      (attr) =>
        attr.type === "SpreadAttribute" &&
        attr.expression.type === "MemberExpression" &&
        attr.expression.object.type === "Identifier" &&
        attr.expression.object.name === namespace &&
        attr.expression.property.type === "Identifier" &&
        attr.expression.property.name === "classes"
    );

    if (!quaffClassesAttr) {
      continue;
    }
    // We found the element on which to add the classes

    // We grab the end to append new classes
    const classEnd = classAttribute.end;
    // We grab the attribute to remove it
    const { start, end } = quaffClassesAttr;

    uses.push({
      classEnd,
      start,
      end,
    });
  }
}
