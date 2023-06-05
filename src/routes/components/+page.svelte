<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDrawer from "$lib/components/drawer/QDrawer.svelte";
  import QLayout from "$lib/components/layout/QLayout.svelte";
  import QItem from "$lib/components/list/QItem.svelte";
  import QItemSection from "$lib/components/list/QItemSection.svelte";
  import QList from "$lib/components/list/QList.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";
</script>

<QLayout>
  <QDrawer slot="drawerLeft" persistent class="surface-variant active">
    <QList separator bordered roundedBorders>
      <QItem>
        <QItemSection>App bar</QItemSection>
      </QItem>
      <QItem>
        <QItemSection>Card</QItemSection>
      </QItem>
      <QItem>
        <QItemSection>Layout</QItemSection>
      </QItem>
    </QList>
  </QDrawer>
  <QDrawer slot="drawerRight" />
  <div slot="content">
    <slot />
  </div>
</QLayout>
