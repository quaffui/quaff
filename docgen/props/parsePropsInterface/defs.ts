export type MaybeParsed = ParsedType | string;

/** Represents a resolved type with an optional source URL for external types. */
export interface ParsedType {
  /** Text representation of a single type (e.g. `"boolean"`, `"MaterialSymbol"`, `"\`img:${string}\`"`). */
  text: string;
  /** The computed types for all internal type references contained in this type */
  computedTypes?: Record<string, MaybeParsed | MaybeParsed[]>;
  /** URL pointing to external documentation for this type (e.g. Material Icons page). Only present for types listed in `TypeSrcMap`. */
  typeSrc?: string;
  /**
   * A string of TypeScript definitions of the complex types in this type, formatted with prettier.
   *
   * This allows the frontend to show hover popups of types in components' props.
   */
  typeDefinition?: string;
}

/** Represents a generic type parameter of an interface (e.g. `<T extends string>`). */
export interface ParsedGeneric {
  /** Name of the generic type parameter (e.g. `"T"`). */
  name: string;
  /** Constraint text if the generic extends a type (e.g. `"string"`). */
  constraint?: MaybeParsed;
}

/** Represents a single parsed property from an interface. */
export interface ParsedProperty {
  /** The property's identifier name (e.g. `"disabled"`, `"icon"`). */
  name: string;
  /** The JSDoc description explaining the property's purpose. */
  description: string;
  /**
   * Flags indicating the property's characteristics
   * - `OPTIONAL`: The property is marked as optional with `?`.
   * - `SNIPPET`: The property's type is a Svelte `Snippet`.
   * - `ARRAY`: The property's type uses the `Array<T>` form (converted to `T[]` in output).
   * - `BINDABLE`: The property is bindable (e.g. `v-model` on the component).
   */
  flags: number;
  /** The computed type(s) for this property. A single `ParsedType` for simple types, or an array of `ParsedType` for union types. */
  type: MaybeParsed | MaybeParsed[];
  /** The default value from the `@default` JSDoc tag, if present. */
  default?: string;
}

/** Represents a fully parsed TypeScript interface. */
export interface ParsedInterface {
  /** The full text of the DOM attributes extension clause, if the interface extends `HTMLAttributes<...>` or similar. */
  domAttributesConstraint?: string | ParsedType;
  /** The interface's generic type parameters. */
  generics: ParsedGeneric[];
  /** All parsed properties, including those inherited from extended internal interfaces. */
  properties: ParsedProperty[];
}

/** Type names whose resolved union values should never be inlined. */
export const PRESERVE_TYPE_NAMES = new Set(["Snippet", "MaterialSymbol"]);

/** Package path prefixes that identify "external" types (Svelte, Material, DOM). */
export const EXTERNAL_PACKAGE_PREFIXES = ["svelte/", "material-symbols", "shiki"];

/** Union size threshold above which a type alias name is shown instead of the expanded union. */
export const LARGE_UNION_THRESHOLD = 10;

export const enum ParsedPropertyFlags {
  NONE = 0,
  /**
   * Whether the property is marked as optional with `?`
   */
  OPTIONAL = 1,
  /**
   * Whether the property's type is a Svelte `Snippet`
   */
  SNIPPET = 2,
  /**
   * Whether the property's type uses the `Array<T>` form (converted to `T[]` in output)
   */
  ARRAY = 4,
  /**
   * Whether the property is bindable (e.g. `v-model` on the component)
   */
  BINDABLE = 8,
}

/** Maps external type names to their documentation URLs. */
export const TypeSrcMap = {
  MaterialSymbol: "https://fonts.google.com/icons",
  BundledLanguage: "https://shiki.style/languages#bundled-languages",
  SpecialLanguage: "https://shiki.style/languages#special-languages",
  BundledTheme: "https://shiki.style/themes#bundled-themes",
  HTMLElementTagNameMap:
    "https://typhonjs-typedoc.github.io/ts-lib-docs/2024/dom/interfaces/HTMLElementTagNameMap.html",
  "HTMLAttributes<HTMLElement>[^\\[]":
    "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes#list_of_global_attributes",
  'HTML(?<element>.+)Attributes\\["(?<prop>\\w+)"\\]': (element: string, prop?: string) =>
    `https://developer.mozilla.org/en-us/docs/Web/API/HTML${element}Element/${prop}`,
  'HTMLAttributes<HTMLElement>\\["(?<prop>\\w+)"\\]': (prop: string) =>
    `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/${prop}`,
  'HTMLAttributes<HTML(?<element>.+)Element>\\["(?<prop>\\w+)"\\]': (
    element: string,
    prop?: string
  ) => `https://developer.mozilla.org/en-us/docs/Web/API/HTML${element}Element/${prop}`,
  "^HTML(?<element>.+)Attributes$|HTMLAttributes<HTML(?<element>.+)Element>": (element: string) =>
    `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${element.toLowerCase()}#attributes`,
};
