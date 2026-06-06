<script lang="ts" module>
  import type { QBreadcrumbsProps } from "./props";

  export const breadcrumbsCtx = QContext<{
    readonly separator: QBreadcrumbsProps["separator"];
    readonly gutter: QBreadcrumbsProps["gutter"];
  }>("QBreadcrumbs");
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { QContext } from "$lib/utils";
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

  // #region:    --- Derived values
  const parsedActiveColor = $derived(useColor(activeColor));
  const parsedSeparatorColor = $derived(useColor(separatorColor));
  // #endregion: --- Derived values

  // #region:    --- Non-reactive variables
  let breadcrumbList: HTMLOListElement;
  // #endregion: --- Non-reactive variables

  // #region:    --- Context
  breadcrumbsCtx.set({ separator, gutter });
  // #endregion: --- Context

  // #region:    --- Lifecycle
  onMount(() => {
    breadcrumbList.querySelector(".q-breadcrumbs__separator:first-child")?.remove();
  });
  // #endregion: --- Lifecycle

  Q.classes("q-breadcrumbs", { classes: [props.class] });
</script>

<nav
  {...props}
  class="q-breadcrumbs"
  aria-label="Breadcrumbs"
  data-quaff
  style:--q-separator-color={parsedSeparatorColor}
  style:--q-active-color={parsedActiveColor}
>
  <ol bind:this={breadcrumbList} class="q-breadcrumbs__list">
    {@render children?.()}
  </ol>
</nav>
