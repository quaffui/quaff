import type { QApiEntry, QApiGeneric } from "../../src/docs/types.js";

export const DOCGEN_PROTOCOL_VERSION = 1;
const PROPS_INTERFACE_NAME_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*Props$/;

export function isPropsInterfaceName(name: string) {
  return PROPS_INTERFACE_NAME_PATTERN.test(name);
}

export interface DocgenComponentInput {
  propsFile: string;
  svelteFiles: string[];
}

export interface DocgenRequest {
  version: typeof DOCGEN_PROTOCOL_VERSION;
  components: DocgenComponentInput[];
}

export interface DocgenInterface {
  name: string;
  componentName?: string;
  description?: string;
  generics: QApiGeneric[];
  domAttributesConstraint?: string;
  props: QApiEntry[];
  snippets: QApiEntry[];
  methods: QApiEntry[];
  typeDependencies: Record<string, string>;
}

export interface DocgenComponentOutput {
  propsFile: string;
  interfaces: DocgenInterface[];
}

export interface DocgenResponse {
  version: typeof DOCGEN_PROTOCOL_VERSION;
  components: DocgenComponentOutput[];
}
