<script lang="ts">
  import { resolve } from "$app/paths";
  import { QDrawerDocs } from "#components/drawer/docs.js";
  import { docsCtx } from "#docs/QDocs.svelte";
  import {
    QBtn,
    QIconBtn,
    QDrawer,
    QFooter,
    QHeader,
    QHeaderTitle,
    QIcon,
    QLayout,
    QList,
    QNavGroup,
    QNavItem,
    QSlider,
    QSwitch,
  } from "#lib";
  import { QDocs, QDocsSection } from "#docs";
  import { useMeta } from "#lib/meta.js";
  import { pageMeta } from "#docs/metadata.js";
  import snippets from "./docs.snippets.js";

  useMeta(
    pageMeta(
      "QDrawer — Navigation Drawer",
      "Build side navigation with QDrawer for Svelte. Explore expandable groups, overlay and persistent modes, custom widths, and QLayout integration."
    )
  );

  docsCtx.set({ snippets, componentDocs: QDrawerDocs });

  let isPreviewDrawerOpen = $state(false);
  let isBasicDrawerOpen = $state(false);
  let isNavigationDrawerOpen = $state(false);
  let navigationDestination = $state("Website");
  let isStartDrawerOpen = $state(false);
  let isEndDrawerOpen = $state(false);
  let isBehaviorDrawerOpen = $state(false);
  let overlay = $state(true);
  let persistent = $state(false);
  let bordered = $state(false);
  let drawerWidth = $state(320);
  let isControlledDrawerOpen = $state(false);
  let isLayoutDrawerOpen = $state(false);
  let drawerRef = $state<QDrawer>();

  function getNavigationProps(destination: string) {
    const isCurrent = navigationDestination === destination;

    return {
      active: isCurrent,
      onclick: () => {
        navigationDestination = destination;
        isNavigationDrawerOpen = false;
      },
    };
  }
</script>

