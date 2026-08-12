export function getOwnTypeDefinition(
  definitions: Readonly<Record<string, string>>,
  typeName: string
) {
  return Object.hasOwn(definitions, typeName) ? definitions[typeName] : undefined;
}
