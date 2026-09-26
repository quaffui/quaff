import path from "path";

export interface FormatRequest {
  sources: string[];
  canFallback: boolean;
}

export default function createFormatter(projectRoot: string) {
  return async ({ sources, canFallback }: FormatRequest): Promise<string[]> => {
    const prettier = await import("prettier");
    const options = await prettier.resolveConfig(path.join(projectRoot, ".prettierrc"), {
      useCache: false,
    });

    return Promise.all(
      sources.map(async (source) => {
        try {
          const result = await prettier.format(source, { ...options, parser: "typescript" });
          return canFallback ? result.trim() : result;
        } catch (error) {
          if (canFallback) {
            return source;
          }

          throw error;
        }
      })
    );
  };
}
