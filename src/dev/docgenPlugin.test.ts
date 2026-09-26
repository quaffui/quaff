import path from "path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import runDocgen from "../../docgen/run.js";
import updateAllSnippets from "../../docgen/snippets/updateAllSnippets.js";
import docgenPlugin from "./docgenPlugin.js";
import type { HotUpdateOptions, ResolvedConfig } from "vite";

vi.mock("../../docgen/run.js", () => ({ default: vi.fn() }));
vi.mock("../../docgen/snippets/getSnippetPagePaths.js", () => ({ default: vi.fn(async () => []) }));
vi.mock("../../docgen/snippets/updateAllSnippets.js", () => ({ default: vi.fn(async () => {}) }));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

function createHarness() {
  const runs: { resolve(): void; reject(error: Error): void }[] = [];
  vi.mocked(runDocgen).mockImplementation(
    () => new Promise<void>((resolve, reject) => runs.push({ resolve, reject }))
  );
  const plugin = docgenPlugin();
  const hook = plugin.hotUpdate;

  if (typeof hook !== "function") {
    throw new Error("Expected the docgen hot update hook");
  }

  const logger = { info: vi.fn(), error: vi.fn(), clearScreen: vi.fn() };
  const resolveId = vi.fn();
  const update = (
    file: string,
    type: HotUpdateOptions["type"] = "update",
    environment = "client"
  ) =>
    hook.call(
      { environment: { name: environment } } as ThisParameterType<typeof hook>,
      {
        type,
        file: path.resolve(file),
        server: { config: { logger }, pluginContainer: { resolveId } },
      } as unknown as HotUpdateOptions
    );
  return { plugin, runs, logger, update, resolveId };
}

it("retries failed changed files together with edits queued during generation", async () => {
  const { runs, logger, update } = createHarness();
  const first = update("src/lib/components/input/props.ts");
  await vi.advanceTimersByTimeAsync(75);
  const second = update("src/lib/components/time/props.ts");
  runs[0].reject(new Error("first generation failed"));
  await vi.advanceTimersByTimeAsync(75);
  expect(vi.mocked(runDocgen).mock.lastCall?.[0]?.changedFiles).toEqual([
    path.resolve("src/lib/components/time/props.ts"),
    path.resolve("src/lib/components/input/props.ts"),
  ]);
  runs[1].resolve();
  await Promise.all([first, second]);
  expect(logger.error).not.toHaveBeenCalled();

  const third = update("src/lib/components/input/props.ts");
  await vi.advanceTimersByTimeAsync(75);
  runs[2].reject(new Error("final generation failed"));
  await third;
  expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("final generation failed"));
});

it("gives create/delete full runs precedence and ignores server and generated updates", async () => {
  const { runs, update } = createHarness();

  for (const type of ["create", "delete"] as const) {
    await update("src/lib/components/input/QInput.svelte", type, "ssr");
    const edit = update("src/shared.ts");
    const full = update("src/lib/components/input/QInput.svelte", type);
    await vi.advanceTimersByTimeAsync(75);
    expect(vi.mocked(runDocgen).mock.lastCall?.[0]?.changedFiles).toBeUndefined();
    runs.at(-1)?.resolve();
    await Promise.all([edit, full]);
  }

  for (const file of [
    "build/app/chunk.js",
    "dist/components/Example.svelte",
    ".svelte-kit/types/index.d.ts",
    "package/index.js",
    "plugins/dist/index.js",
    "docgen/target/generated.js",
    "src/lib/components/input/docs.props.ts",
    "src/lib/components/input/docs.ts",
    "src/routes/example/docs.snippets.ts",
  ]) {
    for (const type of ["create", "update", "delete"] as const) {
      await update(file, type);
    }
  }

  await vi.advanceTimersByTimeAsync(75);
  expect(runs).toHaveLength(2);
});

it("preserves edits queued as a generation finishes and delegates Vite resolution", async () => {
  const { runs, update, resolveId, logger } = createHarness();
  const first = update("src/lib/components/fixture/props.ts");
  await vi.advanceTimersByTimeAsync(75);
  runs[0].resolve();
  const second = update("shared/types.d.ts");
  await vi.advanceTimersByTimeAsync(75);
  expect(runs).toHaveLength(2);
  const options = vi.mocked(runDocgen).mock.lastCall?.[0];
  expect(options?.changedFiles).toEqual([path.resolve("shared/types.d.ts")]);
  resolveId.mockResolvedValueOnce({ id: "/resolved/types.ts?import" });
  expect(await options?.resolveImport?.("$types", "/props.ts")).toBe("/resolved/types.ts");
  expect(resolveId).toHaveBeenCalledWith("$types", "/props.ts");
  resolveId.mockResolvedValueOnce({ id: "external-package", external: true });
  expect(await options?.resolveImport?.("external-package", "/props.ts")).toBeUndefined();
  runs[1].resolve();
  await Promise.all([first, second]);
  expect(logger.error).not.toHaveBeenCalled();
});

it("keeps startup generation and snippets limited to a development server", async () => {
  const { plugin, runs, logger } = createHarness();
  const hook = plugin.configResolved;

  if (typeof hook !== "function") {
    throw new Error("Expected the config resolved hook");
  }

  const configure = (command: ResolvedConfig["command"], mode: string) =>
    hook.call(
      {} as ThisParameterType<typeof hook>,
      { command, mode, logger } as unknown as ResolvedConfig
    );

  await configure("build", "production");
  await configure("serve", "test");
  expect(runs).toHaveLength(0);
  const start = configure("serve", "development");
  await vi.advanceTimersByTimeAsync(75);
  expect(runs).toHaveLength(1);
  expect(updateAllSnippets).toHaveBeenCalledOnce();
  expect(vi.mocked(runDocgen).mock.lastCall?.[0]?.changedFiles).toBeUndefined();
  runs[0].resolve();
  await start;
});
