<script lang="ts">
  import { QExpansionItemDocs } from "$components/expansion-item/docs";
  import { QExpansionItem, QItem, QList, QItemSection, QIcon, QSwitch } from "$components";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QExpansionItemDocs });

  let customExpandedValue = $state(false);
</script>

<svelte:head>
  <title>{pageTitle("QExpansionItem")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QList bordered class="surface" style="max-width: 75%">
      <QExpansionItem label="Click me" icon="waving_hand">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia aliquid facere,
      </QExpansionItem>
    </QList>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic">
        {#snippet sectionDescription()}
          <code>QExpansionItem</code> is a collapsible component that displays content within an expandable
          container. It's perfect for organizing information into collapsible sections like FAQs, settings
          panels, or nested navigation.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem label="Click me" icon="waving_hand">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia aliquid facere,
              dolorem iusto amet quas ad nesciunt, error molestias nostrum quisquam unde a minima
              molestiae natus omnis nulla magni exercitationem.
            </p>
          </QExpansionItem>
          <QExpansionItem
            label="Another expansion item"
            caption="But this time, with a caption"
            icon="cookie"
          >
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt atque libero autem
              velit magni similique porro laborum temporibus excepturi, nobis, alias numquam
              molestiae eaque, unde qui accusantium ullam reiciendis facilis!
            </p>
          </QExpansionItem>
          <QExpansionItem label="No ripple effect" icon="ripples" noRipple>
            <p>
              This item's ripple effect has been disabled with the <code>noRipple</code> prop, making
              it suitable for static content or when you want to avoid visual feedback.
            </p>
          </QExpansionItem>
          <QExpansionItem label="Disabled expansion item" icon="lock" disabled>
            <p>This item is disabled and cannot be interacted with.</p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Mutually exclusive groups">
        {#snippet sectionDescription()}
          Use the <code>name</code> prop when only one item in a group should be expanded at a time.
          Groups are scoped to their containing <code>QList</code>.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem label="First section" icon="folder" name="group1">
            <p>
              This is the first section. When you expand another item in this group, this one will
              automatically close.
            </p>
          </QExpansionItem>
          <QExpansionItem
            label="Second section"
            caption="With a helpful caption"
            icon="description"
            name="group1"
          >
            <p>
              This is the second section. Notice how expanding this closes the previous section
              automatically.
            </p>
          </QExpansionItem>
          <QExpansionItem label="Third section" icon="settings" name="group1">
            <p>And this is the third section of our mutually exclusive group.</p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Expressive and segmented lists">
        {#snippet sectionDescription()}
          The header reuses <code>QItem</code>, so density and expressive list styling are inherited
          from the containing <code>QList</code>. Expanded items use the Material 3 large container
          shape and surface colors.
        {/snippet}

        <QList expressive segmented>
          <QExpansionItem
            label="Projects"
            caption="Three active projects"
            icon="folder"
            defaultOpened
          >
            <QList expressive segmented aria-label="Projects">
              <QItem>
                <QItemSection>Design system</QItemSection>
              </QItem>
              <QItem>
                <QItemSection>Documentation</QItemSection>
              </QItem>
              <QItem>
                <QItemSection>Mobile app</QItemSection>
              </QItem>
            </QList>
          </QExpansionItem>
          <QExpansionItem label="Archive" icon="archive">
            Archived projects appear here.
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Custom expand icons">
        {#snippet sectionDescription()}
          Customize the expand/collapse icons using <code>expandIcon</code> and
          <code>expandedIcon</code>
          props. If only <code>expandIcon</code> is provided, it will rotate when expanded. You can
          disable this rotation with the <code>noRotateExpandIcon</code> prop.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem label="Custom expand icon" icon="star" expandIcon="arrow_drop_down">
            <p>This item uses a dropdown arrow icon that rotates when expanded.</p>
          </QExpansionItem>
          <QExpansionItem
            label="Different expand/collapse icons"
            icon="visibility"
            expandIcon="add"
            expandedIcon="remove"
          >
            <p>This item uses different icons for expanded and collapsed states.</p>
          </QExpansionItem>
          <QExpansionItem
            label="Custom icon with no rotation"
            icon="rotate_left"
            noRotateExpandIcon
            expandIcon="lock"
          >
            <p>
              This item uses a custom icon that does not rotate when expanded, thanks to the
              <code>noRotateExpandIcon</code> prop.
            </p>
          </QExpansionItem>
          <QExpansionItem label="No expand icon" icon="visibility_off" hideExpandIcon>
            <p>This item has no expand icon - click anywhere on the header to toggle.</p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Links and separate toggles">
        {#snippet sectionDescription()}
          Linked headers automatically keep navigation and expansion as separate sibling actions.
          The default non-linked pattern keeps the whole row clickable, as specified by Material 3.
          <code>expandIconToggle</code> remains available as a legacy product-specific override when only
          the trailing control should expand the panel.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem
            label="Navigation item"
            caption="Click the arrow to expand, or the text to navigate"
            icon="home"
            to="/components/button"
          >
            <p>
              The main header area navigates to a different page, while only the expand icon toggles
              the content.
            </p>
          </QExpansionItem>
          <QExpansionItem
            label="External link"
            caption="Opens in new tab"
            icon="link"
            href="https://example.com"
            target="_blank"
          >
            <p>
              The link and disclosure button are separate actions within the list's arrow-key order.
            </p>
          </QExpansionItem>
          <QExpansionItem
            label="Separate disclosure control"
            caption="Only the trailing button expands this item"
            icon="info"
            expandIconToggle
          >
            <p>The rest of this non-linked header is intentionally non-interactive.</p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Dense style">
        {#snippet sectionDescription()}
          Set <code>dense</code> on one expansion item or on the containing list to use the legacy compact
          layout. Prefer regular density for touch interfaces.
        {/snippet}

        <div class="flex q-gap-md">
          <div class="body-large">Regular size:</div>
          <QList bordered separator>
            <QExpansionItem label="Regular item" icon="folder">
              <p>This is a regular-sized expansion item.</p>
            </QExpansionItem>
            <QExpansionItem label="Another regular item" icon="description">
              <p>Another regular-sized item for comparison.</p>
            </QExpansionItem>
          </QList>

          <div class="body-large">Dense:</div>
          <QList bordered separator dense>
            <QExpansionItem label="Dense item" icon="folder">
              <p>This is a dense expansion item - more compact.</p>
            </QExpansionItem>
            <QExpansionItem label="Another dense item" icon="description">
              <p>Another dense item showing the space savings.</p>
            </QExpansionItem>
          </QList>
        </div>
      </QDocsSection>

      <QDocsSection title="Default opened and controlled state">
        {#snippet sectionDescription()}
          Use <code>defaultOpened</code> to have items expanded by default, or bind to the
          <code>value</code>
          prop to control the expansion state programmatically.

          <div class="q-mt-md flex items-center q-gap-sm">
            <QSwitch bind:value={customExpandedValue} label="Toggle controlled expansion item" />
          </div>
        {/snippet}

        <QList bordered separator>
          <QExpansionItem
            label="Controlled expansion item"
            icon="settings"
            bind:value={customExpandedValue}
          >
            <p>This expansion item is controlled by the switch above.</p>
          </QExpansionItem>
          <QExpansionItem label="Opened by default" icon="info" defaultOpened>
            <p>This expansion item is opened by default when the page loads.</p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Custom animation duration">
        {#snippet sectionDescription()}
          Customize the expand/collapse animation speed using the <code>duration</code> prop (in milliseconds).
        {/snippet}

        <QList bordered separator>
          <QExpansionItem
            label="Fast animation"
            caption="150ms duration"
            icon="flash_on"
            duration={150}
          >
            <p>This item expands and collapses quickly with a 150ms animation.</p>
          </QExpansionItem>
          <QExpansionItem
            label="Slow animation"
            caption="800ms duration"
            icon="hourglass_empty"
            duration={800}
          >
            <p>This item has a slower, more deliberate animation at 800ms.</p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Custom summary with complex layouts">
        {#snippet sectionDescription()}
          Use the <code>summary</code> snippet to customize the header's list-item sections. The expansion
          item supplies the trailing disclosure control, so the custom summary should not add another
          interactive control.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem>
            {#snippet summary()}
              <QItemSection type="thumbnail">
                <img src="/cocktail.jpg" alt="User avatar" />
              </QItemSection>
              <QItemSection>
                {#snippet headline()}
                  John Smith
                {/snippet}
                {#snippet line1()}
                  Senior Developer
                {/snippet}
                {#snippet line2()}
                  <span class="text-primary">Click to view details</span>
                {/snippet}
              </QItemSection>
            {/snippet}

            <div class="q-pa-md">
              <div class="body-large q-mb-sm">Contact Information</div>
              <div>Email: john.smith@company.com</div>
              <div>Phone: +1 (555) 123-4567</div>
              <div>Department: Engineering</div>
              <div>Location: San Francisco, CA</div>
            </div>
          </QExpansionItem>

          <QExpansionItem>
            {#snippet summary()}
              <QItemSection type="icon">
                <QIcon name="notifications" aria-hidden="true" />
              </QItemSection>
              <QItemSection>
                <span>Notification Settings</span>
              </QItemSection>
            {/snippet}

            <div class="q-pa-md">
              <div class="q-mb-sm">Configure your notification preferences:</div>
              <div>• Email notifications: Enabled</div>
              <div>• Push notifications: Enabled</div>
              <div>• SMS notifications: Disabled</div>
            </div>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Accessibility">
        {#snippet sectionDescription()}
          The whole-row trigger exposes <code>aria-expanded</code> and supports Enter and Space. Tab
          enters the list's current action; arrow keys move through its rows and any separate
          actions. Separate toggles get a state-aware label automatically; use
          <code>toggleAriaLabel</code>
          when a different stable name is more useful. Do not set <code>selection</code> on a
          <code>QList</code> containing expansion items: disclosures are actions, not listbox options.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem label="FAQ Item 1" caption="What is Quaff?" icon="help">
            <p>
              Quaff is a comprehensive UI component library built with Svelte 5, designed to help
              developers create beautiful and accessible web applications quickly and efficiently.
            </p>
          </QExpansionItem>

          <QExpansionItem
            label="FAQ Item 2"
            caption="How do I get started?"
            icon="help"
            expandIconToggle
            toggleAriaLabel="Toggle answer: How do I get started?"
          >
            <p>
              Getting started is easy! Install the package and start building, the components are
              auto-imported. Check our documentation for detailed examples and API references.
            </p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Complex example">
        {#snippet sectionDescription()}
          A comprehensive example combining multiple features: mutually exclusive grouping, custom
          icons, dense styling, and mixed content types.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem
            label="Account Settings"
            icon="account_circle"
            name="settings-group"
            dense
          >
            <div class="q-pa-md">
              <div class="body-large q-mb-sm">Profile Information</div>
              <div>Update your personal information and preferences.</div>
            </div>
          </QExpansionItem>

          <QExpansionItem
            label="Privacy Settings"
            caption="Control your privacy and data sharing"
            icon="privacy_tip"
            name="settings-group"
            dense
          >
            <div class="q-pa-md">
              <div class="body-large q-mb-sm">Privacy Controls</div>
              <div>• Data sharing: Limited</div>
              <div>• Profile visibility: Friends only</div>
              <div>• Activity status: Hidden</div>
            </div>
          </QExpansionItem>

          <QExpansionItem
            label="Notification Preferences"
            icon="notifications"
            name="settings-group"
            dense
            expandIcon="tune"
            noRotateExpandIcon
          >
            <div class="q-pa-md">
              <div class="body-large q-mb-sm">Notification Types</div>
              <div>Configure how and when you receive notifications.</div>
            </div>
          </QExpansionItem>

          <QExpansionItem
            label="Security"
            caption="Two-factor authentication and password settings"
            icon="security"
            name="settings-group"
            dense
            expandIcon="lock"
            expandedIcon="lock_open"
          >
            <div class="q-pa-md">
              <div class="body-large q-mb-sm">Security Settings</div>
              <div>• Two-factor authentication: Enabled</div>
              <div>• Login alerts: Enabled</div>
              <div>• Password strength: Strong</div>
            </div>
          </QExpansionItem>
        </QList>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
