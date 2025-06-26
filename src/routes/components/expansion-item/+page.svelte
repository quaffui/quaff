<script lang="ts">
  import { QExpansionItemDocs } from "$components/expansion-item/docs";
  import { QExpansionItem, QList, QItemSection, QIcon, QSwitch, QBtn } from "$components";
  import { QDocs, QDocsSection } from "$components/private";
  import { pageTitle } from "$helpers/pageTitle";
  import snippets from "./docs.snippets";

  let customExpandedValue = $state(false);
  let switchValue = $state(true);
</script>

<svelte:head>
  <title>{pageTitle("QExpansionItem")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QExpansionItemDocs}>
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

      <QDocsSection title="With name group (accordion)">
        {#snippet sectionDescription()}
          Use the <code>name</code> prop to group expansion items together, creating accordion behavior
          where only one item in the group can be expanded at a time.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem label="First section" icon="folder" name="group1">
            <p>
              This is the first section of the accordion. When you expand another item in this
              group, this one will automatically close.
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
            <p>And this is the third section of our accordion group.</p>
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

      <QDocsSection title="Expand icon toggle">
        {#snippet sectionDescription()}
          Use <code>expandIconToggle</code> to make only the expand icon clickable, while the rest of
          the header can be used for navigation or other actions.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem
            label="Navigation item"
            caption="Click the arrow to expand, or the text to navigate"
            icon="home"
            to="/components/button"
            expandIconToggle
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
            expandIconToggle
          >
            <p>This demonstrates using an external link with expand icon toggle functionality.</p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Dense style">
        {#snippet sectionDescription()}
          Use the <code>dense</code> prop to create more compact expansion items, useful when you need
          to display many items in limited space.
        {/snippet}

        <div class="flex q-gap-md">
          <div class="body-large">Regular size:</div>
          <QList bordered separator class="flex-1">
            <QExpansionItem label="Regular item" icon="folder">
              <p>This is a regular-sized expansion item.</p>
            </QExpansionItem>
            <QExpansionItem label="Another regular item" icon="description">
              <p>Another regular-sized item for comparison.</p>
            </QExpansionItem>
          </QList>

          <div class="body-large">Dense:</div>
          <QList bordered separator class="flex-1">
            <QExpansionItem label="Dense item" icon="folder" dense>
              <p>This is a dense expansion item - more compact.</p>
            </QExpansionItem>
            <QExpansionItem label="Another dense item" icon="description" dense>
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
            <QSwitch bind:value={customExpandedValue} />
            <span>Toggle controlled expansion item</span>
          </div>
        {/snippet}

        <QList bordered separator>
          <QExpansionItem
            label="Controlled expansion item"
            icon="settings"
            bind:value={customExpandedValue}
          >
            <p>This expansion item is controlled by the switch below.</p>
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
          Use the <code>summary</code> snippet to completely customize the header layout. The
          snippet receives an object with <code>expanded</code> state and control functions.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem>
            {#snippet summary({ expanded, toggle })}
              <QItemSection type="thumbnail">
                <img src="/cocktail.jpg" alt="User avatar" class="rounded-full" />
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
              <QItemSection type="trailingIcon">
                <QBtn
                  icon={expanded ? "remove" : "add"}
                  flat
                  color="on-surface"
                  tag="span"
                  tabindex={-1}
                  aria-label={expanded ? "Collapse details" : "Expand details"}
                  onclick={toggle}
                  style="margin: 0; margin-right: -8px;"
                />
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
            {#snippet summary({ expanded })}
              <QItemSection type="icon">
                <QIcon name="notifications" />
              </QItemSection>
              <QItemSection>
                <span>Notification Settings</span>
              </QItemSection>
              <QItemSection type="trailingIcon">
                <QIcon name={expanded ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
              </QItemSection>
            {/snippet}

            <div class="q-pa-md">
              <div class="q-mb-sm">Configure your notification preferences:</div>
              <div>• Email notifications: {switchValue ? "Enabled" : "Disabled"}</div>
              <div>• Push notifications: Enabled</div>
              <div>• SMS notifications: Disabled</div>
            </div>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Navigation and links">
        {#snippet sectionDescription()}
          QExpansionItem can function as a navigation element using <code>to</code> or
          <code>href</code>
          for routes and external links. If not combined with <code>expandIconToggle</code>,
          clicking the header will not expand the content, but rather navigate to the specified
          route or link (making the use of <code>QExpansionItem</code> kind of useless).
        {/snippet}

        <QList bordered separator>
          <QExpansionItem
            label="Internal navigation"
            caption="Click to navigate to buttons page"
            icon="touch_app"
            to="/components/button"
          >
            <p>This item navigates to the buttons component page when clicked.</p>
          </QExpansionItem>

          <QExpansionItem
            label="External link"
            caption="Opens in current tab"
            icon="link"
            href="https://svelte.dev"
          >
            <p>This item navigates to an external website when clicked.</p>
          </QExpansionItem>

          <QExpansionItem
            label="Dual functionality"
            caption="Click text to navigate, arrow to expand"
            icon="open_in_new"
            to="/components/list"
            expandIconToggle
          >
            <p>
              The header text navigates to the list component, while the arrow icon toggles this
              content.
            </p>
          </QExpansionItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Accessibility">
        {#snippet sectionDescription()}
          QExpansionItem includes accessibility features like ARIA labels and keyboard navigation.
          Use <code>toggleAriaLabel</code> to customize the accessibility label for the toggle button.
        {/snippet}

        <QList bordered separator>
          <QExpansionItem
            label="FAQ Item 1"
            caption="What is Quaff?"
            icon="help"
            toggleAriaLabel="Show answer to: What is Quaff?"
          >
            <p>
              Quaff is a comprehensive UI component library built with Svelte 5, designed to help
              developers create beautiful and accessible web applications quickly and efficiently.
            </p>
          </QExpansionItem>

          <QExpansionItem
            label="FAQ Item 2"
            caption="How do I get started?"
            icon="help"
            toggleAriaLabel="Show answer to: How do I get started?"
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
          A comprehensive example combining multiple features: accordion grouping, custom icons,
          dense styling, and mixed content types.
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
