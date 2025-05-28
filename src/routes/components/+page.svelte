<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    QAvatar,
    QBreadcrumbs,
    QBreadcrumbsEl,
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QCheckbox,
    QChip,
    QCircularProgress,
    QDrawer,
    QFooter,
    QHeader,
    QIcon,
    QInput,
    QItem,
    QItemSection,
    QLayout,
    QLinearProgress,
    QList,
    QRadio,
    QRailbar,
    QSelect,
    QSeparator,
    QSwitch,
    QTab,
    QTable,
    QTabs,
    QToolbar,
  } from "$components";
  import QDocs from "$components/private/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { Quaff } from "$lib";
  import type { Snippet } from "svelte";

  const logos = {
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.477,2,2,6.477,2,12c0,5.013,3.693,9.153,8.505,9.876V14.65H8.031v-2.629h2.474v-1.749 c0-2.896,1.411-4.167,3.818-4.167c1.153,0,1.762,0.085,2.051,0.124v2.294h-1.642c-1.022,0-1.379,0.969-1.379,2.061v1.437h2.995 l-0.406,2.629h-2.588v7.247C18.235,21.236,22,17.062,22,12C22,6.477,17.523,2,12,2z"></path></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="currentColor"><path d="M 4.0351562 3 C 3.7431562 3.57 3.6894375 3.6741406 3.3984375 4.2441406 L 9.5253906 12.726562 L 2.6523438 21 L 4.6015625 21 L 10.431641 13.980469 L 15.5 21 L 20.119141 21 C 20.381141 20.488 20.429406 20.393859 20.691406 19.880859 L 13.673828 10.164062 L 19.671875 3 L 17.714844 3 L 12.767578 8.9082031 L 8.5 3 L 4.0351562 3 z M 5.4335938 4.5 L 7.7324219 4.5 L 18.566406 19.5 L 16.267578 19.5 L 5.4335938 4.5 z"></path></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="currentColor"><path d="M 8 3 C 5.239 3 3 5.239 3 8 L 3 16 C 3 18.761 5.239 21 8 21 L 16 21 C 18.761 21 21 18.761 21 16 L 21 8 C 21 5.239 18.761 3 16 3 L 8 3 z M 18 5 C 18.552 5 19 5.448 19 6 C 19 6.552 18.552 7 18 7 C 17.448 7 17 6.552 17 6 C 17 5.448 17.448 5 18 5 z M 12 7 C 14.761 7 17 9.239 17 12 C 17 14.761 14.761 17 12 17 C 9.239 17 7 14.761 7 12 C 7 9.239 9.239 7 12 7 z M 12 9 A 3 3 0 0 0 9 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 12 A 3 3 0 0 0 12 9 z"></path></svg>`,
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="currentColor"><path d="M19,3H5C3.895,3,3,3.895,3,5v14c0,1.105,0.895,2,2,2h14c1.105,0,2-0.895,2-2V5C21,3.895,20.105,3,19,3z M9,17H6.477v-7H9 V17z M7.694,8.717c-0.771,0-1.286-0.514-1.286-1.2s0.514-1.2,1.371-1.2c0.771,0,1.286,0.514,1.286,1.2S8.551,8.717,7.694,8.717z M18,17h-2.442v-3.826c0-1.058-0.651-1.302-0.895-1.302s-1.058,0.163-1.058,1.302c0,0.163,0,3.826,0,3.826h-2.523v-7h2.523v0.977 C13.93,10.407,14.581,10,15.802,10C17.023,10,18,10.977,18,13.174V17z"></path></svg>`,
  };

  type Component = {
    name: string;
    description: string;
    snippet: Snippet;
    href: string;
  };

  const components: Component[] = [
    {
      name: "QAvatar",
      description: "Display user profiles or visual identities with customizable avatars.",
      href: "/components/avatar",
      snippet: avatar,
    },
    {
      name: "QBreadcrumbs",
      description: "Guide users through your site with intuitive breadcrumb navigation.",
      href: "/components/breadcrumbs",
      snippet: breadcrumbs,
    },
    {
      name: "QBtn",
      description: "Enable user interactions with versatile and stylish buttons.",
      href: "/components/button",
      snippet: button,
    },
    {
      name: "QCard",
      description: "Organize and present content elegantly using flexible card layouts.",
      href: "/components/card",
      snippet: card,
    },
    {
      name: "QCheckbox",
      description: "Allow users to make single or multiple selections with checkboxes.",
      href: "/components/checkbox",
      snippet: checkbox,
    },
    {
      name: "QChip",
      description: "Showcase compact information or tags with interactive chips.",
      href: "/components/chip",
      snippet: chips,
    },
    {
      name: "QDialog",
      description: "Capture user attention for important actions with dialogs.",
      href: "/components/dialog",
      snippet: dialog,
    },
    {
      name: "QDrawer",
      description: "Offer persistent or temporary side navigation with drawers.",
      href: "/components/drawer",
      snippet: drawer,
    },
    {
      name: "QFooter",
      description: "Display consistent information at the bottom of your pages.",
      href: "/components/footer",
      snippet: footer,
    },
    {
      name: "QHeader",
      description: "Provide a prominent top section for branding and navigation.",
      href: "/components/header",
      snippet: header,
    },
    {
      name: "QIcon",
      description: "Enhance visual communication with a wide array of material symbols.",
      href: "/components/icon",
      snippet: icons,
    },
    {
      name: "QInput",
      description: "Collect user data seamlessly with various input field styles.",
      href: "/components/input",
      snippet: input,
    },
    {
      name: "QLayout",
      description: "Structure your application interface with responsive layouts.",
      href: "/components/layout",
      snippet: layout,
    },
    {
      name: "QList",
      description: "Present ordered or unordered collections of items clearly.",
      href: "/components/list",
      snippet: list,
    },
    {
      name: "QProgress",
      description: "Indicate task completion or loading status with linear or cicular indicators.",
      href: "/components/progress",
      snippet: progress,
    },
    {
      name: "QRadio",
      description: "Enable exclusive choices from a set using radio buttons.",
      href: "/components/radio",
      snippet: radio,
    },
    {
      name: "QSelect",
      description: "Offer users a dropdown list for making single or multiple selections.",
      href: "/components/select",
      snippet: select,
    },
    {
      name: "QSwitch",
      description: "Provide on/off toggles for binary state management.",
      href: "/components/switch",
      snippet: qswitch,
    },
    {
      name: "QTable",
      description: "Display structured data effectively in rows and columns.",
      href: "/components/table",
      snippet: table,
    },
    {
      name: "QTabs",
      description: "Organize content into switchable sections with tabbed navigation.",
      href: "/components/tabs",
      snippet: tabs,
    },
    {
      name: "QToolbar",
      description: "Group actions and navigation elements within a toolbar.",
      href: "/components/toolbar",
      snippet: toolbar,
    },
    {
      name: "QTooltip",
      description: "Offer contextual information on hover with helpful tooltips.",
      href: "/components/tooltip",
      snippet: tooltip,
    },
  ];

  let active = $state<Component["name"] | null>(null);
</script>

<svelte:head>
  <title>{pageTitle("Components")}</title>
</svelte:head>

<QDocs
  docName="Components"
  docDescription="Find a large set of reusable components to build your projects. They are styled following Material Design 3 guidelines, for a consistent and modern look."
>
  {#snippet display()}
    <div class="row q-gap-lg q-pa-lg flex-center">
      <QSwitch value={true} class="col-3" />
      <QCheckbox value={true} class="col-2" color="secondary" />
      <QCircularProgress indeterminate class="col-2" />
      <QBtn label="Accept" icon="img:/cocktail.jpg" class="col-5" />
    </div>
    <div class="row q-gap-lg q-pa-lg flex-center">
      <QInput value="Hello world" label="Greeting" filled class="col-7" />
      <QLinearProgress indeterminate class="col-5" trackColor="secondary" color="on-secondary" />
    </div>
    <div class="row q-gap-lg q-pa-lg flex-center">
      <QChip label="Hey!" icon="waving_hand" class="col-3 secondary-container" />
      <QTabs value="home" class="col-9">
        <QTab name="home" icon="home">Home</QTab>
        <QTab name="about" icon="info">About</QTab>
        <QTab name="account" icon="person">Account</QTab>
      </QTabs>
    </div>
  {/snippet}

  <div class="row q-gap-md q-mt-lg">
    {#each components as component (component.name)}
      <div
        class="col-sm-6 col-lg-4 col-xs-12"
        role="link"
        tabindex="0"
        style="grid-auto-rows: 1fr; cursor: pointer;"
        onmouseenter={() => (active = component.name)}
        onmouseleave={() => (active = null)}
        onclick={() => goto(component.href)}
        onkeypress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            goto(component.href);
          }
        }}
      >
        <QCard
          class="q-pa-none"
          style="height: 100%; transition: all 0.3s; overflow: hidden;"
          fill={active === component.name ? "primary" : undefined}
        >
          <div
            class={[
              "q-component-card q-pa-md flex flex-center secondary-container",
              active === component.name && "q-component-card--active",
            ]}
            style="height: 14rem;"
            inert
          >
            {@render component.snippet()}
          </div>

          <QCardSection class="q-px-lg flex column flex-center">
            <h4 class="text-md">{component.name}</h4>
            <p class="text-center" style="text-wrap: balance">{component.description}</p>
          </QCardSection>
        </QCard>
      </div>
    {/each}
  </div>
</QDocs>

{#snippet avatar()}
  <QList>
    <QItem class="surface">
      <QItemSection type="avatar">
        <QAvatar src="/cocktail.jpg" />
      </QItemSection>
      <QItemSection type="content" style="min-width: 0; flex: 1; overflow: hidden;">
        <div style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 100%;">
          Quaff is a powerful UI library
        </div>
      </QItemSection>
    </QItem>
  </QList>
{/snippet}

{#snippet breadcrumbs()}
  <QCard>
    <QBreadcrumbs separator="icon:chevron_right">
      <QBreadcrumbsEl>Home</QBreadcrumbsEl>
      <QBreadcrumbsEl>Components</QBreadcrumbsEl>
      <QBreadcrumbsEl>Breadcrumb</QBreadcrumbsEl>
    </QBreadcrumbs>
  </QCard>
{/snippet}

{#snippet button()}
  <QBtn label="Make payment" variant="filled" />
{/snippet}

{#snippet card()}
  <QCard style="min-width: min-content;">
    <QCardSection class="headline-small">Cocktail degustation</QCardSection>
    <QCardSection>Join us for an unforgettable evening of flavors and fun!</QCardSection>

    <QCardActions align="left">
      <QBtn label="Book now" />
    </QCardActions>
  </QCard>
{/snippet}

{#snippet checkbox()}
  <QCard style="width: 100%; min-width: min-content;">
    <QCardSection class="headline-small">Appearance</QCardSection>
    <QCardSection>
      <QCheckbox value={Quaff.darkMode.isActive} label="Dark mode" />
    </QCardSection>
    <QCardSection>
      <QCheckbox value={false} label="Large text mode" />
    </QCardSection>
  </QCard>
{/snippet}

{#snippet chips()}
  <QCard style="width: 100%;">
    <QCardSection class="headline-small">Pick your flavors</QCardSection>
    <QSeparator />
    <QCardSection horizontal class="q-gap-sm" style="overflow: auto">
      <QChip label="Chocolate" kind="filter" selected={true} />
      <QChip label="Vanilla" kind="filter" />
      <QChip label="Strawberry" kind="filter" />
    </QCardSection>
  </QCard>
{/snippet}

{#snippet dialog()}
  <QCard>
    <QCardSection class="headline-small">Delete this file?</QCardSection>
    <QCardSection>This action cannot be undone.</QCardSection>

    <QCardActions align="right">
      <QBtn label="Cancel" variant="flat" />
      <QBtn label="Delete" class="error" />
    </QCardActions>
  </QCard>
{/snippet}

{#snippet drawer()}
  <QLayout view="lhh LpR fFf" style="height: 50vh;">
    {#snippet drawerLeft()}
      <QDrawer value={true} persistent style="width: 100%;">
        <QList activeClass="text-primary">
          <QItem>Mail</QItem>
          <QItem active clickable class="q-link">
            <QItemSection type="icon">
              <QIcon name="inbox" />
            </QItemSection>
            <QItemSection type="content">Inbox</QItemSection>
            <QItemSection type="trailingText">24</QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="icon">
              <QIcon name="send" />
            </QItemSection>
            <QItemSection type="content">Outbox</QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="icon">
              <QIcon name="favorite" />
            </QItemSection>
            <QItemSection type="content">Favorites</QItemSection>
          </QItem>
        </QList>
      </QDrawer>
    {/snippet}
  </QLayout>
{/snippet}

{#snippet footer()}
  <QLayout style="width: 50vw; position: absolute; left: 1rem; bottom: 1rem;">
    {#snippet footer()}
      <QFooter class="flex">
        <div class="flex column label-large">
          <div>Socials</div>
          <div class="flex q-gap-sm">
            {@html logos.facebook}
            {@html logos.x}
            {@html logos.instagram}
            {@html logos.linkedin}
          </div>
        </div>
      </QFooter>
    {/snippet}
  </QLayout>
{/snippet}

{#snippet header()}
  <QLayout style="width: 50vw; position: absolute; left: 1rem; top: 1rem;">
    {#snippet header()}
      <QHeader>
        <QBtn icon="menu" flat />
        <span class="display-small">Quaff</span>
      </QHeader>
    {/snippet}
  </QLayout>
{/snippet}

{#snippet icons()}
  <div class="flex flex-center q-gap-sm">
    <QCard class="flex q-gap-lg q-px-lg" fill="tertiary" style="border-radius: 50rem;">
      <QIcon name="search" />
      <QIcon name="delete" />
      <QIcon name="archive" />
      <QIcon name="forward" />
    </QCard>
    <QCard class="flex" fill="primary" style="border-radius: 50rem;">
      <QIcon name="add" />
    </QCard>
  </div>
{/snippet}

{#snippet input()}
  <QInput value="" label="Search in messages" rounded filled>
    {#snippet prepend()}
      <QIcon name="search" />
    {/snippet}
    {#snippet append()}
      <QIcon name="mic" />
    {/snippet}
  </QInput>
{/snippet}

{#snippet layout()}
  <QLayout view="lhr lpr lff">
    {#snippet header()}
      <QHeader bordered height={48} />
    {/snippet}

    {#snippet railbarLeft()}
      <QRailbar bordered width={48} />
    {/snippet}

    {#snippet drawerRight()}
      <QDrawer value={true} persistent width={64} side="right" bordered />
    {/snippet}

    {#snippet footer()}
      <QFooter bordered height={48} />
    {/snippet}
  </QLayout>
{/snippet}

{#snippet list()}
  <QList class="surface" separator style="transform: scale(0.93); transform-origin: top;">
    <QItem>
      <QItemSection type="avatar">
        <QAvatar class="primary">CN</QAvatar>
      </QItemSection>
      <QItemSection>
        Chuck Norris

        {#snippet line1()}
          1 message
        {/snippet}
      </QItemSection>
    </QItem>
    <QItem>
      <QItemSection type="avatar">
        <QAvatar class="primary">JD</QAvatar>
      </QItemSection>
      <QItemSection>John Doe</QItemSection>
    </QItem>
    <QItem>
      <QItemSection type="avatar">
        <QAvatar class="primary">M</QAvatar>
      </QItemSection>
      <QItemSection>
        Mom

        {#snippet line1()}
          5 missed calls
        {/snippet}

        {#snippet line2()}
          12 messages
        {/snippet}
      </QItemSection>
      <QItemSection type="trailingIcon">
        <QIcon name="star" filled color="primary" />
      </QItemSection>
    </QItem>
  </QList>
{/snippet}

{#snippet progress()}
  <QCard class="q-pa-none" style="position: absolute; bottom: 1rem; left: 1rem; right: 1rem;">
    <div class="q-py-lg q-px-xl q-mx-auto" style="width: 100%;">
      <img
        src="/cocktail.jpg"
        alt="Cocktail"
        width="100%"
        style="aspect-ratio: 1; object-fit: cover"
      />
    </div>

    <QLinearProgress value={0.63} />

    <QCardSection class="flex justify-between q-px-lg q-py-md">
      <QIcon name="shuffle" filled color="surface-variant" />
      <QIcon name="skip_previous" filled />
      <QIcon name="play_arrow" filled />
      <QIcon name="skip_next" filled />
      <QIcon name="repeat" filled color="surface-variant" />
    </QCardSection>
  </QCard>
{/snippet}

{#snippet radio()}
  <QList class="surface q-pa-lg" style="width: 100%; min-width: min-content;" dense>
    <QItem class="headline-small">Language</QItem>
    <QItem>
      <QRadio value="english" selected="english" label="English" />
    </QItem>
    <QItem>
      <QRadio value="french" label="French" />
    </QItem>
    <QItem>
      <QRadio value="chinese" label="Chinese (Mandarin)" />
    </QItem>
  </QList>
{/snippet}

{#snippet select()}
  {@const options = ["Apple", "Banana", "Cherry", "Strawberry"]}

  <QSelect class="q-select__demo" value="Apple" {options} label="Favorite fruit" filled />
{/snippet}

{#snippet qswitch()}
  <QLayout class="background" style="height: 50vh;">
    {#snippet header()}
      <QHeader bordered style="display: block;" height={86}>
        <div class="flex justify-between items-center q-pa-sm" style="width: 100%;">
          09:30

          <div>
            <QIcon name="signal_wifi_4_bar" size="sm" />
            <QIcon name="signal_cellular_4_bar" size="sm" />
            <QIcon name="battery_6_bar" size="sm" />
          </div>
        </div>

        <div class="flex justify-between items-center" style="width: 100%;">
          <div class="flex flex-center q-gap-md">
            <QIcon name="arrow_back" />
            <span class="headline-small">Settings</span>
          </div>
          <QIcon name="more_vert" />
        </div>
      </QHeader>
    {/snippet}

    {#snippet content()}
      <QList class="q-pa-md" dense>
        <QItem class="body-large">Display options</QItem>
        <QItem>
          <QItemSection>Dark mode</QItemSection>
          <QItemSection type="toggle">
            <QSwitch value={Quaff.darkMode.isActive} checkedIcon="check" />
          </QItemSection>
        </QItem>
      </QList>
    {/snippet}
  </QLayout>
{/snippet}

{#snippet table()}
  {@const columns = [
    {
      name: "id",
      required: true,
      label: "Book ID",
      align: "left" as const,
      field: "id",
      sortable: true,
    },
    {
      name: "title",
      required: true,
      label: "Book Title",
      align: "left" as const,
      field: "title",
      sortable: true,
    },
    {
      name: "author",
      required: true,
      label: "Author",
      align: "left" as const,
      field: "author",
      sortable: true,
    },
  ]}
  {@const rows = [
    { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee" },
    { id: 2, title: "1984", author: "George Orwell" },
    { id: 3, title: "Pride and Prejudice", author: "Jane Austen" },
    { id: 4, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger" },
  ]}

  <QTable {columns} {rows} bordered dense style="position: absolute; left: 1rem; top: 1rem;" />
{/snippet}

{#snippet tabs()}
  <QLayout class="background" style="height: 50vh;">
    {#snippet header()}
      <QHeader class="flex justify-between items-center" height={32}>
        09:30

        <div>
          <QIcon name="signal_wifi_4_bar" size="sm" />
          <QIcon name="signal_cellular_4_bar" size="sm" />
          <QIcon name="battery_6_bar" size="sm" />
        </div>
      </QHeader>
    {/snippet}

    {#snippet content()}
      <QTabs value="Video" class="q-mt-md">
        <QTab name="Video" icon="videocam">Video</QTab>
        <QTab name="Photos" icon="image">Photos</QTab>
        <QTab name="Audio" icon="music_note">Audio</QTab>
      </QTabs>
    {/snippet}
  </QLayout>
{/snippet}

{#snippet toolbar()}
  <QToolbar class="flex justify-between items-center">
    <div class="flex flex-center q-gap-md">
      <QIcon name="arrow_back" />
      <span class="headline-small">Settings</span>
    </div>
    <QIcon name="more_vert" />
  </QToolbar>
{/snippet}

{#snippet tooltip()}
  <QCard class="q-pa-sm">
    <QCardSection class="label-medium text-primary">A cool component</QCardSection>
    <QCardSection class="body-small">
      You can use the <code>QTooltip</code> component to provide additional information on hover.
    </QCardSection>
    <QCardActions align="right">
      <QBtn label="Get started" variant="flat" size="sm" />
    </QCardActions>
  </QCard>

  <QBtn class="q-mt-sm" label="Tooltip" variant="filled" />
{/snippet}

<style>
  .q-component-card {
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    width: 100%;
    min-height: 14rem;
    pointer-events: none;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      background-image: url("cocktail-close-up-2.jpg");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      filter: hue-rotate(var(--q-hue-rotate)) brightness(var(--q-brightness));

      opacity: 0;
    }
  }

  .q-component-card--active::before {
    opacity: 1;
  }

  :global(.q-select__demo .q-select__menu) {
    opacity: 1;
    visibility: visible;
    transform: scale(1) translateY(100%);
  }
</style>
