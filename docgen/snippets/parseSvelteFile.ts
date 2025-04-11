import { readFile } from "fs/promises";
import { format } from "prettier";

export type SnippetSection = {
  title: string;
  content: string;
};

export default async function parseSvelteFile(svelteFilePath: string) {
  const fileContent = await readFile(svelteFilePath, "utf-8");
  const qDocsSectionPattern = /<QDocsSection[^>]*?title="(.*?)"\s*>(.*?)<\/QDocsSection>/gms;

  let match;
  const sections: SnippetSection[] = [];

  while ((match = qDocsSectionPattern.exec(fileContent))) {
    const title = match[1];
    const content = match[2].trim();

    const contentWithoutDescription = content.replace(
      /\{#snippet sectionDescription\(\)\}.+?\s{8}\{\/snippet\}/gms,
      ""
    );

    const formatted = await format(contentWithoutDescription, {
      parser: "svelte",
      plugins: ["prettier-plugin-svelte"],
      printWidth: 100,
    });

    sections.push({ title, content: formatted });
  }

  return sections;
}
