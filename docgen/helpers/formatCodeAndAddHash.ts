import prettier from "prettier";
import { fileURLToPath } from "url";

async function formatCode(code: string) {
  const prettierRcUrl = new URL("../../.prettierrc", import.meta.url);
  const options = await prettier.resolveConfig(fileURLToPath(prettierRcUrl));

  return prettier.format(code, { ...options, parser: "typescript" });
}

export default async function formatCodeAndAddHash(code: string, hash: string) {
  const formatted = await formatCode(code);
  return [
    "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE",
    `// @quaffHash ${hash}`,
    "",
    formatted,
  ].join("\n");
}
