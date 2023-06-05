<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDrawer from "$lib/components/drawer/QDrawer.svelte";
  import QFooter from "$lib/components/footer/QFooter.svelte";
  import QLayout from "$lib/components/layout/QLayout.svelte";
  import QItem from "$lib/components/list/QItem.svelte";
  import QItemSection from "$lib/components/list/QItemSection.svelte";
  import QList from "$lib/components/list/QList.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";

  let leftDrawer: QDrawer | null = null;
  let rightDrawer: QDrawer | null = null;
</script>

<QLayout view="lHh LpR fFr">
  <QToolbar slot="header" class="primary-container">
    <QBtn icon="menu" flat round on:click={() => leftDrawer?.toggle()} />
    <h5 class="max center-align">
      <a href="/">Go home</a>
    </h5>
    <QBtn flat round icon="attach_file" />
    <QBtn flat round icon="today" />
    <QBtn icon="menu" flat round on:click={() => rightDrawer?.toggle()} />
  </QToolbar>
  <QDrawer mini bind:this={leftDrawer} slot="drawerLeft" class="primary">
    <QList dense>
      <QItem>
        <QBtn flat class="circle transparent">
          <i>check_box</i>
        </QBtn>
      </QItem>
      <QItem>
        <QBtn flat class="circle transparent">
          <i>brush</i>
        </QBtn>
      </QItem>
      <QItem>
        <QBtn flat class="circle transparent">
          <i>mic</i>
        </QBtn>
      </QItem>
      <QItem>
        <QBtn flat class="circle transparent">
          <i>image</i>
        </QBtn>
      </QItem>
    </QList>
  </QDrawer>
  <QDrawer overlay slot="drawerRight" side="right" class="secondary" bind:this={rightDrawer}>
    <QList separator>
      <QItem to="/">
        <QItemSection avatar>
          <i>home</i>
        </QItemSection>
        <QItemSection>Return home, oh god this is a long text</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <i>home</i>
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <i>home</i>
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <i>home</i>
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <i>home</i>
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
    </QList>
  </QDrawer>
  <div slot="content" class="tertiary-container" style="height: 200%">
    <h1>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates sed quo illo minima,
      delectus laborum amet commodi consequuntur voluptatum nihil incidunt perspiciatis maiores
      aliquam expedita harum autem nulla quidem dolorem.
    </h1>
  </div>
  <QFooter slot="footer" class="secondary-container">
    <QBtn flat class="circle transparent">
      <i>check_box</i>
    </QBtn>
    <QBtn flat class="circle transparent">
      <i>brush</i>
    </QBtn>
    <QBtn flat class="circle transparent">
      <i>mic</i>
    </QBtn>
    <QBtn flat class="circle transparent">
      <i>image</i>
    </QBtn>
    <div class="max" />
    <QBtn class="square round primary">
      <i>add</i>
    </QBtn>
  </QFooter>
</QLayout>
