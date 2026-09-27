// Preserve logical containment when an overlay moves out of its component tree.
export const portalParents = new WeakMap<Node, Node>();

export function containsWithPortals(container: Node, target: Node | null): boolean {
  while (target) {
    if (target === container) {
      return true;
    }

    target = portalParents.get(target) ?? target.parentNode;
  }

  return false;
}
