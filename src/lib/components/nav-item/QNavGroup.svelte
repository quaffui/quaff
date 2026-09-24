<!--
@component
Collapsible groups of navigation destinations inside a drawer.
-->

<script lang="ts">
  import QExpansionItem from "$components/expansion-item/QExpansionItem.svelte";
  import QList, { listCtx } from "$components/list/QList.svelte";
  import { navigationCtx } from "$internal/navigationContext";
  import type { QNavGroupProps } from "./props";

  let {
    defaultOpened = false,
    value = $bindable(defaultOpened),
    dense,
    expandIcon = "arrow_drop_down",
    children,
    ...props
  }: QNavGroupProps = $props();

  if (navigationCtx.get() !== "drawer") {
    throw new Error("QNavGroup should be used inside QDrawer");
  }

  const list = listCtx.assertGet("QNavGroup should be used inside QList");
  const isDense = $derived(dense || list.dense);
</script>

<QExpansionItem {...props} bind:value dense={isDense} {expandIcon}>
  <QList dense={isDense} expressive={false} preserveTabOrder>
    {@render children?.()}
  </QList>
</QExpansionItem>
