import { page } from "$app/state";

export interface RouterProps {
  activeClass?: string;
  disabled?: boolean;
  href?: string;
  replace?: boolean;
  to?: string;
}

export function isRouteActive(route?: string) {
  if (!route) {
    return false;
  }
  return page.url.pathname === route || page.url.pathname.startsWith(`${route}/`);
}

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
