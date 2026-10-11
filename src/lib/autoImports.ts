import { COMPONENT_DEFINITIONS, type ComponentName } from "./internal/componentRegistry.js";

export const QUAFF_COMPONENT_NAMES = Object.keys(COMPONENT_DEFINITIONS) as ComponentName[];
