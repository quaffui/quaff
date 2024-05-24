import { Node } from "estree-walker";
import type { parse } from "svelte/compiler";

type GetModernRoot<T> = T extends { fragment: unknown } ? T : never;

export type Script = NonNullable<GetModernRoot<ReturnType<typeof parse>>["instance"]>;
export type Fragment = GetModernRoot<ReturnType<typeof parse>>["fragment"];

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
