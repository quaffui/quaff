<script lang="ts">
  import { assets, base } from "$app/paths";
  import {
    QBtn,
    QCard,
    QCardSection,
    QCheckbox,
    QCircularProgress,
    QLinearProgress,
    QSwitch,
    QTabs,
    QTooltip,
  } from "$components";
  import QChip from "$components/chip/QChip.svelte";
  import QInput from "$components/input/QInput.svelte";
  import QDocs from "$components/private/QDocs.svelte";
  import QTab from "$components/tabs/QTab.svelte";
  import { pageTitle } from "$helpers/pageTitle";

  type Component = {
    name: string;
    description: string;
    image: string;
    href: string;
  };

  const components: Component[] = [
    {
      name: "QAvatar",
      description: "Display user profiles or visual identities with customizable avatars.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/avatar`,
    },
    {
      name: "QBreadcrumbs",
      description: "Guide users through your site with intuitive breadcrumb navigation.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/breadcrumbs`,
    },
    {
      name: "QBtn",
      description: "Enable user interactions with versatile and stylish buttons.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/button`,
    },
    {
      name: "QCard",
      description: "Organize and present content elegantly using flexible card layouts.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/card`,
    },
    {
      name: "QCheckbox",
      description: "Allow users to make single or multiple selections with checkboxes.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/checkbox`,
    },
    {
      name: "QChip",
      description: "Showcase compact information or tags with interactive chips.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/chip`,
    },
    {
      name: "QDialog",
      description: "Capture user attention for important actions with dialogs.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/dialog`,
    },
    {
      name: "QDrawer",
      description: "Offer persistent or temporary side navigation with drawers.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/drawer`,
    },
    {
      name: "QFooter",
      description: "Display consistent information at the bottom of your pages.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/footer`,
    },
    {
      name: "QHeader",
      description: "Provide a prominent top section for branding and navigation.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/header`,
    },
    {
      name: "QIcon",
      description: "Enhance visual communication with a wide array of material symbols.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/icon`,
    },
    {
      name: "QInput",
      description: "Collect user data seamlessly with various input field styles.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/input`,
    },
    {
      name: "QLayout",
      description: "Structure your application interface with responsive layouts.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/layout`,
    },
    {
      name: "QList",
      description: "Present ordered or unordered collections of items clearly.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/list`,
    },
    {
      name: "QProgress",
      description: "Indicate task completion or loading status with linear or cicular indicators.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/progress`,
    },
    {
      name: "QRadio",
      description: "Enable exclusive choices from a set using radio buttons.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/radio`,
    },
    {
      name: "QSelect",
      description: "Offer users a dropdown list for making single or multiple selections.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/select`,
    },
    {
      name: "QSwitch",
      description: "Provide on/off toggles for binary state management.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/switch`,
    },
    {
      name: "QTable",
      description: "Display structured data effectively in rows and columns.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/table`,
    },
    {
      name: "QTabs",
      description: "Organize content into switchable sections with tabbed navigation.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/tabs`,
    },
    {
      name: "QToolbar",
      description: "Group actions and navigation elements within a toolbar.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/toolbar`,
    },
    {
      name: "QTooltip",
      description: "Offer contextual information on hover with helpful tooltips.",
      image: `${assets}/cocktail.jpg`,
      href: `${base}/components/tooltip`,
    },
  ];

  let active = $state<Component["name"] | null>(null);
</script>

<svelte:head>
  <title>{pageTitle("Components")}</title>
</svelte:head>

<div class="q-page">
  <QDocs
    docName="Components"
    docDescription="Find a large set of reusable components to build your projects. They are styled following Material Design 3 guidelines, for a consistent and modern look."
  >
    {#snippet display()}
      <div class="row q-gap-lg q-pa-lg flex-center">
        <QSwitch value={true} class="col-3" />
        <QCheckbox value={true} class="col-2" />
        <QCircularProgress indeterminate class="col-2" />
        <QBtn label="Accept" icon="img:{assets}/cocktail.jpg" class="col-5" />
      </div>
      <div class="row q-gap-lg q-pa-lg flex-center">
        <QInput value="Hello world" label="Greeting" filled class="col-7" />
        <QLinearProgress indeterminate class="col-5" trackColor="secondary" color="on-secondary" />
      </div>
      <div class="row q-gap-lg q-pa-lg flex-center">
        <QChip label="Hey!" icon="waving_hand" class="col-3" />
        <QTabs value="home" class="col-9">
          <QTab name="home" icon="home">Home</QTab>
          <QTab name="about" icon="info">About</QTab>
          <QTab name="account" icon="person">Account</QTab>
        </QTabs>
      </div>
    {/snippet}

    <div class="row q-gap-md q-mt-lg">
      {#each components as component (component.name)}
        <a
          class="col-4"
          href={component.href}
          style="grid-auto-rows: 1fr;"
          onmouseenter={() => (active = component.name)}
          onmouseleave={() => (active = null)}
        >
          <QCard
            class="q-pa-none"
            style="height: 100%; transition: all 0.3s;"
            fill={active === component.name ? "primary" : undefined}
          >
            <QCardSection>
              <img src={component.image} alt={component.name} width="100%" />
            </QCardSection>
            <QCardSection class="q-px-lg flex column flex-center">
              <h4 class="text-md">{component.name}</h4>
              <p class="text-center" style="text-wrap: balance">{component.description}</p>
            </QCardSection>
          </QCard>
        </a>
      {/each}
    </div>
  </QDocs>
</div>
