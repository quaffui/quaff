<script lang="ts">
  import { QBadgeDocs } from "$components/badge/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QBadge, QBtn, QIcon, QIconBtn, QSelect, QSwitch } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QBadge — Badge",
      "Show counts, notification dots, and short status labels with QBadge. See how to position Svelte badges on icons or alongside text."
    )
  );

  docsCtx.set({ snippets, componentDocs: QBadgeDocs });

  const REPORTS = [
    { label: "This morning · 0", value: 0 },
    { label: "Today · 8", value: 8 },
    { label: "This week · 24", value: 24 },
    { label: "This year · 1200", value: 1200 },
    { label: "Import correction · -3", value: -3 },
  ];

  let unreadCount = $state(3);
  let hasArrival = $state(true);
  let showCounts = $state(true);
  let reportCount = $state(1200);
  let deskStatus = $state("3 unread requests and one new arrival.");

  function reviewRequests() {
    unreadCount = 0;
    deskStatus = "All requests reviewed. The unread badge is cleared.";
  }

  function reviewArrivals() {
    hasArrival = false;
    deskStatus = "New arrival checked. The notification dot is cleared.";
  }

  function addRequest() {
    unreadCount += 1;
    deskStatus = `${unreadCount} unread ${unreadCount === 1 ? "request" : "requests"}.`;
  }

  function resetDesk() {
    unreadCount = 3;
    hasArrival = true;
    deskStatus = "Desk reset: three unread requests and one new arrival.";
  }
</script>

