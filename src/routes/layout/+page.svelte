<script lang="ts">
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDrawer from "$lib/components/drawer/QDrawer.svelte";
  import QFooter from "$lib/components/footer/QFooter.svelte";
  import QLayout from "$lib/components/layout/QLayout.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";

  let leftDrawer: QDrawer | null = null;
  let rightDrawer: QDrawer | null = null;
</script>

<QLayout view="lHh LpR fFr">
  <QToolbar slot="header" class="primary-container">
    <QBtn icon="menu" flat round on:click={() => leftDrawer?.toggle()} />
    <h5 class="max center-align">Title</h5>
    <QBtn flat round icon="attach_file" />
    <QBtn flat round icon="today" />
    <QBtn icon="menu" flat round on:click={() => rightDrawer?.toggle()} />
  </QToolbar>
  <QDrawer mini bind:this={leftDrawer} slot="drawerLeft" class="primary">Hello world</QDrawer>
  <QDrawer overlay slot="drawerRight" side="right" class="secondary" bind:this={rightDrawer}>
    Hello world
  </QDrawer>
  <div slot="content" class="tertiary-container" style="height: 200%">
    <h1>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates sed quo illo minima,
      delectus laborum amet commodi consequuntur voluptatum nihil incidunt perspiciatis maiores
      aliquam expedita harum autem nulla quidem dolorem.
    </h1>
  </div>
  <QFooter slot="footer" class="secondary-container">
    <button class="circle transparent">
      <i>check_box</i>
    </button>
    <button class="circle transparent">
      <i>brush</i>
    </button>
    <button class="circle transparent">
      <i>mic</i>
    </button>
    <button class="circle transparent">
      <i>image</i>
    </button>
    <div class="max" />
    <button class="square round primary">
      <i>add</i>
    </button>
  </QFooter>
</QLayout>
