<script lang="ts">
  import { docsCtx } from "$docs/QDocs.svelte";
  import { QSwitchDocs } from "$components/switch/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QCard, QCardSection, QIcon, QItem, QItemSection, QList, QSwitch } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QSwitchDocs });

  let switchRef = $state<QSwitch>();
  let toggle = $state(false);
  let wifiEnabled = $state(true);
  let bluetoothEnabled = $state(false);
  let darkMode = $state(false);
  let notificationsEnabled = $state(true);
</script>

<svelte:head>
  <title>{pageTitle("QSwitch")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QCard>
      <QSwitch bind:value={toggle} label="Toggle me" icons />
    </QCard>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Usage">
        {#snippet sectionDescription()}
          QSwitch is a toggle component that allows users to switch between two states. It's
          commonly used for enabling or disabling features and toggling settings on or off.
        {/snippet}

        <div class="q-ma-sm">
          <QSwitch bind:this={switchRef} bind:value={toggle} label="Example setting" />
          <div class="q-mt-sm">Current value: {toggle ? "On" : "Off"}</div>
          <div class="q-mt-sm">
            <QBtn size="sm" label="Toggle programmatically" onclick={switchRef?.toggle} />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Switch with Label">
        {#snippet sectionDescription()}
          Use the <code>label</code> prop to add descriptive text to your switch. This improves usability
          by clearly communicating what the switch controls.
        {/snippet}

        <div class="q-ma-sm flex q-gap-md">
          <QSwitch bind:value={wifiEnabled} label="Enable Wi-Fi" />
          <QSwitch bind:value={bluetoothEnabled} label="Enable Bluetooth" />
          <QSwitch bind:value={notificationsEnabled} label="Enable Notifications" />
        </div>
      </QDocsSection>

      <QDocsSection title="Label Positioning">
        {#snippet sectionDescription()}
          Control the position of the label with the <code>labelPosition</code> prop. You can place the
          label on either the left or right side of the switch.
        {/snippet}

        <div class="q-ma-sm flex q-gap-md">
          <QSwitch bind:value={toggle} label="Right label (default)" labelPosition="right" />
          <QSwitch bind:value={toggle} label="Left label" labelPosition="left" />
        </div>
      </QDocsSection>

      <QDocsSection title="Switch with Icons">
        {#snippet sectionDescription()}
          Use the <code>icons</code> prop to display the default check/close icons, or provide custom
          icons that communicate the selected and unselected states unambiguously.
        {/snippet}

        <div class="q-ma-sm flex q-gap-md">
          <QSwitch bind:value={toggle} icons label="With default icons" />
          <QSwitch bind:value={toggle} showOnlyCheckedIcon label="Only checked icon" />
          <QSwitch
            bind:value={toggle}
            checkedIcon="volume_up"
            uncheckedIcon="volume_off"
            label="Sound"
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Disabled State">
        {#snippet sectionDescription()}
          Use the <code>disabled</code> prop to prevent interaction. Disabled switches use reduced-emphasis
          colors and don't respond to pointer or keyboard input.
        {/snippet}

        <div class="q-ma-sm flex q-gap-md">
          <QSwitch value={false} disabled label="Disabled - Off" />
          <QSwitch value={true} disabled label="Disabled - On" />
          <QSwitch value={true} icons disabled label="Disabled with icons" />
        </div>
      </QDocsSection>

      <QDocsSection title="Two-way Binding">
        {#snippet sectionDescription()}
          QSwitch supports Svelte's two-way binding with the <code>bind:value</code> directive. This makes
          it easy to sync the switch's state with your component's variables.
        {/snippet}

        <QCard class="q-ma-sm" style="max-width: 400px;">
          <QCardSection>
            <div class="text-h6">Dark Mode Settings</div>
            <div class="q-mt-md">
              <QSwitch bind:value={darkMode} label="Dark mode" />
            </div>
          </QCardSection>

          <QCardSection>
            <div class="text-subtitle2">Preview:</div>
            <div
              class="q-pa-md q-mt-sm"
              style="border-radius: 4px; border: 1px solid var(--outline); 
                    background-color: {darkMode ? 'var(--surface-container-highest)' : 'white'}; 
                    color: {darkMode ? 'white' : 'black'};"
            >
              This text changes based on the dark mode setting.
            </div>
          </QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="In Lists">
        {#snippet sectionDescription()}
          Make the whole item the switch when a larger target is useful, or keep the switch as the
          row's only control. Each setting applies immediately without a separate save action.
        {/snippet}

        <div class="flex q-gap-md">
          <QCard class="q-ma-sm">
            <QCardSection class="q-mb-sm">
              <div id="whole-item-switches-title" class="text-h6">Whole item</div>
            </QCardSection>

            <QList role="group" aria-labelledby="whole-item-switches-title">
              <QItem
                clickable
                role="switch"
                aria-checked={wifiEnabled}
                aria-label="Wi-Fi"
                onclick={() => (wifiEnabled = !wifiEnabled)}
              >
                <QItemSection type="avatar">
                  <QIcon name="wifi" />
                </QItemSection>
                <QItemSection>Wi-Fi</QItemSection>
                <QItemSection type="toggle">
                  <QSwitch value={wifiEnabled} inert aria-hidden="true" />
                </QItemSection>
              </QItem>

              <QItem
                clickable
                role="switch"
                aria-checked={bluetoothEnabled}
                aria-label="Bluetooth"
                onclick={() => (bluetoothEnabled = !bluetoothEnabled)}
              >
                <QItemSection type="avatar">
                  <QIcon name="bluetooth" />
                </QItemSection>
                <QItemSection>Bluetooth</QItemSection>
                <QItemSection type="toggle">
                  <QSwitch value={bluetoothEnabled} inert aria-hidden="true" />
                </QItemSection>
              </QItem>

              <QItem
                clickable
                role="switch"
                aria-checked={notificationsEnabled}
                aria-label="Notifications"
                onclick={() => (notificationsEnabled = !notificationsEnabled)}
              >
                <QItemSection type="avatar">
                  <QIcon name="notifications" />
                </QItemSection>
                <QItemSection>Notifications</QItemSection>
                <QItemSection type="toggle">
                  <QSwitch value={notificationsEnabled} inert aria-hidden="true" />
                </QItemSection>
              </QItem>
            </QList>
          </QCard>

          <QCard class="q-ma-sm">
            <QCardSection class="q-mb-sm">
              <div id="switch-only-settings-title" class="text-h6">Switch only</div>
            </QCardSection>

            <QList role="group" aria-labelledby="switch-only-settings-title">
              <QItem>
                <QItemSection>
                  {#snippet headline()}
                    Location Services
                  {/snippet}
                  {#snippet line1()}
                    Allow apps to use your location
                  {/snippet}
                </QItemSection>
                <QItemSection type="toggle">
                  <QSwitch aria-label="Location services" />
                </QItemSection>
              </QItem>

              <QItem>
                <QItemSection>
                  {#snippet headline()}
                    Activity Tracking
                  {/snippet}
                  {#snippet line1()}
                    Record app usage for personalized recommendations
                  {/snippet}
                </QItemSection>
                <QItemSection type="toggle">
                  <QSwitch aria-label="Activity tracking" />
                </QItemSection>
              </QItem>

              <QItem>
                <QItemSection>
                  {#snippet headline()}
                    Marketing Communications
                  {/snippet}
                  {#snippet line1()}
                    Receive emails about new features and offers
                  {/snippet}
                </QItemSection>
                <QItemSection type="toggle">
                  <QSwitch aria-label="Marketing communications" />
                </QItemSection>
              </QItem>
            </QList>
          </QCard>
        </div>
      </QDocsSection>

      <QDocsSection title="Event Handling">
        {#snippet sectionDescription()}
          QSwitch supports standard event handlers like <code>onclick</code> and
          <code>oninput</code>/<code>onchange</code>. This allows you to respond when the switch
          state changes.
        {/snippet}

        <div class="q-ma-sm">
          <QSwitch
            bind:value={toggle}
            label="Click me"
            onclick={() => console.log("Switch clicked")}
            oninput={() => console.log("Switch input")}
            onchange={() => alert(`Switch value changed to: ${toggle ? "On" : "Off"}`)}
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        {#snippet sectionDescription()}
          Give every switch a visible <code>label</code>, or an <code>aria-label</code> when nearby text
          already provides the visual label. QSwitch exposes its current state and supports keyboard navigation
          with a visible focus indicator.
        {/snippet}

        <div class="q-ma-sm">
          <div class="text-subtitle2 q-mb-sm">Keyboard Support:</div>
          <QList dense>
            <QItem>
              <QItemSection type="avatar">
                <QIcon name="chevron_right" />
              </QItemSection>
              <QItemSection>Tab: Focus the switch</QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="avatar">
                <QIcon name="chevron_right" />
              </QItemSection>
              <QItemSection>Space/Enter: Toggle the switch state</QItemSection>
            </QItem>
          </QList>

          <div class="q-mt-md">
            <QSwitch bind:value={toggle} label="Try using keyboard to toggle (Tab, then Space)" />
          </div>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
