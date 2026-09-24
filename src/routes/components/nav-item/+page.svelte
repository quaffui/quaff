<script lang="ts">
  import { resolve } from "$app/paths";
  import { QNavGroupDocs, QNavItemDocs } from "$components/nav-item/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QDrawer, QIcon, QLayout, QList, QNavGroup, QNavItem, QSwitch } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QNavItemDocs, QNavGroupDocs] });

  let mailbox = $state("Starred");
  let hasUnreadMessages = $state(true);
  let destination = $state<keyof typeof STUDIO_PAGES>("Bookings");
  let isDense = $state(false);

  const STUDIO_PAGES = {
    Overview: {
      icon: "dashboard",
      detail: "Your studio at a glance.",
      summary: "12 classes this week",
    },
    Classes: {
      icon: "fitness_center",
      detail: "Find the next session on the schedule.",
      summary: "Strength · Today, 18:00",
    },
    Bookings: {
      icon: "event_available",
      detail: "Keep track of who's joining.",
      summary: "8 of 12 places reserved",
    },
  } as const;
  const selectedPage = $derived(STUDIO_PAGES[destination]);

  function selectMailbox(name: string) {
    mailbox = name;

    if (name === "Inbox") {
      hasUnreadMessages = false;
    }
  }
</script>

<svelte:head>
  <title>{pageTitle("QNavItem & QNavGroup")}</title>
</svelte:head>

<QDocs
  docName="Navigation Items"
  docDescription="Link to destinations in drawers, navigation bars and rails. Group related pages under expandable headings."
>
  {#snippet display()}
    <QLayout class="mail-preview">
      {#snippet drawerLeft()}
        <QDrawer value={true} width={288} behavior="desktop" persistent style="max-width: 100%;">
          <div class="mail-brand">
            <span class="mail-mark"><QIcon name="alternate_email" aria-hidden="true" /></span>
            <span class="title-large">Kite mail</span>
          </div>
          <QList tag="nav" aria-label="Kite mail" expressive={false} preserveTabOrder>
            <QNavItem
              icon="inbox"
              label="Inbox"
              active={mailbox === "Inbox"}
              badge={hasUnreadMessages ? inboxBadge : undefined}
              badgeAriaLabel="3 unread messages"
              onclick={() => selectMailbox("Inbox")}
            />
            <QNavItem
              icon="star"
              label="Starred"
              active={mailbox === "Starred"}
              onclick={() => selectMailbox("Starred")}
            />
            <QNavItem
              icon="draft"
              label="Drafts"
              active={mailbox === "Drafts"}
              onclick={() => selectMailbox("Drafts")}
            />
          </QList>
          <p class="mail-status label-medium" aria-live="polite">Viewing {mailbox.toLowerCase()}</p>
        </QDrawer>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Drawer Destinations">
      {#snippet sectionDescription()}
        Place QNavItem in a <code>QList tag="nav"</code> inside QDrawer. Use <code>to</code> or
        <code>href</code> for links; the current route gets its active style and
        <code>aria-current</code> automatically. Set <code>active</code> to control selection
        yourself. Icons are optional in drawers; include them in
        <a href={resolve("/components/navbar", {})}>bars</a>
        and <a href={resolve("/components/railbar", {})}>rails</a>.
      {/snippet}

      <QLayout class="linked-drawer">
        {#snippet drawerLeft()}
          <QDrawer value={true} width={320} behavior="desktop" persistent style="max-width: 100%;">
            <h6 class="q-drawer__headline">Explore navigation</h6>
            <QList
              tag="nav"
              aria-label="Navigation documentation"
              expressive={false}
              preserveTabOrder
            >
              <QNavItem label="Navigation items" to="/components/nav-item" />
              <QNavItem label="Drawer" to="/components/drawer" />
              <QNavItem label="Navigation bar" to="/components/navbar" />
              <QNavItem label="Team settings" disabled />
            </QList>
          </QDrawer>
        {/snippet}
      </QLayout>
    </QDocsSection>

    <QDocsSection title="Expandable Groups">
      {#snippet sectionDescription()}
        QNavGroup provides a nested navigation list under a collapsible heading. Use it inside a
        drawer’s QList. Use <code>defaultOpened</code>
        for an initially expanded group, or bind <code>value</code> to control it. The group's
        children inherit the outer list's <code>dense</code> setting.
      {/snippet}

      <QSwitch bind:value={isDense} label="Compact navigation" class="q-mb-md" />
      <div class="studio-example">
        <QLayout class="studio-navigation">
          {#snippet drawerLeft()}
            <QDrawer
              value={true}
              width={320}
              behavior="desktop"
              persistent
              style="max-width: 100%;"
            >
              <h6 class="q-drawer__headline">Tempo studio</h6>
              <QList
                tag="nav"
                aria-label="Tempo studio"
                dense={isDense}
                expressive={false}
                preserveTabOrder
              >
                <QNavItem
                  label="Overview"
                  icon="dashboard"
                  active={destination === "Overview"}
                  onclick={() => (destination = "Overview")}
                />
                <QNavGroup label="Schedule" icon="calendar_month" defaultOpened>
                  <QNavItem
                    label="Classes"
                    active={destination === "Classes"}
                    onclick={() => (destination = "Classes")}
                  />
                  <QNavItem
                    label="Bookings"
                    active={destination === "Bookings"}
                    onclick={() => (destination = "Bookings")}
                  />
                </QNavGroup>
                <QNavItem label="Team" icon="group" disabled />
              </QList>
            </QDrawer>
          {/snippet}
        </QLayout>
        <section class="studio-summary" aria-live="polite">
          <span class="label-large">TEMPO STUDIO</span>
          <QIcon name={selectedPage.icon} size="48px" aria-hidden="true" />
          <h5>{destination}</h5>
          <p>{selectedPage.detail}</p>
          <div class="studio-stat title-medium">{selectedPage.summary}</div>
        </section>
      </div>
    </QDocsSection>
  {/snippet}
</QDocs>

{#snippet inboxBadge()}3{/snippet}

<style lang="scss">
  :global(.mail-preview),
  :global(.linked-drawer),
  :global(.studio-navigation) {
    border-radius: 16px;
    border: 1px solid var(--outline-variant);
  }

  :global(.mail-preview) {
    height: 304px;
    max-width: 18rem;
  }

  .mail-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px 16px;
  }

  .mail-mark {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: var(--tertiary-container);
    color: var(--on-tertiary-container);
  }

  .mail-status {
    margin: 16px 16px 0;
    color: var(--on-surface-variant);
  }

  :global(.linked-drawer) {
    height: 304px;
    max-width: 20rem;
  }

  .studio-example {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 272px), 1fr));
    gap: 16px;
    max-width: 44rem;
  }

  :global(.studio-navigation) {
    height: 368px;
    max-width: 20rem;
  }

  .studio-summary {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    border-radius: 16px;
    background: var(--tertiary-container);
    color: var(--on-tertiary-container);

    h5,
    p {
      margin: 0;
    }
  }

  .studio-stat {
    padding: 16px;
    border-radius: 12px;
    background: var(--surface);
    color: var(--on-surface);
  }
</style>
