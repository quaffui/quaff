import { readFile, readdir, realpath, stat } from "fs/promises";
import path from "path";
import generateHash from "../helpers/generateHash.js";
import { createDocgenSourceReader } from "./dependencies.js";
import type { DocgenComponentInput } from "./types.js";

export default async function createPropsHasher(projectRoot: string) {
  const libPath = path.join(projectRoot, "src/lib");
  const fileHashes = new Map<string, string>();

  async function hashFiles(files: string[]) {
    const entries = await Promise.all(
      files.toSorted().map(async (file) => {
        let hash = fileHashes.get(file);

        if (!hash) {
          hash = generateHash(await readFile(file, "utf8"));
          fileHashes.set(file, hash);
        }

        return [path.relative(projectRoot, file), hash];
      })
    );

    return generateHash(JSON.stringify(entries));
  }

  const generatorFiles = [
    ".prettierrc",
    "bun.lock",
    "package.json",
    "docgen/Cargo.toml",
    "docgen/Cargo.lock",
  ].map((file) => path.join(projectRoot, file));

  for (const directory of ["docgen/src", "docgen/props", "docgen/helpers"]) {
    const entries = await readdir(path.join(projectRoot, directory), {
      recursive: true,
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (entry.isFile() && /\.(?:rs|ts)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
        generatorFiles.push(path.join(entry.parentPath, entry.name));
      }
    }
  }

  const generatorHash = await hashFiles(generatorFiles);
  const getSourceFiles = createDocgenSourceReader(async (source, importer) => {
    const target = source.startsWith("$")
      ? path.join(libPath, source.slice(1).replace(/^lib(?:\/|$)/, ""))
      : path.resolve(path.dirname(importer), source);
    const candidates = [target, `${target}.ts`];

    if (target.endsWith(".js")) {
      candidates.push(target.slice(0, -3) + ".ts");
    }

    candidates.push(path.join(target, "index.ts"));

    for (const candidate of candidates) {
      try {
        if ((await stat(candidate)).isFile()) {
          return await realpath(candidate);
        }
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !("code" in error) ||
          (error.code !== "ENOENT" && error.code !== "ENOTDIR")
        ) {
          throw error;
        }
      }
    }
  });

  return async (input: DocgenComponentInput) => {
    const sources = await getSourceFiles([input.propsFile, ...input.svelteFiles]);
    return generateHash(generatorHash + (await hashFiles(sources)));
  };
}
