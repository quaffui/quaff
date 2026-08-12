import { createHash, randomUUID } from "crypto";
import { open, readFile, rename, rm, stat, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import pathExists from "../helpers/pathExists.js";

export interface GeneratedFile {
  destination: string;
  contents: string;
}

interface GeneratedFileOperations {
  exists(file: string): Promise<boolean>;
  remove(file: string): Promise<void>;
  rename(source: string, destination: string): Promise<void>;
  write(file: string, contents: string): Promise<void>;
}

interface LockInfo {
  pid: number;
  token: string;
}

const LOCK_POLL_INTERVAL_MS = 50;
const LOCK_WAIT_TIMEOUT_MS = 10 * 60 * 1000;
const INVALID_LOCK_STALE_AFTER_MS = 30 * 1000;

const defaultOperations: GeneratedFileOperations = {
  exists: pathExists,
  async remove(file) {
    await rm(file, { force: true });
  },
  rename,
  async write(file, contents) {
    await writeFile(file, contents, "utf8");
  },
};

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function lockPath(scope: string) {
  const key = createHash("sha256").update(path.resolve(scope)).digest("hex").slice(0, 20);

  return path.join(tmpdir(), `quaff-docgen-props-${key}.lock`);
}

function isProcessAlive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return isNodeError(error) && error.code === "EPERM";
  }
}

async function readLockInfo(file: string): Promise<LockInfo | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(file, "utf8"));

    if (
      typeof value === "object" &&
      value !== null &&
      "pid" in value &&
      typeof value.pid === "number" &&
      Number.isSafeInteger(value.pid) &&
      value.pid > 0 &&
      "token" in value &&
      typeof value.token === "string" &&
      value.token.length > 0
    ) {
      return { pid: value.pid, token: value.token };
    }
  } catch {
    // A process can observe the lock between its creation and metadata write.
  }
}

async function removeStaleLock(file: string) {
  const info = await readLockInfo(file);

  if (info) {
    if (isProcessAlive(info.pid)) {
      return false;
    }

    await rm(file, { force: true });
    return true;
  }

  try {
    const { mtimeMs } = await stat(file);

    if (Date.now() - mtimeMs < INVALID_LOCK_STALE_AFTER_MS) {
      return false;
    }

    await rm(file, { force: true });
    return true;
  } catch (error) {
    return isNodeError(error) && error.code === "ENOENT";
  }
}

async function delay(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function acquireLock(scope: string) {
  const file = lockPath(scope);
  const token = randomUUID();
  const deadline = Date.now() + LOCK_WAIT_TIMEOUT_MS;

  while (true) {
    try {
      const handle = await open(file, "wx");

      try {
        await handle.writeFile(JSON.stringify({ pid: process.pid, token }), "utf8");
      } catch (error) {
        await handle.close();
        await rm(file, { force: true });
        throw error;
      }

      return async () => {
        await handle.close();

        const current = await readLockInfo(file);

        if (current?.token === token) {
          await rm(file, { force: true });
        }
      };
    } catch (error) {
      if (!isNodeError(error) || error.code !== "EEXIST") {
        if (await removeStaleLock(file)) {
          continue;
        }

        throw error;
      }
    }

    if (await removeStaleLock(file)) {
      continue;
    }

    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for another props docgen process to release ${file}.`);
    }

    await delay(LOCK_POLL_INTERVAL_MS);
  }
}

export async function withGeneratedFilesLock<T>(scope: string, callback: () => Promise<T>) {
  const release = await acquireLock(scope);

  try {
    return await callback();
  } finally {
    await release();
  }
}

export async function replaceGeneratedFiles(
  files: GeneratedFile[],
  orphanedOutputs: string[],
  operationOverrides: Partial<GeneratedFileOperations> = {}
) {
  const operations = { ...defaultOperations, ...operationOverrides };
  const nonce = `${process.pid}-${randomUUID()}`;
  const replacements = files.map((file) => ({
    ...file,
    backup: `${file.destination}.${nonce}.bak`,
    temporary: `${file.destination}.${nonce}.tmp`,
  }));
  const orphans = orphanedOutputs.map((destination) => ({
    destination,
    backup: `${destination}.${nonce}.bak`,
  }));
  const targets = [...replacements, ...orphans];
  const uniqueTargets = new Set(targets.map(({ destination }) => destination));

  if (uniqueTargets.size !== targets.length) {
    throw new Error("Props docgen attempted to update the same generated file more than once.");
  }

  const backedUp: (typeof targets)[number][] = [];
  const installed: typeof replacements = [];

  try {
    const writeResults = await Promise.allSettled(
      replacements.map(({ temporary, contents }) => operations.write(temporary, contents))
    );
    const writeErrors = writeResults
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    if (writeErrors.length) {
      throw new AggregateError(writeErrors, "Props docgen could not stage every generated file.");
    }

    for (const target of targets) {
      if (await operations.exists(target.destination)) {
        await operations.rename(target.destination, target.backup);
        backedUp.push(target);
      }
    }

    for (const replacement of replacements) {
      await operations.rename(replacement.temporary, replacement.destination);
      installed.push(replacement);
    }
  } catch (error) {
    const rollbackErrors: unknown[] = [];

    for (const replacement of installed.toReversed()) {
      try {
        await operations.remove(replacement.destination);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }

    for (const target of backedUp.toReversed()) {
      try {
        await operations.rename(target.backup, target.destination);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }

    await Promise.all(
      replacements.map(({ temporary }) =>
        operations.remove(temporary).catch((rollbackError) => rollbackErrors.push(rollbackError))
      )
    );

    if (rollbackErrors.length) {
      throw new AggregateError(
        [error, ...rollbackErrors],
        "Props docgen failed and could not fully roll back generated files.",
        { cause: error }
      );
    }

    throw error;
  }

  const cleanupResults = await Promise.allSettled(
    backedUp.map(({ backup }) => operations.remove(backup))
  );
  const cleanupErrors = cleanupResults
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);

  if (cleanupErrors.length) {
    throw new AggregateError(
      cleanupErrors,
      "Props docgen committed generated files but could not remove every backup."
    );
  }
}
