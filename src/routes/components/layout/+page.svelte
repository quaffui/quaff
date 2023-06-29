<script lang="ts">
  import { QCard, QIcon, QItemSection } from "$lib";
  import QBtn from "$lib/components/button/QBtn.svelte";
  import QDrawer from "$lib/components/drawer/QDrawer.svelte";
  import QFooter from "$lib/components/footer/QFooter.svelte";
  import QLayout from "$lib/components/layout/QLayout.svelte";
  import { QLayoutDocs } from "$lib/components/layout/docs";
  import type { QLayoutProps } from "$lib/components/layout/props";
  import QItem from "$lib/components/list/QItem.svelte";
  import QList from "$lib/components/list/QList.svelte";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import QRailbar from "$lib/components/railbar/QRailbar.svelte";
  import QToggle from "$lib/components/toggle/QToggle.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";
  import { createStyles } from "$lib/utils/props";

  import snippets from "./docs.snippets";

  let displayLeftDrawer = false;
  let view: QLayoutProps["view"] = "hhh lpr fff";

  let header = true;
  let footer = true;
  let leftRailBar = true;
  let leftDrawer = true;
  let rightRailBar = true;
  let rightDrawer = true;

  $: style =
    createStyles({
      "--header-height": header ? "64px" : "0px",
      "--footer-height": footer ? "80px" : "0px",
      "--left-railbar-width": leftRailBar ? "88px" : "0px",
      "--right-railbar-width": rightRailBar ? "88px" : "0px",
      "--left-drawer-width": leftDrawer ? "300px" : "0px",
      "--right-drawer-width": rightDrawer ? "300px" : "0px",
    }) || undefined;

  $: display = (val: boolean) => {
    return val ? undefined : "display: none";
  };

  let leftDrawerShown = true;
  let rightDrawerShown = true;
</script>

<QDocs QComponentDocs={QLayoutDocs}>
  <QLayout slot="display" view="lhh lpr lfr" headerHeight="50px" footerHeight="50px">
    <QToolbar slot="header" class="surface small-elevate no-round">
      <QBtn icon="menu" flat on:click={() => (displayLeftDrawer = !displayLeftDrawer)} />
      <h3 class="small max center-align">Header</h3>
    </QToolbar>
    <QDrawer slot="drawerLeft" overlay bind:value={displayLeftDrawer} bordered class="no-round">
      <QList dense>
        <QItem to="#">
          <QIcon name="home" />
          <QItemSection>Home</QItemSection>
        </QItem>
        <QItem to="#">
          <QIcon name="help" />
          <QItemSection>About</QItemSection>
        </QItem>
        <QItem to="#">
          <QIcon name="shopping_cart" />
          <QItemSection>Store</QItemSection>
        </QItem>
        <QItem to="#">
          <QIcon name="mail" />
          <QItemSection>Contact</QItemSection>
        </QItem>
      </QList>
    </QDrawer>
    <QRailbar slot="railbarRight" side="right" bordered>
      <QList>
        <QItem to="#">
          <QIcon name="home" />
          <QItemSection>Home</QItemSection>
        </QItem>
        <QItem to="#">
          <QIcon name="help" />
          <QItemSection>About</QItemSection>
        </QItem>
      </QList>
    </QRailbar>
    <QFooter slot="footer" class="no-round">
      <h3 class="small center">Footer</h3>
    </QFooter>
  </QLayout>

  <div slot="usage">
    <QDocsSection {snippets} title="Trying different layouts">
      <QCard bordered class="no-padding" style="height: 80vh">
        <QLayout {view} {style}>
          <QToolbar style={display(header)} slot="header" class="small-elevate">
            {#if leftDrawer}
              <QBtn icon="menu" flat on:click={() => (leftDrawerShown = !leftDrawerShown)} />
            {/if}
            <div class="max flex center-align">Header</div>
            {#if rightDrawer}
              <QBtn icon="menu" flat on:click={() => (rightDrawerShown = !rightDrawerShown)} />
            {/if}
          </QToolbar>

          <QRailbar style={display(leftRailBar)} slot="railbarLeft" bordered>
            <QList>
              <QItem to="#">
                <QIcon name="home" />
                <QItemSection>Home</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="help" />
                <QItemSection>About</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="shopping_cart" />
                <QItemSection>Store</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="mail" />
                <QItemSection>Contact</QItemSection>
              </QItem>
            </QList>
          </QRailbar>
          <QRailbar style={display(rightRailBar)} slot="railbarRight" side="right" bordered>
            <QList>
              <QItem to="#">
                <QIcon name="home" />
                <QItemSection>Home</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="help" />
                <QItemSection>About</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="shopping_cart" />
                <QItemSection>Store</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="mail" />
                <QItemSection>Contact</QItemSection>
              </QItem>
            </QList>
          </QRailbar>

          <QDrawer
            style={display(leftDrawer)}
            slot="drawerLeft"
            bordered
            persistent
            bind:value={leftDrawerShown}
          >
            <QList>
              <QItem to="#">
                <QIcon name="home" />
                <QItemSection>Home</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="help" />
                <QItemSection>About</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="shopping_cart" />
                <QItemSection>Store</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="mail" />
                <QItemSection>Contact</QItemSection>
              </QItem>
            </QList>
          </QDrawer>
          <QDrawer
            style={display(rightDrawer)}
            slot="drawerRight"
            side="right"
            bordered
            persistent
            bind:value={rightDrawerShown}
          >
            <QList>
              <QItem to="#">
                <QIcon name="home" />
                <QItemSection>Home</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="help" />
                <QItemSection>About</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="shopping_cart" />
                <QItemSection>Store</QItemSection>
              </QItem>
              <QItem to="#">
                <QIcon name="mail" />
                <QItemSection>Contact</QItemSection>
              </QItem>
            </QList>
          </QDrawer>

          <QFooter style={display(footer)} slot="footer">
            {#if leftDrawer}
              <QBtn icon="menu" flat on:click={() => (leftDrawerShown = !leftDrawerShown)} />
            {/if}
            <div class="max flex center-align">Footer</div>
            {#if rightDrawer}
              <QBtn icon="menu" flat on:click={() => (rightDrawerShown = !rightDrawerShown)} />
            {/if}
          </QFooter>

          <div
            slot="content"
            class="flex column q-gap-sm center middle"
            style="height: fit-content; width: fit-content"
          >
            <QToggle label="Header" bind:value={header} />
            <QToggle label="Left Railbar" bind:value={leftRailBar} />
            <QToggle label="Right Railbar" bind:value={rightRailBar} />
            <QToggle label="Left Drawer" bind:value={leftDrawer} />
            <QToggle label="Right Drawer" bind:value={rightDrawer} />
            <QToggle label="Footer" bind:value={footer} />
          </div>
        </QLayout>
      </QCard>
    </QDocsSection>
  </div>
</QDocs>
