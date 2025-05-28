<script lang="ts">
  import { QItemDocs, QItemSectionDocs, QListDocs } from "$components/list/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QAvatar, QCheckbox, QIcon, QItem, QItemSection, QList, QSwitch } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";

  let selectedItem = $state(0);
  let checkboxValue = $state(false);
  let switchValue = $state(false);
</script>

<svelte:head>
  <title>{pageTitle("QList")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={[QListDocs, QItemDocs, QItemSectionDocs]}>
  {#snippet display()}
    <QList bordered>
      <QItem clickable>
        <QItemSection type="avatar">
          <QIcon name="inbox" />
        </QItemSection>
        <QItemSection>
          <span>Inbox</span>
        </QItemSection>
        <QItemSection type="trailingText">
          <span>4</span>
        </QItemSection>
      </QItem>
      <QItem clickable>
        <QItemSection type="avatar">
          <QIcon name="send" />
        </QItemSection>
        <QItemSection>
          <span>Sent</span>
        </QItemSection>
      </QItem>
      <QItem clickable>
        <QItemSection type="avatar">
          <QIcon name="delete" />
        </QItemSection>
        <QItemSection>
          <span>Trash</span>

          {#snippet line1()}
            <span>Deleted items are kept for 30 days</span>
          {/snippet}
        </QItemSection>
      </QItem>
    </QList>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic List">
        {#snippet sectionDescription()}
          QList is a versatile component that displays a collection of items in a vertical layout.
          It integrates with QItem and QItemSection components to create structured content.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem>
            <QItemSection>Basic Item</QItemSection>
          </QItem>
          <QItem>
            <QItemSection>Simple List Item</QItemSection>
          </QItem>
          <QItem>
            <QItemSection>Another Item</QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="List with Icons">
        {#snippet sectionDescription()}
          Lists can include icons for visual identification. Use the QItemSection component with
          <code>type="icon"</code> to display icons alongside your content.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem>
            <QItemSection type="icon">
              <QIcon name="inbox" />
            </QItemSection>
            <QItemSection>Inbox</QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="icon">
              <QIcon name="send" />
            </QItemSection>
            <QItemSection>Sent</QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="icon">
              <QIcon name="delete" />
            </QItemSection>
            <QItemSection>Trash</QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Clickable Items">
        {#snippet sectionDescription()}
          Use the <code>clickable</code> prop on QItem to make items interactive. Clickable items
          include a ripple effect when clicked and can have the <code>active</code> prop to indicate
          the selected item.
        {/snippet}

        <QList bordered class="q-my-md" activeClass="primary">
          <QItem clickable active={selectedItem === 0} onclick={() => (selectedItem = 0)}>
            <QItemSection type="icon">
              <QIcon name="inbox" />
            </QItemSection>
            <QItemSection>Inbox</QItemSection>
          </QItem>
          <QItem clickable active={selectedItem === 1} onclick={() => (selectedItem = 1)}>
            <QItemSection type="icon">
              <QIcon name="send" />
            </QItemSection>
            <QItemSection>Sent</QItemSection>
          </QItem>
          <QItem clickable active={selectedItem === 2} onclick={() => (selectedItem = 2)}>
            <QItemSection type="icon">
              <QIcon name="delete" />
            </QItemSection>
            <QItemSection>Trash</QItemSection>
          </QItem>
        </QList>
        <div class="q-mt-sm">Selected item: {["Inbox", "Sent", "Trash"][selectedItem]}</div>
      </QDocsSection>

      <QDocsSection title="List with Separators">
        {#snippet sectionDescription()}
          Enable the <code>separator</code> prop to add dividers between list items. You can also
          customize the separators using the <code>separatorOptions</code> prop to change their appearance.
        {/snippet}

        <QList bordered separator class="q-my-md">
          <QItem>
            <QItemSection>Item with separators</QItemSection>
          </QItem>
          <QItem>
            <QItemSection>Another item</QItemSection>
          </QItem>
          <QItem>
            <QItemSection>Last item</QItemSection>
          </QItem>
        </QList>

        <QList
          bordered
          separator
          separatorOptions={{ spacing: "sm", textAlign: "center", text: "Hey!" }}
          class="q-my-md"
        >
          <QItem>
            <QItemSection>Custom separators</QItemSection>
          </QItem>
          <QItem>
            <QItemSection>With spacing</QItemSection>
          </QItem>
          <QItem>
            <QItemSection>And centered text</QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Dense List">
        {#snippet sectionDescription()}
          The <code>dense</code> prop makes list items more compact, useful for displaying more items
          in a smaller space. This property can be applied to the list or to individual items.
        {/snippet}

        <div class="flex q-gap-md">
          <QList bordered separator dense class="q-my-md">
            <QItem>
              <QItemSection>Dense list</QItemSection>
            </QItem>
            <QItem>
              <QItemSection type="icon">
                <QIcon name="star" />
              </QItemSection>
              <QItemSection>All items are dense</QItemSection>
            </QItem>
            <QItem>
              <QItemSection>Compact item</QItemSection>
            </QItem>
          </QList>

          <QList bordered separator>
            <QItem>
              <QItemSection>Regular item</QItemSection>
            </QItem>
            <QItem dense>
              <QItemSection>This item is dense</QItemSection>
            </QItem>
            <QItem>
              <QItemSection>Regular item</QItemSection>
            </QItem>
          </QList>
        </div>
      </QDocsSection>

      <QDocsSection title="Avatar and Images">
        {#snippet sectionDescription()}
          QItemSection with <code>type="avatar"</code> or <code>type="thumbnail"</code> can display avatars
          or images. This is useful for contact lists, message threads, or any content requiring visual
          identification.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem>
            <QItemSection type="avatar">
              <QAvatar src="/cocktail.jpg" />
            </QItemSection>
            <QItemSection>
              <span>John Smith</span>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="avatar">
              <QAvatar class="primary">A</QAvatar>
            </QItemSection>
            <QItemSection>
              <span>Alice Johnson</span>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="thumbnail">
              <img src="/cocktail.jpg" alt="Thumbnail" />
            </QItemSection>
            <QItemSection>
              <span>Image Thumbnail</span>
            </QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Multi-line Items">
        {#snippet sectionDescription()}
          QItemSection can display multiple lines of text using the <code>headline</code>,
          <code>line1</code>, <code>line2</code>, and <code>line3</code> props. This creates a structured
          and hierarchical display of information.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem>
            <QItemSection type="icon">
              <QIcon name="event" />
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                <span>Team Lunch</span>
              {/snippet}

              {#snippet line1()}
                <span>12:00 PM at Cafe</span>
              {/snippet}

              {#snippet line2()}
                <span>Remember to bring project notes</span>
              {/snippet}

              {#snippet line3()}
                <span>Coffee is offered</span>
              {/snippet}
            </QItemSection>
            <QItemSection type="trailingText">
              <span>Today</span>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="icon">
              <QIcon name="mail" />
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                <span>Meeting Agenda</span>
              {/snippet}

              {#snippet line1()}
                <span>Discussion for the upcoming project deadline</span>
              {/snippet}

              {#snippet line2()}
                <span>2:30 PM - 3:30 PM</span>
              {/snippet}
            </QItemSection>
            <QItemSection type="trailingText">
              <span>Today</span>
            </QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Item with Controls">
        {#snippet sectionDescription()}
          Lists can incorporate interactive controls like checkboxes and switchs. Use the
          <code>type="toggle"</code> on QItemSection to properly position these controls.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem>
            <QItemSection type="icon">
              <QIcon name="notifications" />
            </QItemSection>
            <QItemSection>Notifications</QItemSection>
            <QItemSection type="toggle">
              <QSwitch bind:value={switchValue} />
            </QItemSection>
          </QItem>
          <QItem tag="label" clickable>
            <QItemSection type="icon">
              <QIcon name="cloud_done" />
            </QItemSection>
            <QItemSection>Sync Data</QItemSection>
            <QItemSection type="toggle">
              <QCheckbox bind:value={checkboxValue} />
            </QItemSection>
          </QItem>
        </QList>
        <div class="q-mt-sm">
          Switch value: {switchValue ? "On" : "Off"}, Checkbox value: {checkboxValue
            ? "Checked"
            : "Unchecked"}
        </div>
      </QDocsSection>

      <QDocsSection title="List Styling Options">
        {#snippet sectionDescription()}
          QList offers several styling options through its props. <code>bordered</code> adds a
          border around the list, <code>roundedBorders</code> makes those borders rounded, and
          <code>padding</code> adds internal spacing.
        {/snippet}

        <div class="flex q-gap-md">
          <QList class="q-my-md">
            <QItem>
              <QItemSection>Default</QItemSection>
            </QItem>
            <QItem>
              <QItemSection>List</QItemSection>
            </QItem>
          </QList>

          <QList bordered class="q-my-md">
            <QItem>
              <QItemSection>Bordered</QItemSection>
            </QItem>
            <QItem>
              <QItemSection>List</QItemSection>
            </QItem>
          </QList>

          <QList bordered roundedBorders class="q-my-md">
            <QItem>
              <QItemSection>Rounded</QItemSection>
            </QItem>
            <QItem>
              <QItemSection>Borders</QItemSection>
            </QItem>
          </QList>

          <QList bordered padding class="q-my-md">
            <QItem>
              <QItemSection>With</QItemSection>
            </QItem>
            <QItem>
              <QItemSection>Padding</QItemSection>
            </QItem>
          </QList>
        </div>
      </QDocsSection>

      <QDocsSection title="Navigation with Links">
        {#snippet sectionDescription()}
          QItem can function as a navigation link by using the <code>to</code> or <code>href</code> props.
          This renders the item as an anchor element and integrates with your routing system.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem to="/components/button">
            <QItemSection type="icon">
              <QIcon name="touch_app" />
            </QItemSection>
            <QItemSection>Buttons Component</QItemSection>
            <QItemSection type="trailingIcon">
              <QIcon name="chevron_right" />
            </QItemSection>
          </QItem>
          <QItem to="/components/checkbox">
            <QItemSection type="icon">
              <QIcon name="check_box" />
            </QItemSection>
            <QItemSection>Checkbox Component</QItemSection>
            <QItemSection type="trailingIcon">
              <QIcon name="chevron_right" />
            </QItemSection>
          </QItem>
          <QItem href="#">
            <QItemSection type="icon">
              <QIcon name="link" />
            </QItemSection>
            <QItemSection>External Link</QItemSection>
            <QItemSection type="trailingIcon">
              <QIcon name="open_in_new" />
            </QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="Advanced List Layout">
        {#snippet sectionDescription()}
          Combining all QItem and QItemSection features enables building complex list layouts for
          various use cases. Here's a comprehensive example showing multiple section types and
          interactive elements.
        {/snippet}

        <QList bordered separator class="q-my-md">
          <QItem>
            <QItemSection type="avatar">
              <QAvatar>
                <img src="/cocktail.jpg" alt="Avatar" />
              </QAvatar>
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                <span>John Smith</span>
              {/snippet}

              {#snippet line1()}
                <span>Meeting scheduled for tomorrow</span>
              {/snippet}

              {#snippet line2()}
                <span>Would you like to bring the project files?</span>
              {/snippet}
            </QItemSection>
            <QItemSection type="trailingText">
              <span>10:30 AM</span>
            </QItemSection>
          </QItem>

          <QItem>
            <QItemSection type="avatar">
              <QAvatar class="primary">A</QAvatar>
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                <span>Alice Johnson</span>
              {/snippet}

              {#snippet line1()}
                <span>Updated design files are ready</span>
              {/snippet}

              {#snippet line2()}
                <span>Check the shared folder for the latest mockups</span>
              {/snippet}
            </QItemSection>
            <QItemSection type="trailingText">
              <span>Yesterday</span>
            </QItemSection>
          </QItem>

          <QItem tag="label" clickable>
            <QItemSection type="icon">
              <QIcon name="notifications" />
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                <span>Notification Settings</span>
              {/snippet}

              {#snippet line1()}
                <span>Receive alerts for new messages</span>
              {/snippet}
            </QItemSection>
            <QItemSection type="toggle">
              <QSwitch bind:value={switchValue} />
            </QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="QItemSection Types Reference">
        {#snippet sectionDescription()}
          <code>QItemSection</code> supports several predefined types that control its layout and styling.
          This reference shows all available types and their typical usage.
        {/snippet}

        <QList bordered separator roundedBorders class="q-my-md">
          <QItem>
            <QItemSection type="avatar">
              <QAvatar class="primary">
                <QIcon name="person" />
              </QAvatar>
            </QItemSection>
            <QItemSection>
              <div class="body-large">type="avatar"</div>
              <div class="body-small text-on-surface-variant">
                Used for user avatars or images, typically circular
              </div>
            </QItemSection>
          </QItem>

          <QItem>
            <QItemSection type="thumbnail">
              <img src="/cocktail.jpg" alt="Cocktail" />
            </QItemSection>
            <QItemSection>
              <div class="body-large">type="thumbnail"</div>
              <div class="body-small text-on-surface-variant">
                Larger than avatar, for images or previews
              </div>
            </QItemSection>
          </QItem>

          <QItem>
            <QItemSection type="video">
              <video autoplay loop playsinline>
                <track kind="captions" />
                <source src="/cocktail.mp4" type="video/mp4" />
              </video>
            </QItemSection>
            <QItemSection>
              <div class="body-large">type="video"</div>
              <div class="body-small text-on-surface-variant">
                Larger than thumbnail, for videos
              </div>
            </QItemSection>
          </QItem>

          <QItem>
            <QItemSection type="icon">
              <QIcon name="star" />
            </QItemSection>
            <QItemSection>
              <div class="body-large">type="icon"</div>
              <div class="body-small text-on-surface-variant">
                Similar to avatar but with different styling
              </div>
            </QItemSection>
          </QItem>

          <QItem>
            <QItemSection type="icon">
              <QIcon name="mail" />
            </QItemSection>
            <QItemSection>
              <div class="body-large">type="content" (default)</div>
              <div class="body-small text-on-surface-variant">
                Main content area, can have headline and up to 3 lines
              </div>
            </QItemSection>
          </QItem>

          <QItem>
            <QItemSection type="icon">
              <QIcon name="settings" />
            </QItemSection>
            <QItemSection>
              <div class="body-large">Section with trailing elements</div>
            </QItemSection>
            <QItemSection type="trailingIcon">
              <QIcon name="more_vert" style="cursor:pointer;" />
            </QItemSection>
          </QItem>

          <QItem>
            <QItemSection type="icon">
              <QIcon name="mail" />
            </QItemSection>
            <QItemSection>
              <div class="body-large">With trailing text</div>
            </QItemSection>
            <QItemSection type="trailingText">
              <span>12:30</span>
            </QItemSection>
          </QItem>

          <QItem>
            <QItemSection type="avatar">
              <QIcon name="notifications" />
            </QItemSection>
            <QItemSection>
              <div class="body-large">With switch</div>
            </QItemSection>
            <QItemSection type="toggle">
              <QSwitch />
            </QItemSection>
          </QItem>
        </QList>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
