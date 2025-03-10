import { Node as EstreeNode, NodeMap } from "estree";
import type { AST } from "svelte/compiler";

export type Script = NonNullable<AST.Root["instance"]>;
export type Fragment = AST.Root["fragment"];

export interface ClassesDefinition {
  start: number;
  end: number;
  classes: string[];
}

export interface ClassesUsage {
  /*
   *                                                v here
   * Start of the class attribute value <div class="...">.
   */
  start: number;
  /*
   *                                                v here
   * End of the class attribute value <div class="...">.
   */
  end: number;
}

export interface Result {
  def: ClassesDefinition;
  uses: ClassesUsage[];
}

export type ComponentName = `q-${string}`;

export type ScriptDef = Record<ComponentName, ClassesDefinition>;

export type ClassAttribute = EstreeNode & { type: "Attribute"; name: "class" };

export type Node<T extends string | undefined = undefined> = T extends undefined
  ? AST.BaseNode & EstreeNode
  : T extends keyof NodeMap
    ? AST.BaseNode & NodeMap[T]
    : AST.BaseNode & EstreeNode & { type: T };
