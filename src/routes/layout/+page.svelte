<script lang="ts">
  import {
    QDrawer,
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QRailbar,
    QList,
    QItem,
    QIcon,
    QItemSection,
    QFooter,
  } from "$lib";

  let leftDrawer: QDrawer | null = null;
  let rightDrawer: QDrawer | null = null;
</script>

<QLayout view="hHh LpR fFr" leftRailbarWidth="120">
  <QToolbar slot="header" class="primary-container">
    <QBtn icon="menu" flat on:click={() => leftDrawer?.toggle()} />
    <QToolbarTitle>
      <a href="/">Go home</a>
    </QToolbarTitle>
    <QBtn flat icon="attach_file" />
    <QBtn flat icon="today" />
    <QBtn icon="menu" flat on:click={() => rightDrawer?.toggle()} />
  </QToolbar>
  <QRailbar slot="railbarLeft" bordered width="120">
    <QList>
      <QItem class="column round" to="/" style="gap: 0.25em">
        <QIcon name="home" />
        <QItemSection>Home</QItemSection>
      </QItem>
      <QItem class="column round" to="/components" style="gap: 0.25em">
        <QIcon name="grid_view" />
        <QItemSection>Components</QItemSection>
      </QItem>
      <QItem class="column round" to="/utils" style="gap: 0.25em">
        <QIcon name="construction" />
        <QItemSection>Quaff utils</QItemSection>
      </QItem>
      <QItem class="column round" to="/dev" style="gap: 0.25em">
        <QIcon name="code" />
        <QItemSection>Dev tests</QItemSection>
      </QItem>
      <QItem class="column round" to="/layout" style="gap: 0.25em">
        <QIcon name="dashboard_customize" />
        <QItemSection>Layout tests</QItemSection>
      </QItem>
    </QList>
  </QRailbar>
  <QDrawer overlay slot="drawerLeft" side="left" class="secondary" bind:this={leftDrawer}>
    <QList separator>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home, oh god this is a long text</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
    </QList>
  </QDrawer>
  <QRailbar slot="railbarRight" bordered side="right">
    <QList dense>
      <QItem>
        <QBtn flat class="circle transparent">
          <QIcon name="check_box" />
        </QBtn>
      </QItem>
      <QItem>
        <QBtn flat class="circle transparent">
          <QIcon name="brush" />
        </QBtn>
      </QItem>
      <QItem>
        <QBtn flat class="circle transparent">
          <QIcon name="mic" />
        </QBtn>
      </QItem>
      <QItem>
        <QBtn flat class="circle transparent">
          <QIcon name="image" />
        </QBtn>
      </QItem>
    </QList>
  </QRailbar>
  <QDrawer slot="drawerRight" side="right" class="secondary" bind:this={rightDrawer}>
    <QList separator>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home, oh god this is a long text</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
      <QItem to="/">
        <QItemSection avatar>
          <QIcon name="home" />
        </QItemSection>
        <QItemSection>Return home</QItemSection>
      </QItem>
    </QList>
  </QDrawer>
  <div slot="content" class="tertiary-container" style="height: 200%">
    <div class="q-page">
      <h1 class="q-mb-xl">Layout Test</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates sed quo illo minima,
        delectus laborum amet commodi consequuntur voluptatum nihil incidunt perspiciatis maiores
        aliquam expedita harum autem nulla quidem dolorem.
      </p>
    </div>
  </div>
  <QFooter slot="footer" class="secondary-container">
    <QBtn flat class="circle transparent">
      <QIcon name="check_box" />
    </QBtn>
    <QBtn flat class="circle transparent">
      <QIcon name="brush" />
    </QBtn>
    <QBtn flat class="circle transparent">
      <QIcon name="mic" />
    </QBtn>
    <QBtn flat class="circle transparent">
      <QIcon name="image" />
    </QBtn>
    <div class="max" />
    <QBtn class="square round primary">
      <QIcon name="add" />
    </QBtn>
  </QFooter>
</QLayout>
