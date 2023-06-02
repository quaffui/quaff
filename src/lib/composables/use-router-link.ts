import { stringifyClasses } from "$lib/utils/props";

export interface UseRouterLinkProps {
  href?: string;
  to?: string;
  disable: boolean;
  activeClass?: string;
  replace: boolean;
}

export const UseRouterLinkPropsDefaults: UseRouterLinkProps = {
  href: undefined,
  to: undefined,
  disable: false,
  activeClass: undefined,
  replace: false,
};

export default function <T extends UseRouterLinkProps>(props: T) {
  const hasLink = props.to !== undefined || props.href !== undefined;

  const linkClasses = stringifyClasses(["q-link", props.disable && "disable"]);

  const linkAttributes = {
    href: props.to || props.href,
    "data-sveltkit-reload": props.replace === true ? "" : undefined,
  };

  return {
    hasLink,
    linkAttributes,
    linkClasses,
  };
}
