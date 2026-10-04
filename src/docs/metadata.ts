import type { MetaOptions } from "$lib/meta";

export const SITE_URL = "https://quaff.dev";

export function formatPageTitle(title: string): string {
  return title === "Quaff" ? title : `${title} • Quaff`;
}

/** Use the same page copy for search results and shared links. */
export function pageMeta(title: string, description: string): MetaOptions {
  return {
    title,
    meta: {
      description: { name: "description", content: description },
      "og:title": { property: "og:title", content: title, template: formatPageTitle },
      "og:description": { property: "og:description", content: description },
    },
  };
}

export function getCanonicalUrl(path: string): string {
  return `${SITE_URL}${path.replace(/\/?$/, "/")}`;
}
