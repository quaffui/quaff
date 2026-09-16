import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDocgenSourceReader,
  getAffectedDocgenComponents,
  getDocgenImports,
} from "./dependencies.js";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe("docgen source dependencies", () => {
  it("reads type-only imports and reexports from TypeScript and both Svelte scripts", async () => {
    expect(
      await getDocgenImports('import type { A } from "./a"; export { B } from "./b";', "props.ts")
    ).toEqual(["./a", "./b"]);
    expect(
      await getDocgenImports(
        '<script lang="ts" module>import type { A } from "./a";</script>' +
          '<script lang="ts">import { B } from "./b";</script><p>from "./ignored"</p>',
        "QExample.svelte"
      )
    ).toEqual(["./a", "./b"]);
  });

  it("retains script imports while component markup is incomplete", async () => {
    expect(
      await getDocgenImports(
        '<script lang="ts">import type { Props } from "./props";</script><button',
        "QExample.svelte"
      )
    ).toEqual(["./props"]);
  });

  it("scans scripts with generic attributes and syntax errors without scanning markup or comments", async () => {
    expect(
      await getDocgenImports(
        '<!-- <script>import "./ignored";</script> -->' +
          '<script generics="T extends Record<string, unknown>" lang="ts">' +
          'import type { A } from "./a"; const = ;</script>' +
          '<script module lang="ts">export type { B } from "./b";</script>' +
          '<style>@import "./ignored.css";</style><p>import "./ignored";</p>',
        "Example.svelte"
      )
    ).toEqual(["./a", "./b"]);
  });

  it("follows shared types, barrels and cycles without including unrelated components", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "quaff-docgen-dependencies-"));
    directories.push(root);
    const components = path.join(root, "components");
    const files: Record<string, string> = {
      "types.ts": 'export type Shared = string; export type { Cycle } from "./cycle.ts";',
      "cycle.ts": 'import type { Shared } from "./types.ts"; export type Cycle = Shared;',
      "index.ts": 'export type { Shared } from "./types.ts";',
      "components/input/props.ts": 'import type { Shared } from "../../index.ts";',
      "components/date/props.ts": 'export type { Shared } from "../input/props.ts";',
      "components/time/props.ts": "export interface QTimeProps {}",
      "components/time/QTime.svelte":
        '<script lang="ts">import type { Shared } from "../../index.ts";</script>',
      "components/button/props.ts":
        'import "./style.css"; import "./docs.props.ts"; import type { External } from "external";',
      "components/button/style.css": "invalid TypeScript but harmless CSS",
      "components/button/QButton.svelte": '<script lang="ts">const = ;</script>',
    };

    for (const [file, contents] of Object.entries(files)) {
      const destination = path.join(root, file);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, contents);
    }

    const resolveImport = vi.fn(async (source: string, importer: string) => {
      if (!source.startsWith(".")) {
        throw new Error("External type-only exports cannot be resolved at runtime");
      }

      return path.resolve(path.dirname(importer), source);
    });
    const affected = await getAffectedDocgenComponents(
      path.join(root, "types.ts"),
      components,
      resolveImport
    );
    expect(affected.map((directory) => path.basename(directory)).sort()).toEqual([
      "date",
      "input",
      "time",
    ]);
    expect(
      await getAffectedDocgenComponents(path.join(root, "unrelated.ts"), components, resolveImport)
    ).toEqual([]);

    const getSourceFiles = createDocgenSourceReader(resolveImport);
    const dateProps = path.join(components, "date/props.ts");
    const inputProps = path.join(components, "input/props.ts");
    const dependencies = ["cycle.ts", "index.ts", "types.ts"].map((file) => path.join(root, file));
    expect(await getSourceFiles([dateProps, dateProps])).toEqual(
      [dateProps, inputProps, ...dependencies].sort()
    );
    const resolutionCount = resolveImport.mock.calls.length;
    expect(await getSourceFiles([inputProps])).toEqual([inputProps, ...dependencies].sort());
    expect(resolveImport).toHaveBeenCalledTimes(resolutionCount);
    expect(await getSourceFiles([path.join(components, "button/props.ts")])).toEqual([
      path.join(components, "button/props.ts"),
    ]);

    const outsideDependency = `${root}-outside.ts`;
    await writeFile(outsideDependency, "export type Outside = string;");
    directories.push(outsideDependency);
    await writeFile(
      inputProps,
      `import type { Outside } from ${JSON.stringify(path.relative(path.dirname(inputProps), outsideDependency))};`
    );
    expect(await getAffectedDocgenComponents(outsideDependency, components, resolveImport)).toEqual(
      [path.join(components, "date"), path.join(components, "input")]
    );

    const changedSource = path.join(components, "button/QButton.svelte");
    await writeFile(changedSource, '<script lang="ts">const = ;</script>');
    expect(await getAffectedDocgenComponents(changedSource, components, resolveImport)).toEqual([
      path.join(components, "button"),
    ]);
  });
});
