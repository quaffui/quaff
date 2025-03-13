/**
 * Prepares the positions to be able to modify the markup
 *
 * @export
 * @param {import("./types").Fragment} fragment
 * @param {import("./types").ComponentName} component
 * @param {import("./types").ClassesUsage[]} uses
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
      for (const awaitKey of /** @type {const} */ (["pending", "then", "catch"])) {
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

    if (!("fragment" in node)) {
      continue;
    }

    prepareMarkup(node.fragment, component, uses, namespace);

    if (!("attributes" in node)) {
      continue;
    }

    const classAttribute =
      /** @type {((typeof node.attributes[0]) & { type: "Attribute" }) | undefined} */ (
        node.attributes.find((attr) => attr.type === "Attribute" && attr.name === "class")
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
    // Elements to attach the classes to

    // We grab the start and end of the class definition to replace with the new classes
    const { start, end } = cls;

    uses.push({
      start,
      end,
    });
  }
}
