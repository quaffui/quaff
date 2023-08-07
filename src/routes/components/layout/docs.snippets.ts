import type { QLayoutProps } from "$lib/components/layout/props";
import { capitalize } from "$lib/utils/string";

export const snippet = (
  view: QLayoutProps["view"],
  [header, footer, leftRailbar, leftDrawer, rightRailbar, rightDrawer]: boolean[]
) => {
  const headerSnippet = `  <QToolbar slot="header" class="elevate-2">
${
  leftDrawer
    ? '    <QBtn icon="menu" flat on:click={() => (leftDrawerShown = !leftDrawerShown)} />\n'
    : ""
}    <div class="max flex center-align">Header</div>
${
  rightDrawer
    ? '    <QBtn icon="menu" flat on:click={() => (rightDrawerShown = !rightDrawerShown)} />\n'
    : ""
}  </QToolbar>`;

  const footerSnippet = `  <QFooter slot="footer">
${
  leftDrawer
    ? '    <QBtn icon="menu" flat on:click={() => (leftDrawerShown = !leftDrawerShown)} />\n'
    : ""
}    <div class="max flex center-align">Footer</div>
${
  rightDrawer
    ? '    <QBtn icon="menu" flat on:click={() => (rightDrawerShown = !rightDrawerShown)} />\n'
    : ""
}  </QFooter>`;

  const railbarSnippet = (side: "left" | "right") => `  <QRailbar slot="railbar${capitalize(
    side
  )}" bordered>
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
  </QRailbar>`;

  const drawerSnippet = (side: "left" | "right") => `  <QDrawer
    slot="drawer${capitalize(side)}"
    bordered
    persistent
    bind:value={${side}DrawerShown}
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
  </QDrawer>`;

  const resultSnippet = `<QLayout view="${view}">${header ? "\n" + headerSnippet + "\n" : ""}${
    leftRailbar ? "\n" + railbarSnippet("left") + "\n" : ""
  }${rightRailbar ? "\n" + railbarSnippet("right") + "\n" : ""}${
    leftDrawer ? "\n" + drawerSnippet("left") + "\n" : ""
  }${rightDrawer ? "\n" + drawerSnippet("right") + "\n" : ""}${
    footer ? "\n" + footerSnippet + "\n" : ""
  }</Qlayout>`;

  return {
    "Trying different layouts": resultSnippet,
  };
};
