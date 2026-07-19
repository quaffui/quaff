import { resolve } from "$app/paths";
import { page } from "$app/state";
import type { Linkable, WithActiveAttrs } from "./types";

interface RouterProps extends Linkable, WithActiveAttrs {}

export function isRouteActive(route?: string) {
  if (!route) {
    return;
  }

  return page.url.pathname === route || page.url.pathname.startsWith(`${route}/`);
}

/**
 * Provides routing information for a component.
 *
 * This includes link attributes, the `q-link` class, as well as whether the component is active due to routing.
 */
export function getRouterInfo<T extends RouterProps>(props: T) {
  const href = props.to || props.href;
  const hasLink = href !== undefined;
  const resolvedHref = href?.startsWith("/") ? resolve(href, {}) : href;
  const isActive = isRouteActive(resolvedHref);

  const linkAttributes = {
    "data-sveltekit-reload": props.replace || undefined,
    href: resolvedHref,
  };

  return {
    get hasLink() {
      return hasLink;
    },
    get linkAttributes() {
      return linkAttributes;
    },
    get linkClass() {
      return hasLink ? "q-link" : undefined;
    },
    get isActive() {
      return isActive;
    },
  };
}
