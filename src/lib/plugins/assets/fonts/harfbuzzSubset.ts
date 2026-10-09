import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

interface SubsetExports {
  memory: WebAssembly.Memory;
  _initialize(): void;
  malloc(length: number): number;
  free(pointer: number): void;
  hb_blob_create(data: number, length: number, mode: number, user: number, destroy: number): number;
  hb_blob_destroy(blob: number): void;
  hb_blob_get_length(blob: number): number;
  hb_blob_get_data(blob: number, length: number): number;
  hb_face_create(blob: number, index: number): number;
  hb_face_destroy(face: number): void;
  hb_face_reference_blob(face: number): number;
  hb_subset_input_create_or_fail(): number;
  hb_subset_input_destroy(input: number): void;
  hb_subset_input_unicode_set(input: number): number;
  hb_subset_input_glyph_set(input: number): number;
  hb_subset_input_set(input: number, set: number): number;
  hb_subset_input_set_flags(input: number, flags: number): void;
  hb_subset_or_fail(face: number, input: number): number;
  hb_set_clear(set: number): void;
  hb_set_add(set: number, value: number): void;
  hb_set_invert(set: number): void;
}

const REQUIRE = createRequire(import.meta.url);
const NO_LAYOUT_CLOSURE = 0x200;
const KEEP_GLYPH_NAMES = 0x80;
const LAYOUT_FEATURE_SET = 6;
const READONLY_MEMORY = 2;
let runtime: Promise<SubsetExports> | undefined;

async function createSubsetRuntime(): Promise<SubsetExports> {
  const path = REQUIRE.resolve("harfbuzzjs/dist/harfbuzz-subset.wasm");
  const runtimeBytes = await readFile(path);
  const module = await WebAssembly.compile(new Uint8Array(runtimeBytes));
  const instance = await WebAssembly.instantiate(module);
  const exports = instance.exports as unknown as SubsetExports;
  exports._initialize();
  return exports;
}

function setSubsetValues(hb: SubsetExports, target: number, values: Iterable<number>): void {
  hb.hb_set_clear(target);

  for (const value of values) {
    hb.hb_set_add(target, value);
  }
}

export async function subsetSfntFont(
  input: Uint8Array,
  glyphs: ReadonlySet<number>,
  unicodes: ReadonlySet<number>
): Promise<Uint8Array> {
  runtime ??= createSubsetRuntime();
  const hb = await runtime;
  const allocation = hb.malloc(input.byteLength);

  if (!allocation) {
    throw new Error("Cannot allocate memory for Material Symbols subsetting.");
  }

  let blob = 0;
  let face = 0;
  let request = 0;
  let subset = 0;
  let output = 0;

  try {
    new Uint8Array(hb.memory.buffer, allocation, input.byteLength).set(input);
    blob = hb.hb_blob_create(allocation, input.byteLength, READONLY_MEMORY, 0, 0);
    face = hb.hb_face_create(blob, 0);
    request = hb.hb_subset_input_create_or_fail();

    if (!request) {
      throw new Error("Cannot create a Material Symbols subset request.");
    }

    // ASCII ligature closure would retain other icons sharing the same letters.
    hb.hb_subset_input_set_flags(request, NO_LAYOUT_CLOSURE | KEEP_GLYPH_NAMES);
    setSubsetValues(hb, hb.hb_subset_input_glyph_set(request), glyphs);
    setSubsetValues(hb, hb.hb_subset_input_unicode_set(request), unicodes);
    const features = hb.hb_subset_input_set(request, LAYOUT_FEATURE_SET);
    hb.hb_set_clear(features);
    hb.hb_set_invert(features);
    subset = hb.hb_subset_or_fail(face, request);

    if (!subset) {
      throw new Error("HarfBuzz could not subset the Material Symbols font.");
    }

    output = hb.hb_face_reference_blob(subset);
    const length = hb.hb_blob_get_length(output);
    const pointer = hb.hb_blob_get_data(output, 0);
    return new Uint8Array(hb.memory.buffer, pointer, length).slice();
  } finally {
    hb.hb_blob_destroy(output);
    hb.hb_face_destroy(subset);
    hb.hb_subset_input_destroy(request);
    hb.hb_face_destroy(face);
    hb.hb_blob_destroy(blob);
    hb.free(allocation);
  }
}
