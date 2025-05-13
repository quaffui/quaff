<script lang="ts">
  import { QDrawerDocs } from "$components/drawer/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QBtn,
    QDrawer,
    QFooter,
    QHeader,
    QIcon,
    QItem,
    QItemSection,
    QLayout,
    QList,
  } from "$lib";
  import { QDocs, QDocsSection } from "$private";

  import snippets from "./docs.snippets";

  let displayDrawerOpen = $state(false);
  let basicDrawerOpen = $state(false);

  let leftDrawerOpen = $state(false);
  let rightDrawerOpen = $state(false);
  let overlayDrawerOpen = $state(false);
  let persistentDrawerOpen = $state(false);
  let borderedDrawerOpen = $state(false);
  let customWidthDrawerOpen = $state(false);
  let programmaticDrawerState = $state(false);
  let layoutDrawerOpen = $state(false);

  let drawerRef = $state<QDrawer>();
</script>

<svelte:head>
  <title>{pageTitle("QDrawer")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QDrawerDocs}>
  {#snippet display()}
    <QBtn label="Open drawer" onclick={() => (displayDrawerOpen = !displayDrawerOpen)} />

    <QDrawer bind:value={displayDrawerOpen} overlay>
      <div class="q-py-md">
        <h5>Navigation</h5>
        <QList dense>
          <QItem>
            <QItemSection type="avatar">
              <QIcon name="home" />
            </QItemSection>
            <QItemSection>Home</QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="avatar">
              <QIcon name="settings" />
            </QItemSection>
            <QItemSection>Settings</QItemSection>
          </QItem>
        </QList>
      </div>
    </QDrawer>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Drawer">
        {#snippet sectionDescription()}
          QDrawer is a side navigation component that can be toggled open and closed. It's typically
          used for navigation menus, filtering options, or additional content. The drawer is
          controlled with the <code>value</code> prop which determines if it's open or closed.
        {/snippet}

        <QLayout
          view="hHh LpR fFf"
          style="height: 300px; width: 100%; border: 1px solid var(--outline);"
        >
          {#snippet header()}
            <QHeader>
              <QBtn flat round icon="menu" onclick={() => (basicDrawerOpen = !basicDrawerOpen)} />
              <h6 class="q-mx-md q-mb-none">App Title</h6>
            </QHeader>
          {/snippet}

          {#snippet drawerLeft()}
            <QDrawer bind:value={basicDrawerOpen}>
              <div class="q-pa-md">
                <h6>Navigation</h6>
                <QList dense>
                  <QItem>
                    <QItemSection type="avatar">
                      <QIcon name="home" />
                    </QItemSection>
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem>
                    <QItemSection type="avatar">
                      <QIcon name="settings" />
                    </QItemSection>
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
                <div class="q-mt-lg">
                  <QBtn label="Close Drawer" onclick={() => (basicDrawerOpen = false)} />
                </div>
              </div>
            </QDrawer>
          {/snippet}

          <div class="q-pa-md">
            <p>Click the menu button to toggle the drawer:</p>
            <QBtn label="Toggle Drawer" onclick={() => (basicDrawerOpen = !basicDrawerOpen)} />
          </div>
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Drawer Sides">
        {#snippet sectionDescription()}
          QDrawer can be positioned on either the left or right side of the layout using the
          <code>side</code> prop. The default is "left".
        {/snippet}

        <QLayout
          view="hHh LpR fFf"
          style="height: 300px; width: 100%; border: 1px solid var(--outline);"
        >
          {#snippet header()}
            <QHeader class="justify-between">
              <QBtn flat round icon="menu" onclick={() => (leftDrawerOpen = !leftDrawerOpen)} />
              <h6 class="q-mx-md q-mb-none">App Title</h6>
              <QBtn
                flat
                round
                icon="settings"
                onclick={() => (rightDrawerOpen = !rightDrawerOpen)}
              />
            </QHeader>
          {/snippet}

          {#snippet drawerLeft()}
            <QDrawer bind:value={leftDrawerOpen} side="left">
              <div class="q-pa-md">
                <h6>Left Drawer</h6>
                <p>This drawer opens from the left side.</p>
                <QBtn label="Close" onclick={() => (leftDrawerOpen = false)} />
              </div>
            </QDrawer>
          {/snippet}

          {#snippet drawerRight()}
            <QDrawer bind:value={rightDrawerOpen} side="right">
              <div class="q-pa-md">
                <h6>Right Drawer</h6>
                <p>This drawer opens from the right side.</p>
                <QBtn label="Close" onclick={() => (rightDrawerOpen = false)} />
              </div>
            </QDrawer>
          {/snippet}

          <div class="q-pa-md flex column flex-center">
            <p>Click the buttons to toggle the drawers:</p>
            <div class="flex q-gap-md">
              <QBtn label="Toggle Left Drawer" onclick={() => (leftDrawerOpen = !leftDrawerOpen)} />
              <QBtn
                label="Toggle Right Drawer"
                onclick={() => (rightDrawerOpen = !rightDrawerOpen)}
              />
            </div>
          </div>
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Overlay Mode">
        {#snippet sectionDescription()}
          By default, QDrawer pushes the content aside when opened. With the <code>overlay</code> prop,
          the drawer will appear above the content instead, without affecting the layout. Overlay drawers
          cannot be persistent.
        {/snippet}

        <QLayout
          view="hHh LpR fFf"
          style="height: 300px; width: 100%; border: 1px solid var(--outline);"
        >
          {#snippet header()}
            <QHeader>
              <QBtn
                flat
                round
                icon="menu"
                onclick={() => (overlayDrawerOpen = !overlayDrawerOpen)}
              />
              <h6 class="q-mx-md q-mb-none">Overlay Drawer</h6>
            </QHeader>
          {/snippet}

          {#snippet drawerLeft()}
            <QDrawer bind:value={overlayDrawerOpen} overlay>
              <div class="q-pa-md">
                <h6>Overlay Drawer</h6>
                <p>This drawer appears over the content instead of pushing it aside.</p>
                <QBtn label="Close" onclick={() => (overlayDrawerOpen = false)} />
              </div>
            </QDrawer>
          {/snippet}

          <div class="q-pa-md">
            <p>Click the menu button to open the overlay drawer:</p>
            <QBtn
              label="Toggle Overlay Drawer"
              onclick={() => (overlayDrawerOpen = !overlayDrawerOpen)}
            />
            <p class="q-mt-md">Notice how the content doesn't move when the drawer opens.</p>
          </div>
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Persistent Drawer">
        {#snippet sectionDescription()}
          A persistent drawer won't close when clicking outside it. This is useful when you need the
          drawer to stay open until explicitly closed by the user.
        {/snippet}

        <QLayout
          view="hHh LpR fFf"
          style="height: 300px; width: 100%; border: 1px solid var(--outline);"
        >
          {#snippet header()}
            <QHeader>
              <QBtn
                flat
                round
                icon="menu"
                onclick={() => (persistentDrawerOpen = !persistentDrawerOpen)}
              />
              <h6 class="q-mx-md q-mb-none">Persistent Drawer</h6>
            </QHeader>
          {/snippet}

          {#snippet drawerLeft()}
            <QDrawer bind:value={persistentDrawerOpen} persistent>
              <div class="q-pa-md">
                <h6>Persistent Drawer</h6>
                <p>This drawer won't close when clicking outside it. Try it!</p>
                <p>You need to use the button below or in the header to close it.</p>
                <QBtn label="Close Drawer" onclick={() => (persistentDrawerOpen = false)} />
              </div>
            </QDrawer>
          {/snippet}

          <div class="q-pa-md">
            <p>Click the menu button to open the persistent drawer:</p>
            <QBtn
              label="Toggle Persistent Drawer"
              onclick={() => (persistentDrawerOpen = !persistentDrawerOpen)}
            />
            <p class="q-mt-md">Try clicking here - the drawer will stay open.</p>
          </div>
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Bordered Drawer">
        {#snippet sectionDescription()}
          You can add a border to the drawer using the <code>bordered</code> prop, which helps visually
          separate it from the main content.
        {/snippet}

        <QLayout
          view="hHh LpR fFf"
          style="height: 300px; width: 100%; border: 1px solid var(--outline);"
        >
          {#snippet header()}
            <QHeader>
              <QBtn
                flat
                round
                icon="menu"
                onclick={() => (borderedDrawerOpen = !borderedDrawerOpen)}
              />
              <h6 class="q-mx-md q-mb-none">Bordered Drawer</h6>
            </QHeader>
          {/snippet}

          {#snippet drawerLeft()}
            <QDrawer bind:value={borderedDrawerOpen} bordered>
              <div class="q-pa-md">
                <h6>Bordered Drawer</h6>
                <p>This drawer has a border on its edge.</p>
                <QBtn label="Close" onclick={() => (borderedDrawerOpen = false)} />
              </div>
            </QDrawer>
          {/snippet}

          <div class="q-pa-md">
            <p>Click the menu button to toggle the bordered drawer:</p>
            <QBtn
              label="Toggle Bordered Drawer"
              onclick={() => (borderedDrawerOpen = !borderedDrawerOpen)}
            />
          </div>
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Custom Width">
        {#snippet sectionDescription()}
          You can customize the width of the drawer using the <code>width</code> prop. The default width
          is 300px. If specified as a number, it's interpreted as pixels.
        {/snippet}

        <QLayout
          view="hHh LpR fFf"
          style="height: 300px; width: 100%; border: 1px solid var(--outline);"
        >
          {#snippet header()}
            <QHeader>
              <QBtn
                flat
                round
                icon="menu"
                onclick={() => (customWidthDrawerOpen = !customWidthDrawerOpen)}
              />
              <h6 class="q-mx-md q-mb-none">Custom Width</h6>
            </QHeader>
          {/snippet}

          {#snippet drawerLeft()}
            <QDrawer bind:value={customWidthDrawerOpen} width={400}>
              <div class="q-pa-md">
                <h6>Wide Drawer (400px)</h6>
                <p>This drawer has a custom width of 400px instead of the default 300px.</p>
                <QBtn label="Close" onclick={() => (customWidthDrawerOpen = false)} />
              </div>
            </QDrawer>
          {/snippet}

          <div class="q-pa-md">
            <p>Click the menu button to toggle the wide drawer:</p>
            <QBtn
              label="Toggle Wide Drawer"
              onclick={() => (customWidthDrawerOpen = !customWidthDrawerOpen)}
            />
          </div>
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Programmatic Control">
        {#snippet sectionDescription()}
          QDrawer provides methods for programmatic control: <code>show</code>(),
          <code>hide</code>(), and <code>toggle</code>(). These can be accessed by binding to the
          component with <code>bind</code>:this.
        {/snippet}

        <QLayout
          view="hHh LpR fFf"
          style="height: 300px; width: 100%; border: 1px solid var(--outline);"
        >
          {#snippet header()}
            <QHeader>
              <h6 class="q-mb-none">Programmatic Control</h6>
            </QHeader>
          {/snippet}

          {#snippet drawerLeft()}
            <QDrawer bind:this={drawerRef} bind:value={programmaticDrawerState}>
              <div class="q-pa-md">
                <h6>Drawer Content</h6>
                <p>This drawer is controlled programmatically.</p>
                <QBtn label="Close with hide()" onclick={drawerRef?.hide} />
              </div>
            </QDrawer>
          {/snippet}

          <div class="q-pa-md">
            <p>Control the drawer with these buttons:</p>
            <div class="flex q-gap-md">
              <QBtn label="Show Drawer" onclick={drawerRef?.show} />
              <QBtn label="Hide Drawer" onclick={drawerRef?.hide} />
              <QBtn label="Toggle Drawer" onclick={drawerRef?.toggle} />
            </div>
          </div>
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Working with QLayout">
        {#snippet sectionDescription()}
          QDrawer is designed to work with QLayout. The view prop of QLayout controls how the drawer
          relates to headers and footers. The format "hHh LpR fFf" defines the layout structure,
          where L and R represent left and right drawers, and their casing determines how they
          interact with other elements.
        {/snippet}

        <QLayout
          view="lHh Lpr lff"
          style="height: 350px; width: 100%; border: 1px solid var(--outline);"
        >
          {#snippet header()}
            <QHeader>
              <QBtn flat round icon="menu" onclick={() => (layoutDrawerOpen = !layoutDrawerOpen)} />
              <h6 class="q-mx-md q-mb-none">App with Layout</h6>
            </QHeader>
          {/snippet}

          {#snippet drawerLeft()}
            <QDrawer bind:value={layoutDrawerOpen} bordered>
              <div class="q-pa-md">
                <h6>Navigation</h6>
                <QList dense>
                  <QItem>
                    <QItemSection type="avatar">
                      <QIcon name="home" />
                    </QItemSection>
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem>
                    <QItemSection type="avatar">
                      <QIcon name="person" />
                    </QItemSection>
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                </QList>
              </div>
            </QDrawer>
          {/snippet}

          {#snippet footer()}
            <QFooter>
              <div class="q-px-md q-py-sm text-center">Footer content</div>
            </QFooter>
          {/snippet}

          <div class="q-pa-md">
            <p>This example shows a complete layout with:</p>
            <ul class="q-ma-md">
              <li>Header at the top</li>
              <li>Navigation drawer on the left</li>
              <li>Footer at the bottom</li>
            </ul>
            <QBtn
              label="Toggle Navigation"
              onclick={() => (layoutDrawerOpen = !layoutDrawerOpen)}
            />
          </div>
        </QLayout>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  h6 {
    margin: 0;
  }
</style>
