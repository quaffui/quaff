<script lang="ts">
  import { QSwitchDocs } from "#components/switch/docs.js";
  import { QDocs, QDocsSection } from "#docs";
  import { docsCtx } from "#docs/QDocs.svelte";
  import { QBtn, QIcon, QItem, QItemSection, QList, QSwitch } from "#lib";
  import { useMeta } from "#lib/meta.js";
  import { pageMeta } from "#docs/metadata.js";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QSwitch — Switch",
      "Toggle settings with QSwitch for Svelte. Explore labels, icons, two-way binding, disabled states, list integration, events, and accessible usage."
    )
  );

  docsCtx.set({ snippets, componentDocs: QSwitchDocs });

  let hasPlatformLights = $state(true);
  let shouldUseHilltopRoute = $state(false);
  let shouldPlaceLabelsLeft = $state(false);
  let hasTrackPower = $state(true);
  let hasStationSigns = $state(true);
  let hasTunnelLights = $state(false);
  let isDepartureAllowed = $state(false);
  let departureSwitch = $state<ReturnType<typeof QSwitch>>();
  let leverEvents = $state<string[]>([]);

  const route = $derived(shouldUseHilltopRoute ? "Hilltop loop" : "Platform one");
  const isSignalClear = $derived(hasTrackPower && isDepartureAllowed);
  const signal = $derived.by(() => {
    if (!hasTrackPower) {
      return "Power off";
    }

    return isSignalClear ? "Clear" : "Stop";
  });

  function recordEvent(event: "click" | "input" | "change") {
    leverEvents = [...leverEvents, `${event}: ${isDepartureAllowed ? "on" : "off"}`].slice(-6);
  }
</script>

