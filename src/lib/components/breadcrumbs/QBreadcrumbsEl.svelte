<script lang="ts">
  import { isRouteActive } from "$lib/composables";
  import { Quaff } from "$lib/stores/Quaff";
  import { getContext } from "svelte";
  import { QIcon } from "$lib";
  import type { QBreadcrumbsElProps, QBreadcrumbsGutterOptions } from "./props";

  export let label: QBreadcrumbsElProps["label"] = "",
    icon: QBreadcrumbsElProps["icon"] = undefined,
    tag: QBreadcrumbsElProps["tag"] = "div",
    to: QBreadcrumbsElProps["to"] = undefined,
    href: QBreadcrumbsElProps["href"] = undefined,
    activeClass: QBreadcrumbsElProps["activeClass"] = "q-breadcrumbs__el--active",
    userClasses: QBreadcrumbsElProps["userClasses"] = "";
  export { userClasses as class };

  const activeColor = getContext<string>("activeColor");
  const separator = getContext<{ type: string; color: string; gutter: QBreadcrumbsGutterOptions }>(
    "separator"
  );

  $: isActive = isRouteActive($Quaff.router, href || to);

  $: activeClasses = isActive ? `${activeClass} text-${activeColor}` : "";
</script>

<div class="q-breadcrumbs__separator q-px-{separator.gutter}">
  {#if separator.type.startsWith("icon:")}
    <QIcon name={separator.type.replace("icon:", "")} size="1rem" />
  {:else}
    {separator.type}
  {/if}
</div>

{#if href !== undefined || to !== undefined}
  <a href={href || to} class="q-breadcrumb__el {activeClasses} {userClasses}">
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
  <svelte:element this={tag} class="q-breadcrumb__el {activeClasses} {userClasses}">
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
