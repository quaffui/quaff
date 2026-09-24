<script lang="ts" module>
  import type { MaterialSymbol } from "material-symbols";

  type NavigationLink = { name: string; to: string; icon?: MaterialSymbol };
  export type NavigationItem =
    NavigationLink | { name: string; children: NavigationItem[]; icon?: MaterialSymbol };

  export function getNavigationLinks(items: NavigationItem[]): NavigationLink[] {
    return items.flatMap((item) =>
      "children" in item ? getNavigationLinks(item.children) : [item]
    );
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { QList, QNavGroup, QNavItem, Quaff } from "$lib";

  let {
    items,
    label,
    dense = false,
    onclick,
  }: {
    items: NavigationItem[];
    label: string;
    dense?: boolean;
    onclick?: () => void;
  } = $props();

  const pathname = $derived(Quaff.router.url.pathname);

  let expandedGroups = $state(untrack(() => getExpandedGroups(items, pathname)));

  $effect(() => {
    Object.assign(expandedGroups, getExpandedGroups(items, pathname));
  });

  function getExpandedGroups(
    entries: NavigationItem[],
    pathname: string,
    groups: Record<string, boolean> = {}
  ) {
    for (const item of entries) {
      if (!("children" in item)) {
        continue;
      }

      const hasCurrentPage = getNavigationLinks(item.children).some(({ to }) => to === pathname);

      if (hasCurrentPage) {
        groups[item.name] = true;
        getExpandedGroups(item.children, pathname, groups);
      }
    }

    return groups;
  }
</script>

<QList tag="nav" aria-label={label} {dense} expressive={false} preserveTabOrder>
  {@render navigationItems(items)}
</QList>

{#snippet navigationItems(entries: NavigationItem[])}
  {#each entries as item (item.name)}
    {#if "children" in item}
      <QNavGroup
        label={item.name}
        icon={item.icon}
        bind:value={
          () => expandedGroups[item.name] ?? false, (value) => (expandedGroups[item.name] = value)
        }
      >
        {@render navigationItems(item.children)}
      </QNavGroup>
    {:else}
      <QNavItem to={item.to} label={item.name} icon={item.icon} {onclick} />
    {/if}
  {/each}
{/snippet}
