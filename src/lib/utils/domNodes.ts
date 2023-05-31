// Fills input array with the children in a node (recursive)
function fillNormalizedNodes(children: Set<Element>, node: Element) {
  if (node.children.length !== 0) {
    for (let child of node.children) {
      fillNormalizedNodes(children, child);
    }
  }
  children.add(node);
}

// Gets the list of children in a node
export function getNormalizedNodes(nodes: HTMLCollection) {
  const children = new Set<Element>();

  for (let node of nodes) {
    fillNormalizedNodes(children, node);
  }

  return Array.from(children);
}
