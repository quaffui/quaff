<script lang="ts">
  import { QNavbarDocs, QNavItemDocs } from "$components/navbar/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QLayout, QNavbar, QNavItem } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QNavbarDocs, QNavItemDocs] });

  let selectedDestination = $state("home");
</script>

<svelte:head>
  <title>{pageTitle("QNavbar")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QLayout style="height: 280px;">
      {#snippet content()}
        <div class="flex flex-center column" style="height: 100%;">
          <h5>{selectedDestination}</h5>
          <span class="text-on-surface-variant">Selected destination</span>
        </div>
      {/snippet}

      {#snippet navbar()}
        <QNavbar aria-label="Primary navigation">
          <QNavItem
            icon="home"
            label="Home"
            active={selectedDestination === "home"}
            onclick={() => (selectedDestination = "home")}
          />
          <QNavItem
            icon="search"
            label="Explore"
            active={selectedDestination === "explore"}
            onclick={() => (selectedDestination = "explore")}
          />
          <QNavItem
            icon="person"
            label="Profile"
            active={selectedDestination === "profile"}
            onclick={() => (selectedDestination = "profile")}
          />
        </QNavbar>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="QLayout Integration">
        {#snippet sectionDescription()}
          Place QNavbar in QLayout's <code>navbar</code> snippet. QLayout reserves space at the bottom
          of its content for the bar, while QNavItem represents each primary destination. Use three to
          five stable, equal-priority top-level destinations, keep exactly one active, and always show
          concise one- or two-word labels.
        {/snippet}

        <div style="height: 300px; border: 1px solid var(--outline-variant);">
          <QLayout>
            {#snippet content()}
              <div class="flex flex-center column" style="height: 100%;">
                <h5>{selectedDestination}</h5>
                <p class="text-on-surface-variant">Choose a destination below.</p>
              </div>
            {/snippet}

            {#snippet navbar()}
              <QNavbar aria-label="Example primary navigation">
                <QNavItem
                  icon="home"
                  label="Home"
                  active={selectedDestination === "home"}
                  onclick={() => (selectedDestination = "home")}
                />
                <QNavItem
                  icon="search"
                  label="Explore"
                  active={selectedDestination === "explore"}
                  onclick={() => (selectedDestination = "explore")}
                />
                <QNavItem
                  icon="favorite"
                  label="Favorites"
                  active={selectedDestination === "favorites"}
                  onclick={() => (selectedDestination = "favorites")}
                />
                <QNavItem
                  icon="person"
                  label="Profile"
                  active={selectedDestination === "profile"}
                  onclick={() => (selectedDestination = "profile")}
                />
              </QNavbar>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Badges">
        {#snippet sectionDescription()}
          Provide the <code>badge</code> snippet to add a badge to a navigation item. An empty
          snippet renders the 6px dot variant; plain text renders the larger variant and should be
          limited to four characters including <code>+</code>, such as <code>999+</code>. Use
          <code>badgeAriaLabel</code> whenever the badge conveys information, and always for a dot. For
          a dot, use a description such as “New notification”. Remove an unread marker once its destination
          is selected.
        {/snippet}

        <div style="height: 260px; border: 1px solid var(--outline-variant);">
          <QLayout>
            {#snippet content()}
              <div class="flex flex-center" style="height: 100%;">
                <span class="headline-small">Inbox</span>
              </div>
            {/snippet}

            {#snippet navbar()}
              <QNavbar aria-label="Inbox navigation">
                <QNavItem icon="home" label="Home" active />
                <QNavItem icon="notifications" label="Updates" badgeAriaLabel="New notification">
                  {#snippet badge()}{/snippet}
                </QNavItem>
                <QNavItem icon="chat" label="Messages" badgeAriaLabel="3 unread messages">
                  {#snippet badge()}3{/snippet}
                </QNavItem>
                <QNavItem icon="inbox" label="Inbox" badgeAriaLabel="More than 999 unread emails">
                  {#snippet badge()}999+{/snippet}
                </QNavItem>
              </QNavbar>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Horizontal Items">
        {#snippet sectionDescription()}
          Add <code>horizontal</code> for medium layouts from 600px through 839px. Use vertical items
          below 600px and switch to a navigation rail at 840px and above.
        {/snippet}

        <div style="height: 260px; border: 1px solid var(--outline-variant);">
          <QLayout>
            {#snippet content()}
              <div class="flex flex-center" style="height: 100%;">
                <span class="headline-small">Wide navigation</span>
              </div>
            {/snippet}

            {#snippet navbar()}
              <QNavbar horizontal aria-label="Wide primary navigation">
                <QNavItem icon="home" label="Home" active />
                <QNavItem icon="calendar_month" label="Calendar" badgeAriaLabel="New notification">
                  {#snippet badge()}{/snippet}
                </QNavItem>
                <QNavItem icon="person" label="Profile" />
              </QNavbar>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Links and Active State">
        {#snippet sectionDescription()}
          Use <code>href</code> for destinations; <code>to</code> is supported as an alias. The
          <code>active</code>,
          <code>activeClass</code>, and <code>activeStyle</code> props can mark the current destination;
          router links can also become active from the current route, including nested routes.
        {/snippet}

        <div style="height: 260px; border: 1px solid var(--outline-variant);">
          <QLayout>
            {#snippet content()}
              <div class="flex flex-center" style="height: 100%;">
                <span class="headline-small">Linked destinations</span>
              </div>
            {/snippet}

            {#snippet navbar()}
              <QNavbar aria-label="Documentation navigation">
                <QNavItem
                  icon="widgets"
                  label="Components"
                  to="/components"
                  active
                  activeClass="text-secondary"
                />
                <QNavItem icon="view_quilt" label="Layout" to="/components/layout" />
                <QNavItem
                  icon="description"
                  label="Material specs"
                  href="https://m3.material.io/components/navigation-bar/specs"
                  target="_blank"
                  aria-label="Material navigation bar specifications (opens in a new tab)"
                />
                <QNavItem icon="block" label="Unavailable" disabled />
              </QNavbar>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Icons and Labels">
        {#snippet sectionDescription()}
          The required <code>icon</code> prop accepts a Material Symbol name or a snippet. Supply a
          <code>label</code>, or use the default children snippet as its fallback. Keep visible
          labels concise, and add an <code>aria-label</code> when a destination needs a fuller
          accessible name. Custom icon content inherits the 24px icon size; when it has distinct
          filled and outlined forms, choose the active form from the same state used by
          <code>active</code>.
        {/snippet}

        <div style="height: 260px; border: 1px solid var(--outline-variant);">
          <QLayout>
            {#snippet content()}
              <div class="flex flex-center" style="height: 100%;">
                <span class="headline-small">Accessible labels</span>
              </div>
            {/snippet}

            {#snippet navbar()}
              <QNavbar aria-label="Custom primary navigation">
                <QNavItem icon="home" active>Home</QNavItem>
                <QNavItem aria-label="Saved favorites" label="Saved">
                  {#snippet icon()}
                    <span aria-hidden="true">★</span>
                  {/snippet}
                </QNavItem>
                <QNavItem icon="settings" label="Settings" />
              </QNavbar>
            {/snippet}
          </QLayout>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
