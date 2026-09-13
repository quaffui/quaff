<script lang="ts" module>
  import { QContext } from "$utils/context";
  import type { QBreadcrumbsProps } from "./props";

  export const breadcrumbsCtx = QContext<{
    readonly separator: QBreadcrumbsProps["separator"];
    readonly gutter: QBreadcrumbsProps["gutter"];
    readonly activeClass: QBreadcrumbsProps["activeClass"];
    readonly activeStyle: QBreadcrumbsProps["activeStyle"];
  }>("QBreadcrumbs");
</script>

<script lang="ts">
  import { useColor } from "$composables";

  // #region:    --- Props
  let {
    activeColor = "primary",
    gutter = "sm",
    separator = "/",
    separatorColor = "outline-variant",
    children,
    ...props
  }: QBreadcrumbsProps = $props();
  // #endregion: --- Props

  // #region:    --- Context
  breadcrumbsCtx.set({
    separator,
    gutter,
    activeClass: props.activeClass,
    activeStyle: props.activeStyle,
  });
  // #endregion: --- Context

  Q.classes("q-breadcrumbs", { classes: [props.class] });
</script>

<nav
  {...props}
  class="q-breadcrumbs"
  aria-label={props["aria-label"] ?? "Breadcrumbs"}
  data-quaff
  style:--q-separator-color={useColor(separatorColor)}
  style:--q-active-color={useColor(activeColor)}
>
  <ol class="q-breadcrumbs__list">
    {@render children?.()}
  </ol>
</nav>
