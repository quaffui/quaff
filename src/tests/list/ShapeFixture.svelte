<script lang="ts">
  import QList from "#components/list/QList.svelte";
  import QItem from "#components/list/QItem.svelte";
  import QItemSection from "#components/list/QItemSection.svelte";
  import QExpansionItem from "#components/expansion-item/QExpansionItem.svelte";

  let {
    expressive = true,
    segmented = true,
    separator = false,
    noRound = false,
    dense = false,
    count = 3,
    activeIndex = -1,
    itemType = "item",
    expandIconToggle = false,
    openedIndex = -1,
    href,
  }: {
    expressive?: boolean;
    segmented?: boolean;
    separator?: boolean;
    noRound?: boolean;
    dense?: boolean;
    count?: number;
    activeIndex?: number;
    itemType?: "item" | "expansion" | "mixed";
    expandIconToggle?: boolean;
    openedIndex?: number;
    href?: string;
  } = $props();
</script>

<QList {expressive} {segmented} {separator} {noRound} {dense} aria-label="List shapes">
  {#each Array(count) as _, index (index)}
    {#if itemType === "expansion" || (itemType === "mixed" && index % 2 === 0)}
      <QExpansionItem
        label="Item {index + 1}"
        {expandIconToggle}
        {href}
        defaultOpened={index === openedIndex}
      >
        <QList {expressive} {segmented} {dense} aria-label="Nested items">
          <QItem clickable><QItemSection>Nested first</QItemSection></QItem>
          <QItem clickable><QItemSection>Nested last</QItemSection></QItem>
        </QList>
      </QExpansionItem>
    {:else}
      <QItem clickable active={index === activeIndex}>
        <QItemSection>Item {index + 1}</QItemSection>
      </QItem>
    {/if}
  {/each}
</QList>
