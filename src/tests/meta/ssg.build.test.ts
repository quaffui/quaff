import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, it, onTestFinished } from "vitest";
import { buildAppFixture } from "../support/appFixture";

it("prerenders loaded page metadata into the static HTML head", async () => {
  const app = await buildAppFixture("meta-ssg");
  onTestFinished(app.remove);

  const html = await readFile(join(app.directory, "build/index.html"), "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";

  expect(head.match(/<title>[^<]*<\/title>/g)).toEqual(["<title>Loaded page | Quaff</title>"]);
  const descriptions = head.match(/<meta\b[^>]*name="description"[^>]*>/g);
  expect(descriptions).toHaveLength(1);
  expect(descriptions?.[0]).toContain('content="Loaded before rendering."');
});