<QDocs>
  {#snippet display()}
    <div class="desk-preview q-pa-lg text-on-surface">
      <div class="label-medium text-primary">THE TOOLSHED</div>
      <h2 class="title-large q-mt-xs q-mb-lg">Lending updates</h2>
      <div class="preview-row body-medium flex items-center justify-between q-gap-md">
        <span>Unread requests</span><QBadge label={3} aria-label="3 unread requests" />
      </div>
      <div class="preview-row body-medium flex items-center justify-between q-gap-md">
        <span>New arrivals</span><QBadge aria-label="New tool arrivals" />
      </div>
      <div class="preview-row body-medium flex items-center justify-between q-gap-md">
        <span>Precision driver set</span><QBadge>NEW</QBadge>
      </div>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Floating Counts and Dots">
      {#snippet sectionDescription()}
        Place a <code>floating</code> badge inside a positioned icon wrapper. Empty badges show a
        dot; <code>label</code> adds a count. Review a notification to clear its badge, or add a request
        to increase the count. Use dots when a count would crowd nearby controls.
      {/snippet}

      <div class="lending-desk q-pa-lg">
        <div class="flex items-center justify-between q-gap-md q-mb-lg">
          <div>
            <div class="label-small text-primary">THE TOOLSHED</div>
            <h3 class="title-large q-ma-none">Lending notifications</h3>
          </div>
          <div class="desk-actions flex items-center q-gap-lg">
            <QIconBtn
              aria-label="Review requests"
              aria-describedby={unreadCount ? "toolshed-request-count" : undefined}
              onclick={reviewRequests}
            >
              <span class="badge-anchor">
                <QIcon name="assignment" aria-hidden="true" />
                {#if unreadCount}
                  <QBadge
                    id="toolshed-request-count"
                    floating
                    label={showCounts ? unreadCount : undefined}
                    aria-label={`${unreadCount} unread requests`}
                    aria-hidden="true"
                  />
                {/if}
              </span>
            </QIconBtn>
            <QIconBtn
              aria-label="Review new arrivals"
              aria-describedby={hasArrival ? "toolshed-new-arrival" : undefined}
              onclick={reviewArrivals}
            >
              <span class="badge-anchor">
                <QIcon name="inventory_2" aria-hidden="true" />
                {#if hasArrival}
                  <QBadge
                    id="toolshed-new-arrival"
                    floating
                    aria-label="New tool on the shelf"
                    aria-hidden="true"
                  />
                {/if}
              </span>
            </QIconBtn>
          </div>
        </div>
        <div class="flex items-center q-gap-md">
          <QBtn variant="tonal" icon="add" label="Add request" onclick={addRequest} />
          <QSwitch label="Show unread counts" bind:value={showCounts} />
          <QBtn variant="flat" icon="restart_alt" label="Reset notifications" onclick={resetDesk} />
        </div>
        <p class="body-medium q-mt-lg q-mb-none" role="status">{deskStatus}</p>
      </div>
    </QDocsSection>

    <QDocsSection title="Counts Alongside Text">
      {#snippet sectionDescription()}
        Inline badges sit beside a label without covering it. Numeric labels display zero for
        negative numbers and cap at <code>999+</code>. Keep the full count in the accessible name.
        Switch the report to try these boundaries.
      {/snippet}

      <div class="report-layout flex items-start q-gap-lg">
        <QSelect
          label="Lending report"
          options={REPORTS}
          bind:value={reportCount}
          emitValue
          outlined
        />
        <div class="report-card flex items-center q-pa-lg">
          <div class="report-icon primary-container" aria-hidden="true">
            <QIcon name="recycling" size="32px" />
          </div>
          <div class="report-copy">
            <h3 class="title-medium q-ma-none">Tools, used again</h3>
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">
              {reportCount < 0
                ? "A negative import displays as zero."
                : `${reportCount.toLocaleString("en")} loans in this report`}
            </p>
          </div>
          <QBadge label={reportCount} aria-label={`${Math.max(0, reportCount)} tool loans`} />
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Short Status Labels">
      {#snippet sectionDescription()}
        Use <code>label</code> or the default snippet for short text, ideally four characters or fewer.
        Keep longer information alongside the badge. Badges communicate status; actions belong on their
        associated buttons or links.
      {/snippet}

      <div class="shelf-note flex items-center q-pa-lg">
        <QIcon name="shelves" size="32px" class="text-tertiary" aria-hidden="true" />
        <div>
          <div class="shelf-title flex items-center">
            <h3 class="title-medium q-ma-none">Precision driver set</h3>
            <QBadge>NEW</QBadge>
          </div>
          <p class="body-medium q-mt-sm q-mb-none">Available on shelf B.</p>
        </div>
      </div>
      <p class="body-medium q-mt-lg q-mb-none">
        For an icon button, connect the badge with <code>aria-describedby</code> and give dots a
        meaningful description. The desk example hides the badge from separate announcement while
        keeping it as the button's description. A changing count can also be summarized in a nearby
        <code>role="status"</code> message.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .lending-desk :global(.q-switch) {
    max-width: 100%;
  }

  .desk-preview {
    width: 100%;
    max-width: 336px;
    max-height: 100%;
    overflow: auto;
    border-radius: 24px;
    background: var(--surface-container-low);
  }

  .report-icon {
    display: grid;
    place-items: center;
    flex: none;
    width: 64px;
    height: 64px;
    border-radius: 20px;
  }

  .preview-row {
    flex-wrap: nowrap;
    margin-top: 12px;
  }

  .preview-row > span {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .lending-desk {
    width: 100%;
    max-width: 640px;
    min-width: 0;
    border: 1px solid var(--outline-variant);
    border-radius: 24px;
    background: var(--surface-container-low);
  }

  .desk-actions {
    padding-inline-end: 16px;
  }

  .badge-anchor {
    position: relative;
    display: inline-flex;
  }

  .report-layout > :global(.q-field) {
    flex: 1 1 240px;
    min-width: 0;
  }

  .report-card,
  .shelf-note {
    gap: 20px;
    border-radius: 24px;
    background: var(--surface-container-low);
  }

  .report-card {
    flex: 2 1 368px;
    min-width: 0;
  }

  .report-copy,
  .shelf-note > div {
    flex: 1 1 160px;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .shelf-title {
    gap: 12px;
  }
</style>
