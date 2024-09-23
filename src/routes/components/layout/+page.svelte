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
    QSwitch,
  } from "$lib";
  import { QLayoutDocs } from "$lib/components/layout/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import { createStyles } from "$lib/utils";
  import type { QLayoutProps } from "$lib/components/layout/props";
  import { snippet } from "./docs.snippets";

  let displayLeftDrawerElement = $state<QDrawer>();
  let displayLeftDrawer = $state(false);
  let viewArr = $state([
    ["h", "h", "h"],
    ["l", "p", "r"],
    ["f", "f", "f"],
  ]);
  const view = $derived(viewArr.map((v) => v.join("")).join(" ") as QLayoutProps["view"]);

  let showHeader = $state(true);
  let showFooter = $state(true);
  let leftRailbar = $state(true);
  let leftDrawer = $state(true);
  let rightRailbar = $state(false);
  let rightDrawer = $state(false);

  const snippets = $derived(
    snippet(view, [showHeader, showFooter, leftRailbar, leftDrawer, rightRailbar, rightDrawer])
  );

  const style = $derived(
    createStyles({
      "--header-height": showHeader ? "64px" : "0px",
      "--footer-height": showFooter ? "80px" : "0px",
      "--left-railbar-width": leftRailbar ? "88px" : "0px",
      "--right-railbar-width": rightRailbar ? "88px" : "0px",
      "--left-drawer-width": leftDrawer ? "300px" : "0px",
      "--right-drawer-width": rightDrawer ? "300px" : "0px",
    }) || undefined
  );

  let leftDrawerElement = $state<QDrawer>();
  let leftDrawerShown = $state(true);

  let rightDrawerElement = $state<QDrawer>();
  let rightDrawerShown = $state(true);

  $effect(() => {
    if (!leftDrawer) {
      leftDrawerShown = false;
    } else if (!rightDrawer) {
      rightDrawerShown = false;
    }
  });
</script>

<QDocs componentDocs={QLayoutDocs}>
  {#snippet display()}
    <QLayout view="lhh lpr lfr" headerHeight="50px" footerHeight="50px" style="border-radius: 0">
      {#snippet header()}
        <QHeader elevated height={48}>
          <QBtn icon="menu" design="flat" onclick={displayLeftDrawerElement?.toggle} />
          <QToolbarTitle>Header</QToolbarTitle>
        </QHeader>
      {/snippet}
      {#snippet drawerLeft()}
        <QDrawer
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
      {/snippet}
      {#snippet railbarRight()}
        <QRailbar side="right" bordered>
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
      {/snippet}
      {#snippet footer()}
        <QFooter class="no-round flex flex-center" height={48}>
          <h3 class="small center">Footer</h3>
        </QFooter>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection {snippets} title="Trying different layouts">
        <QCard bordered class="q-pa-none" style="height: 80vh">
          <QLayout {view} {style}>
            {#snippet header()}
              {#if showHeader}
                <QHeader elevated>
                  {#if leftDrawer}
                    <QBtn icon="menu" design="flat" onclick={leftDrawerElement?.toggle} />
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
                    <QBtn icon="menu" design="flat" onclick={rightDrawerElement?.toggle} />
                  {/if}
                </QHeader>
              {/if}
            {/snippet}

            {#snippet railbarLeft()}
              {#if leftRailbar}
                <QRailbar bordered>
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
              {/if}
            {/snippet}

            {#snippet railbarRight()}
              {#if rightRailbar}
                <QRailbar side="right" bordered>
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
              {/if}
            {/snippet}
            {#snippet drawerLeft()}
              {#if leftDrawer}
                <QDrawer
                  bordered
                  width={160}
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
              {/if}
            {/snippet}
            {#snippet drawerRight()}
              {#if rightDrawer}
                <QDrawer
                  side="right"
                  bordered
                  persistent
                  width={160}
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
              {/if}
            {/snippet}
            {#snippet footer()}
              {#if showFooter}
                <QFooter bordered>
                  {#if leftDrawer}
                    <QBtn icon="menu" design="flat" onclick={leftDrawerElement?.toggle} />
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
                    <QBtn icon="menu" design="flat" onclick={rightDrawerElement?.toggle} />
                  {/if}
                </QFooter>
              {/if}
            {/snippet}
            {#snippet content()}
              <QList style="text-align: center">
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={showHeader} />
                  </QItemSection>
                  <QItemSection>Header</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={leftRailbar} />
                  </QItemSection>
                  <QItemSection>Left Railbar</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={rightRailbar} />
                  </QItemSection>
                  <QItemSection>Right Railbar</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={leftDrawer} />
                  </QItemSection>
                  <QItemSection>Left Drawer</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={rightDrawer} />
                  </QItemSection>
                  <QItemSection>Right Drawer</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={showFooter} />
                  </QItemSection>
                  <QItemSection>Footer</QItemSection>
                </QItem>
              </QList>
            {/snippet}
          </QLayout>
        </QCard>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style lang="scss">
  :global(.q-layout__content > .q-list) {
    max-width: fit-content;
    margin-inline: auto;
  }

  :global(.q-footer > nav) {
    justify-content: center;
  }
</style>
