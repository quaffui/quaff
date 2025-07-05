<script lang="ts">
  import "$lib/css/fonts.scss";
  import "$lib/css/index.scss";

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
  import QMenu from "$components/menu/QMenu.svelte";

  type Item = {
    name: string;
    to: string;
  };

  const { children } = $props();

  Quaff.init();

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
  ];
  const components: Item[] = [
    {
      name: "Avatar",
      to: "/components/avatar",
    },
    {
      name: "Breadcrumbs",
      to: "/components/breadcrumbs",
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
      name: "Expansion Item",
      to: "/components/expansion-item",
    },
    {
      name: "Footer",
      to: "/components/footer",
    },
    {
      name: "Header",
      to: "/components/header",
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
      name: "Table",
      to: "/components/table",
    },
    {
      name: "Tabs",
      to: "/components/tabs",
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

  const quaffUtils: Item[] = [
    {
      name: "The Quaff class",
      to: "/utils/quaff",
    },
    {
      name: "QTheme",
      to: "/utils/q-theme",
    },
    {
      name: "QScrollObserver",
      to: "/utils/q-scroll-observer",
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
    isRouteActive("/components") ? "/components" : isRouteActive("/utils") ? "/utils" : null
  );

  const previousItem = $derived(
    prepareItem(selectedRailbarItem, Quaff.router.url.pathname, "previous")
  );
  const nextItem = $derived(prepareItem(selectedRailbarItem, Quaff.router.url.pathname, "next"));

  $effect(() => {
    if (Quaff.breakpoints.isLessThan("md")) {
      return;
    }

    if (selectedRailbarItem !== null) {
      drawerLeftEl?.show();
    } else {
      drawerLeftEl?.hide();
    }
  });

  const drawerContent = $derived(
    selectedRailbarItem === "/components"
      ? components
      : selectedRailbarItem === "/utils"
        ? quaffUtils
        : []
  );

  const drawerLeft = $derived(Quaff.breakpoints.isLessThan("md") ? mobileDrawer : desktopDrawer);

  function prepareItem(selected: string | null, route: string, kind: "previous" | "next") {
    if (
      selected === null ||
      Quaff.breakpoints.isMoreThan("md", true) ||
      !["/components/", "/utils/"].some((r) => route.includes(r))
    ) {
      return null;
    }

    const path = route.includes("/components/") ? components : quaffUtils;

    const currentIndex = path.findIndex((item) => item.to === route);

    if (currentIndex === -1) {
      return null;
    }

    if (kind === "previous" && currentIndex > 0) {
      return path[currentIndex - 1];
    } else if (kind === "next" && currentIndex < path.length - 1) {
      return path[currentIndex + 1];
    }

    return null;
  }
</script>

<QLayout view="hhr lpr fff" class="main-layout" {drawerLeft}>
  {#snippet header()}
    <QHeader class="elevate-2">
      {#if Quaff.breakpoints.isLessThan("md")}
        <QBtn icon="menu" variant="flat" round onclick={drawerLeftEl?.toggle} class="q-mr-sm" />
      {/if}

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
    {#if Quaff.breakpoints.isMoreThan("md", true)}
      {@render railbar()}
    {/if}
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
      <div class="q-mx-auto q-my-lg flex flex-center">
        <QBtn label="Hello">
          <QMenu
            items={[
              "Hey",
              { label: "Hello", icon: "edit", trailingIcon: "check" },
              "separator",
              { label: "World" },
            ]}
          />
        </QBtn>
      </div>

      {@render children?.()}

      {#if Quaff.breakpoints.isLessThan("md") && (nextItem || previousItem)}
        <div class="q-px-md flex justify-center q-gap-md" style="padding-bottom: 4rem;">
          {#if previousItem}
            <QBtn icon="arrow_back" label={previousItem.name} to={previousItem.to} filled />
          {/if}

          {#if nextItem}
            <QBtn icon="arrow_forward" label={nextItem.name} to={nextItem.to} filled />
          {/if}
        </div>
      {/if}

      <div class="privacy-policy"><a href="/privacy-policy">Privacy Policy</a></div>
    </div>
  {/snippet}
</QLayout>

{#snippet mainRoutesList()}
  <QList>
    {#each pages as { name, icon, to } (`${name}-${icon}-${to}`)}
      <QItem {to} noRipple>
        <QIcon name={icon} />
        <QItemSection>{name}</QItemSection>
      </QItem>
    {/each}
  </QList>
{/snippet}

{#snippet railbar()}
  <QRailbar class="surface no-round" bordered width={120}>
    {@render mainRoutesList()}
  </QRailbar>
{/snippet}

{#snippet mobileDrawer()}
  <QDrawer bind:this={drawerLeftEl} overlay bordered>
    {@render mainRoutesList()}
  </QDrawer>
{/snippet}

{#snippet desktopDrawer()}
  <QDrawer persistent bind:this={drawerLeftEl} width={180} bordered>
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
  </QDrawer>
{/snippet}

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
