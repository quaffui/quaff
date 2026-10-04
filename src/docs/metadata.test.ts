import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { render } from "svelte/server";
import { expect, it } from "vitest";
import { GET as getSitemap } from "../routes/sitemap.xml/+server";
import MetaLayout from "../tests/meta/MetaLayout.svelte";
import { formatPageTitle, getCanonicalUrl, pageMeta } from "./metadata";

it("renders page titles and descriptions for search and shared links", () => {
  const { head } = render(MetaLayout, {
    props: {
      defaults: { titleTemplate: formatPageTitle },
      pages: [pageMeta("Inputs & forms", 'Fields with "labels" & hints.')],
    },
  });

  expect(head).toContain("<title>Inputs &amp; forms • Quaff</title>");
  expect(head).toContain('property="og:title" content="Inputs &amp; forms • Quaff"');
  expect(head).toContain(
    'name="description" content="Fields with &quot;labels&quot; &amp; hints."'
  );
  expect(head).toContain(
    'property="og:description" content="Fields with &quot;labels&quot; &amp; hints."'
  );
});

it("uses the same brand suffix for the homepage and shared links", () => {
  const { head } = render(MetaLayout, {
    props: {
      defaults: { title: "Quaff", titleTemplate: formatPageTitle },
      pages: [pageMeta("Material 3 UI Components for Svelte 5", "Build with Quaff.")],
    },
  });

  expect(head).toContain("<title>Material 3 UI Components for Svelte 5 • Quaff</title>");
  expect(head).toContain(
    'property="og:title" content="Material 3 UI Components for Svelte 5 • Quaff"'
  );
});

it.each([
  ["Quaff", "Quaff"],
  ["Page not found", "Page not found • Quaff"],
])("formats the default title %s without page metadata", (title, expected) => {
  const { head } = render(MetaLayout, {
    props: { defaults: { title, titleTemplate: formatPageTitle } },
  });

  expect(head).toContain(`<title>${expected}</title>`);
});

it("lists every docs route without the noindex privacy page", async () => {
  const routes = readdirSync(fileURLToPath(new URL("../routes", import.meta.url)), {
    recursive: true,
  })
    .filter((path) => typeof path === "string" && path.endsWith("+page.svelte"))
    .map((path) => `/${String(path).replace(/\/?\+page\.svelte$/, "")}`)
    .filter((path) => path !== "/privacy-policy");
  const response = getSitemap();
  const sitemap = await response.text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  expect(response.headers.get("content-type")).toContain("application/xml");
  expect(urls).toContain("https://quaff.dev/");
  expect(urls).toContain("https://quaff.dev/components/input/");
  expect(urls).not.toContain("https://quaff.dev/privacy-policy/");
  expect(urls.sort()).toEqual(routes.map(getCanonicalUrl).sort());
});
