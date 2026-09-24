import { spawn } from "child_process";
import { EventEmitter } from "events";
import path from "path";
import { afterEach, expect, it, vi } from "vitest";
import { getAffectedDocgenComponents } from "../../docgen/props/dependencies.js";
import docgenPlugin from "./docgenPlugin.js";
import type { HotUpdateOptions } from "vite";

vi.mock("child_process", () => ({ spawn: vi.fn() }));
vi.mock("../../docgen/props/dependencies.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../docgen/props/dependencies.js")>()),
  getAffectedDocgenComponents: vi.fn(async (file: string) => [path.dirname(file)]),
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it("retries failed targets together with edits queued during the failed generation", async () => {
  vi.useFakeTimers();

  const children: EventEmitter[] = [];
  vi.mocked(spawn).mockImplementation(() => {
    const child = new EventEmitter();
    children.push(child);
    return child as ReturnType<typeof spawn>;
  });
  const plugin = docgenPlugin();
  const hook = plugin.hotUpdate;

  if (typeof hook !== "function") {
    throw new Error("Expected the docgen hot update hook");
  }

  const logger = { info: vi.fn(), error: vi.fn(), clearScreen: vi.fn() };
  const update = (component: string) =>
    hook.call(
      { environment: { name: "client" } } as ThisParameterType<typeof hook>,
      {
        type: "update",
        file: path.resolve(`src/lib/components/${component}/props.ts`),
        server: { config: { logger } },
      } as unknown as HotUpdateOptions
    );
  const first = update("input");
  await vi.advanceTimersByTimeAsync(75);
  expect(children).toHaveLength(1);

  const second = update("time");
  await vi.advanceTimersByTimeAsync(0);
  children[0].emit("exit", 1, null);
  await vi.advanceTimersByTimeAsync(75);
  expect(children).toHaveLength(2);
  expect(vi.mocked(spawn).mock.calls[1][1]).toEqual([
    "scripts/docgenProps.ts",
    path.resolve("src/lib/components/time"),
    path.resolve("src/lib/components/input"),
  ]);

  children[1].emit("exit", 0, null);
  await Promise.all([first, second]);
  expect(logger.error).not.toHaveBeenCalled();

  const third = update("input");
  await vi.advanceTimersByTimeAsync(75);
  children[2].emit("exit", 1, null);
  await third;
  expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("exit code 1"));
});

it("regenerates added and removed sources once and ignores generated files", async () => {
  vi.useFakeTimers();

  const children: EventEmitter[] = [];
  vi.mocked(spawn).mockImplementation(() => {
    const child = new EventEmitter();
    children.push(child);
    return child as ReturnType<typeof spawn>;
  });
  const hook = docgenPlugin().hotUpdate;

  if (typeof hook !== "function") {
    throw new Error("Expected the docgen hot update hook");
  }

  const logger = { info: vi.fn(), error: vi.fn(), clearScreen: vi.fn() };
  const update = (type: HotUpdateOptions["type"], file: string, environment = "client") =>
    hook.call(
      { environment: { name: environment } } as ThisParameterType<typeof hook>,
      {
        type,
        file: path.resolve(`src/lib/components/input/${file}`),
        server: { config: { logger } },
      } as unknown as HotUpdateOptions
    );

  for (const type of ["create", "delete"] as const) {
    await update(type, "QInput.svelte", "ssr");
    const pending = update(type, "QInput.svelte");
    await vi.advanceTimersByTimeAsync(75);
    expect(vi.mocked(spawn).mock.lastCall?.[1]).toEqual(["scripts/docgenProps.ts"]);
    children.at(-1)?.emit("exit", 0, null);
    await pending;
  }

  for (const type of ["create", "update", "delete"] as const) {
    await update(type, "docs.props.ts");
    await update(type, "docs.ts");
  }

  await vi.advanceTimersByTimeAsync(75);
  expect(children).toHaveLength(2);
  expect(logger.error).not.toHaveBeenCalled();
});

it("runs edits queued while the previous generation finishes", async () => {
  vi.useFakeTimers();

  const children: EventEmitter[] = [];
  vi.mocked(spawn).mockImplementation(() => {
    const child = new EventEmitter();
    children.push(child);
    return child as ReturnType<typeof spawn>;
  });
  const hook = docgenPlugin().hotUpdate;

  if (typeof hook !== "function") {
    throw new Error("Expected the docgen hot update hook");
  }

  const logger = { info: vi.fn(), error: vi.fn(), clearScreen: vi.fn() };
  const update = (file: string) =>
    hook.call(
      { environment: { name: "client" } } as ThisParameterType<typeof hook>,
      {
        type: "update",
        file: path.resolve(file),
        server: { config: { logger } },
      } as unknown as HotUpdateOptions
    );
  const first = update("src/lib/components/fixture/props.ts");
  await vi.advanceTimersByTimeAsync(75);
  children[0].emit("exit", 0, null);

  // The next handler resumes before the completed queue's promise handlers run.
  const second = update("src/shared.d.ts");
  await vi.advanceTimersByTimeAsync(75);
  expect(children).toHaveLength(2);
  expect(vi.mocked(spawn).mock.lastCall?.[1]).toEqual([
    "scripts/docgenProps.ts",
    path.resolve("src"),
  ]);
  children[1].emit("exit", 0, null);
  await Promise.all([first, second]);
  expect(logger.error).not.toHaveBeenCalled();
});

it("ignores generated build sources while preserving local dependencies outside src", async () => {
  vi.useFakeTimers();

  const children: EventEmitter[] = [];
  vi.mocked(spawn).mockImplementation(() => {
    const child = new EventEmitter();
    children.push(child);
    return child as ReturnType<typeof spawn>;
  });
  const hook = docgenPlugin().hotUpdate;

  if (typeof hook !== "function") {
    throw new Error("Expected the docgen hot update hook");
  }

  const logger = { info: vi.fn(), error: vi.fn(), clearScreen: vi.fn() };
  const update = (type: HotUpdateOptions["type"], file: string) =>
    hook.call(
      { environment: { name: "client" } } as ThisParameterType<typeof hook>,
      {
        type,
        file: path.resolve(file),
        server: { config: { logger } },
      } as unknown as HotUpdateOptions
    );

  for (const file of [
    "build/app/chunk.js",
    "dist/components/Example.svelte",
    ".svelte-kit/types/index.d.ts",
    "package/index.js",
    "plugins/dist/index.js",
    "docgen/target/generated.js",
    "src/lib/components/fixture/docs.props.ts",
    "src/lib/components/fixture/docs.ts",
    "src/routes/example/docs.snippets.ts",
  ]) {
    for (const type of ["create", "update", "delete"] as const) {
      await update(type, file);
    }
  }

  vi.mocked(getAffectedDocgenComponents).mockResolvedValueOnce([]);
  await update("update", "src/unused.ts");
  await vi.advanceTimersByTimeAsync(75);
  expect(children).toHaveLength(0);
  expect(logger.info).not.toHaveBeenCalled();

  for (const file of ["shared/types.d.ts", "dist-helpers/types.ts"]) {
    const pending = update("update", file);
    await vi.advanceTimersByTimeAsync(75);
    expect(vi.mocked(spawn).mock.lastCall?.[1]).toEqual([
      "scripts/docgenProps.ts",
      path.resolve(path.dirname(file)),
    ]);
    children.at(-1)?.emit("exit", 0, null);
    await pending;
  }

  expect(children).toHaveLength(2);
  expect(logger.error).not.toHaveBeenCalled();
});
