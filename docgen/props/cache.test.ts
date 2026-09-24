import { mkdir, mkdtemp, rm, symlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, expect, it } from "vitest";
import createPropsHasher from "./cache.js";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

it("invalidates component, transitive dependency and generator changes independently", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "quaff-docgen-cache-"));
  directories.push(root);
  const files: Record<string, string> = {
    ".prettierrc": "{}",
    "bun.lock": "{}",
    "package.json": "{}",
    "docgen/Cargo.toml": "",
    "docgen/Cargo.lock": "",
    "docgen/src/main.rs": "fn main() {}",
    "docgen/props/render.ts": "export {};",
    "docgen/helpers/hash.ts": "export {};",
    "src/lib/types/index.ts": 'export type { Shared } from "./shared.js";',
    "src/lib/types/shared.ts":
      'import type { Outside } from "../../outside.d.ts"; export type Shared = string | Outside;',
    "src/outside.d.ts": 'export type Outside = "before";',
    "src/lib/internal/base/props.ts": "export interface QBaseProps { disabled?: boolean; }",
    "src/lib/internal/base/QBase.svelte":
      '<script lang="ts">let { disabled = false } = $props();</script>',
    "src/lib/components/first/props.ts":
      'import type { Shared } from "$types"; import type { QBaseProps } from "$internal/base/props"; export interface FirstProps extends QBaseProps {}',
    "src/lib/components/first/Example.svelte": '<script lang="ts">let value = 1;</script>',
    "src/lib/components/second/props.ts": 'import type { Shared } from "../first/props";',
    "src/lib/components/linked/props.ts": 'import type { Shared } from "./shared";',
    "src/lib/components/independent/props.ts": "export interface IndependentProps {}",
  };

  for (const [name, contents] of Object.entries(files)) {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, contents);
  }

  const input = (name: string) => ({
    propsFile: path.join(root, "src/lib/components", name, "props.ts"),
    svelteFiles:
      name === "first" ? [path.join(root, "src/lib/components/first/Example.svelte")] : [],
  });
  const hashes = async () => {
    const getHash = await createPropsHasher(root);
    return Promise.all(["first", "second", "independent"].map((name) => getHash(input(name))));
  };
  await symlink(
    path.join(root, "src/lib/types/shared.ts"),
    path.join(root, "src/lib/components/linked/shared.ts")
  );
  const originalLinkedHash = await (await createPropsHasher(root))(input("linked"));
  const original = await hashes();
  expect(await hashes()).toEqual(original);

  await writeFile(path.join(root, "src/lib/components/first/docs.ts"), "generated output");
  expect(await hashes()).toEqual(original);

  await writeFile(path.join(root, "src/outside.d.ts"), 'export type Outside = "after";');
  expect(await (await createPropsHasher(root))(input("linked"))).not.toBe(originalLinkedHash);
  const outsideChange = await hashes();
  expect(outsideChange[0]).not.toBe(original[0]);
  expect(outsideChange[1]).not.toBe(original[1]);
  expect(outsideChange[2]).toBe(original[2]);

  await writeFile(path.join(root, "src/lib/types/shared.ts"), "export type Shared = number;");
  const sharedChange = await hashes();
  expect(sharedChange[0]).not.toBe(original[0]);
  expect(sharedChange[1]).not.toBe(original[1]);
  expect(sharedChange[2]).toBe(original[2]);

  await writeFile(
    path.join(root, "src/lib/internal/base/QBase.svelte"),
    '<script lang="ts">let { disabled = true } = $props();</script>'
  );
  const inheritedDefaultChange = await hashes();
  expect(inheritedDefaultChange[0]).not.toBe(sharedChange[0]);
  expect(inheritedDefaultChange[1]).not.toBe(sharedChange[1]);
  expect(inheritedDefaultChange[2]).toBe(sharedChange[2]);

  await writeFile(path.join(root, "src/lib/components/first/Example.svelte"), "<p>Changed</p>");
  const componentChange = await hashes();
  expect(componentChange[0]).not.toBe(inheritedDefaultChange[0]);
  expect(componentChange.slice(1)).toEqual(inheritedDefaultChange.slice(1));

  await writeFile(path.join(root, "docgen/src/main.rs"), "fn main() { /* updated */ }");
  const generatorChange = await hashes();
  expect(generatorChange.every((hash, index) => hash !== componentChange[index])).toBe(true);
});
