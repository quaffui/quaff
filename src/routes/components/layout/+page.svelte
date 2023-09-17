<script lang="ts">
  import {
    QDrawer,
    QLayout,
    QBtn,
    QToolbarTitle,
    QList,
    QHeader,
    QItem,
    QIcon,
    QItemSection,
    QRailbar,
    QFooter,
    QCard,
    QRadio,
    QToggle,
  } from "$lib";
  import { QLayoutDocs } from "$lib/components/layout/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import { createStyles } from "$lib/utils";
  import { snippet } from "./docs.snippets";
  import type { QLayoutProps } from "$lib/components/layout/props";

  let displayLeftDrawerElement: QDrawer;
  let displayLeftDrawer = false;
  let viewArr = [
    ["h", "h", "h"],
    ["l", "p", "r"],
    ["f", "f", "f"],
  ];
  $: view = viewArr.map((v) => v.join("")).join(" ") as QLayoutProps["view"];

  let header = true;
  let footer = true;
  let leftRailbar = true;
  let leftDrawer = true;
  let rightRailbar = false;
  let rightDrawer = false;

  $: snippets = snippet(view, [header, footer, leftRailbar, leftDrawer, rightRailbar, rightDrawer]);

  $: style =
    createStyles({
      "--header-height": header ? "64px" : "0px",
      "--footer-height": footer ? "80px" : "0px",
      "--left-railbar-width": leftRailbar ? "88px" : "0px",
      "--right-railbar-width": rightRailbar ? "88px" : "0px",
      "--left-drawer-width": leftDrawer ? "300px" : "0px",
      "--right-drawer-width": rightDrawer ? "300px" : "0px",
    }) || undefined;

  let leftDrawerElement: QDrawer;
  let leftDrawerShown = true;

  let rightDrawerElement: QDrawer;
  let rightDrawerShown = true;

  $: if (!leftDrawer) {
    leftDrawerShown = false;
  } else if (!rightDrawer) {
    rightDrawerShown = false;
  }
</script>

<QDocs componentDocs={QLayoutDocs}>
  <QLayout slot="display" view="lhh lpr lfr" headerHeight="50px" footerHeight="50px">
    <QHeader slot="header" elevate>
      <QBtn icon="menu" flat on:click={displayLeftDrawerElement.toggle} />
      <QToolbarTitle>Header</QToolbarTitle>
    </QHeader>
    <QDrawer
      slot="drawerLeft"
      overlay
      bind:value={displayLeftDrawer}
      bordered
      class="no-round"
      bind:this={displayLeftDrawerElement}
    >
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
    <QFooter slot="footer" class="no-round flex flex-center" elevate>
      <h3 class="small center">Footer</h3>
    </QFooter>
  </QLayout>

  <div slot="usage">
    <QDocsSection {snippets} title="Trying different layouts">
      <QCard bordered class="q-pa-none" style="height: 80vh">
        <QLayout {view} {style}>
          <QHeader style={header ? undefined : "display: none;"} slot="header" elevate>
            {#if leftDrawer}
              <QBtn icon="menu" flat on:click={leftDrawerElement.toggle} />
            {/if}
            <div class="flex column">
              <QRadio bind:selected={viewArr[0][0]} value="h" label="h" />
              <QRadio style="margin: 0" bind:selected={viewArr[0][0]} value="l" label="l" />
            </div>
            <div class="max flex column items-center" style="flex-grow: 1">
              <QRadio
                style="width: fit-content"
                bind:selected={viewArr[0][1]}
                value="h"
                label="h"
              />
              <QRadio
                style="width: fit-content; margin: 0"
                bind:selected={viewArr[0][1]}
                value="H"
                label="H"
              />
            </div>
            <div class="flex column">
              <QRadio bind:selected={viewArr[0][2]} value="h" label="h" />
              <QRadio style="margin: 0" bind:selected={viewArr[0][2]} value="r" label="r" />
            </div>
            {#if rightDrawer}
              <QBtn icon="menu" flat on:click={rightDrawerElement.toggle} />
            {/if}
          </QHeader>

          <QRailbar style={leftRailbar ? undefined : "display: none;"} slot="railbarLeft" bordered>
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
          <QRailbar
            style={rightRailbar ? undefined : "display: none;"}
            slot="railbarRight"
            side="right"
            bordered
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
          </QRailbar>

          <QDrawer
            style={leftDrawer ? undefined : "display: none;"}
            slot="drawerLeft"
            bordered
            persistent
            bind:value={leftDrawerShown}
            bind:this={leftDrawerElement}
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
            style={rightDrawer ? undefined : "display: none;"}
            slot="drawerRight"
            side="right"
            bordered
            persistent
            bind:value={rightDrawerShown}
            bind:this={rightDrawerElement}
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

          <QFooter style={footer ? undefined : "display: none;"} slot="footer" elevate>
            {#if leftDrawer}
              <QBtn icon="menu" flat on:click={leftDrawerElement.toggle} />
            {/if}
            <div class="flex column">
              <QRadio bind:selected={viewArr[2][0]} value="f" label="f" />
              <QRadio style="margin: 0" bind:selected={viewArr[2][0]} value="l" label="l" />
            </div>
            <div class="max flex column items-center" style="flex-grow: 1">
              <QRadio
                style="width: fit-content"
                bind:selected={viewArr[2][1]}
                value="f"
                label="f"
              />
              <QRadio
                style="width: fit-content; margin: 0"
                bind:selected={viewArr[2][1]}
                value="F"
                label="F"
              />
            </div>
            <div class="flex column">
              <QRadio bind:selected={viewArr[2][2]} value="f" label="f" />
              <QRadio style="margin: 0" bind:selected={viewArr[2][2]} value="r" label="r" />
            </div>
            {#if rightDrawer}
              <QBtn icon="menu" flat on:click={rightDrawerElement.toggle} />
            {/if}
          </QFooter>

          <QList slot="content">
            <QItem>
              <QItemSection type="toggle">
                <QToggle bind:value={header} />
              </QItemSection>
              <QItemSection>Header</QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="toggle">
                <QToggle bind:value={leftRailbar} />
              </QItemSection>
              <QItemSection>Left Railbar</QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="toggle">
                <QToggle bind:value={rightRailbar} />
              </QItemSection>
              <QItemSection>Right Railbar</QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="toggle">
                <QToggle bind:value={leftDrawer} />
              </QItemSection>
              <QItemSection>Left Drawer</QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="toggle">
                <QToggle bind:value={rightDrawer} />
              </QItemSection>
              <QItemSection>Right Drawer</QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="toggle">
                <QToggle bind:value={footer} />
              </QItemSection>
              <QItemSection>Footer</QItemSection>
            </QItem>
          </QList>
        </QLayout>
      </QCard>
    </QDocsSection>
  </div>
</QDocs>
