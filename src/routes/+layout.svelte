<svelte:options runes={true} />

<script lang="ts">
  // Comment this in again while needed during development
  //import "beercss/dist/cdn/beer.min.css";
  import "../lib/css/index.scss";
  import "../lib/css/fonts.scss";

  import { fade } from "svelte/transition";
  import Quaff from "$lib/classes/Quaff.svelte";
  import {
    QLayout,
    QToolbarTitle,
    QBtn,
    QRailbar,
    QList,
    QItem,
    QIcon,
    QItemSection,
    QDrawer,
    QHeader,
    QAvatar,
  } from "$lib";
  import QTheme from "$lib/classes/QTheme.svelte";
  import { isRouteActive } from "$lib/utils/router";
  import { page } from "$app/state";
  import type { MaterialSymbol } from "material-symbols";

  const { data, children } = $props();

  let chosenColor = $state(0);

  const pages: { name: string; icon: MaterialSymbol; to: string }[] = [
    {
      name: "Home",
      icon: "home",
      to: "/",
    },
    {
      name: "Components",
      icon: "grid_view",
      to: "/components",
    },
    {
      name: "Grid",
      icon: "grid_on",
      to: "/grid",
    },
    {
      name: "Colors",
      icon: "palette",
      to: "/colors",
    },
    {
      name: "Quaff utils",
      icon: "construction",
      to: "/utils",
    },
    {
      name: "Dev tests",
      icon: "code",
      to: "/dev",
    },
    {
      name: "Layout tests",
      icon: "dashboard_customize",
      to: "/layout",
    },
  ];
  const components = [
    {
      name: "Avatar",
      to: "/components/avatar",
    },
    {
      name: "Button",
      to: "/components/button",
    },
    {
      name: "Card",
      to: "/components/card",
    },
    {
      name: "Checkbox",
      to: "/components/checkbox",
    },
    {
      name: "Chip",
      to: "/components/chip",
    },
    {
      name: "Dialog",
      to: "/components/dialog",
    },
    {
      name: "Drawer",
      to: "/components/drawer",
    },
    {
      name: "Footer",
      to: "/components/footer",
    },
    {
      name: "Icon",
      to: "/components/icon",
    },
    {
      name: "Input",
      to: "/components/input",
    },
    {
      name: "Layout",
      to: "/components/layout",
    },
    {
      name: "List",
      to: "/components/list",
    },
    {
      name: "Progress",
      to: "/components/progress",
    },
    {
      name: "Radio",
      to: "/components/radio",
    },
    {
      name: "Railbar",
      to: "/components/railbar",
    },
    {
      name: "Select",
      to: "/components/select",
    },
    {
      name: "Separator",
      to: "/components/separator",
    },
    {
      name: "Switch",
      to: "/components/switch",
    },
    {
      name: "Tabs",
      to: "/components/tabs",
    },
    {
      name: "Table",
      to: "/components/table",
    },
    {
      name: "Toolbar",
      to: "/components/toolbar",
    },
    {
      name: "Tooltip",
      to: "/components/tooltip",
    },
  ];
  const quaffUtils = [
    {
      name: "The Quaff object",
      to: "/utils/quaff",
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
    isRouteActive("/components") ? "components" : isRouteActive("/utils") ? "utils" : null
  );

  $effect(() => {
    if (selectedRailbarItem !== null) {
      drawerLeftEl?.show();
    } else {
      drawerLeftEl?.hide();
    }
  });

  const drawerContent = $derived(
    selectedRailbarItem === "components"
      ? components
      : selectedRailbarItem === "utils"
        ? quaffUtils
        : []
  );

  if (data.isDark) {
    Quaff.darkMode.set(true);
  }
</script>

<!-- eslint-disable-next-line svelte/valid-compile -->
{#if page.route.id === "/layout"}
  {@render children?.()}
{:else}
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
        {#key drawerContent}
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
        {/key}
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
                  shape="rounded"
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
      <div bind:this={contentEl}>
        {@render children?.()}
      </div>
    {/snippet}
  </QLayout>
{/if}

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
</style>
