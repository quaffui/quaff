import { createClasses } from "$utils";
import type { Page } from "@sveltejs/kit";

export interface UseRouterLinkProps {
  href?: string;
  to?: string;
  disable?: boolean;
  activeClass?: string;
  replace?: boolean;
}

export const UseRouterLinkPropsDefaults: UseRouterLinkProps = {
  href: undefined,
  to: undefined,
  disable: false,
  activeClass: undefined,
  replace: false,
};

export function isRouteActive(
  router: Page<Record<string, string>, string | null>,
  to: string | undefined
) {
  return to === "/"
    ? router.url.pathname === to
    : router.url.pathname.slice(0, (to || "").length) === to;
}

export function useRouterLink<T extends UseRouterLinkProps>(props: T) {
  const hasLink = [props.to, props.href].some((entry) => typeof entry !== "undefined");
  const linkClasses = createClasses([hasLink && "q-link", props.disable && "disable"]);

  const linkAttributes = {
    href: props.to || props.href,
    "data-sveltkit-reload": props.replace ? "" : undefined,
  };

  return {
    hasLink,
    linkAttributes,
    linkClasses,
  };
}
