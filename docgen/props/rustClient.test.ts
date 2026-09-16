import { spawn } from "child_process";
import { EventEmitter } from "events";
import { PassThrough } from "stream";
import { afterEach, expect, it, vi } from "vitest";
import runRustDocgen from "./rustClient.js";

vi.mock("child_process", () => ({ spawn: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it.skipIf(process.platform === "win32")(
  "kills a timed-out process group even after its cargo leader has exited",
  async () => {
    vi.useFakeTimers();

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
    const kill = vi.spyOn(process, "kill").mockImplementation(() => true);
    const result = runRustDocgen({ version: 1, components: [] }).catch((error: Error) => error);

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
