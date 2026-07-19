<script lang="ts">
  import { QItemDocs, QItemSectionDocs, QListDocs } from "$components/list/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QAvatar,
    QCheckbox,
    QIcon,
    QIconBtn,
    QInput,
    QItem,
    QItemSection,
    QList,
    QRadio,
    QSwitch,
  } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: [QListDocs, QItemDocs, QItemSectionDocs] });

  let lastAction = $state("None");
  let singleSelection = $state("Email");
  let multipleSelection = $state(["Archive"]);
  let checkboxValue = $state(false);
  let switchValue = $state(false);
  let itemInputValue = $state("8");

  function toggleSelection(item: string) {
    multipleSelection = multipleSelection.includes(item)
      ? multipleSelection.filter((entry) => entry !== item)
      : [...multipleSelection, item];
  }

  function stopPropagation(event: Event) {
    event.stopPropagation();
  }
</script>

<svelte:head>
  <title>{pageTitle("QList")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QList bordered class="surface">
      <QItem clickable>
        <QItemSection type="icon">
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
        <QItemSection type="icon">
          <QIcon name="send" />
        </QItemSection>
        <QItemSection>
          <span>Sent</span>
        </QItemSection>
      </QItem>
      <QItem clickable>
        <QItemSection type="icon">
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
      <QDocsSection title="Baseline List">
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

      <QDocsSection title="Single-action List">
        {#snippet sectionDescription()}
          Use <code>clickable</code> when the entire item performs one action. Single-action items are
          not persistent selections.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem clickable onclick={() => (lastAction = "Inbox")}>
            <QItemSection type="icon">
              <QIcon name="inbox" />
            </QItemSection>
            <QItemSection>Inbox</QItemSection>
          </QItem>
          <QItem clickable onclick={() => (lastAction = "Sent")}>
            <QItemSection type="icon">
              <QIcon name="send" />
            </QItemSection>
            <QItemSection>Sent</QItemSection>
          </QItem>
          <QItem clickable onclick={() => (lastAction = "Trash")}>
            <QItemSection type="icon">
              <QIcon name="delete" />
            </QItemSection>
            <QItemSection>Trash</QItemSection>
          </QItem>
        </QList>
        <div class="q-mt-sm">Last action: {lastAction}</div>
      </QDocsSection>

      <QDocsSection title="Multi-action List">
        {#snippet sectionDescription()}
          In a multi-action item, the content section is the primary action and trailing controls
          provide independent secondary actions. Add <code>action</code> to the content section to
          render it as a native button, and use <code>leading</code> to include its leading visual in
          the same target.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem>
            <QItemSection action onclick={() => (lastAction = "Play Northern Lights")}>
              {#snippet leading()}<QIcon name="music_note" />{/snippet}
              Northern Lights
              {#snippet line1()}The Observatory{/snippet}
            </QItemSection>
            <QItemSection type="side" class="q-gap-sm">
              <QIconBtn
                icon="bookmark"
                flat
                aria-label="Bookmark Northern Lights"
                onclick={() => (lastAction = "Bookmark Northern Lights")}
              />
              <QIconBtn
                icon="more_vert"
                flat
                aria-label="More options for Northern Lights"
                onclick={() => (lastAction = "More options")}
              />
            </QItemSection>
          </QItem>
        </QList>
        <div class="q-mt-sm">Last action: {lastAction}</div>
      </QDocsSection>

      <QDocsSection title="Selection Lists">
        {#snippet sectionDescription()}
          Set <code>selection</code> to <code>single</code> or <code>multiple</code> for listbox
          semantics. Keep selection in application state with QItem's <code>active</code> prop, and include
          a non-color selection indicator.
        {/snippet}

        <div class="row q-col-gutter-md q-my-md">
          <div class="col-12 col-md-6">
            <div class="title-medium q-mb-sm">Baseline single-select</div>
            <QList selection="single" aria-label="Choose a notification channel">
              {#each ["Email", "Messages", "Calls"] as item (item)}
                <QItem
                  clickable
                  active={singleSelection === item}
                  onclick={() => (singleSelection = item)}
                >
                  <QItemSection type="side">
                    <QRadio
                      value={item}
                      selected={singleSelection}
                      aria-label={item}
                      onclick={stopPropagation}
                      onchange={() => (singleSelection = item)}
                    />
                  </QItemSection>
                  <QItemSection>{item}</QItemSection>
                </QItem>
              {/each}
            </QList>
          </div>

          <div class="col-12 col-md-6">
            <div class="title-medium q-mb-sm">Baseline multi-select</div>
            <QList selection="multiple" aria-label="Choose folders">
              {#each ["Inbox", "Archive", "Trash"] as item (item)}
                <QItem
                  clickable
                  active={multipleSelection.includes(item)}
                  onclick={() => toggleSelection(item)}
                >
                  <QItemSection type="side">
                    <QCheckbox
                      value={multipleSelection.includes(item)}
                      aria-label={item}
                      onclick={stopPropagation}
                      onchange={() => toggleSelection(item)}
                    />
                  </QItemSection>
                  <QItemSection>{item}</QItemSection>
                </QItem>
              {/each}
            </QList>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Expressive Lists">
        {#snippet sectionDescription()}
          Enable <code>expressive</code> for expressive shapes and spacing, then add
          <code>segmented</code> for separated item containers. Native <code>draggable</code> items
          apply the dragged state automatically; set <code>dragged</code> directly when using custom
          pointer or touch reordering. Pass
          <code>{`{ expressive: true }`}</code> to <code>Quaff.init()</code> to enable expressive styling
          globally.
        {/snippet}

        <div class="row q-col-gutter-md q-my-md">
          <div class="col-12 col-md-6">
            <div class="title-medium q-mb-sm">Standard</div>
            <QList expressive aria-label="Expressive folders">
              {#each ["Inbox", "Archive", "Trash"] as item (item)}
                <QItem clickable active={item === "Archive"}>
                  <QItemSection>{item}</QItemSection>
                </QItem>
              {/each}
            </QList>
          </div>

          <div class="col-12 col-md-6">
            <div class="title-medium q-mb-sm">Segmented and draggable</div>
            <QList expressive segmented aria-label="Draggable folders">
              {#each ["Inbox", "Archive", "Trash"] as item (item)}
                <QItem draggable>
                  <QItemSection type="icon" dragHandle>
                    <QIcon name="drag_indicator" />
                  </QItemSection>
                  <QItemSection>{item}</QItemSection>
                </QItem>
              {/each}
            </QList>
          </div>
        </div>
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
          <code>line1</code>, <code>line2</code>, and <code>line3</code> snippets. This creates a structured
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
          Lists can incorporate interactive controls like checkboxes, inputs, and switches. Use
          <code>type="side"</code> for trailing controls that should keep their natural width.
        {/snippet}

        <QList bordered class="q-my-md">
          <QItem>
            <QItemSection type="icon">
              <QIcon name="notifications" />
            </QItemSection>
            <QItemSection>Notifications</QItemSection>
            <QItemSection type="side">
              <QSwitch bind:value={switchValue} aria-label="Notifications" />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="icon">
              <QIcon name="cloud_done" />
            </QItemSection>
            <QItemSection>Sync Data</QItemSection>
            <QItemSection type="side">
              <QCheckbox bind:value={checkboxValue} aria-label="Sync data" />
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="icon">
              <QIcon name="tune" />
            </QItemSection>
            <QItemSection>
              {#snippet headline()}
                <span>Custom threshold</span>
              {/snippet}

              {#snippet line1()}
                <span>Enabled when the switch is on</span>
              {/snippet}
            </QItemSection>
            <QItemSection type="side">
              <QInput bind:value={itemInputValue} type="number" label="Value" outlined dense />
            </QItemSection>
            <QItemSection type="side">
              <QSwitch bind:value={switchValue} aria-label="Enable custom threshold" />
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
          border around the list, <code>noRound</code> removes the rounded borders, and
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

          <QList bordered noRound class="q-my-md">
            <QItem>
              <QItemSection>No Rounded Borders</QItemSection>
            </QItem>
            <QItem>
              <QItemSection>List</QItemSection>
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

          <QItem>
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
              <QSwitch bind:value={switchValue} aria-label="Notification settings" />
            </QItemSection>
          </QItem>
        </QList>
      </QDocsSection>

      <QDocsSection title="QItemSection Types Reference">
        {#snippet sectionDescription()}
          <code>QItemSection</code> supports several predefined types that control its layout and styling.
          This reference shows all available types and their typical usage.
        {/snippet}

        <QList bordered separator class="q-my-md">
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
              <QIcon name="more_vert" />
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
            <QItemSection type="icon">
              <QIcon name="notifications" />
            </QItemSection>
            <QItemSection>
              <div class="body-large">With switch</div>
            </QItemSection>
            <QItemSection type="toggle">
              <QSwitch aria-label="Enable switch" />
            </QItemSection>
          </QItem>
        </QList>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
