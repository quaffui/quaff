import { getCanonicalUrl } from "$docs/metadata";

export const prerender = true;

export function GET() {
  const urls = Object.keys(import.meta.glob("/src/routes/**/+page.svelte"))
    .map((file) => file.replace("/src/routes", "").replace("/+page.svelte", "") || "/")
    .filter((path) => path !== "/privacy-policy")
    .sort()
    .map((path) => `  <url><loc>${getCanonicalUrl(path)}</loc></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
}
