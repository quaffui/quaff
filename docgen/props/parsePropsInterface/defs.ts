/**
 * Corresponds to a type definition from an external package (including built-in DOM types).
 * Those types link to external documentation sources like MDN, google fonts or svelte's docs.
 *
 * For example, `MaterialSymbol` will link to `fonts.google.com/icons`.
 */
export interface ExternalType {
  /**
   * The name of the type as it appears in the source code (e.g. `MaterialSymbol`)
   */
  name: string;
  /**
   * The URL to the external documentation source
   */
  typeSrc: string;
}

/**
 * Type used for primitive types or types that couldn't be resolved to an external type.
 *
 * For example, `string`, `number`, `boolean`, etc.
 */
export interface StandardType {
  /**
   * The full text of the type definition
   */
  definition: string;
}

/**
 * Type used for complex types, such as `interface`s or `type` aliases.
 *
 * These types can (but are not bound to) depend on other "complex" types.
 * In this case, the name of those other types will be accessible through the `dependencies` property.
 *
 * For example, `QSize` or `CssValue`.
 */
export interface ComplexType extends StandardType {
  /**
   * The name of the type as it appears in the source code (e.g. `QSize`)
   */
  name: string;
  /**
   * The names of other "complex" types that this type depends on (e.g. `["CssUnit"]` which `CssValue` depends on)
   */
  dependencies: string[];
}

/**
 * A parsed type. Can be external, standard or complex.
 */
export type ParsedType = ExternalType | StandardType | ComplexType;

/** Represents a generic type parameter of an interface (e.g. `<T extends string>`). */
export interface ParsedGeneric {
  /** Name of the generic type parameter (e.g. `"T"`). */
  name: string;
  /** Constraint text if the generic extends a type (e.g. `"string"`). */
  constraint?: ParsedType;
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
  type: ParsedType | ParsedType[];
  /** The default value from the `@default` JSDoc tag, if present. */
  default?: string;
}

/** Represents a fully parsed TypeScript interface. */
export interface ParsedInterface {
  /** The full text of the DOM attributes extension clause, if the interface extends `HTMLAttributes<...>` or similar. */
  domAttributesConstraint?: ParsedType;
  /** The interface's generic type parameters. */
  generics: ParsedGeneric[];
  /** All parsed properties, including those inherited from extended internal interfaces. */
  properties: ParsedProperty[];
  /** The resolved type dependencies for the interface. */
  typeDependencies: Record<string, ParsedType | ParsedType[]>;
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
  /**
   * Whether the property is an `Omit<T, K>` utility type
   */
  OMIT = 16,
  /**
   * Whether the property is an `Exclude<T, U>` utility type
   */
  EXCLUDE = 32,
  /**
   * Whether the property is a `Pick<T, K>` utility type
   */
  PICK = 64,
  /**
   * Whether the property is an `Extract<T, U>` utility type
   */
  EXTRACT = 128,
}

/**
 * Maps external type names to their documentation URLs.
 * Not using an object to avoid creating regexp objects repeatedly inside loops.
 */
export const TypeSrcMap = [
  ["MaterialSymbol", "https://fonts.google.com/icons"],
  ["BundledLanguage", "https://shiki.style/languages#bundled-languages"],
  ["SpecialLanguage", "https://shiki.style/languages#special-languages"],
  ["BundledTheme", "https://shiki.style/themes#bundled-themes"],
  ["Snippet", "https://svelte.dev/docs/svelte/snippet#Typing-snippets"],
  [
    "HTMLElementTagNameMap",
    "https://typhonjs-typedoc.github.io/ts-lib-docs/2024/dom/interfaces/HTMLElementTagNameMap.html",
  ],
  [
    /^(?<event>[A-Z][a-z]+Event)Handler<.*>$/,
    (event: string) => "https://developer.mozilla.org/en-US/docs/Web/API/" + event,
  ],
  [
    /HTMLAttributes<HTMLElement>(?![[])/,
    "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes#list_of_global_attributes",
  ],
  [
    /^(?<element>HTML(?:.+)?Element)$/,
    (element: string) => `https://developer.mozilla.org/en-us/docs/Web/API/${element}`,
  ],
  [
    /HTML(?<element>.+)Attributes\\["(?<prop>\\w+)"\\]/,
    (element: string, prop?: string) =>
      `https://developer.mozilla.org/en-us/docs/Web/API/HTML${element}Element/${prop}`,
  ],
  [
    /HTMLAttributes<HTMLElement>\\["(?<prop>\\w+)"\\]/,
    (prop: string) =>
      `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/${prop}`,
  ],
  [
    /HTMLAttributes<HTML(?<element>.+)Element>\\["(?<prop>\\w+)"\\]/,
    (element: string, prop?: string) =>
      `https://developer.mozilla.org/en-us/docs/Web/API/HTML${element}Element/${prop}`,
  ],
  [
    /HTML(?<element>.+)Attributes/,
    (element: string) =>
      `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${element.toLowerCase()}#attributes`,
  ],
  [
    /HTMLAttributes<HTML(?<element>.+)Element>/,
    (element: string) =>
      `https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/${element.toLowerCase()}#attributes`,
  ],
] as const;

/**List of TypeScript builtin types that should never be inlined.
 * Avoids creating deep type trees for simple types.
 */
export const BUILTIN_TYPES = new Set([
  "Record",
  "Omit",
  "Pick",
  "Exclude",
  "Extract",
  "Partial",
  "Required",
  "Readonly",
  "ReturnType",
  "Parameters",
  "HTMLElement",
  "Element",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "FocusEvent",
  "ClipboardEvent",
  "DragEvent",
  "PointerEvent",
  "TouchEvent",
  "WheelEvent",
  "AnimationEvent",
  "TransitionEvent",
  "Window",
  "Document",
  "Promise",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Array",
  "Object",
  "Function",
  "String",
  "Number",
  "Boolean",
  "Date",
  "RegExp",
  "Symbol",
]);