{#snippet renderClearIcon()}
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path
      d="m4 8 3 3 5-6"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round" />
  </svg>
{/snippet}
{#snippet renderStopIcon()}
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"
    ><rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" /></svg>
{/snippet}

<QDocs>
  {#snippet display()}
    <div class="switch-preview surface overflow-auto q-pa-lg">
      <p class="label-medium text-primary q-mt-none q-mb-md">RAILWAY SETTINGS</p>
      <QSwitch bind:value={hasPlatformLights} label="Platform lamps" icons />
      <p class="body-medium q-mb-none" role="status">Lamps {hasPlatformLights ? "on" : "off"}</p>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Value and Labels">
      {#snippet sectionDescription()}
        Bind <code>value</code> to a boolean for a setting that applies immediately. The default
        <code>labelPosition="right"</code> puts the label after the switch; use <code>"left"</code>
        to put it before. Toggle label placement below to compare.
      {/snippet}
      <QSwitch bind:value={shouldPlaceLabelsLeft} label="Labels on the left" class="q-mb-md" />
      <div class="signal-box bg-surface-container-low q-pa-lg">
        <h3 class="title-medium q-mt-none q-mb-lg">Platform settings</h3>
        <div class="scene-controls flex items-center q-gap-y-md">
          <QSwitch
            bind:value={hasPlatformLights}
            label="Platform lamps"
            labelPosition={shouldPlaceLabelsLeft ? "left" : "right"}
            icons />
          <QSwitch
            bind:value={shouldUseHilltopRoute}
            label="Use hilltop loop"
            labelPosition={shouldPlaceLabelsLeft ? "left" : "right"}
            showOnlyCheckedIcon />
        </div>
        <p class="scene-status body-medium" role="status">
          <strong>{route}</strong> · Signal: {signal.toLowerCase()} · Platform lamps {hasPlatformLights
            ? "on"
            : "off"}
        </p>
      </div>
      <p class="body-medium q-mt-md q-mb-none">
        <code>icons</code> adds the default check and close symbols.
        <code>showOnlyCheckedIcon</code>
        shows a check only when the switch is on.
      </p>
    </QDocsSection>

    <QDocsSection title="Custom Icons and Events">
      {#snippet sectionDescription()}
        Use Material Symbol names or snippets for <code>checkedIcon</code> and
        <code>uncheckedIcon</code>. This lever uses two small SVG snippets. A component reference
        exposes <code>toggle()</code>; both the switch and the desk button below update the same
        value.
      {/snippet}
      <div class="lever-card bg-surface-container-low q-pa-lg">
        <div class="flex no-wrap items-center q-gap-md">
          <div
            class="signal-lamp flex no-wrap flex-center"
            class:error-container={hasTrackPower && !isSignalClear}
            class:success-container={isSignalClear}
            class:bg-surface-container-highest={!hasTrackPower}
            class:text-on-surface-variant={!hasTrackPower}
            aria-hidden="true">
            <QIcon name={isSignalClear ? "check" : "stop"} size="32px" />
          </div>
          <div class="signal-copy min-width-0">
            <div class="label-medium text-on-surface-variant">DEPARTURE SIGNAL</div>
            <h3 class="headline-small q-ma-none">{signal}</h3>
          </div>
        </div>
        <div class="lever-controls flex items-center q-gap-y-md q-mt-lg">
          <QSwitch
            bind:this={departureSwitch}
            bind:value={isDepartureAllowed}
            label="Allow departure"
            disabled={!hasTrackPower}
            checkedIcon={renderClearIcon}
            uncheckedIcon={renderStopIcon}
            onclick={() => recordEvent("click")}
            oninput={() => recordEvent("input")}
            onchange={() => recordEvent("change")} />
          <QBtn
            variant="tonal"
            icon="touch_app"
            label="Operate desk lever"
            disabled={!hasTrackPower}
            onclick={() => departureSwitch?.toggle()} />
        </div>
        <p class="body-medium text-on-surface-variant q-mt-md q-mb-none">
          {hasTrackPower
            ? "The departure setting controls the signal above."
            : "Track power is off. Restore it in the supply cabinet to operate the lever."}
        </p>
        <div class="event-record no-border-radius q-mt-lg">
          <h4 class="title-medium q-ma-none">Lever activity</h4>
          <p class="body-small text-on-surface-variant q-mt-xs q-mb-sm">
            <code>click</code> sees the previous value; <code>input</code> and <code>change</code>
            see the new value. The method emits <code>input</code> and <code>change</code>.
          </p>
          <ol
            class="event-list body-medium flex q-gap-y-sm q-pa-none q-ma-none"
            aria-label="Latest switch events"
            aria-live="polite"
            aria-relevant="additions text">
            {#each leverEvents as event, index (index)}
              <li><code>{event}</code></li>
            {:else}<li>Operate the lever to see its events.</li>{/each}
          </ol>
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Settings in a List">
      {#snippet sectionDescription()}
        A whole row can be a switch, with an inert visual QSwitch inside it. Alternatively, keep the
        row passive and make QSwitch its only control. Both patterns below apply a setting
        immediately; each setting has one keyboard target.
      {/snippet}
      <div class="cabinet-grid items-start q-gap-lg">
        <section
          class="cabinet border min-width-0 bg-surface-container-low"
          aria-labelledby="railway-supply-heading">
          <h3 id="railway-supply-heading" class="title-large cabinet-title">Supply cabinet</h3>
          <QList preserveTabOrder>
            <QItem
              clickable
              role="switch"
              aria-checked={hasTrackPower}
              aria-label="Track power"
              onclick={() => (hasTrackPower = !hasTrackPower)}>
              <QItemSection>
                {#snippet headline()}Track power{/snippet}
                {#snippet line1()}Supply the locomotive and departure signal.{/snippet}
              </QItemSection>
              <QItemSection type="toggle">
                <QSwitch
                  value={hasTrackPower}
                  checkedIcon="power_settings_new"
                  uncheckedIcon="power_off"
                  inert
                  aria-hidden="true" />
              </QItemSection>
            </QItem>
            <QItem
              clickable
              role="switch"
              aria-checked={hasStationSigns}
              aria-label="Station signs"
              onclick={() => (hasStationSigns = !hasStationSigns)}>
              <QItemSection>
                {#snippet headline()}Station signs{/snippet}
                {#snippet line1()}Show the nameboard on station displays.{/snippet}
              </QItemSection>
              <QItemSection type="toggle"
                ><QSwitch value={hasStationSigns} inert aria-hidden="true" /></QItemSection>
            </QItem>
          </QList>
        </section>
        <section
          class="cabinet border min-width-0 bg-surface-container-low"
          aria-labelledby="railway-trackside-heading">
          <h3 id="railway-trackside-heading" class="title-large cabinet-title">
            Trackside details
          </h3>
          <QList preserveTabOrder>
            <QItem>
              <QItemSection>
                {#snippet headline()}Tunnel lamps{/snippet}
                {#snippet line1()}Light the entrance to the hilltop tunnel.{/snippet}
              </QItemSection>
              <QItemSection type="toggle"
                ><QSwitch
                  bind:value={hasTunnelLights}
                  aria-label="Tunnel lamps"
                  checkedIcon="light_mode"
                  uncheckedIcon="dark_mode" /></QItemSection>
            </QItem>
            <QItem>
              <QItemSection>
                {#snippet headline()}Crossing gate{/snippet}
                {#snippet line1()}Always enabled during visiting hours.{/snippet}
              </QItemSection>
              <QItemSection type="toggle"
                ><QSwitch value={true} icons disabled aria-label="Crossing gate" /></QItemSection>
            </QItem>
            <QItem>
              <QItemSection>
                {#snippet headline()}Workshop spur{/snippet}
                {#snippet line1()}Closed while its track is being repaired.{/snippet}
              </QItemSection>
              <QItemSection type="toggle"
                ><QSwitch value={false} disabled aria-label="Workshop spur" /></QItemSection>
            </QItem>
          </QList>
        </section>
      </div>
    </QDocsSection>

    <QDocsSection title="Accessibility" noCode>
      <p>
        Name switches with a visible <code>label</code>, <code>aria-labelledby</code> referencing
        nearby text, or <code>aria-label</code>. Keep labels stable; <code>aria-checked</code> exposes
        the on/off state.
      </p>
      <p>
        Tab and Shift+Tab move focus; Space or Enter toggles. <code>disabled</code> prevents user interaction
        and removes the tab stop.
      </p>
      <p>
        For clickable rows, put <code>role="switch"</code>, an accessible name and
        <code>aria-checked</code> on the row. Make its <code>QSwitch</code> <code>inert</code> and
        <code>aria-hidden="true"</code> to keep one keyboard target.
      </p>
    </QDocsSection>
  {/snippet}
</QDocs>

<style lang="scss">
  @use "$css/mixins";

  code {
    overflow-wrap: anywhere;
  }

  .switch-preview {
    max-width: 360px;
    max-height: 100%;
    border-radius: 24px;
  }
  .signal-box,
  .lever-card {
    max-width: 760px;
    border-radius: 24px;
  }
  .signal-copy {
    overflow-wrap: anywhere;
  }
  .scene-controls,
  .lever-controls {
    column-gap: 32px;
  }
  .scene-controls :global(.q-switch),
  .lever-controls :global(.q-switch) {
    max-width: 100%;
  }
  .scene-status {
    margin-top: 20px;
    overflow-wrap: anywhere;
  }
  .signal-lamp {
    flex: none;
    width: 64px;
    height: 64px;
    border-radius: 20px;
  }
  .event-record {
    padding-top: 20px;
    border-top: 1px solid var(--outline-variant);
  }
  .event-list {
    column-gap: 20px;
    list-style: none;
  }
  .cabinet-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  }
  .cabinet {
    border-radius: 24px;
  }
  .cabinet-title {
    padding: 20px;
    overflow-wrap: anywhere;
  }
  .cabinet :global(.q-item__section--content) {
    overflow-wrap: anywhere;
  }
  @include mixins.up-to-sm {
    .signal-box,
    .lever-card {
      padding: 16px;
    }
  }
</style>
