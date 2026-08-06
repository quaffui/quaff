/// Type names whose resolved union values should never be inlined.
pub const PRESERVE_TYPE_NAMES: [&str; 2] = ["Snippet", "MaterialSymbol"];

/// Package path prefixes that identify "external" types (Svelte, Material, Shiki, etc.)
pub const EXTERNAL_PACKAGE_PREFIXES: [&str; 3] = ["svelte", "material-symbols", "shiki"];

/// List of Typescript builtin types that should never be inlined.
/// Avoid creating deep type trees for basic types.
pub const BUILTIN_TYPE_NAMES: [&str; 39] = [
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
];
