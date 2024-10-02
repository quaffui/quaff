import { derived } from "svelte/store";
import { page } from "$app/stores";
import type { Readable } from "svelte/store";

export interface RouterProps {
  activeClass?: string;
  disabled?: boolean;
  href?: string;
  replace?: boolean;
  to?: string;
}

export const isRouteActive: Readable<(route?: string) => boolean> = derived(page, ($page) => {
  return (route?: string) => {
    if (!route) {
      return false;
    }
    return $page.url.pathname === route || $page.url.pathname.startsWith(`${route}/`);
  };
});

export function getRouterInfo<T extends RouterProps>(props: T) {
  const hasLink = [props.to, props.href].some((entry) => entry !== undefined);
  const linkClasses = `${hasLink ? "q-link" : ""} ${props.disabled ? "disabled" : ""}`.trim();

  const linkAttributes = {
    href: props.to || props.href,
    "data-sveltekit-reload": props.replace ? true : undefined,
  };

  return {
    hasLink,
    linkAttributes,
    linkClasses,
  };
}
