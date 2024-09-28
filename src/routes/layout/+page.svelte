<script lang="ts">
  import {
    QDrawer,
    QLayout,
    QHeader,
    QToolbarTitle,
    QBtn,
    QRailbar,
    QList,
    QItem,
    QIcon,
    QItemSection,
    QFooter,
  } from "$lib";

  let leftDrawer: ReturnType<typeof QDrawer> | null = null;
  let rightDrawer: ReturnType<typeof QDrawer> | null = null;
</script>

<QLayout view="hHh LpR fFr" leftRailbarWidth="120">
  {#snippet header()}
    <QHeader class="primary-container">
      <QBtn icon="menu" design="flat" onclick={() => leftDrawer?.toggle()} />
      <QToolbarTitle>
        <a href="/">Go home</a>
      </QToolbarTitle>
      <QBtn design="flat" icon="attach_file" />
      <QBtn design="flat" icon="today" />
      <QBtn icon="menu" design="flat" onclick={() => rightDrawer?.toggle()} />
    </QHeader>
  {/snippet}
  {#snippet railbarLeft()}
    <QRailbar bordered width={120}>
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
  {/snippet}

  {#snippet drawerLeft()}
    <QDrawer overlay side="left" class="secondary" bind:this={leftDrawer}>
      <QList separator>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home, oh god this is a long text</QItemSection>
        </QItem>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home</QItemSection>
        </QItem>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home</QItemSection>
        </QItem>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home</QItemSection>
        </QItem>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home</QItemSection>
        </QItem>
      </QList>
    </QDrawer>
  {/snippet}

  {#snippet railbarRight()}
    <QRailbar bordered side="right">
      <QList dense>
        <QItem>
          <QBtn design="flat" class="circle transparent">
            <QIcon name="check_box" />
          </QBtn>
        </QItem>
        <QItem>
          <QBtn design="flat" class="circle transparent">
            <QIcon name="brush" />
          </QBtn>
        </QItem>
        <QItem>
          <QBtn design="flat" class="circle transparent">
            <QIcon name="mic" />
          </QBtn>
        </QItem>
        <QItem>
          <QBtn design="flat" class="circle transparent">
            <QIcon name="image" />
          </QBtn>
        </QItem>
      </QList>
    </QRailbar>
  {/snippet}
  {#snippet drawerRight()}
    <QDrawer side="right" class="secondary" bind:this={rightDrawer}>
      <QList separator>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home, oh god this is a long text</QItemSection>
        </QItem>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home</QItemSection>
        </QItem>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home</QItemSection>
        </QItem>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home</QItemSection>
        </QItem>
        <QItem to="/">
          <QItemSection type="avatar">
            <QIcon name="home" />
          </QItemSection>
          <QItemSection>Return home</QItemSection>
        </QItem>
      </QList>
    </QDrawer>
  {/snippet}

  {#snippet content()}
    <div class="tertiary-container" style="height: 200%">
      <div class="q-page">
        <h1 class="q-mb-xl">Layout Test</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates sed quo illo minima,
          delectus laborum amet commodi consequuntur voluptatum nihil incidunt perspiciatis maiores
          aliquam expedita harum autem nulla quidem dolorem.
        </p>
      </div>
    </div>
  {/snippet}

  {#snippet footer()}
    <QFooter class="secondary-container">
      <QBtn design="flat" class="circle transparent">
        <QIcon name="check_box" />
      </QBtn>
      <QBtn design="flat" class="circle transparent">
        <QIcon name="brush" />
      </QBtn>
      <QBtn design="flat" class="circle transparent">
        <QIcon name="mic" />
      </QBtn>
      <QBtn design="flat" class="circle transparent">
        <QIcon name="image" />
      </QBtn>
      <div class="max"></div>
      <QBtn class="square round primary">
        <QIcon name="add" />
      </QBtn>
    </QFooter>
  {/snippet}
</QLayout>
