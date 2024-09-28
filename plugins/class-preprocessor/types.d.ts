import { Node } from "estree-walker";
import type { AST } from "svelte/compiler";

export type Script = NonNullable<AST.Root["instance"]>;
export type Fragment = AST.Root["fragment"];

export interface ClassesDefinition {
  start: number;
  end: number;
  classes: string[];
  bemClasses: string[];
}

export interface ClassesUsage {
  classEnd: number;
  start: number;
  end: number;
}

export interface Result {
  def: ClassesDefinition;
  uses: ClassesUsage[];
}

export type ComponentName = `q-${string}`;

export type ScriptDef = Record<ComponentName, ClassesDefinition>;

export type ClassAttribute = Node & { type: "Attribute"; name: "class" };
