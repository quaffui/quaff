import { render } from "svelte/server";
import { describe, expect, it } from "vitest";
import MetaLayout from "./MetaLayout.svelte";

describe("Meta server rendering", () => {
  it("includes descendant overrides in the initial head without a wrapper", () => {
    const { head, body } = render(MetaLayout, {
      props: {
        defaults: {
          title: "Home",
          titleTemplate: (title) => `${title} | Quaff`,
          meta: {
            description: { name: "description", content: "Default description" },
            robots: { name: "robots", content: "noindex" },
            theme: { name: "theme-color", content: "#123456" },
          },
          link: {
            canonical: { rel: "canonical", href: "https://example.com/" },
            author: { rel: "author", href: "https://example.com/author" },
          },
        },
        pages: [
          { title: "Section" },
          () => ({
            title: "Page & details",
            meta: {
              description: {
                name: "description",
                content: "Page description",
                template: (content) => `${content}. More details.`,
              },
              robots: null,
            },
            link: {
              canonical: { rel: "canonical", href: "https://example.com/page" },
              author: null,
            },
          }),
        ],
      },
    });

    expect(head).toContain("<title>Page &amp; details | Quaff</title>");
    expect(head).toContain('name="description" content="Page description. More details."');
    expect(head).toContain('name="theme-color" content="#123456"');
    expect(head).toContain('rel="canonical" href="https://example.com/page"');
    expect(head.match(/name="description"/g)).toHaveLength(1);
    expect(head.match(/rel="canonical"/g)).toHaveLength(1);
    expect(head).not.toContain('name="robots"');
    expect(head).not.toContain('rel="author"');
    expect(body.replace(/<!--.*?-->/g, "").trim()).toBe("<p>Page content</p><p>Page content</p>");
  });

  it("accepts getter defaults and works without defaults", () => {
    const defaults = render(MetaLayout, {
      props: { defaults: () => ({ title: "Default title" }) },
    });
    const page = render(MetaLayout, {
      props: { pages: [{ title: "Page title" }] },
    });

    expect(defaults.head).toContain("<title>Default title</title>");
    expect(page.head).toContain("<title>Page title</title>");
  });

  it("keeps metadata isolated between server renders", () => {
    const first = render(MetaLayout, {
      props: {
        pages: [
          {
            title: "Private page",
            meta: { description: { name: "description", content: "Private description" } },
          },
        ],
      },
    });
    const second = render(MetaLayout, {
      props: { defaults: { title: "Public page" } },
    });
    const empty = render(MetaLayout);

    expect(first.head).toContain("<title>Private page</title>");
    expect(second.head).toContain("<title>Public page</title>");
    expect(second.head).not.toContain("Private");
    expect(second.head).not.toContain('name="description"');
    expect(empty.head).toContain("<title></title>");
    expect(empty.head).not.toContain('name="description"');
  });
});
