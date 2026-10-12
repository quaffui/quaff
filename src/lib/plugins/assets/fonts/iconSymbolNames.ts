const SYMBOL_PATTERN = /^[a-z0-9][a-z0-9_]*$/;

export function addSymbolNames(names: Set<string>, value: string, prefix?: string) {
  if (prefix && !value.startsWith(prefix)) {
    return;
  }

  if (value.startsWith("img:") || value.startsWith("svg:")) {
    return;
  }

  const normalized = prefix ? value.slice(prefix.length) : value;

  for (const name of normalized.trim().split(/\s+/)) {
    if (SYMBOL_PATTERN.test(name)) {
      names.add(name);
    }
  }
}
