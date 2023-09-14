import { createHash } from "crypto";

export default function generateHash(fileContents: string) {
  const hash = createHash("sha256");
  const fullResult = hash.update(fileContents).digest("hex");
  return fullResult.slice(0, fullResult.length / 2);
}
