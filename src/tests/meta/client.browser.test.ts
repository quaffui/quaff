import { expect } from "vitest";
import { createComponentTest } from "../support/browserTest";
import type { Page } from "playwright";

const it = createComponentTest({
  component: "meta/ClientFixture.svelte",
  readySelector: "button:first-of-type",
});

async function readHead(page: Page) {
  return page.evaluate(() => ({
    title: document.title,
    descriptions: Array.from(document.head.querySelectorAll('meta[name="description"]'), (tag) =>
      tag.getAttribute("content")
    ),
    robots: Array.from(document.head.querySelectorAll('meta[name="robots"]'), (tag) =>
      tag.getAttribute("content")
    ),
  }));
}

it("keeps replacement page metadata and removes tags from destroyed pages", async ({
  page,
  openFixture,
}) => {
  await openFixture();
  await expect
    .poll(() => readHead(page))
    .toEqual({
      title: "First page",
      descriptions: ["First description"],
      robots: [],
    });
  await page.getByRole("button", { name: "Second page" }).click();
  await expect
    .poll(() => readHead(page))
    .toEqual({
      title: "Second page",
      descriptions: ["Second description"],
      robots: [],
    });
  await page.getByRole("button", { name: "Private page" }).click();
  await expect
    .poll(() => readHead(page))
    .toEqual({
      title: "Private page",
      descriptions: [],
      robots: ["noindex"],
    });
  await page.getByRole("button", { name: "Remove page" }).click();
  await expect.poll(() => readHead(page)).toEqual({ title: "Site", descriptions: [], robots: [] });
});
