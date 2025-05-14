<script lang="ts">
  import "$lib/css/fonts.scss";
  import "$lib/css/index.scss";

  import { fade } from "svelte/transition";
  import { base } from "$app/paths";
  import {
    QAvatar,
    QBtn,
    QDrawer,
    QHeader,
    QIcon,
    QItem,
    QItemSection,
    QLayout,
    QList,
    QRailbar,
    QToolbarTitle,
    QTheme,
    Quaff,
  } from "$lib";
  import { isRouteActive } from "$utils";
  import type { MaterialSymbol } from "material-symbols";

  const { children } = $props();

  Quaff.init();

  let chosenColor = $state(0);

  function to(uri: string) {
    return `${base}${uri}`;
  }

  const pages: { name: string; icon: MaterialSymbol; to: string }[] = [
    {
      name: "Home",
      icon: "home",
      to: to("/"),
    },
    {
      name: "Components",
      icon: "grid_view",
      to: to("/components"),
    },
    {
      name: "Grid",
      icon: "grid_on",
      to: to("/grid"),
    },
    {
      name: "Colors",
      icon: "palette",
      to: to("/colors"),
    },
    {
      name: "Quaff utils",
      icon: "construction",
      to: to("/utils"),
    },
  ];
  const components = [
    {
      name: "Avatar",
      to: to("/components/avatar"),
    },
    {
      name: "Breadcrumbs",
      to: to("/components/breadcrumbs"),
    },
    {
      name: "Button",
      to: to("/components/button"),
    },
    {
      name: "Card",
      to: to("/components/card"),
    },
    {
      name: "Checkbox",
      to: to("/components/checkbox"),
    },
    {
      name: "Chip",
      to: to("/components/chip"),
    },
    {
      name: "Dialog",
      to: to("/components/dialog"),
    },
    {
      name: "Drawer",
      to: to("/components/drawer"),
    },
    {
      name: "Footer",
      to: to("/components/footer"),
    },
    {
      name: "Icon",
      to: to("/components/icon"),
    },
    {
      name: "Input",
      to: to("/components/input"),
    },
    {
      name: "Layout",
      to: to("/components/layout"),
    },
    {
      name: "List",
      to: to("/components/list"),
    },
    {
      name: "Progress",
      to: to("/components/progress"),
    },
    {
      name: "Radio",
      to: to("/components/radio"),
    },
    {
      name: "Railbar",
      to: to("/components/railbar"),
    },
    {
      name: "Select",
      to: to("/components/select"),
    },
    {
      name: "Separator",
      to: to("/components/separator"),
    },
    {
      name: "Switch",
      to: to("/components/switch"),
    },
    {
      name: "Table",
      to: to("/components/table"),
    },
    {
      name: "Tabs",
      to: to("/components/tabs"),
    },
    {
      name: "Toolbar",
      to: to("/components/toolbar"),
    },
    {
      name: "Tooltip",
      to: to("/components/tooltip"),
    },
  ];

  const quaffUtils = [
    {
      name: "The Quaff class",
      to: to("/utils/quaff"),
    },
    {
      name: "QTheme",
      to: to("/utils/q-theme"),
    },
    {
      name: "QScrollObserver",
      to: to("/utils/q-scroll-observer"),
    },
  ];

  const colors = [
    "#0039b4",
    ...[
      "red",
      "blue-grey",
      "green",
      "yellow",
      "orange",
      "indigo",
      "teal",
      "deep-purple",
      "brown",
    ].map((color: string) => `var(--color-${color})`),
  ];

  let contentEl = $state<HTMLDivElement>();
  let drawerLeftEl = $state<ReturnType<typeof QDrawer>>();
  let drawerRightEl = $state<ReturnType<typeof QDrawer>>();

  const selectedRailbarItem = $derived(
    isRouteActive(`${base}/components`)
      ? `${base}/components`
      : isRouteActive(`${base}/utils`)
        ? `${base}/utils`
        : null
  );

  $effect(() => {
    if (selectedRailbarItem !== null) {
      drawerLeftEl?.show();
    } else {
      drawerLeftEl?.hide();
    }
  });

  const drawerContent = $derived(
    selectedRailbarItem === `${base}/components`
      ? components
      : selectedRailbarItem === `${base}/utils`
        ? quaffUtils
        : []
  );
</script>

<!-- eslint-disable-next-line svelte/valid-compile -->
<QLayout view="hhr lpr fff" class="main-layout">
  {#snippet header()}
    <QHeader class="elevate-2">
      <QToolbarTitle>Quaff</QToolbarTitle>
      <QBtn
        icon={Quaff.darkMode.isActive ? "light_mode" : "dark_mode"}
        variant="flat"
        round
        onclick={Quaff.darkMode.toggle}
      />
      <QBtn icon="palette" variant="flat" onclick={drawerRightEl?.toggle} />
    </QHeader>
  {/snippet}

  {#snippet railbarLeft()}
    <QRailbar class="surface no-round" bordered width={120}>
      <QList>
        {#each pages as { name, icon, to } (`${name}-${icon}-${to}`)}
          <QItem {to} noRipple>
            <QIcon name={icon} />
            <QItemSection>{name}</QItemSection>
          </QItem>
        {/each}
      </QList>
    </QRailbar>
  {/snippet}

  {#snippet drawerLeft()}
    <QDrawer persistent bind:this={drawerLeftEl} width={180} bordered>
      <div in:fade={{ delay: 200, duration: 200 }} out:fade={{ duration: 200 }}>
        <QList dense>
          {#each drawerContent as { name, to } (`${name}-${to}`)}
            <QItem
              {to}
              onclick={() => contentEl?.scrollTo({ top: 0, behavior: "smooth" })}
              activeClass="text-primary"
            >
              {name}
            </QItem>
          {/each}
        </QList>
      </div>
    </QDrawer>
  {/snippet}

  {#snippet drawerRight()}
    <QDrawer side="right" bind:this={drawerRightEl} overlay bordered>
      <div class="q-pa-md">
        <h6 class="q-mb-lg">Want a different color theme?</h6>
        <div class="flex q-gap-md">
          {#each colors as color, index (index)}
            <QBtn
              round
              onclick={() => {
                chosenColor = index;
                QTheme.setTheme(color);
              }}
              disabled={chosenColor === index}
            >
              <QAvatar
                class={chosenColor === index ? "chosen" : ""}
                size="2.5rem"
                style="background-color:{color}; border: solid 0.0625rem var(--outline)"
              />
            </QBtn>
          {/each}
        </div>
      </div>
    </QDrawer>
  {/snippet}
  {#snippet content()}
    <div bind:this={contentEl} style="position: relative; min-height: 100%;">
      {@render children?.()}
      <div class="privacy-policy"><a href="{base}/privacy-policy">Privacy Policy</a></div>
    </div>
  {/snippet}
</QLayout>

<style>
  :global(.q-avatar.chosen::after) {
    content: "✔️";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: transparent;
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .privacy-policy {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    padding: 1rem;
    font-size: 0.8rem;
  }
</style>
