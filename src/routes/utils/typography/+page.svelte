<script lang="ts">
  import { QDocs, QDocsSection } from "$docs";
  import { QAvatar, QBtn, QCodeBlock, QIcon, QInput, QSelect, QSwitch } from "$lib";
  import { useMeta } from "$lib/meta";
  import { pageMeta } from "$docs/metadata";

  useMeta(
    pageMeta(
      "Typography",
      "Build clear text hierarchies with Quaff's Material 3 typography. Explore baseline and emphasized styles, text scaling, utility classes, and design tokens."
    )
  );

  // Role, emphasized class, size, line height, baseline weight, emphasized weight.
  const TYPE_STYLES = [
    ["display-large", "display-large-emphasized", 57, 64, 400, 500],
    ["display-medium", "display-medium-emphasized", 45, 52, 400, 500],
    ["display-small", "display-small-emphasized", 36, 44, 400, 500],
    ["headline-large", "headline-large-emphasized", 32, 40, 400, 500],
    ["headline-medium", "headline-medium-emphasized", 28, 36, 400, 500],
    ["headline-small", "headline-small-emphasized", 24, 32, 400, 500],
    ["title-large", "title-large-emphasized", 22, 28, 400, 500],
    ["title-medium", "title-medium-emphasized", 16, 24, 500, 700],
    ["title-small", "title-small-emphasized", 14, 20, 500, 700],
    ["body-large", "body-large-emphasized", 16, 24, 400, 500],
    ["body-medium", "body-medium-emphasized", 14, 20, 400, 500],
    ["body-small", "body-small-emphasized", 12, 16, 400, 500],
    ["label-large", "label-large-emphasized", 14, 20, 500, 700],
    ["label-medium", "label-medium-emphasized", 12, 16, 500, 700],
    ["label-small", "label-small-emphasized", 11, 16, 500, 700],
  ] as const;
  const ROLE_OPTIONS = TYPE_STYLES.map(([role]) => ({ label: role, value: role }));
  const UPDATES = [
    {
      id: "studio",
      icon: "palette",
      title: "The studios are staying open",
      detail: "Meet the makers until 22:00.",
      time: "Now",
    },
    {
      id: "ticket",
      icon: "confirmation_number",
      title: "Your Friday pass is ready",
      detail: "One pass. Six places to explore.",
      time: "1h",
    },
    {
      id: "route",
      icon: "map",
      title: "A new stop on the art trail",
      detail: "Find the light installation at Pier 4.",
      time: "3h",
    },
  ] as const;

  let emphasizeHeadline = $state(true);
  let saved = $state(false);
  let unread = $state(["studio", "ticket"]);
  let selectedRole = $state("headline-large");
  let previewText = $state("Good things, after dark.");
  const style = $derived(TYPE_STYLES.find(([role]) => role === selectedRole) ?? TYPE_STYLES[3]);
  const sample = $derived(previewText || "Good things, after dark.");
  const sampleCode = $derived(
    `<p class="${style[0]}">${escapeHtml(sample)}</p>\n<p class="${style[1]}">${escapeHtml(sample)}</p>`
  );

  function escapeHtml(text: string) {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function toggleRead(id: string) {
    unread = unread.includes(id) ? unread.filter((value) => value !== id) : [...unread, id];
  }
</script>

<QDocs
  docName="Typography"
  docDescription="Give every word its place. Add emphasis where it matters."
>
  {#snippet display()}
    <div class="type-poster surface">
      <div class="poster-top label-medium-emphasized">
        <span>THE CITY, REIMAGINED</span>
        <QIcon name="north_east" size="24px" aria-hidden="true" />
      </div>
      <h2 class="poster-title display-large-emphasized">After<br />hours.</h2>
      <div class="poster-orbit tertiary-container" aria-hidden="true">
        <span class="primary"></span>
        <span class="tertiary"></span>
      </div>
      <div class="poster-bottom body-small">
        <span>Open studios.<br />Unexpected discoveries.</span>
        <span class="label-large-emphasized">FRI<br />18—23</span>
      </div>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Build a Hierarchy" noCode>
      {#snippet sectionDescription()}
        Choose a role and size: <code>headline-large</code> for a heading,
        <code>body-large</code> for reading, and <code>label-medium</code> for details. Add
        <code>-emphasized</code> for a heavier weight at the same size.
      {/snippet}

      <div class="example-controls">
        <QSwitch label="Emphasize the headline" bind:value={emphasizeHeadline} />
      </div>
      <article class="event-story surface-container-low" aria-labelledby="event-title">
        <div class="event-art secondary-container" aria-hidden="true">
          <div class="art-scene">
            <div class="art-window primary"><span class="secondary-container"></span></div>
            <div class="art-disc tertiary"></div>
          </div>
          <div class="art-caption label-large-emphasized">MAKE ROOM<br />FOR SOMETHING NEW.</div>
          <span class="art-edition label-medium">AFTER HOURS / 07</span>
        </div>
        <div class="event-copy">
          <div class="story-eyebrow label-medium text-on-surface-variant">
            FRIDAY EDIT · ART & CULTURE
          </div>
          <h2
            id="event-title"
            class={emphasizeHeadline ? "headline-large-emphasized" : "headline-large"}
          >
            A different side<br />of the city.
          </h2>
          <p class="body-large text-on-surface-variant">
            Step inside working studios, meet local makers, and follow the lights to your next
            discovery.
          </p>
          <div class="event-facts body-medium">
            <span><QIcon name="schedule" size="20px" aria-hidden="true" /> Friday, 18:00–23:00</span
            >
            <span
              ><QIcon name="location_on" size="20px" aria-hidden="true" /> The Dockside Quarter</span
            >
          </div>
          <div class="event-actions">
            <QBtn
              variant="tonal"
              icon={saved ? "bookmark_added" : "bookmark_add"}
              label={saved ? "Saved to your evening" : "Save for Friday"}
              bind:selected={saved}
              expressive={false}
              class="label-large-emphasized"
            />
            <span class="body-small text-on-surface-variant">Free entry · All welcome</span>
          </div>
        </div>
      </article>
      <QCodeBlock
        class="example-code"
        language="html"
        copiable
        code={`<p class="label-medium">FRIDAY EDIT · ART & CULTURE</p>
<h2 class="headline-large-emphasized">A different side of the city.</h2>
<p class="body-large">Step inside working studios and meet local makers.</p>`}
      />
    </QDocsSection>

    <QDocsSection title="Make a State Stand Out" noCode>
      {#snippet sectionDescription()}
        Use emphasis for unread messages, selected items, or important actions. It is always opt-in,
        including in expressive mode. Select an update to mark it read or unread.
      {/snippet}

      <div class="updates surface-container-low">
        <div class="updates-header">
          <div>
            <div class="label-medium text-on-surface-variant">YOUR EVENING</div>
            <h2 class="title-large">The latest</h2>
          </div>
          <span class="unread-count primary-container label-medium-emphasized" aria-live="polite">
            {unread.length} unread
          </span>
        </div>
        <ul class="updates-list">
          {#each UPDATES as update (update.id)}
            {@const isUnread = unread.includes(update.id)}
            <li>
              <button
                type="button"
                class="update-row"
                aria-pressed={isUnread}
                aria-label={`${update.title}. ${isUnread ? "Unread. Mark as read" : "Read. Mark as unread"}`}
                onclick={() => toggleRead(update.id)}
              >
                <QAvatar
                  size="sm"
                  class={isUnread ? "primary-container" : "surface-container-high"}
                  aria-hidden="true"
                >
                  <QIcon name={update.icon} />
                </QAvatar>
                <span class="update-copy">
                  <span class={isUnread ? "title-medium-emphasized" : "title-medium"}
                    >{update.title}</span
                  >
                  <span class="body-medium text-on-surface-variant">{update.detail}</span>
                </span>
                <span class="update-status label-small text-on-surface-variant">
                  <span>{update.time}</span>
                  <span class="read-dot" class:is-unread={isUnread} aria-hidden="true"></span>
                </span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
      <QCodeBlock
        class="example-code"
        language="svelte"
        copiable
        code={'<span class={unread ? "title-medium-emphasized" : "title-medium"}>\n  The studios are staying open\n</span>'}
      />
    </QDocsSection>

    <QDocsSection title="Explore the Scale" noCode>
      {#snippet sectionDescription()}
        All 15 roles have an emphasized partner. Try your own words and compare them side by side.
      {/snippet}

      <div class="scale-controls">
        <QSelect
          label="Type style"
          options={ROLE_OPTIONS}
          bind:value={selectedRole}
          emitValue
          outlined
        />
        <QInput label="Try your own text" bind:value={previewText} outlined />
      </div>
      <div class="scale-comparison">
        <div class="type-sample surface-container-low">
          <div class="sample-label label-medium text-on-surface-variant">BASELINE</div>
          <p class={style[0]}>{sample}</p>
          <div class="sample-metrics body-small text-on-surface-variant">
            <code>{style[0]}</code>
            <span>{style[2]}px / {style[3]}px · Weight {style[4]}</span>
          </div>
        </div>
        <div class="type-sample secondary-container">
          <div class="sample-label label-medium">EMPHASIZED</div>
          <p class={style[1]}>{sample}</p>
          <div class="sample-metrics body-small">
            <code>{style[1]}</code>
            <span>{style[2]}px / {style[3]}px · Weight {style[5]}</span>
          </div>
        </div>
      </div>
      <p class="body-small text-on-surface-variant">
        Size / line height at a 16px root. Text follows the browser's font size.
      </p>
      <QCodeBlock class="example-code" language="html" code={sampleCode} copiable />
    </QDocsSection>

    <QDocsSection title="Classes and Tokens" noCode>
      {#snippet sectionDescription()}
        Typography is included in Quaff's base CSS. Apply a class to the element that styles the
        text. Each role also has tokens for its font family, style, weight, size, line height, and
        tracking.
      {/snippet}
      <QCodeBlock
        language="css"
        copiable
        code={`/* Change a font for this role. Load your font separately. */
:root {
  --typescale-headline-large-emphasized-font-family-name: "Your Brand", sans-serif;
}`}
      />
      <p class="body-medium q-mt-md">
        Use semantic headings for page structure; classes control their appearance. See the <a
          class="q-docs-link"
          href="https://m3.material.io/styles/typography/type-scale-tokens#0429784f-5344-4a4a-a482-3a902918d4b1"
          >Material type scale</a
        >
        for the full guidance.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  .type-poster {
    width: 100%;
    max-width: 336px;
    padding: 24px;
    border-radius: 12px;
    isolation: isolate;
    overflow: hidden;
    container-type: inline-size;
  }
  :global(.q-docs__preview:has(.type-poster)) {
    min-height: max(400px, 23rem) !important;
  }
  .poster-top,
  .poster-bottom {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 16px;
    border-radius: 0;
  }
  .poster-top {
    max-width: 100%;
  }
  .poster-title {
    display: block;
    margin: 16px 0 24px;
    position: relative;
    z-index: 1;
    letter-spacing: var(--typescale-display-large-emphasized-letter-spacing);
  }
  .poster-bottom {
    position: relative;
    z-index: 1;
    flex-wrap: wrap;
  }
  .poster-bottom > :last-child {
    text-align: end;
    margin-inline-start: auto;
    white-space: nowrap;
  }
  .poster-orbit {
    position: absolute;
    width: 144px;
    aspect-ratio: 1;
    border-radius: 50%;
    inset-inline-end: -70px;
    inset-block-start: 64px;
    rotate: -24deg;
  }
  .poster-orbit span {
    position: absolute;
    width: 32px;
    height: 128px;
    border-radius: 32px;
    inset-block-start: 8px;
    inset-inline-start: 32px;
  }
  .poster-orbit span + span {
    inset-inline-start: 80px;
  }
  .example-controls {
    margin-block-end: 20px;
  }
  .event-story {
    display: grid;
    grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.2fr);
    max-width: 960px;
    border-radius: 24px;
    overflow: hidden;
    container-type: inline-size;
  }
  .event-art {
    min-height: 360px;
    overflow: hidden;
    border-radius: 0;
    padding: 28px;
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: 24px;
  }
  .art-scene {
    flex: 1;
    min-height: 248px;
    border-radius: 0;
    overflow: hidden;
  }
  .art-window {
    position: absolute;
    width: 176px;
    height: 220px;
    border-radius: 96px 96px 0 0;
    inset-inline-start: 16px;
    inset-block-start: 12px;
    rotate: -12deg;
  }
  .art-window span {
    position: absolute;
    inset: 24px;
    border-radius: 80px 80px 0 0;
  }
  .art-disc {
    position: absolute;
    width: 144px;
    aspect-ratio: 1;
    border-radius: 50%;
    inset-inline-end: -28px;
    inset-block-start: 88px;
  }
  .art-caption,
  .art-edition {
    position: relative;
    z-index: 1;
  }
  .art-edition {
    opacity: 0.8;
  }
  .event-copy {
    min-width: 0;
    padding: 32px;
  }
  .event-copy h2 {
    display: block;
    margin-block: 16px;
    text-wrap: balance;
  }
  .event-copy p {
    margin-block: 0 24px;
  }
  .event-facts {
    display: grid;
    gap: 10px;
  }
  .event-facts span {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .event-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-block-start: 28px;
  }
  :global(.example-code) {
    margin-block-start: 24px;
  }
  .updates {
    max-width: 760px;
    border-radius: 24px;
    overflow: hidden;
  }
  .updates-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    padding: 24px;
    border-radius: 0;
  }
  .updates-header h2 {
    margin-block: 4px 0;
  }
  .unread-count {
    padding: 6px 12px;
    border-radius: 9999px;
  }
  .updates-list {
    list-style: none;
    border-radius: 0;
  }
  .updates-list li {
    border-block-start: 1px solid var(--outline-variant);
    border-radius: 0;
  }
  .update-row {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: start;
    gap: 16px;
    padding: 20px 24px;
    background: transparent;
    text-align: start;
    border-radius: 0;
  }
  .update-row:hover {
    background: color-mix(in srgb, var(--on-surface) 6%, transparent);
  }
  .update-row:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -4px;
  }
  .update-copy {
    display: grid;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }
  .update-status {
    display: grid;
    justify-items: center;
    gap: 12px;
    align-self: start;
  }
  .read-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: transparent;
  }
  .read-dot.is-unread {
    background: var(--primary);
  }
  .scale-controls {
    display: grid;
    grid-template-columns: minmax(160px, 1fr) minmax(0, 2fr);
    gap: 16px;
    margin-block-end: 24px;
  }
  .scale-comparison {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .type-sample {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 24px;
    padding: 28px;
    border-radius: 24px;
  }
  .type-sample p {
    margin: 0;
    flex: 1;
    overflow-wrap: anywhere;
  }
  .sample-metrics {
    display: grid;
    gap: 8px;
  }
  .sample-metrics code {
    overflow-wrap: anywhere;
    font-family: inherit;
  }
  @container (max-width: 16rem) {
    .poster-title {
      font-size: var(--typescale-display-small-emphasized-font-size);
      line-height: var(--typescale-display-small-emphasized-line-height);
    }
  }
  @media (max-width: 760px) {
    .event-story {
      grid-template-columns: 1fr;
    }
    .event-art {
      min-height: 240px;
    }
    .art-scene {
      min-height: 208px;
    }
    .art-window {
      height: 176px;
    }
    .event-copy {
      padding: 24px;
    }
    .scale-controls,
    .scale-comparison {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 400px) {
    .type-poster {
      padding: 16px;
    }
    .event-copy,
    .updates-header,
    .type-sample {
      padding: 20px;
    }
    .update-row {
      padding: 16px;
      gap: 12px;
    }
    .update-row :global(.q-avatar) {
      display: none;
    }
  }
</style>