<QDocs>
  {#snippet display()}
    <QLayout class="drawer-preview surface full-width" view="hHh LpR fFf">
      {#snippet header()}
        <QHeader>
          <QIconBtn
            flat
            icon="menu"
            aria-label="Open preview navigation"
            aria-expanded={isPreviewDrawerOpen}
            aria-controls="preview-navigation"
            onclick={() => (isPreviewDrawerOpen = !isPreviewDrawerOpen)}
          />
          <QHeaderTitle align="start">Workspace</QHeaderTitle>
        </QHeader>
      {/snippet}
      {#snippet drawerStart()}
        <QDrawer
          id="preview-navigation"
          bind:value={isPreviewDrawerOpen}
          width={240}
          overlay
          aria-label="Preview navigation"
          class="drawer-panel"
        >
          <div class="flex items-center justify-between q-px-sm">
            <h2 class="title-medium q-ma-md">Workspace</h2>
            <QIconBtn
              icon="close"
              flat
              aria-label="Close preview navigation"
              onclick={() => (isPreviewDrawerOpen = false)}
            />
          </div>
          <QList tag="nav" aria-label="Preview pages" expressive={false} preserveTabOrder>
            <QNavItem
              label="Overview"
              icon="home"
              active
              onclick={() => (isPreviewDrawerOpen = false)}
            />
            <QNavItem
              label="Projects"
              icon="folder"
              onclick={() => (isPreviewDrawerOpen = false)}
            />
            <QNavItem
              label="Settings"
              icon="settings"
              onclick={() => (isPreviewDrawerOpen = false)}
            />
          </QList>
        </QDrawer>
      {/snippet}
      <div class="column items-center q-gap-md q-pa-lg text-center">
        <QIcon name="folder" size="40px" class="text-primary" />
        <h2 class="title-large q-ma-none">Everything in its place</h2>
        <p class="body-medium q-ma-none">Open the drawer to explore your workspace.</p>
        <QBtn
          label="Open navigation"
          variant="tonal"
          onclick={() => (isPreviewDrawerOpen = true)}
        />
      </div>
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Basic Usage">
      {#snippet sectionDescription()}
        Place QDrawer in QLayout's <code>drawerStart</code> snippet and bind <code>value</code> to control
        it. The drawer shares space with content on wide screens and becomes modal below its breakpoint.
      {/snippet}
      <QLayout class="drawer-example surface-container-low border full-width" view="hHh LpR fFf">
        {#snippet header()}
          <QHeader>
            <QIconBtn
              flat
              icon="menu"
              aria-label="Toggle basic navigation"
              aria-expanded={isBasicDrawerOpen}
              aria-controls="basic-navigation"
              onclick={() => (isBasicDrawerOpen = !isBasicDrawerOpen)}
            />
            <QHeaderTitle align="start">My workspace</QHeaderTitle>
          </QHeader>
        {/snippet}
        {#snippet drawerStart()}
          <QDrawer
            id="basic-navigation"
            bind:value={isBasicDrawerOpen}
            aria-label="Basic navigation"
            class="drawer-panel"
          >
            <div class="flex items-center justify-between q-px-sm">
              <h2 class="title-medium q-ma-md">Navigation</h2>
              <QIconBtn
                flat
                icon="close"
                aria-label="Close basic navigation"
                onclick={() => (isBasicDrawerOpen = false)}
              />
            </div>
            <QList tag="nav" aria-label="Workspace pages" expressive={false} preserveTabOrder>
              <QNavItem
                label="Home"
                icon="home"
                active
                onclick={() => (isBasicDrawerOpen = false)}
              />
              <QNavItem
                label="Settings"
                icon="settings"
                onclick={() => (isBasicDrawerOpen = false)}
              />
            </QList>
          </QDrawer>
        {/snippet}
        <div class="q-pa-lg">
          <h3 class="title-large q-mt-none q-mb-sm">Home</h3>
          <p class="body-medium q-ma-none">Use the menu button to open or close navigation.</p>
        </div>
      </QLayout>
    </QDocsSection>

    <QDocsSection title="Expandable Navigation">
      {#snippet sectionDescription()}
        Group related destinations with QNavGroup. Selecting a page here updates the content and
        closes the drawer. Use raw <code>to</code> paths for app navigation; see
        <a class="q-docs-link" href={resolve("/components/nav-item")}>QNavItem and QNavGroup</a>.
      {/snippet}
      <QLayout class="drawer-example surface-container-low border full-width" view="hHh LpR fFf">
        {#snippet header()}
          <QHeader>
            <QIconBtn
              flat
              icon="menu"
              aria-label="Toggle project navigation"
              aria-expanded={isNavigationDrawerOpen}
              aria-controls="project-navigation"
              onclick={() => (isNavigationDrawerOpen = !isNavigationDrawerOpen)}
            />
            <QHeaderTitle align="start">Projects</QHeaderTitle>
          </QHeader>
        {/snippet}
        {#snippet drawerStart()}
          <QDrawer
            id="project-navigation"
            bind:value={isNavigationDrawerOpen}
            overlay
            aria-label="Project navigation"
            class="drawer-panel"
          >
            <div class="flex items-center justify-between q-px-sm">
              <h2 class="title-medium q-ma-md">Workspace</h2>
              <QIconBtn
                flat
                icon="close"
                aria-label="Close project navigation"
                onclick={() => (isNavigationDrawerOpen = false)}
              />
            </div>
            <QList tag="nav" aria-label="Projects" expressive={false} preserveTabOrder>
              <QNavItem label="Overview" icon="home" {...getNavigationProps("Overview")} />
              <QNavGroup label="Projects" icon="folder" defaultOpened>
                {#each ["Website", "Mobile app"] as destination (destination)}
                  <QNavItem label={destination} {...getNavigationProps(destination)} />
                {/each}
              </QNavGroup>
              <QNavItem label="Settings" icon="settings" {...getNavigationProps("Settings")} />
            </QList>
          </QDrawer>
        {/snippet}
        <div class="q-pa-lg" aria-live="polite">
          <p class="label-medium q-mt-none q-mb-sm">Current page</p>
          <h3 class="title-large q-mt-none q-mb-md">{navigationDestination}</h3>
          <QBtn
            label="Choose a page"
            variant="tonal"
            onclick={() => (isNavigationDrawerOpen = true)}
          />
        </div>
      </QLayout>
    </QDocsSection>

    <QDocsSection title="Drawer Sides">
      {#snippet sectionDescription()}
        <code>side="start"</code> follows the reading direction; <code>side="end"</code> uses the
        opposite edge. Match them with QLayout's <code>drawerStart</code> and <code>drawerEnd</code>
        snippets. Use <code>left</code> or <code>right</code> when an edge must stay physical.
      {/snippet}
      <div class="flex q-gap-sm q-mb-lg">
        <QBtn label="Open start drawer" onclick={() => (isStartDrawerOpen = true)} />
        <QBtn label="Open end drawer" variant="outlined" onclick={() => (isEndDrawerOpen = true)} />
      </div>
      <QLayout class="drawer-example surface-container-low border full-width" view="hHh LpR fFf">
        {#snippet drawerStart()}
          <QDrawer
            bind:value={isStartDrawerOpen}
            side="start"
            overlay
            aria-label="Start drawer"
            class="drawer-panel"
          >
            <div class="q-pa-lg">
              <h3 class="title-large q-mt-none q-mb-md">Navigation</h3>
              <p class="body-medium q-mb-lg">The start edge follows the page direction.</p>
              <QBtn
                label="Close start drawer"
                variant="outlined"
                onclick={() => (isStartDrawerOpen = false)}
              />
            </div>
          </QDrawer>
        {/snippet}
        {#snippet drawerEnd()}
          <QDrawer
            bind:value={isEndDrawerOpen}
            side="end"
            overlay
            aria-label="End drawer"
            class="drawer-panel"
          >
            <div class="q-pa-lg">
              <h3 class="title-large q-mt-none q-mb-md">Page details</h3>
              <p class="body-medium q-mb-lg">Supporting content can use the opposite edge.</p>
              <QBtn
                label="Close end drawer"
                variant="outlined"
                onclick={() => (isEndDrawerOpen = false)}
              />
            </div>
          </QDrawer>
        {/snippet}
        <div class="column flex-center fit q-pa-lg text-center">
          <QIcon name="view_sidebar" size="40px" class="text-primary q-mb-md" />
          <p class="body-medium q-ma-none">Navigation on one side, details on the other.</p>
        </div>
      </QLayout>
    </QDocsSection>

    <QDocsSection title="Behavior and Appearance">
      {#snippet sectionDescription()}
        <code>overlay</code> opens above content with a scrim. <code>persistent</code> prevents
        outside clicks, Escape, and swipes from dismissing it, so provide a close button.
        <code>bordered</code> adds an edge border; numeric <code>width</code> uses pixels and
        defaults to 360. The default responsive breakpoint is 840px; <code>behavior="desktop"</code>
        or
        <code>"mobile"</code> forces one presentation. Open the drawer to adjust its width.
      {/snippet}
      <div class="flex items-center q-gap-lg q-mb-lg">
        <QSwitch label="Overlay" bind:value={overlay} />
        <QSwitch label="Persistent" bind:value={persistent} />
        <QSwitch label="Bordered" bind:value={bordered} />
      </div>
      <QLayout class="drawer-example surface-container-low border full-width" view="hHh LpR fFf">
        {#snippet header()}
          <QHeader>
            <QIconBtn
              flat
              icon="menu"
              aria-label="Toggle configurable drawer"
              aria-expanded={isBehaviorDrawerOpen}
              aria-controls="configurable-drawer"
              onclick={() => (isBehaviorDrawerOpen = !isBehaviorDrawerOpen)}
            />
            <QHeaderTitle align="start">Drawer settings</QHeaderTitle>
          </QHeader>
        {/snippet}
        {#snippet drawerStart()}
          <QDrawer
            id="configurable-drawer"
            bind:value={isBehaviorDrawerOpen}
            {overlay}
            {persistent}
            {bordered}
            width={drawerWidth}
            noSwipe
            aria-label="Configurable drawer"
            class="drawer-panel"
          >
            <div class="q-pa-lg">
              <h3 class="title-large q-mt-none q-mb-md">Drawer settings</h3>
              <div class="q-mb-md">
                <label for="drawer-width" class="label-large">Drawer width: {drawerWidth}px</label>
                <QSlider
                  id="drawer-width"
                  bind:value={drawerWidth}
                  min={240}
                  max={400}
                  step={40}
                  label
                />
              </div>
              <QBtn
                label="Close drawer"
                variant="outlined"
                onclick={() => (isBehaviorDrawerOpen = false)}
              />
            </div>
          </QDrawer>
        {/snippet}
        <div class="q-pa-lg">
          <h3 class="title-large q-mt-none q-mb-sm">Page content</h3>
          <p class="body-medium q-ma-none">
            Compare overlay and standard behavior on a wide screen.
          </p>
        </div>
      </QLayout>
    </QDocsSection>

    <QDocsSection title="Programmatic Control">
      {#snippet sectionDescription()}
        Use <code>bind:this</code> to call <code>show()</code>, <code>hide()</code>, or
        <code>toggle()</code>. Bind <code>value</code> when the rest of the page also needs the open state.
      {/snippet}
      <div class="flex q-gap-sm q-mb-lg">
        <QBtn label="Show" onclick={drawerRef?.show} />
        <QBtn label="Hide" variant="outlined" onclick={drawerRef?.hide} />
        <QBtn label="Toggle" variant="outlined" onclick={drawerRef?.toggle} />
      </div>
      <QLayout class="drawer-example surface-container-low border full-width" view="hHh LpR fFf">
        {#snippet drawerStart()}
          <QDrawer
            bind:this={drawerRef}
            bind:value={isControlledDrawerOpen}
            overlay
            aria-label="Controlled drawer"
            class="drawer-panel"
          >
            <div class="q-pa-lg">
              <h3 class="title-large q-mt-none q-mb-md">Controlled drawer</h3>
              <QBtn label="Close with hide()" variant="outlined" onclick={drawerRef?.hide} />
            </div>
          </QDrawer>
        {/snippet}
        <div class="q-pa-lg" aria-live="polite">
          <p class="body-medium q-ma-none">
            Drawer state: {isControlledDrawerOpen ? "Open" : "Closed"}
          </p>
        </div>
      </QLayout>
    </QDocsSection>

    <QDocsSection title="Working with QLayout">
      {#snippet sectionDescription()}
        QLayout's <code>view</code> controls how drawers share space with headers and footers. This
        example lets the start drawer extend beside both bars. See
        <a class="q-docs-link" href={resolve("/components/layout")}>QLayout</a> for view combinations.
      {/snippet}
      <QLayout class="drawer-example surface-container-low border full-width" view="lHh Lpr lff">
        {#snippet header()}
          <QHeader>
            <QIconBtn
              flat
              icon="menu"
              aria-label="Toggle layout navigation"
              aria-expanded={isLayoutDrawerOpen}
              aria-controls="layout-navigation"
              onclick={() => (isLayoutDrawerOpen = !isLayoutDrawerOpen)}
            />
            <QHeaderTitle align="start">App layout</QHeaderTitle>
          </QHeader>
        {/snippet}
        {#snippet drawerStart()}
          <QDrawer
            id="layout-navigation"
            bind:value={isLayoutDrawerOpen}
            bordered
            aria-label="Layout navigation"
            class="drawer-panel"
          >
            <div class="flex items-center justify-between q-px-sm">
              <h2 class="title-medium q-ma-md">Navigation</h2>
              <QIconBtn
                flat
                icon="close"
                aria-label="Close layout navigation"
                onclick={() => (isLayoutDrawerOpen = false)}
              />
            </div>
            <QList tag="nav" aria-label="Layout pages" expressive={false} preserveTabOrder>
              <QNavItem
                label="Home"
                icon="home"
                active
                onclick={() => (isLayoutDrawerOpen = false)}
              />
              <QNavItem
                label="Profile"
                icon="person"
                onclick={() => (isLayoutDrawerOpen = false)}
              />
            </QList>
          </QDrawer>
        {/snippet}
        {#snippet footer()}
          <QFooter>
            <p class="body-small q-px-md q-py-sm q-ma-none">Workspace · All changes saved</p>
          </QFooter>
        {/snippet}
        <div class="q-pa-lg">
          <h3 class="title-large q-mt-none q-mb-sm">Page content</h3>
          <p class="body-medium q-ma-none">Header, drawer, and footer share one layout.</p>
        </div>
      </QLayout>
    </QDocsSection>

    <QDocsSection title="Accessibility" noCode>
      {#snippet sectionDescription()}
        Name each drawer with <code>aria-label</code> or <code>aria-labelledby</code>, and label its
        toggle button. Modal drawers contain focus and return it when closed; Escape dismisses them
        unless <code>persistent</code> is set. Always provide a close action, and use real links for destinations
        in your app.
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  :global(.drawer-preview),
  :global(.drawer-example) {
    border-radius: 24px;
  }

  :global(.drawer-preview) {
    height: 300px;
  }

  :global(.drawer-example) {
    height: 360px;
  }

  :global(.drawer-panel) {
    max-width: 100%;
  }
</style>
