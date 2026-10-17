<script lang="ts">
  import { untrack } from "svelte";
  import QExpansionItem from "#components/expansion-item/QExpansionItem.svelte";
  import QList from "#components/list/QList.svelte";
  import QItem from "#components/list/QItem.svelte";
  import QItemSection from "#components/list/QItemSection.svelte";

  let { query = "" }: { query?: string } = $props();
  const params = new URLSearchParams(untrack(() => query));
  const expressive = !params.has("standard");
  const defaultOpened = !params.has("closed");
</script>

<main style="width: 480px; margin: 24px;">
  <QList {expressive} segmented={expressive}>
    <QExpansionItem id="parent" label="Parent" {defaultOpened}>
      <QList {expressive} segmented={expressive}>
        <QExpansionItem id="child" label="Child">
          <QList {expressive} segmented={expressive}>
            <QExpansionItem id="grandchild" label="Grandchild">
              <QList {expressive}>
                {#each ["First", "Second", "Third", "Fourth"] as label (label)}
                  <QItem><QItemSection>{label}</QItemSection></QItem>
                {/each}
              </QList>
            </QExpansionItem>
            <QItem><QItemSection>Child sibling</QItemSection></QItem>
          </QList>
        </QExpansionItem>
        <QItem><QItemSection>Parent sibling</QItemSection></QItem>
      </QList>
    </QExpansionItem>
    <QItem id="following"><QItemSection>Following item</QItemSection></QItem>
  </QList>
</main>
