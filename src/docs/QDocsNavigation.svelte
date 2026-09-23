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
  import { QExpansionItem, QIcon, QItem, QItemSection, QList, Quaff } from "$lib";

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
      <QExpansionItem
        label={item.name}
        icon={item.icon}
        expandIcon="arrow_drop_down"
        bind:value={
          () => expandedGroups[item.name] ?? false, (value) => (expandedGroups[item.name] = value)
        }
      >
        <QList {dense} expressive={false} preserveTabOrder>
          {@render navigationItems(item.children)}
        </QList>
      </QExpansionItem>
    {:else}
      {@const isCurrent = pathname === item.to}
      <QItem
        to={item.to}
        active={isCurrent}
        aria-current={isCurrent ? "page" : undefined}
        {onclick}
      >
        {#if item.icon}
          <QItemSection type="icon"><QIcon name={item.icon} /></QItemSection>
        {/if}
        <QItemSection>{item.name}</QItemSection>
      </QItem>
    {/if}
  {/each}
{/snippet}
