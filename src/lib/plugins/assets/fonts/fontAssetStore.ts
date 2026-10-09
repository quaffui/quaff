import { createHash, randomUUID } from "node:crypto";
import { access, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, extname, resolve as resolvePath } from "node:path";
import { getOrCreateCachedValue } from "../promiseCache.js";
import type { ResolvedConfig } from "vite";

const FONT_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:woff|woff2)$/;
const UNSAFE_CACHE_PATH_PATTERN = /[#?%]/;
const LOCAL_REQUIRE = createRequire(import.meta.url);
// Bump when the glyph selection or shaping algorithm changes.
const SUBSET_CACHE_VERSION = "material-symbols-1";

export class FontAssetStore {
  readonly directory: string;
  private readonly consumerRequire: ReturnType<typeof createRequire>;
  private readonly reads = new Map<string, Promise<Uint8Array>>();
  private readonly writes = new Map<string, Promise<string>>();
  private readonly subsets = new Map<string, Promise<Uint8Array>>();
  private engineVersion: Promise<string> | undefined;

  constructor(config: Pick<ResolvedConfig, "root" | "cacheDir">) {
    this.directory = resolveFontDirectory(config.cacheDir);
    this.consumerRequire = createRequire(resolvePath(config.root, "package.json"));
  }

  resolveFile(specifier: string) {
    try {
      return this.consumerRequire.resolve(specifier);
    } catch {
      return LOCAL_REQUIRE.resolve(specifier);
    }
  }

  readAsset(specifier: string): Promise<Uint8Array> {
    const file = this.resolveFile(specifier);

    return getOrCreateCachedValue(this.reads, file, async () => readFile(file));
  }

  writeAsset(name: string, bytes: Uint8Array): Promise<string> {
    if (!FONT_NAME_PATTERN.test(name)) {
      throw new Error(`[quaff:assets] Invalid generated font name: ${name}`);
    }

    const extension = extname(name);
    const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
    const filename = `${name.slice(0, -extension.length)}-${hash}${extension}`;

    return getOrCreateCachedValue(this.writes, filename, async () =>
      this.writeFile(filename, bytes)
    );
  }

  async getOrCreateSubset(
    original: Uint8Array,
    names: readonly string[],
    create: () => Promise<Uint8Array>
  ): Promise<Uint8Array> {
    const engines = await this.getEngineVersion();
    const key = createHash("sha256")
      .update(engines)
      .update("\0")
      .update(original)
      .update("\0")
      .update([...new Set(names)].sort().join("\n"))
      .digest("hex");
    const pending = this.subsets.get(key) ?? this.readOrCreateSubset(key, create);
    this.subsets.set(key, pending);

    try {
      return await pending;
    } finally {
      if (this.subsets.get(key) === pending) {
        this.subsets.delete(key);
      }
    }
  }

  private async readOrCreateSubset(key: string, create: () => Promise<Uint8Array>) {
    const file = resolvePath(this.directory, "subsets", `${key}.woff2`);

    try {
      const bytes = await readFile(file);

      if (isWoff2(bytes)) {
        return bytes;
      }
    } catch (error) {
      if (!isMissingFile(error)) {
        throw error;
      }
    }

    const bytes = await create();
    await this.createFile(file, bytes);

    return bytes;
  }

  private async getEngineVersion(): Promise<string> {
    try {
      this.engineVersion ??= readEngineVersions();

      return await this.engineVersion;
    } catch (error) {
      this.engineVersion = undefined;

      throw error;
    }
  }

  private async writeFile(filename: string, bytes: Uint8Array) {
    const file = resolvePath(this.directory, filename);

    try {
      await access(file);
    } catch {
      await this.createFile(file, bytes);
    }

    const encodedPath = encodeURI(file.replaceAll("\\", "/"))
      .replaceAll("#", "%23")
      .replaceAll("?", "%3F");

    return `/@fs/${encodedPath}`;
  }

  private async createFile(file: string, bytes: Uint8Array) {
    await mkdir(dirname(file), { recursive: true });
    const temporaryFile = `${file}.${randomUUID()}.tmp`;

    try {
      await writeFile(temporaryFile, bytes);
      await rename(temporaryFile, file);
    } finally {
      await rm(temporaryFile, { force: true });
    }
  }
}

async function readEngineVersions(): Promise<string> {
  const files = [
    resolvePath(dirname(LOCAL_REQUIRE.resolve("harfbuzzjs")), "../package.json"),
    LOCAL_REQUIRE.resolve("wawoff2/package.json"),
  ];
  const versions = await Promise.all(
    files.map(async (file) => {
      const metadata = JSON.parse(await readFile(file, "utf8")) as { version?: unknown };

      if (typeof metadata.version !== "string") {
        throw new Error(`[quaff:assets] Could not read the font engine version from ${file}.`);
      }

      return metadata.version;
    })
  );

  return [SUBSET_CACHE_VERSION, ...versions].join(":");
}

function isWoff2(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 48) {
    return false;
  }

  const header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  return header.getUint32(0) === 0x774f4632 && header.getUint32(8) === bytes.byteLength;
}

function isMissingFile(error: unknown): boolean {
  return !!(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

function resolveFontDirectory(cacheDir: string) {
  const directory = resolvePath(cacheDir, "quaff-fonts");

  if (!UNSAFE_CACHE_PATH_PATTERN.test(directory)) {
    return directory;
  }

  const temporaryRoot = resolvePath(tmpdir(), "quaff-fonts");

  if (UNSAFE_CACHE_PATH_PATTERN.test(temporaryRoot)) {
    throw new Error(
      "[quaff:assets] Vite cannot serve fonts from cache paths containing #, ?, or %. Set cacheDir to an absolute path without these characters."
    );
  }

  // Vite decodes these characters before resolving CSS assets and serving development URLs.
  const projectHash = createHash("sha256").update(directory).digest("hex").slice(0, 16);

  return resolvePath(temporaryRoot, projectHash);
}
