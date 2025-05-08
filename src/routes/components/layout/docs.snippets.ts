import { capitalize } from "$utils";
import type { QLayoutProps } from "$components/layout/props";

function drawerBtn (side: "left" | "right") {
 return `      <QBtn icon="menu" flat onclick={() => (${side}DrawerShown = !${side}DrawerShown)} />`
}

function hfBuilder(
  kind: "header" | "footer",
  leftDrawer: boolean,
  rightDrawer: boolean
) {
  const classes = (!leftDrawer || rightDrawer) ? ' class="justify-between"' : ""

  const snippetTemplate = [
    `  {#snippet ${kind}()}`,
    `    <Q${capitalize(kind)}${classes}>`,
    leftDrawer && drawerBtn("left"),
    `      <div class="title-large">Header</div>`,
    rightDrawer && drawerBtn("right"),
    `    </Q${capitalize(kind)}>`,
    `  {/snippet}${kind === "header" ? "\n" : ""}`,
  ]

  return snippetTemplate.filter(Boolean).join("\n")
}

function navbarBuilder(kind: "railbar" | "drawer", side: "left" | "right") {
  const attributes = [
    "bordered",
  ]

  if (kind === "drawer") {
    attributes.push("persistent", `bind:value={${side}DrawerShown}`)
  }

  return [
    `  {#snippet ${kind}${capitalize(side)}()}`,
    `    <Q${capitalize(kind)} ${attributes.join(" ")}>`,
    `      <QList>`,
    `        <QItem to="#">`,
    `          <QIcon name="home" />`,
    `          <QItemSection>Home</QItemSection>`,
    `        </QItem>`,
    `        <QItem to="#">`,
    `          <QIcon name="help" />`,
    `          <QItemSection>About</QItemSection>`,
    `        </QItem>`,
    `        <QItem to="#">`,
    `          <QIcon name="shopping_cart" />`,
    `          <QItemSection>Store</QItemSection>`,
    `        </QItem>`,
    `        <QItem to="#">`,
    `          <QIcon name="mail" />`,
    `          <QItemSection>Contact</QItemSection>`,
    `        </QItem>`,
    `      </QList>`,
    `    </Q${capitalize(kind)}>`,
    `  {/snippet}\n`,
  ].join("\n")
}

export const snippet = (
  view: QLayoutProps["view"],
  [header, footer, leftRailbar, leftDrawer, rightRailbar, rightDrawer]: boolean[]
) => {
  const result = [
    `<QLayout view="${view}">`,
    header && hfBuilder("header", leftDrawer, rightDrawer),
    leftRailbar && navbarBuilder("railbar", "left"),
    rightRailbar && navbarBuilder("railbar", "right"),
    leftDrawer && navbarBuilder("drawer", "left"),
    rightDrawer && navbarBuilder("drawer", "right"),
    footer && hfBuilder("footer", leftDrawer, rightDrawer),
    `</QLayout>`,
  ]

  return {
    "Trying different layouts": result.filter(Boolean).join("\n"),
  };
};
