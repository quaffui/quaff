<script lang="ts">
  import { getContext } from "svelte";
  import type { QBreadcrumbsElProps } from "./props";
  import QIcon from "../icon/QIcon.svelte";
  import { createClasses } from "$lib/utils/props";
  import { isRouteActive } from "$lib/composables/use-router-link";
  import { Quaff } from "$lib/stores/Quaff";

  export let label: QBreadcrumbsElProps["label"] = "",
    icon: QBreadcrumbsElProps["icon"] = undefined,
    tag: QBreadcrumbsElProps["tag"] = "div",
    to: QBreadcrumbsElProps["to"] = undefined,
    href: QBreadcrumbsElProps["href"] = undefined,
    activeClass: QBreadcrumbsElProps["activeClass"] = "active",
    userClasses: QBreadcrumbsElProps["userClasses"] = undefined;
  export { userClasses as class };

  const activeColor = getContext<string>("activeColor");
  const separator = getContext<{ type: string; color: string; gutter: string }>("separator");

  $: isActive = isRouteActive($Quaff.router, href || to);

  $: classes = createClasses([isActive && activeClass], {
    component: "q-breadcrumbs",
    element: "el",
    quaffClasses: [isActive && `text-${activeColor}`],
    userClasses,
  });

  $: separatorClasses = createClasses([], {
    component: "q-breadcrumbs",
    element: "separator",
    quaffClasses: [`q-px-${separator.gutter}`],
  });
</script>

<div class={separatorClasses}>
  {#if separator.type.startsWith("icon:")}
    <QIcon name={separator.type.replace("icon:", "")} size="1rem" />
  {:else}
    {separator.type}
  {/if}
</div>

{#if href !== undefined || to !== undefined}
  <a href={href || to} class={classes}>
    {#if icon !== undefined}
      <QIcon name={icon} size="1rem" />
    {:else if $$slots.icon}
      <slot name="icon" />
    {/if}

    <slot>
      {label}
    </slot>
  </a>
{:else}
  <svelte:element this={tag} class={classes}>
    {#if icon !== undefined}
      <QIcon name={icon} size="1rem" />
    {:else if $$slots.icon}
      <slot name="icon" />
    {/if}

    <slot>
      {label}
    </slot>
  </svelte:element>
{/if}
