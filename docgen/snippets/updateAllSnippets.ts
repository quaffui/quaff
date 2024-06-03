import getSnippetPagePaths from "./getSnippetPagePaths.js";
import updateSnippetsForPage from "./updateSnippetsForPage.js";

export default async function updateAllSnippets() {
  const snippetPagePaths = await getSnippetPagePaths();

  for (const snippetPagePath of snippetPagePaths) {
    await updateSnippetsForPage(snippetPagePath);
  }
}
