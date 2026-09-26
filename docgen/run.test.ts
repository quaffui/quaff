import { spawn } from "child_process";
import { EventEmitter } from "events";
import { PassThrough } from "stream";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import createFormatter from "./format.js";
import runDocgen from "./run.js";

vi.mock("child_process", () => ({ spawn: vi.fn() }));
vi.mock("./format.js", () => ({ default: vi.fn() }));

beforeEach(() => {
  vi.mocked(createFormatter).mockReturnValue(async ({ sources }) =>
    sources.map((source) => source + " formatted")
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function mockChild() {
  const child = Object.assign(new EventEmitter(), {
    pid: 123456,
    exitCode: null as number | null,
    signalCode: null as string | null,
    stdin: new PassThrough(),
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    kill: vi.fn(),
  });
  vi.mocked(spawn).mockReturnValue(child as unknown as ReturnType<typeof spawn>);
  const responses: string[] = [];
  child.stdin.on("data", (chunk) => responses.push(chunk.toString()));
  const close = (code = 0) => {
    child.stdout.end();
    child.stderr.end();
    child.emit("close", code, null);
  };
  return { child, responses, close };
}

it("answers format and resolution requests in order across split UTF-8 chunks", async () => {
  const { child, responses, close } = mockChild();
  const resolveImport = vi.fn(async () => undefined);
  const result = runDocgen({ resolveImport });
  const request = Buffer.from(
    JSON.stringify({ kind: "format", sources: ["🦀"], canFallback: true }) + "\n"
  );
  const split = request.indexOf(Buffer.from("🦀")) + 1;
  child.stdout.write(request.subarray(0, split));
  child.stdout.write(request.subarray(split));
  child.stdout.write(
    JSON.stringify({ kind: "resolve", source: "./types", importer: "/props.ts" }) + "\n"
  );
  await vi.waitFor(() => expect(responses).toHaveLength(3));
  expect(responses.slice(1).map((line) => JSON.parse(line))).toEqual([["🦀 formatted"], null]);
  expect(resolveImport).toHaveBeenCalledWith("./types", "/props.ts");
  close();
  await result;
});

it("terminates the child and preserves the original formatter error without replying", async () => {
  const { child, responses, close } = mockChild();
  const error = new Error("bad formatting");
  const kill = vi.spyOn(process, "kill").mockImplementation(() => true);
  vi.mocked(createFormatter).mockReturnValue(async () => {
    throw error;
  });
  const result = runDocgen().catch((error: Error) => error);
  child.stdout.write(
    JSON.stringify({ kind: "format", sources: ["bad"], canFallback: false }) + "\n"
  );
  expect(await result).toBe(error);
  expect(responses).toHaveLength(1);

  if (process.platform === "win32") {
    expect(child.kill).toHaveBeenCalledWith("SIGTERM");
  } else {
    expect(kill).toHaveBeenCalledWith(-child.pid, "SIGTERM");
  }

  close(1);
});

it("reports child failures with their stderr diagnostics", async () => {
  const { child, close } = mockChild();
  vi.spyOn(process.stderr, "write").mockReturnValue(true);
  const result = runDocgen().catch((error: Error) => error);
  child.stderr.write("Invalid TypeScript source");
  close(1);
  expect(await result).toMatchObject({
    message: expect.stringContaining("exit code 1:\nInvalid TypeScript source"),
  });
});

it("terminates malformed protocol output", async () => {
  const { child, close } = mockChild();
  const kill = vi.spyOn(process, "kill").mockImplementation(() => true);
  const result = runDocgen().catch((error: Error) => error);
  child.stdout.write("not JSON\n");
  expect(await result).toBeInstanceOf(SyntaxError);
  expect(process.platform === "win32" ? child.kill : kill).toHaveBeenCalled();
  close(1);
});

it("acknowledges commits without formatting and stops the timeout before file replacement", async () => {
  vi.useFakeTimers();
  const { child, responses, close } = mockChild();
  const kill = vi.spyOn(process, "kill").mockImplementation(() => true);
  const result = runDocgen().catch((error: Error) => error);
  child.stdout.write(JSON.stringify({ kind: "commit" }) + "\n");
  await vi.advanceTimersByTimeAsync(0);
  expect(responses).toHaveLength(2);
  expect(JSON.parse(responses[1])).toBeNull();
  await vi.advanceTimersByTimeAsync(10 * 60_000 + 5000);
  expect(kill).not.toHaveBeenCalled();
  expect(child.kill).not.toHaveBeenCalled();
  close();
  expect(await result).toBeUndefined();
});

it.skipIf(process.platform === "win32")(
  "kills a timed-out process group after its cargo leader exits",
  async () => {
    vi.useFakeTimers();
    const { child } = mockChild();
    const kill = vi.spyOn(process, "kill").mockImplementation(() => true);
    const result = runDocgen().catch((error: Error) => error);
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(await result).toMatchObject({ message: expect.stringContaining("timeout") });
    expect(kill).toHaveBeenCalledWith(-child.pid, "SIGTERM");
    child.signalCode = "SIGTERM";
    child.emit("exit", null, "SIGTERM");
    await vi.advanceTimersByTimeAsync(5000);
    expect(kill).toHaveBeenCalledWith(-child.pid, "SIGKILL");
    child.emit("close", null, "SIGTERM");
  }
);
