import { readFile } from "fs/promises";

export type SnippetSection = {
  title: string;
  content: string;
};

export default async function parseSvelteFile(svelteFilePath: string) {
  const fileContent = await readFile(svelteFilePath, "utf-8");
  const qDocsSectionPattern = /<QDocsSection[^>]*?title="(.*?)">(.*?)<\/QDocsSection>/gs;
  const SIX_SPACES = "      ";

  let match;
  const sections: SnippetSection[] = [];

  while ((match = qDocsSectionPattern.exec(fileContent))) {
    const title = match[1];
    const content = match[2].trim();
    sections.push({ title, content });
  }

  return sections.map(({ title, content }) => ({
    title,
    content: content.replaceAll(SIX_SPACES, ""),
  }));
}
