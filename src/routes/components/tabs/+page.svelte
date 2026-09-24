<script lang="ts">
  import { QTabDocs, QTabsDocs } from "$components/tabs/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QAvatar, QIcon, QInput, QSwitch, QTab, QTabs } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QTabsDocs, QTabDocs] });

  const MEDIA = [
    {
      name: "music",
      label: "Music",
      icon: "album",
      color: "primary-container",
      title: "Fast Forward",
      detail: "Voltage Club · New album",
    },
    {
      name: "shows",
      label: "Shows",
      icon: "mic",
      color: "tertiary-container",
      title: "Extra Time",
      detail: "The week's sport in 20 minutes",
    },
    {
      name: "live",
      label: "Live",
      icon: "radio",
      color: "secondary-container",
      title: "Frequency 96",
      detail: "Indie tracks, all day long",
    },
  ] as const;
  const ASSET_GROUPS = [
    {
      name: "art",
      label: "Art",
      icon: "image",
      color: "tertiary-container",
      files: [
        { name: "Racer kart", detail: "3D model · 4.2 MB" },
        { name: "Trackside banners", detail: "Texture atlas · 1.8 MB" },
        { name: "Finish gate", detail: "3D model · 860 KB" },
      ],
    },
    {
      name: "audio",
      label: "Audio",
      icon: "music_note",
      color: "primary-container",
      files: [
        { name: "Engine loop", detail: "WAV · 12 seconds" },
        { name: "Checkpoint chime", detail: "WAV · 2 seconds" },
        { name: "Menu theme", detail: "OGG · 2 minutes" },
      ],
    },
    {
      name: "code",
      label: "Code",
      icon: "code",
      color: "secondary-container",
      files: [
        { name: "Race controller", detail: "TypeScript · Updated today" },
        { name: "Lap counter", detail: "TypeScript · Updated yesterday" },
      ],
    },
  ] as const;

  let mediaTab = $state("music");
  let assetTab = $state("art");
  let orderTab = $state("tracking");
  let settingsTab = $state("profile");
  let hasLabels = $state(true);
  let hasInlineLabels = $state(false);
  let hasSeparator = $state(true);
  let displayName = $state("Jamie Lee");
  let hasEmailAlerts = $state(true);
  let hasWeeklySummary = $state(false);
  let isOnlineVisible = $state(true);
</script>

<svelte:head>
  <title>{pageTitle("QTabs")}</title>
</svelte:head>

