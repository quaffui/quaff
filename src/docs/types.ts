import { ParsedGeneric, ParsedProperty, ParsedType } from "$docgen/props/parsePropsInterface/defs";

export interface QComponentDocs {
  name: string;
  description: string;
  docs: {
    generics: ParsedGeneric[];
    domAttributesConstraint: ParsedType | undefined;
    props: ParsedProperty[];
    snippets: ParsedProperty[];
    methods: QComponentMethod[];
    events: QComponentEvent[];
    typeDependencies: Record<string, ParsedType | ParsedType[]>;
  };
}

export interface QComponentType {
  name: string;
  description: string;
}

export interface QComponentEvent {
  name: string;
  type: string;
  description: string;
}

export interface QComponentMethod {
  name: string;
  type: string;
  description: string;
}
