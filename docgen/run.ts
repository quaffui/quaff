import { spawn } from "child_process";
import path from "path";
import { createInterface } from "readline";
import { fileURLToPath } from "url";
import createFormatter, { type FormatRequest } from "./format.js";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const DOCGEN_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_STDOUT_BYTES = 64 * 1024 * 1024;
const MAX_STDERR_BYTES = 16 * 1024 * 1024;

export interface DocgenOptions {
  projectRoot?: string;
  targets?: string[];
  changedFiles?: string[];
  resolveImport?: (source: string, importer: string) => Promise<string | null | undefined>;
}

type HostRequest =
  | ({ kind: "format" } & FormatRequest)
  | { kind: "resolve"; source: string; importer: string }
  | { kind: "commit" };

export default function runDocgen({
  projectRoot = PROJECT_ROOT,
  targets = [],
  changedFiles = [],
  resolveImport,
}: DocgenOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const canUseProcessGroup = process.platform !== "win32";
    const child = spawn(
      "cargo",
      [
        "run",
        "--release",
        "--quiet",
        "--locked",
        "--manifest-path",
        path.join(PROJECT_ROOT, "docgen/Cargo.toml"),
        "--",
        "generate",
      ],
      { detached: canUseProcessGroup, stdio: ["pipe", "pipe", "pipe"] }
    );
    child.stdin.write(
      JSON.stringify({
        projectRoot,
        targets,
        changedFiles,
        shouldResolveImports: !!resolveImport,
      }) + "\n"
    );
    const format = createFormatter(projectRoot);
    const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
    let replies = Promise.resolve();
    let diagnostics = "";
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let hasSettled = false;
    let forceKillTimer: ReturnType<typeof setTimeout> | undefined;
    const timeout = setTimeout(
      () => fail(new Error("Rust docgen exceeded its 600-second timeout."), true),
      DOCGEN_TIMEOUT_MS
    );

    function signalChild(signal: NodeJS.Signals) {
      if (!canUseProcessGroup && (child.exitCode !== null || child.signalCode !== null)) {
        return;
      }

      try {
        if (canUseProcessGroup && child.pid) {
          process.kill(-child.pid, signal);
        } else {
          child.kill(signal);
        }
      } catch {
        child.kill(signal);
      }
    }

    function fail(error: unknown, doTerminate = false) {
      if (hasSettled) {
        return;
      }

      hasSettled = true;
      clearTimeout(timeout);
      lines.close();

      if (doTerminate) {
        signalChild("SIGTERM");
        forceKillTimer = setTimeout(() => signalChild("SIGKILL"), 5000);
        forceKillTimer.unref();
      }

      reject(error);
    }

    async function reply(line: string) {
      if (hasSettled) {
        return;
      }

      const request: HostRequest = JSON.parse(line);
      let response: string[] | string | null;

      if (request.kind === "format") {
        response = await format(request);
      } else if (request.kind === "resolve" && resolveImport) {
        response = (await resolveImport(request.source, request.importer)) ?? null;
      } else if (request.kind === "commit") {
        clearTimeout(timeout);
        response = null;
      } else {
        throw new Error(`Unsupported Rust docgen host request: ${request.kind}`);
      }

      if (!hasSettled) {
        child.stdin.write(JSON.stringify(response) + "\n");
      }
    }

    lines.on("line", (line) => {
      replies = replies.then(() => reply(line)).catch((error) => fail(error, true));
    });
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.length;

      if (stdoutBytes > MAX_STDOUT_BYTES) {
        fail(new Error(`Rust docgen stdout exceeded ${MAX_STDOUT_BYTES} bytes.`), true);
      }
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (hasSettled) {
        return;
      }

      stderrBytes += chunk.length;

      if (stderrBytes > MAX_STDERR_BYTES) {
        fail(new Error(`Rust docgen stderr exceeded ${MAX_STDERR_BYTES} bytes.`), true);
        return;
      }

      process.stderr.write(chunk);
      diagnostics += chunk.toString("utf8");
    });
    child.once("error", (error) =>
      fail(new Error(`Failed to start Rust docgen: ${error.message}`, { cause: error }))
    );
    child.stdin.once("error", (error) =>
      fail(new Error(`Failed to reply to Rust docgen: ${error.message}`, { cause: error }), true)
    );
    child.once("close", async (code, signal) => {
      clearTimeout(forceKillTimer);
      await replies;

      if (hasSettled) {
        return;
      }

      if (code !== 0) {
        const status = signal ? `signal ${signal}` : `exit code ${code ?? "unknown"}`;
        fail(
          new Error(
            `Rust docgen failed with ${status}:\n${diagnostics.trim() || "No diagnostics were emitted."}`
          )
        );
        return;
      }

      hasSettled = true;
      clearTimeout(timeout);
      lines.close();
      resolve();
    });
  });
}
