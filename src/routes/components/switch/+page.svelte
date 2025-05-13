<script lang="ts">
  import { QSwitchDocs } from "$components/switch/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QBtn, QCard, QCardSection, QIcon, QItem, QItemSection, QList, QSwitch } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";

  let toggle = $state(false);
  let wifiEnabled = $state(true);
  let bluetoothEnabled = $state(false);
  let darkMode = $state(false);
  let notificationsEnabled = $state(true);
</script>

<svelte:head>
  <title>{pageTitle("QSwitch")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QSwitchDocs}>
  {#snippet display()}
    <QSwitch bind:value={toggle} label="Toggle me" icons />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Usage">
        {#snippet sectionDescription()}
          QSwitch is a toggle component that allows users to switch between two states. It's
          commonly used for enabling or disabling features and toggling settings on or off.
        {/snippet}

        <div class="q-ma-sm">
          <QSwitch bind:value={toggle} />
          <div class="q-mt-sm">Current value: {toggle ? "On" : "Off"}</div>
          <div class="q-mt-sm">
            <QBtn size="sm" label="Toggle programmatically" onclick={() => (toggle = !toggle)} />
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Switch with Label">
        {#snippet sectionDescription()}
          Use the <code>label</code> prop to add descriptive text to your switch. This improves usability
          by clearly communicating what the switch controls.
        {/snippet}

        <div class="q-ma-sm flex flex-col q-gap-md">
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

        <div class="q-ma-sm flex flex-col q-gap-md">
          <QSwitch bind:value={toggle} label="Right label (default)" labelPosition="right" />
          <QSwitch bind:value={toggle} label="Left label" labelPosition="left" />
        </div>
      </QDocsSection>

      <QDocsSection title="Switch with Icons">
        {#snippet sectionDescription()}
          Enhance visual feedback with icons inside the switch handle. Use the <code>icons</code>
          prop to display default check/close icons or specify custom icons with
          <code>checkedIcon</code>
          and <code>uncheckedIcon</code>.
        {/snippet}

        <div class="q-ma-sm flex flex-col q-gap-md">
          <QSwitch bind:value={toggle} icons label="With default icons" />
          <QSwitch bind:value={toggle} showOnlyCheckedIcon label="Only checked icon" />
          <QSwitch bind:value={toggle} checkedIcon="favorite" label="Custom checked icon" />
          <QSwitch bind:value={toggle} uncheckedIcon="warning" label="Custom unchecked icon" />
          <QSwitch
            bind:value={toggle}
            checkedIcon="brightness_7"
            uncheckedIcon="brightness_2"
            label="Custom both icons"
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Disabled State">
        {#snippet sectionDescription()}
          Use the <code>disabled</code> prop to prevent user interaction with the switch. Disabled switches
          maintain their appearance but don't respond to clicks or keyboard input.
        {/snippet}

        <div class="q-ma-sm flex flex-col q-gap-md">
          <QSwitch value={false} disabled label="Disabled - Off" />
          <QSwitch value={true} disabled label="Disabled - On" />
          <QSwitch value={true} icons disabled label="Disabled with icons" />
        </div>
      </QDocsSection>

      <QDocsSection title="Two-way Binding">
        {#snippet sectionDescription()}
          QSwitch supports Svelte's two-way binding with the <code>bind:value</code> directive. This
          makes it easy to sync the switch's state with your component's variables.
        {/snippet}

        <QCard class="q-ma-sm" style="max-width: 400px;">
          <QCardSection>
            <div class="text-h6">Dark Mode Settings</div>
            <div class="q-mt-md">
              <QSwitch
                bind:value={darkMode}
                icons
                checkedIcon="dark_mode"
                uncheckedIcon="light_mode"
                label="Enable Dark Mode"
              />
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

      <QDocsSection title="In Forms and Lists">
        {#snippet sectionDescription()}
          QSwitch can be integrated into forms and lists to create intuitive settings interfaces.
        {/snippet}

        <div class="flex q-gap-md">
          <QCard class="q-ma-sm">
            <QCardSection>
              <div class="text-h6">Settings</div>
            </QCardSection>

            <QList>
              <QItem tag="label">
                <QItemSection type="avatar">
                  <QIcon name="wifi" />
                </QItemSection>
                <QItemSection>Wi-Fi</QItemSection>
                <QItemSection type="toggle">
                  <QSwitch bind:value={wifiEnabled} />
                </QItemSection>
              </QItem>

              <QItem tag="label">
                <QItemSection type="avatar">
                  <QIcon name="bluetooth" />
                </QItemSection>
                <QItemSection>Bluetooth</QItemSection>
                <QItemSection type="toggle">
                  <QSwitch bind:value={bluetoothEnabled} />
                </QItemSection>
              </QItem>

              <QItem tag="label">
                <QItemSection type="avatar">
                  <QIcon name="notifications" />
                </QItemSection>
                <QItemSection>Notifications</QItemSection>
                <QItemSection type="toggle">
                  <QSwitch bind:value={notificationsEnabled} />
                </QItemSection>
              </QItem>
            </QList>
          </QCard>

          <QCard class="q-ma-sm">
            <QCardSection>
              <div class="text-h6">Privacy Settings</div>
            </QCardSection>

            <QList>
              <QItem tag="label">
                <QItemSection>
                  {#snippet headline()}
                    Location Services
                  {/snippet}
                  {#snippet line1()}
                    Allow apps to use your location
                  {/snippet}
                </QItemSection>
                <QItemSection type="toggle">
                  <QSwitch />
                </QItemSection>
              </QItem>

              <QItem tag="label">
                <QItemSection>
                  {#snippet headline()}
                    Activity Tracking
                  {/snippet}
                  {#snippet line1()}
                    Record app usage for personalized recommendations
                  {/snippet}
                </QItemSection>
                <QItemSection type="toggle">
                  <QSwitch />
                </QItemSection>
              </QItem>

              <QItem tag="label">
                <QItemSection>
                  {#snippet headline()}
                    Marketing Communications
                  {/snippet}
                  {#snippet line1()}
                    Receive emails about new features and offers
                  {/snippet}
                </QItemSection>
                <QItemSection type="toggle">
                  <QSwitch />
                </QItemSection>
              </QItem>
            </QList>
          </QCard>
        </div>
      </QDocsSection>

      <QDocsSection title="Event Handling">
        {#snippet sectionDescription()}
          QSwitch supports standard event handlers like <code>onclick</code> and
          <code>onchange</code>. This allows you to perform actions when the switch state changes.
        {/snippet}

        <div class="q-ma-sm">
          <QSwitch
            bind:value={toggle}
            label="Click me"
            onclick={() => console.log("Switch clicked")}
            onchange={() => alert(`Switch value changed to: ${toggle ? "On" : "Off"}`)}
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Accessibility" noCode>
        {#snippet sectionDescription()}
          QSwitch is built with accessibility in mind. It includes proper ARIA attributes, supports
          keyboard navigation, and provides visual feedback.
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
