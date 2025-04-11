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
  import type { QLayoutProps } from "$lib/components/layout/props";
  import { snippet } from "./docs.snippets";

  let displayLeftDrawerElement = $state<ReturnType<typeof QDrawer>>();
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

  let leftDrawerElement = $state<ReturnType<typeof QDrawer>>();
  let leftDrawerShown = $state(true);

  let rightDrawerElement = $state<ReturnType<typeof QDrawer>>();
  let rightDrawerShown = $state(true);

  $effect(() => {
    if (!leftDrawer) {
      leftDrawerShown = false;
    } else if (!rightDrawer) {
      rightDrawerShown = false;
    }
  });
</script>

<QDocs {snippets} componentDocs={QLayoutDocs}>
  {#snippet display()}
    <QLayout view="lhh lpr lfr" style="border-radius: 0">
      {#snippet header()}
        <QHeader elevated height={48}>
          <QBtn icon="menu" variant="flat" onclick={displayLeftDrawerElement?.toggle} />
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
      <QDocsSection title="Trying different layouts">
        {#snippet sectionDescription()}
          <p>
            The QLayout component is a powerful tool for creating responsive layouts in your
            application. It allows you to easily create complex layouts with minimal effort.
          </p>
          <p>
            To handle the layout of your application, Quaff provides a <code>view</code> prop that allows
            you to quickly configure one. As of today, this prop is not case-sensitive.
          </p>
          <p>
            Basically, the <code>view</code> prop can be split in 3 parts of 3 letters:
          </p>
          <ul class="q-pl-md">
            <li>
              The first part defines the header layout. The first letter defines wether the header
              <code>h</code>
              or the railbar and drawer <code>l</code> should extend to the top left corner. The
              second letter is always a <code>h</code>. The third letter defines wether the header
              <code>h</code>
              or the railbar and drawer <code>r</code> should extend to the top right corner.
            </li>
            <li>
              Right now, the second part doesn't have any impact on the layout so using
              <code>lpr</code> by default works well. Note that it might change in the future.
            </li>
            <li>
              Finally, the third part defines the footer layout in the same way the first group
              defines the header layout. The only difference is the <code>h</code> (for header) is
              replaced by
              <code>f</code> (for footer).
            </li>
          </ul>
          <p>
            As the <code>view</code> prop can be a bit tricky to understand at first, here's a sandbox
            where you can try different layout configurations and see how they look in real-time. When
            you find a layout you like, you can copy the code for it and use it in your own application.
          </p>
        {/snippet}

        <QCard bordered class="q-pa-none">
          <QLayout {view}>
            {#snippet header()}
              {#if showHeader}
                <QHeader elevated>
                  {#if leftDrawer}
                    <QBtn icon="menu" variant="flat" onclick={leftDrawerElement?.toggle} />
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
                    <QBtn icon="menu" variant="flat" onclick={rightDrawerElement?.toggle} />
                  {/if}
                </QHeader>
              {/if}
            {/snippet}

            {#snippet railbarLeft()}
              {#if leftRailbar}
                <QRailbar bordered>
                  <QList>
                    <QItem to="#" noRipple>
                      <QIcon name="home" />
                      <QItemSection>Home</QItemSection>
                    </QItem>
                    <QItem to="#" noRipple>
                      <QIcon name="help" />
                      <QItemSection>About</QItemSection>
                    </QItem>
                    <QItem to="#" noRipple>
                      <QIcon name="shopping_cart" />
                      <QItemSection>Store</QItemSection>
                    </QItem>
                    <QItem to="#" noRipple>
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
                    <QItem to="#" noRipple>
                      <QIcon name="home" />
                      <QItemSection>Home</QItemSection>
                    </QItem>
                    <QItem to="#" noRipple>
                      <QIcon name="help" />
                      <QItemSection>About</QItemSection>
                    </QItem>
                    <QItem to="#" noRipple>
                      <QIcon name="shopping_cart" />
                      <QItemSection>Store</QItemSection>
                    </QItem>
                    <QItem to="#" noRipple>
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
                    <QBtn icon="menu" variant="flat" onclick={leftDrawerElement?.toggle} />
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
                    <QBtn icon="menu" variant="flat" onclick={rightDrawerElement?.toggle} />
                  {/if}
                </QFooter>
              {/if}
            {/snippet}

            {#snippet content()}
              <div class="flex items-center q-mx-auto" style="height: 60vh; max-width: 12rem">
                <QList style="text-align: center;">
                  <QItem>
                    <QItemSection type="switch">
                      <QSwitch bind:value={showHeader} />
                    </QItemSection>
                    <QItemSection>Header</QItemSection>
                  </QItem>
                  <QItem>
                    <QItemSection type="switch">
                      <QSwitch bind:value={leftRailbar} />
                    </QItemSection>
                    <QItemSection>Left Railbar</QItemSection>
                  </QItem>
                  <QItem>
                    <QItemSection type="switch">
                      <QSwitch bind:value={rightRailbar} />
                    </QItemSection>
                    <QItemSection>Right Railbar</QItemSection>
                  </QItem>
                  <QItem>
                    <QItemSection type="switch">
                      <QSwitch bind:value={leftDrawer} />
                    </QItemSection>
                    <QItemSection>Left Drawer</QItemSection>
                  </QItem>
                  <QItem>
                    <QItemSection type="switch">
                      <QSwitch bind:value={rightDrawer} />
                    </QItemSection>
                    <QItemSection>Right Drawer</QItemSection>
                  </QItem>
                  <QItem>
                    <QItemSection type="switch">
                      <QSwitch bind:value={showFooter} />
                    </QItemSection>
                    <QItemSection>Footer</QItemSection>
                  </QItem>
                </QList>
              </div>
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
