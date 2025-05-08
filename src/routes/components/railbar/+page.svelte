<script lang="ts">
  import { QRailbarDocs } from "$components/railbar/docs";
  import {
    QBtn,
    QDrawer,
    QFooter,
    QHeader,
    QIcon,
    QItem,
    QItemSection,
    QLayout,
    QList,
    QRailbar,
  } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";

  let selectedRoute = $state("home");
  let leftDrawerOpen = $state(false);
  let rightDrawerOpen = $state(false);
</script>

<QDocs {snippets} componentDocs={QRailbarDocs}>
  {#snippet display()}
    <QLayout view="hHh LpR fFf" style="height: 300px;">
      {#snippet railbarLeft()}
        <QRailbar bordered>
          <QList>
            <QItem
              to="#"
              active={selectedRoute === "home"}
              clickable
              onclick={() => (selectedRoute = "home")}
            >
              <QIcon name="home" />
              <QItemSection>Home</QItemSection>
            </QItem>
            <QItem
              to="#"
              active={selectedRoute === "person"}
              clickable
              onclick={() => (selectedRoute = "person")}
            >
              <QIcon name="person" />
              <QItemSection>Profile</QItemSection>
            </QItem>
            <QItem
              to="#"
              active={selectedRoute === "settings"}
              clickable
              onclick={() => (selectedRoute = "settings")}
            >
              <QIcon name="settings" />
              <QItemSection>Settings</QItemSection>
            </QItem>
          </QList>
        </QRailbar>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Railbar">
        {#snippet sectionDescription()}
          QRailbar is a navigational component that typically stays fixed to the side of your
          layout. It's narrower than a drawer and often displays icons that expand to show text on
          hover or focus.
        {/snippet}

        <div style="height: 300px; border: 1px solid var(--outline);">
          <QLayout view="hHh LpR fFf">
            {#snippet railbarLeft()}
              <QRailbar>
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            <div class="flex flex-center column" style="height: 100%">
              <h5>Selected route: {selectedRoute}</h5>
              <p>Click the icons in the railbar to change the route.</p>
            </div>
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Railbar with Border">
        {#snippet sectionDescription()}
          Add a border to the railbar with the <code>bordered</code> prop to visually separate it from
          the content.
        {/snippet}

        <div style="height: 300px; border: 1px solid var(--outline);">
          <QLayout view="hHh LpR fFf">
            {#snippet railbarLeft()}
              <QRailbar bordered>
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            <div class="flex flex-center column" style="height: 100%">
              <h5>With Border</h5>
              <p>This railbar has a border to separate it from the content.</p>
            </div>
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Right Side Railbar">
        {#snippet sectionDescription()}
          Position the railbar on the right side of the layout using the <code>side</code>"right"
          prop.
        {/snippet}

        <div style="height: 300px; border: 1px solid var(--outline);">
          <QLayout view="hHh LpR fFf">
            {#snippet railbarRight()}
              <QRailbar side="right" bordered>
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            <div class="flex flex-center column" style="height: 100%">
              <h5>Right Side Railbar</h5>
              <p>This railbar is positioned on the right side of the layout.</p>
            </div>
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Width Railbar">
        {#snippet sectionDescription()}
          Adjust the width of the railbar using the <code>width</code> prop. The default width is 88px.
        {/snippet}

        <div style="height: 300px; border: 1px solid var(--outline);">
          <QLayout view="hHh LpR fFf">
            {#snippet railbarLeft()}
              <QRailbar width={120} bordered>
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            <div class="flex flex-center column" style="height: 100%">
              <h5>Custom Width</h5>
              <p>This railbar has a custom width of 120px instead of the default 88px.</p>
            </div>
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Railbar in Complete Layout">
        {#snippet sectionDescription()}
          The railbar is designed to work seamlessly with other QLayout components like QHeader,
          QFooter, and QDrawers. Here's an example of a complete layout with a railbar.
        {/snippet}

        <div style="height: 400px; border: 1px solid var(--outline);">
          <QLayout view="hHh LpR fFf">
            <!-- Header -->
            {#snippet header()}
              <QHeader class="flex items-center justify-between">
                <QBtn flat round icon="menu" onclick={() => (leftDrawerOpen = !leftDrawerOpen)} />
                <div class="q-ml-md text-h6">Complete Layout</div>
                <QBtn
                  flat
                  round
                  icon="more_vert"
                  onclick={() => (rightDrawerOpen = !rightDrawerOpen)}
                />
              </QHeader>
            {/snippet}

            <!-- Left Railbar -->
            {#snippet railbarLeft()}
              <QRailbar bordered>
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "favorite"}
                    clickable
                    onclick={() => (selectedRoute = "favorite")}
                  >
                    <QIcon name="favorite" />
                    <QItemSection>Favorites</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            <!-- Left Drawer -->
            {#snippet drawerLeft()}
              <QDrawer bind:value={leftDrawerOpen} bordered>
                <div class="q-px-sm">
                  <h6 class="q-my-md">Navigation</h6>
                  <QList dense>
                    <QItem to="#" clickable>
                      <QItemSection type="avatar">
                        <QIcon name="inbox" />
                      </QItemSection>
                      <QItemSection>Inbox</QItemSection>
                    </QItem>
                    <QItem to="#" clickable>
                      <QItemSection type="avatar">
                        <QIcon name="send" />
                      </QItemSection>
                      <QItemSection>Outbox</QItemSection>
                    </QItem>
                    <QItem to="#" clickable>
                      <QItemSection type="avatar">
                        <QIcon name="delete" />
                      </QItemSection>
                      <QItemSection>Trash</QItemSection>
                    </QItem>
                  </QList>
                </div>
              </QDrawer>
            {/snippet}

            <!-- Right Drawer -->
            {#snippet drawerRight()}
              <QDrawer side="right" bind:value={rightDrawerOpen} bordered>
                <div class="q-px-sm">
                  <h6 class="q-my-md">Settings</h6>
                  <QList dense>
                    <QItem to="#" clickable>
                      <QItemSection type="avatar">
                        <QIcon name="account_circle" />
                      </QItemSection>
                      <QItemSection>Account</QItemSection>
                    </QItem>
                    <QItem to="#" clickable>
                      <QItemSection type="avatar">
                        <QIcon name="notifications" />
                      </QItemSection>
                      <QItemSection>Notifications</QItemSection>
                    </QItem>
                    <QItem to="#" clickable>
                      <QItemSection type="avatar">
                        <QIcon name="help" />
                      </QItemSection>
                      <QItemSection>Help</QItemSection>
                    </QItem>
                  </QList>
                </div>
              </QDrawer>
            {/snippet}

            <!-- Footer -->
            {#snippet footer()}
              <QFooter>
                <div class="q-px-md q-py-sm flex justify-center">Footer Content</div>
              </QFooter>
            {/snippet}

            <!-- Page Content -->
            <div class="flex flex-center column" style="height: 100%">
              <h5>Current Page: {selectedRoute}</h5>
              <p>This is a complete layout example with:</p>
              <ul class="q-ml-md">
                <li>Header at the top</li>
                <li>Railbar on the left</li>
                <li>Expandable drawers on both sides</li>
                <li>Footer at the bottom</li>
              </ul>
              <div class="q-mt-md">
                <QBtn
                  label="Toggle Left Drawer"
                  onclick={() => (leftDrawerOpen = !leftDrawerOpen)}
                  class="q-mr-sm"
                />
                <QBtn
                  label="Toggle Right Drawer"
                  onclick={() => (rightDrawerOpen = !rightDrawerOpen)}
                />
              </div>
            </div>
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Multiple Railbars">
        {#snippet sectionDescription()}
          You can have railbars on both sides of your layout simultaneously. This is useful for
          applications that need different types of navigation or tools on different sides.
        {/snippet}

        <div style="height: 300px; border: 1px solid var(--outline);">
          <QLayout view="hHh LpR fFf">
            <!-- Left Railbar -->
            {#snippet railbarLeft()}
              <QRailbar bordered>
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            <!-- Right Railbar -->
            {#snippet railbarRight()}
              <QRailbar side="right" bordered>
                <QList>
                  <QItem to="#" clickable>
                    <QIcon name="lightbulb" />
                    <QItemSection>Ideas</QItemSection>
                  </QItem>
                  <QItem to="#" clickable>
                    <QIcon name="notifications" />
                    <QItemSection>Alerts</QItemSection>
                  </QItem>
                  <QItem to="#" clickable>
                    <QIcon name="help" />
                    <QItemSection>Help</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            <div class="flex flex-center column" style="height: 100%">
              <h5>Dual Railbars</h5>
              <p>This layout uses railbars on both the left and right sides.</p>
              <p>Left railbar: Main navigation</p>
              <p>Right railbar: Auxiliary functions</p>
            </div>
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Railbar with Header Integration">
        {#snippet sectionDescription()}
          The relationship between the railbar and header/footer can be controlled with the
          QLayout's <code>view</code> prop. This determines whether the railbar extends to the top/bottom
          of the layout or stops at the header/footer.
        {/snippet}

        <div style="height: 350px; border: 1px solid var(--outline);">
          <QLayout view="hhh lpr fff">
            {#snippet header()}
              <QHeader>
                <div class="q-px-md q-py-sm row items-center">
                  <div class="text-h6">Header Above Railbar</div>
                </div>
              </QHeader>
            {/snippet}

            {#snippet railbarLeft()}
              <QRailbar bordered>
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            {#snippet footer()}
              <QFooter>
                <div class="q-px-md q-py-sm flex justify-center">Footer Below Railbar</div>
              </QFooter>
            {/snippet}

            <div class="flex flex-center column" style="height: 100%">
              <h5>Header Integration</h5>
              <p>This layout uses the <code>view="hhh lpr fff"</code> configuration.</p>
              <p>
                The lowercase <code>l</code> in the 1st and 3rd groups means the railbar extends beside
                the header and the footer.
              </p>
            </div>
          </QLayout>
        </div>

        <div class="q-mt-lg" style="height: 350px; border: 1px solid var(--outline);">
          <QLayout view="lhh lpr lff">
            {#snippet header()}
              <QHeader>
                <div class="q-px-md q-py-sm row items-center">
                  <div class="text-h6">Header Next to Railbar</div>
                </div>
              </QHeader>
            {/snippet}

            {#snippet railbarLeft()}
              <QRailbar bordered>
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            {#snippet footer()}
              <QFooter>
                <div class="q-px-md q-py-sm flex justify-center">Footer Next to Railbar</div>
              </QFooter>
            {/snippet}

            <div class="flex flex-center column" style="height: 100%">
              <h5>Alternative Header Integration</h5>
              <p>This layout uses the <code>view="lhh lpr lff"</code> configuration.</p>
              <p>
                The lowercase <code>h</code> means the header extends to the top edge, above the railbar.
              </p>
              <p>
                The lowercase <code>f</code> means the footer extends to the bottom edge, under the railbar.
              </p>
            </div>
          </QLayout>
        </div>
      </QDocsSection>

      <QDocsSection title="Styling the Railbar">
        {#snippet sectionDescription()}
          The railbar can be styled using standard class props. Here are some styling examples.
        {/snippet}

        <div style="height: 300px; border: 1px solid var(--outline);">
          <QLayout view="hHh LpR fFf">
            {#snippet railbarLeft()}
              <QRailbar bordered class="surface-variant">
                <QList>
                  <QItem
                    to="#"
                    active={selectedRoute === "home"}
                    clickable
                    onclick={() => (selectedRoute = "home")}
                  >
                    <QIcon name="home" />
                    <QItemSection>Home</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "person"}
                    clickable
                    onclick={() => (selectedRoute = "person")}
                  >
                    <QIcon name="person" />
                    <QItemSection>Profile</QItemSection>
                  </QItem>
                  <QItem
                    to="#"
                    active={selectedRoute === "settings"}
                    clickable
                    onclick={() => (selectedRoute = "settings")}
                  >
                    <QIcon name="settings" />
                    <QItemSection>Settings</QItemSection>
                  </QItem>
                </QList>
              </QRailbar>
            {/snippet}

            <div class="flex flex-center column" style="height: 100%">
              <h5>Styled Railbar</h5>
              <p>This railbar uses the surface-variant background color.</p>
              <p>You can apply any styling classes to the railbar and its contents.</p>
            </div>
          </QLayout>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
