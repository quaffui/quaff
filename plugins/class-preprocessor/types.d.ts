import type { parse } from "svelte/compiler";
import { Node } from "estree-walker";

type GetModernRoot<T> = T extends { fragment: unknown } ? T : never;

export type Script = NonNullable<GetModernRoot<ReturnType<typeof parse>>["instance"]>;
export type Fragment = GetModernRoot<ReturnType<typeof parse>>["fragment"];

export interface Def {
  start: number;
  end: number;
  classes: string[];
  bemClasses: string[];
}

export interface Use {
  classEnd: number;
  start: number;
  end: number;
}

export interface Result {
  def: Def;
  uses: Use[];
}

export type ComponentName = `q-${string}`;

export type ScriptDef = Record<ComponentName, Def>;

export type ClassAttribute = Node & { type: "Attribute"; name: "class" };