<QDocs docDescription="Switch between related views without leaving the page.">
  {#snippet display()}
    <div class="media-library surface">
      <h2 class="title-large q-pa-md q-ma-none">Soundbox</h2>
      <QTabs bind:value={mediaTab} aria-label="Media library">
        {#each MEDIA as category (category.name)}
          <QTab
            name={category.name}
            icon={category.icon}
            id={`media-tab-${category.name}`}
            aria-controls={`media-panel-${category.name}`}>{category.label}</QTab
          >
        {/each}
      </QTabs>
      {#each MEDIA as category (category.name)}
        <div
          id={`media-panel-${category.name}`}
          role="tabpanel"
          aria-labelledby={`media-tab-${category.name}`}
          hidden={mediaTab !== category.name}
          tabindex="0"
          class="media-panel"
        >
          <div class="media-art {category.color}" aria-hidden="true">
            <QIcon name={category.icon} size="48px" />
          </div>
          <h3 class="title-large q-mt-md q-mb-xs">{category.title}</h3>
          <p class="body-medium q-ma-none">{category.detail}</p>
        </div>
      {/each}
    </div>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Primary Tabs">
        {#snippet sectionDescription()}
          Bind <code>value</code> to choose a panel. Primary tabs stack icons above labels; use
          <code>inlineLabel</code> to place them side by side. Icon-only tabs need an accessible
          label. <code>noSeparator</code> removes the divider.
        {/snippet}

        <div class="example-controls">
          <QSwitch label="Show labels" bind:value={hasLabels} />
          <QSwitch label="Inline icons" bind:value={hasInlineLabels} disabled={!hasLabels} />
          <QSwitch label="Divider" bind:value={hasSeparator} />
        </div>
        <div class="example-frame surface">
          <div class="example-heading">
            <QIcon name="sports_esports" class="text-tertiary" size="32px" aria-hidden="true" />
            <div>
              <h6 class="title-large">Orbit Racer</h6>
              <div class="body-medium text-on-surface-variant">Project assets</div>
            </div>
          </div>
          <QTabs
            bind:value={assetTab}
            inlineLabel={hasInlineLabels}
            noSeparator={!hasSeparator}
            aria-label="Project assets"
          >
            {#each ASSET_GROUPS as group (group.name)}
              {#snippet label()}{group.label}{/snippet}
              <QTab
                name={group.name}
                icon={group.icon}
                id={`asset-tab-${group.name}`}
                aria-controls={`asset-panel-${group.name}`}
                aria-label={group.label}
                children={hasLabels ? label : undefined}
              />
            {/each}
          </QTabs>
          {#each ASSET_GROUPS as group (group.name)}
            <div
              id={`asset-panel-${group.name}`}
              role="tabpanel"
              aria-labelledby={`asset-tab-${group.name}`}
              hidden={assetTab !== group.name}
              tabindex="0"
              class="example-panel"
            >
              <ul class="asset-list">
                {#each group.files as file (file.name)}
                  <li class="asset-row">
                    <QAvatar class={group.color} aria-hidden="true">
                      <QIcon name={group.icon} />
                    </QAvatar>
                    <div>
                      <div class="title-medium">{file.name}</div>
                      <div class="body-medium text-on-surface-variant">{file.detail}</div>
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      </QDocsSection>

      <QDocsSection title="Secondary Tabs">
        {#snippet sectionDescription()}
          Use <code>variant="secondary"</code> for related views within a section. Icons sit beside labels,
          and the indicator spans the tab's width.
        {/snippet}

        <div class="example-frame surface">
          <div class="example-heading">
            <QAvatar class="primary-container" size="md" aria-hidden="true">
              <QIcon name="local_shipping" />
            </QAvatar>
            <div>
              <h6 class="title-large">Order #1048</h6>
              <div class="body-medium text-on-surface-variant">Racket Works</div>
            </div>
          </div>
          <QTabs bind:value={orderTab} variant="secondary" aria-label="Order details">
            <QTab
              name="tracking"
              icon="route"
              id="order-tab-tracking"
              aria-controls="order-panel-tracking">Tracking</QTab
            >
            <QTab
              name="items"
              icon="inventory_2"
              id="order-tab-items"
              aria-controls="order-panel-items">Items</QTab
            >
          </QTabs>
          <div
            id="order-panel-tracking"
            role="tabpanel"
            aria-labelledby="order-tab-tracking"
            hidden={orderTab !== "tracking"}
            tabindex="0"
            class="example-panel"
          >
            <div class="delivery-banner tertiary-container">
              <QIcon name="delivery_truck_speed" size="40px" aria-hidden="true" />
              <div>
                <h6 class="title-large">On its way</h6>
                <div class="body-medium">Arriving Friday, 18:00–21:00</div>
              </div>
            </div>
            <p class="body-medium q-mb-none">Your racket and grips have left the warehouse.</p>
          </div>
          <div
            id="order-panel-items"
            role="tabpanel"
            aria-labelledby="order-tab-items"
            hidden={orderTab !== "items"}
            tabindex="0"
            class="example-panel"
          >
            <dl class="order-details">
              <div>
                <dt>Club racket</dt>
                <dd>€79</dd>
              </div>
              <div>
                <dt>Grip tape · 3 pack</dt>
                <dd>€7</dd>
              </div>
              <div class="title-medium">
                <dt>Total</dt>
                <dd>€86</dd>
              </div>
            </dl>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Vertical Tabs">
        {#snippet sectionDescription()}
          <code>variant="vertical"</code> stacks the tabs vertically. This is a Quaff extension for layouts
          that need it. Values in these settings stay intact when you switch tabs.
        {/snippet}

        <div class="example-frame surface">
          <h6 class="title-large q-pa-md q-ma-none">Workspace settings</h6>
          <div class="settings-layout">
            <QTabs bind:value={settingsTab} variant="vertical" aria-label="Workspace settings">
              <QTab name="profile" id="settings-tab-profile" aria-controls="settings-panel-profile"
                >Profile</QTab
              >
              <QTab name="alerts" id="settings-tab-alerts" aria-controls="settings-panel-alerts"
                >Alerts</QTab
              >
              <QTab name="privacy" id="settings-tab-privacy" aria-controls="settings-panel-privacy"
                >Privacy</QTab
              >
            </QTabs>
            <div class="settings-panels">
              <div
                id="settings-panel-profile"
                role="tabpanel"
                aria-labelledby="settings-tab-profile"
                hidden={settingsTab !== "profile"}
                tabindex="0"
                class="example-panel"
              >
                <div class="profile-preview q-mb-md">
                  <QAvatar class="tertiary-container" aria-hidden="true">
                    {displayName.trim().charAt(0).toUpperCase() || "?"}
                  </QAvatar>
                  <span class="title-medium">{displayName || "Your name"}</span>
                </div>
                <QInput label="Name" bind:value={displayName} outlined />
              </div>
              <div
                id="settings-panel-alerts"
                role="tabpanel"
                aria-labelledby="settings-tab-alerts"
                hidden={settingsTab !== "alerts"}
                tabindex="0"
                class="example-panel"
              >
                <div class="settings-options">
                  <QSwitch label="Email alerts" bind:value={hasEmailAlerts} />
                  <QSwitch label="Weekly summary" bind:value={hasWeeklySummary} />
                </div>
              </div>
              <div
                id="settings-panel-privacy"
                role="tabpanel"
                aria-labelledby="settings-tab-privacy"
                hidden={settingsTab !== "privacy"}
                tabindex="0"
                class="example-panel"
              >
                <QSwitch label="Online status" bind:value={isOnlineVisible} />
                <p class="body-medium text-on-surface-variant q-mb-none" aria-live="polite">
                  {isOnlineVisible
                    ? "Teammates can see when you're online."
                    : "Your online status is hidden."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Router Links">
        {#snippet sectionDescription()}
          Add <code>to</code> to navigate to another page. These tabs follow the current route; they do
          not need a bound value. The links below open other component pages.
        {/snippet}

        <div class="example-frame surface">
          <QTabs value="tabs" aria-label="Component pages" variant="secondary">
            <QTab name="tabs" to="/components/tabs">Tabs</QTab>
            <QTab name="buttons" to="/components/button">Buttons</QTab>
            <QTab name="menus" to="/components/menu">Menus</QTab>
          </QTabs>
        </div>
      </QDocsSection>

      <QDocsSection title="Keyboard and Panels" noCode>
        {#snippet sectionDescription()}
          Arrow keys move focus between tabs; vertical tabs use Up and Down. Home and End jump to
          the first and last tab. Press Enter or Space to select, then Tab to reach the panel.
        {/snippet}
        <p>
          Connect each tab and panel with <code>id</code>, <code>aria-controls</code>, and
          <code>aria-labelledby</code>. Give panels <code>role="tabpanel"</code> and
          <code>tabindex="0"</code>, and hide inactive panels with <code>hidden</code>.
        </p>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style>
  .media-library {
    width: 100%;
    max-width: 24rem;
    border-radius: 24px;
    overflow: hidden;
  }

  .media-panel,
  .example-panel {
    padding: 16px;
  }

  .media-art {
    position: relative;
    display: grid;
    place-items: center;
    height: 80px;
    border-radius: 12px;
    overflow: hidden;
  }

  .media-art::before,
  .media-art::after {
    content: "";
    position: absolute;
    width: 128px;
    height: 128px;
    border: 16px solid currentColor;
    border-radius: 50%;
    opacity: 0.1;
  }

  .media-art::before {
    inset-inline-start: -48px;
  }

  .media-art::after {
    inset-inline-end: -48px;
  }

  .example-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    margin-bottom: 16px;
  }

  .example-frame {
    max-width: 42rem;
    border: 1px solid var(--outline-variant);
    border-radius: 16px;
    overflow: hidden;
  }

  .example-heading,
  .asset-row,
  .profile-preview,
  .delivery-banner {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .example-heading {
    padding: 16px;
  }

  .asset-list {
    display: grid;
    gap: 16px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .delivery-banner {
    flex-wrap: wrap;
    padding: 16px;
    border-radius: 12px;
  }

  .order-details {
    display: grid;
    gap: 16px;
    margin: 0;
  }

  .order-details > div {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px 16px;
  }

  .order-details dd {
    margin: 0;
  }

  .settings-layout {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: start;
  }

  .settings-panels {
    min-height: 176px;
  }

  .profile-preview {
    flex-wrap: wrap;
    overflow-wrap: anywhere;
  }

  .settings-options {
    display: grid;
    gap: 16px;
  }
</style>
