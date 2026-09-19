<script lang="ts">
  import { QBadgeDocs } from "$components/badge/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QBadge,
    QBtn,
    QCard,
    QCardSection,
    QIcon,
    QIconBtn,
    QItem,
    QItemSection,
    QList,
  } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QBadgeDocs });

  let hasNotification = $state(true);
  let unreadCount = $state(3);
</script>

<svelte:head>
  <title>{pageTitle("QBadge")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QCard class="q-pa-lg" aria-hidden="true">
      <QCardSection class="title-large q-pa-none q-mb-lg">Your inbox</QCardSection>
      <div class="flex items-center q-gap-xl" style="padding-inline-end: 1.5rem;">
        <span style="position: relative; display: inline-flex;">
          <QIcon name="notifications" />
          <QBadge floating />
        </span>
        <span style="position: relative; display: inline-flex;">
          <QIcon name="mail" />
          <QBadge floating label={8} />
        </span>
        <span style="position: relative; display: inline-flex;">
          <QIcon name="inbox" />
          <QBadge floating label={1200} />
        </span>
      </div>
    </QCard>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Dots and Counts">
      {#snippet sectionDescription()}
        Empty badges render a dot. Add a <code>label</code> or text content for a larger badge.
        Numbers above 999 display as <code>999+</code>; keep custom text to four characters.
      {/snippet}

      <div class="flex items-center q-gap-lg">
        <QBadge aria-label="New notification" />
        <QBadge label={0} aria-label="No unread messages" />
        <QBadge label={8} aria-label="8 unread messages" />
        <QBadge label={24} aria-label="24 unread messages" />
        <QBadge label={1200} aria-label="1200 unread messages" />
        <QBadge>NEW</QBadge>
      </div>
    </QDocsSection>

    <QDocsSection title="On Icons">
      {#snippet sectionDescription()}
        <p>
          Use <code>floating</code> inside a positioned icon wrapper. Placement follows the text direction.
          Prefer a dot when a count would overlap nearby content.
        </p>
        <p>
          Describe the badge through its control's <code>aria-describedby</code>, including a
          meaningful description for dots. Select an icon below to clear its unread notification.
        </p>
      {/snippet}

      <div class="flex items-center q-gap-lg">
        <QIconBtn
          aria-label="Notifications"
          aria-describedby={hasNotification ? "badge-notification" : undefined}
          onclick={() => (hasNotification = false)}
        >
          <span style="position: relative; display: inline-flex;">
            <QIcon name="notifications" aria-hidden="true" />
            {#if hasNotification}
              <QBadge
                id="badge-notification"
                floating
                aria-label="New notification"
                aria-hidden="true"
              />
            {/if}
          </span>
        </QIconBtn>
        <QIconBtn
          aria-label="Messages"
          aria-describedby={unreadCount ? "badge-messages" : undefined}
          onclick={() => (unreadCount = 0)}
        >
          <span style="position: relative; display: inline-flex;">
            <QIcon name="mail" aria-hidden="true" />
            {#if unreadCount}
              <QBadge
                id="badge-messages"
                floating
                label={unreadCount}
                aria-label={`${unreadCount} unread messages`}
                aria-hidden="true"
              />
            {/if}
          </span>
        </QIconBtn>
        <QBtn
          label="Reset"
          variant="tonal"
          onclick={() => {
            hasNotification = true;
            unreadCount = 3;
          }}
        />
      </div>
    </QDocsSection>

    <QDocsSection title="Alongside Text">
      {#snippet sectionDescription()}
        Badges can also sit at the end of a row. Keep them separate from the label to avoid overlap.
      {/snippet}

      <QList style="width: min(24rem, 100%);">
        <QItem>
          <QItemSection type="content">Inbox</QItemSection>
          <QItemSection type="side"
            ><QBadge label={24} aria-label="24 unread messages" /></QItemSection
          >
        </QItem>
        <QItem>
          <QItemSection type="content">Updates</QItemSection>
          <QItemSection type="side"><QBadge aria-label="New notification" /></QItemSection>
        </QItem>
      </QList>
    </QDocsSection>
  {/snippet}
</QDocs>
