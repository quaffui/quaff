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
  import QRadio from "$lib/components/radio/QRadio.svelte";
  import QRailbar from "$lib/components/railbar/QRailbar.svelte";
  import QToggle from "$lib/components/toggle/QToggle.svelte";
  import QToolbar from "$lib/components/toolbar/QToolbar.svelte";
  import { createStyles } from "$lib/utils/props";

  import { snippet } from "./docs.snippets";

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

  let leftDrawerShown = true;
  let rightDrawerShown = true;

  $: if (!leftDrawer) {
    leftDrawerShown = false;
  } else if (!rightDrawer) {
    rightDrawerShown = false;
  }

  $: console.log({ rightDrawerShown });
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
          <QToolbar
            style={header ? undefined : "display: none;"}
            slot="header"
            class="small-elevate"
          >
            {#if leftDrawer}
              <QBtn icon="menu" flat on:click={() => (leftDrawerShown = !leftDrawerShown)} />
            {/if}
            <div class="flex column">
              <QRadio bind:selected={viewArr[0][0]} value="h" label="h" />
              <QRadio class="no-margin" bind:selected={viewArr[0][0]} value="l" label="l" />
            </div>
            <div class="max flex column middle-align">
              <QRadio
                style="width: fit-content"
                bind:selected={viewArr[0][1]}
                value="h"
                label="h"
              />
              <QRadio
                style="width: fit-content"
                class=" no-margin"
                bind:selected={viewArr[0][1]}
                value="H"
                label="H"
              />
            </div>
            <div class="flex column">
              <QRadio bind:selected={viewArr[0][2]} value="h" label="h" />
              <QRadio class="no-margin" bind:selected={viewArr[0][2]} value="r" label="r" />
            </div>
            {#if rightDrawer}
              <QBtn icon="menu" flat on:click={() => (rightDrawerShown = !rightDrawerShown)} />
            {/if}
          </QToolbar>

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

          <QFooter style={footer ? undefined : "display: none;"} slot="footer">
            {#if leftDrawer}
              <QBtn icon="menu" flat on:click={() => (leftDrawerShown = !leftDrawerShown)} />
            {/if}
            <div class="flex column">
              <QRadio bind:selected={viewArr[2][0]} value="f" label="f" />
              <QRadio class="no-margin" bind:selected={viewArr[2][0]} value="l" label="l" />
            </div>
            <div class="max flex column middle-align">
              <QRadio
                style="width: fit-content"
                bind:selected={viewArr[2][1]}
                value="f"
                label="f"
              />
              <QRadio
                style="width: fit-content"
                class=" no-margin"
                bind:selected={viewArr[2][1]}
                value="F"
                label="F"
              />
            </div>
            <div class="flex column">
              <QRadio bind:selected={viewArr[2][2]} value="f" label="f" />
              <QRadio class="no-margin" bind:selected={viewArr[2][2]} value="r" label="r" />
            </div>
            {#if rightDrawer}
              <QBtn icon="menu" flat on:click={() => (rightDrawerShown = !rightDrawerShown)} />
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
