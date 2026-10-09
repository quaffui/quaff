import { access, readdir, realpath, stat } from "node:fs/promises";
import { resolve } from "node:path";
import type { Dirent } from "node:fs";

const SOURCE_FILE_PATTERN = /\.(?:svelte|html|[cm]?[jt]s|md|svx|json|css|scss)$/;
const DECLARATION_FILE_PATTERN = /\.d\.[cm]?[jt]s$/;
const SKIPPED_DIRECTORIES = new Set([".svelte-kit", "node_modules"]);

interface SourceFiles {
  files: string[];
  realDirectories: Set<string>;
  realFiles: Set<string>;
}

export async function findSourceFiles(
  dir: string,
  sourceFiles: SourceFiles = {
    files: [],
    realDirectories: new Set(),
    realFiles: new Set(),
  }
): Promise<SourceFiles> {
  const realDirectory = await realpath(dir);

  if (sourceFiles.realDirectories.has(realDirectory)) {
    return sourceFiles;
  }

  sourceFiles.realDirectories.add(realDirectory);

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    await collectSourceEntry(dir, entry, sourceFiles);
  }

  return sourceFiles;
}

async function collectSourceEntry(dir: string, entry: Dirent, sourceFiles: SourceFiles) {
  const path = resolve(dir, entry.name);

  if (await isDirectoryEntry(entry, path)) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) {
      return;
    }

    await findSourceFiles(path, sourceFiles);

    return;
  }

  if (!isSourceFile(path)) {
    return;
  }

  const realFile = await realpath(path);

  if (!sourceFiles.realFiles.has(realFile)) {
    sourceFiles.files.push(path);
    sourceFiles.realFiles.add(realFile);
  }
}

async function isDirectoryEntry(entry: Dirent, path: string) {
  if (!entry.isSymbolicLink()) {
    return entry.isDirectory();
  }

  try {
    const information = await stat(path);

    return information.isDirectory();
  } catch (error) {
    if (isMissingPathError(error) && !isSourceFile(path)) {
      return false;
    }

    throw error;
  }
}

export function isSourceFile(file: string) {
  return SOURCE_FILE_PATTERN.test(file) && !DECLARATION_FILE_PATTERN.test(file);
}

export function normalizePath(path: string) {
  return path.replaceAll("\\", "/");
}

export async function doesFileExist(file: string) {
  try {
    await access(file);

    return true;
  } catch (error) {
    if (isMissingPathError(error)) {
      return false;
    }

    throw error;
  }
}

function isMissingPathError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
