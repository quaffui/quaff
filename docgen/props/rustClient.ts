import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import {
  DOCGEN_PROTOCOL_VERSION,
  isPropsInterfaceName,
  type DocgenRequest,
  type DocgenResponse,
} from "./types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(dirname, "../..");
const manifestPath = path.resolve(projectRoot, "docgen/Cargo.toml");
const DOCGEN_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_STDOUT_BYTES = 64 * 1024 * 1024;
const MAX_STDERR_BYTES = 16 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isApiEntry(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.header === "string" &&
    typeof value.description === "string"
  );
}

function isApiGeneric(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    isOptionalString(value.constraint) &&
    isOptionalString(value.default)
  );
}

export function validateDocgenResponse(value: unknown): DocgenResponse {
  if (!isRecord(value) || value.version !== DOCGEN_PROTOCOL_VERSION) {
    throw new Error(`Rust docgen returned an unsupported protocol version.`);
  }

  if (!Array.isArray(value.components)) {
    throw new Error(`Rust docgen response is missing its components array.`);
  }

  for (const component of value.components) {
    if (!isRecord(component) || typeof component.propsFile !== "string") {
      throw new Error(`Rust docgen returned an invalid component record.`);
    }

    if (!Array.isArray(component.interfaces)) {
      throw new Error(`Rust docgen returned no interfaces for ${component.propsFile}.`);
    }

    for (const parsedInterface of component.interfaces) {
      if (
        !isRecord(parsedInterface) ||
        typeof parsedInterface.name !== "string" ||
        !isPropsInterfaceName(parsedInterface.name)
      ) {
        throw new Error(`Rust docgen returned an invalid interface record.`);
      }

      if (
        !isOptionalString(parsedInterface.domAttributesConstraint) ||
        !Array.isArray(parsedInterface.generics) ||
        !parsedInterface.generics.every(isApiGeneric) ||
        !Array.isArray(parsedInterface.props) ||
        !parsedInterface.props.every(isApiEntry) ||
        !Array.isArray(parsedInterface.snippets) ||
        !parsedInterface.snippets.every(isApiEntry) ||
        !Array.isArray(parsedInterface.methods) ||
        !parsedInterface.methods.every(isApiEntry) ||
        !isRecord(parsedInterface.typeDependencies) ||
        !Object.values(parsedInterface.typeDependencies).every(
          (definition) => typeof definition === "string"
        )
      ) {
        throw new Error(`Rust docgen returned invalid data for ${parsedInterface.name}.`);
      }
    }
  }

  return value as unknown as DocgenResponse;
}

export default function runRustDocgen(request: DocgenRequest): Promise<DocgenResponse> {
  return new Promise((resolve, reject) => {
    const canUseProcessGroup = process.platform !== "win32";
    const child = spawn(
      "cargo",
      ["run", "--quiet", "--locked", "--manifest-path", manifestPath, "--", "generate"],
      {
        cwd: projectRoot,
        detached: canUseProcessGroup,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let hasSettled = false;
    let forceKillTimer: ReturnType<typeof setTimeout> | undefined;

    const timeout = setTimeout(() => {
      rejectOnce(
        new Error(`Rust docgen exceeded its ${DOCGEN_TIMEOUT_MS / 1000}-second timeout.`),
        true
      );
    }, DOCGEN_TIMEOUT_MS);

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

    function terminateChild() {
      signalChild("SIGTERM");
      forceKillTimer = setTimeout(() => signalChild("SIGKILL"), 5000);
      forceKillTimer.unref();
    }

    function rejectOnce(error: unknown, doTerminate = false) {
      if (hasSettled) {
        return;
      }

      hasSettled = true;
      clearTimeout(timeout);

      if (doTerminate) {
        terminateChild();
      }

      reject(error);
    }

    function resolveOnce(response: DocgenResponse) {
      if (hasSettled) {
        return;
      }

      hasSettled = true;
      clearTimeout(timeout);
      resolve(response);
    }

    child.stdout.on("data", (chunk: Buffer) => {
      if (hasSettled) {
        return;
      }

      stdoutBytes += chunk.length;

      if (stdoutBytes > MAX_STDOUT_BYTES) {
        rejectOnce(new Error(`Rust docgen stdout exceeded ${MAX_STDOUT_BYTES} bytes.`), true);
        return;
      }

      stdout.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (hasSettled) {
        return;
      }

      stderrBytes += chunk.length;

      if (stderrBytes > MAX_STDERR_BYTES) {
        rejectOnce(new Error(`Rust docgen stderr exceeded ${MAX_STDERR_BYTES} bytes.`), true);
        return;
      }

      process.stderr.write(chunk);
      stderr.push(chunk);
    });
    child.once("error", (error) => {
      rejectOnce(new Error(`Failed to start Rust docgen: ${error.message}`, { cause: error }));
    });
    child.once("close", (code, signal) => {
      if (forceKillTimer) {
        clearTimeout(forceKillTimer);
      }

      if (hasSettled) {
        return;
      }

      const output = Buffer.concat(stdout).toString("utf8").trim();
      const diagnostics = Buffer.concat(stderr).toString("utf8").trim();

      if (code !== 0) {
        const status = signal ? `signal ${signal}` : `exit code ${code ?? "unknown"}`;
        const detail = diagnostics || output || "No diagnostics were emitted.";

        rejectOnce(new Error(`Rust docgen failed with ${status}:\n${detail}`));
        return;
      }

      if (!output) {
        rejectOnce(
          new Error(
            `Rust docgen produced no JSON output. The TypeScript pipeline requires the version ${DOCGEN_PROTOCOL_VERSION} batch protocol.`
          )
        );
        return;
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(output);
      } catch (error) {
        const detail = diagnostics ? `\nRust diagnostics:\n${diagnostics}` : "";

        rejectOnce(
          new Error(`Rust docgen produced invalid JSON.${detail}`, {
            cause: error,
          })
        );
        return;
      }

      try {
        resolveOnce(validateDocgenResponse(parsed));
      } catch (error) {
        rejectOnce(error);
      }
    });

    child.stdin.once("error", (error) => {
      rejectOnce(
        new Error(`Failed to send the request to Rust docgen: ${error.message}`, { cause: error }),
        true
      );
    });
    child.stdin.end(JSON.stringify(request));
  });
}
