import { readFile, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import getComponentDirs from "../helpers/getComponentDirs.js";
import pathExists from "../helpers/pathExists.js";
import extractHash from "../helpers/extractHash.js";
import createPropsHasher from "./cache.js";
import { replaceGeneratedFiles, withGeneratedFilesLock } from "./generatedFiles.js";
import renderDocs from "./renderDocs.js";
import runRustDocgen from "./rustClient.js";
import { DOCGEN_PROTOCOL_VERSION, type DocgenComponentInput } from "./types.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/lib/components");
const GENERATED_HEADER = "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE";

export function resolveTargetDirs(
  allComponentDirs: string[],
  targets?: string[] | string
): Set<string> | undefined {
  if (!targets) {
    return;
  }

  const targetList = Array.isArray(targets) ? targets : [targets];

  if (!targetList.length) {
    return;
  }

  const allDirsSet = new Set(allComponentDirs);
  const targetDirs = new Set<string>();

  for (const rawTarget of targetList) {
    const target = rawTarget.trim();

    if (!target) {
      continue;
    }

    if (allDirsSet.has(target)) {
      targetDirs.add(target);
      continue;
    }

    const resolved = path.resolve(target);
    const rel = path.relative(rootDir, resolved);

    if (!rel) {
      return;
    }

    if (
      rel === ".." ||
      rel.startsWith(`..${path.sep}`) ||
      rel.includes(`${path.sep}..${path.sep}`) ||
      path.isAbsolute(rel)
    ) {
      throw new Error(`Target is not within the components directory (${rootDir}): ${rawTarget}`);
    }

    const componentDir = rel.split(path.sep)[0];

    if (!allDirsSet.has(componentDir)) {
      throw new Error(`Component directory not found for target: ${rawTarget}`);
    }

    targetDirs.add(componentDir);
  }

  return targetDirs.size > 0 ? targetDirs : undefined;
}

async function collectInputs(allDirs: string[], targetDirs?: Set<string>) {
  const componentDirs = (
    targetDirs ? allDirs.filter((dir) => targetDirs.has(dir)) : allDirs
  ).sort();
  const inputs: DocgenComponentInput[] = [];
  const orphanedOutputs: string[] = [];

  for (const dir of componentDirs) {
    const componentDir = path.resolve(rootDir, dir);
    const propsFile = path.resolve(componentDir, "props.ts");

    const hasProps = await pathExists(propsFile);

    // Remove the obsolete intermediate output as components migrate to complete docs.ts files.
    for (const name of hasProps ? ["docs.props.ts"] : ["docs.props.ts", "docs.ts"]) {
      const generatedFile = path.resolve(componentDir, name);

      if (
        (await pathExists(generatedFile)) &&
        (await readFile(generatedFile, "utf8")).startsWith(GENERATED_HEADER)
      ) {
        orphanedOutputs.push(generatedFile);
      }
    }

    if (!hasProps) {
      continue;
    }

    const svelteFiles = (await readdir(componentDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".svelte"))
      .map((entry) => path.resolve(componentDir, entry.name))
      .sort();

    inputs.push({ propsFile, svelteFiles });
  }

  return { inputs, orphanedOutputs };
}

function validateResponse(inputs: DocgenComponentInput[], responsePaths: string[]) {
  const requested = new Set(inputs.map(({ propsFile }) => path.resolve(propsFile)));
  const received = new Set<string>();

  for (const responsePath of responsePaths) {
    const resolved = path.resolve(responsePath);

    if (!requested.has(resolved)) {
      throw new Error(`Rust docgen returned an unexpected component: ${responsePath}`);
    }

    if (received.has(resolved)) {
      throw new Error(`Rust docgen returned ${responsePath} more than once.`);
    }

    received.add(resolved);
  }

  const missing = [...requested].filter((propsFile) => !received.has(propsFile));

  if (missing.length) {
    throw new Error(`Rust docgen omitted ${missing.length} component(s):\n${missing.join("\n")}`);
  }
}

async function updateAllPropsLocked(targets?: string[] | string) {
  const allDirs = await getComponentDirs(rootDir);
  const targetDirs = resolveTargetDirs(allDirs, targets);
  const { inputs: requestedInputs, orphanedOutputs } = await collectInputs(allDirs, targetDirs);
  const getHash = await createPropsHasher(path.resolve(rootDir, "../../.."));
  const hashes = new Map<string, string>();
  const inputs: DocgenComponentInput[] = [];

  for (const input of requestedInputs) {
    const hash = await getHash(input);
    const output = path.join(path.dirname(input.propsFile), "docs.ts");
    hashes.set(input.propsFile, hash);

    if (!(await pathExists(output)) || extractHash(await readFile(output, "utf8")) !== hash) {
      inputs.push(input);
    }
  }

  if (inputs.length === 0) {
    if (orphanedOutputs.length > 0) {
      await replaceGeneratedFiles([], orphanedOutputs);
    }

    return;
  }

  const response = await runRustDocgen({
    version: DOCGEN_PROTOCOL_VERSION,
    components: inputs,
  });

  validateResponse(
    inputs,
    response.components.map(({ propsFile }) => propsFile)
  );

  const rendered = await Promise.all(
    response.components.map(async ({ propsFile, interfaces }) => {
      if (!interfaces.length) {
        throw new Error(`Rust docgen returned no props interfaces for ${propsFile}.`);
      }

      const interfaceNames = new Set<string>();

      for (const parsedInterface of interfaces) {
        if (interfaceNames.has(parsedInterface.name)) {
          throw new Error(`Rust docgen returned ${parsedInterface.name} more than once.`);
        }

        interfaceNames.add(parsedInterface.name);
      }

      const destination = path.resolve(path.dirname(propsFile), "docs.ts");
      const contents = await renderDocs(interfaces, hashes.get(propsFile));

      return { destination, contents };
    })
  );

  const changed = [];

  for (const output of rendered) {
    if (
      !(await pathExists(output.destination)) ||
      (await readFile(output.destination, "utf8")) !== output.contents
    ) {
      changed.push(output);
    }
  }

  await replaceGeneratedFiles(changed, orphanedOutputs);
}

export default async function updateAllProps(targets?: string[] | string) {
  await withGeneratedFilesLock(rootDir, () => updateAllPropsLocked(targets));
}
