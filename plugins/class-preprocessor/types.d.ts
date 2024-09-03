import { Node } from "estree-walker";
import type { parse } from "svelte/compiler";

function parseModern(source: string) {
  return parse(source, { modern: true });
}

type Root = ReturnType<typeof parseModern>;

export type Script = NonNullable<Root["instance"]>;
export type Fragment = Root["fragment"];

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
