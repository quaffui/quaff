export interface FixtureServer {
  /** Builds a fixture page URL; `path` selects another page than the default one. */
  getUrl(query?: FixtureQuery, path?: string): string;
  close(): Promise<void>;
}

export type FixtureQuery = string | Record<string, string>;

export function createFixtureUrl(baseUrl: string, path: string, query: FixtureQuery = "") {
  const url = new URL(path, baseUrl);
  url.search = new URLSearchParams(query).toString();

  return url.href;
}
