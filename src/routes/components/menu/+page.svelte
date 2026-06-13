<script lang="ts">
  import { QMenuDocs } from "$components/menu/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QDialog,
    QItem,
    QItemSection,
    QList,
    QMenu,
  } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QMenuDocs });

  let isDisplayMenuOpen = $state(false);
  let isBasicMenuOpen = $state(false);
  let isTargetMenuOpen = $state(false);
  let customTarget = $state<HTMLDivElement>();
  let isRightMenuOpen = $state(false);
  let isFitMenuOpen = $state(false);
  let isPersistentMenuOpen = $state(false);
  let isDialogOpen = $state(false);
  let isDialogMenuOpen = $state(false);
</script>

<svelte:head>
  <title>{pageTitle("QMenu")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QBtn label="Open menu" onclick={() => (isDisplayMenuOpen = !isDisplayMenuOpen)}>
      <QMenu bind:value={isDisplayMenuOpen}>
        <QList dense>
          <QItem clickable>
            <QItemSection>Profile</QItemSection>
          </QItem>
          <QItem clickable>
            <QItemSection>Settings</QItemSection>
          </QItem>
        </QList>
      </QMenu>
    </QBtn>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Menu">
        {#snippet sectionDescription()}
          QMenu anchors popup content to a target. When placed inside a Quaff component, it uses the
          parent component as its target by default.
        {/snippet}

        <QBtn label="Open menu" onclick={() => (isBasicMenuOpen = !isBasicMenuOpen)}>
          <QMenu bind:value={isBasicMenuOpen}>
            <QList dense>
              <QItem clickable>
                <QItemSection>Profile</QItemSection>
              </QItem>
              <QItem clickable>
                <QItemSection>Settings</QItemSection>
              </QItem>
              <QItem clickable>
                <QItemSection>Sign out</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </QDocsSection>

      <QDocsSection title="Custom Target">
        {#snippet sectionDescription()}
          Use <code>target</code> when the trigger and anchor are not the same element.
        {/snippet}

        <div class="row q-gutter-md items-center">
          <div class="col-xs-12 col-sm-5 col-md-4">
            <div bind:this={customTarget} class="surface-variant q-pa-sm">Anchored surface</div>
          </div>

          <div class="col-xs-12 col-sm-5 col-md-4">
            <QBtn
              class="q-menu-docs__action"
              label="Open menu"
              onclick={() => (isTargetMenuOpen = !isTargetMenuOpen)}
            >
              <QMenu bind:value={isTargetMenuOpen} target={customTarget}>
                <QList dense>
                  <QItem clickable>
                    <QItemSection>First action</QItemSection>
                  </QItem>
                  <QItem clickable>
                    <QItemSection>Second action</QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </QBtn>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Anchoring and Fit">
        {#snippet sectionDescription()}
          Use <code>anchor</code>, <code>self</code>, and <code>fit</code> to control alignment and width
          relative to the target.
        {/snippet}

        <div class="row q-gutter-md items-start">
          <div class="col-xs-12 col-sm-6">
            <QBtn
              class="q-menu-docs__action"
              label="Bottom right"
              onclick={() => (isRightMenuOpen = !isRightMenuOpen)}
            >
              <QMenu bind:value={isRightMenuOpen} anchor="bottom right" self="top right">
                <QList dense>
                  <QItem clickable>
                    <QItemSection>Right aligned</QItemSection>
                  </QItem>
                  <QItem clickable>
                    <QItemSection>Natural width</QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </QBtn>
          </div>

          <div class="col-xs-12 col-sm-6">
            <QBtn
              class="q-menu-docs__action"
              label="Fit to target"
              onclick={() => (isFitMenuOpen = !isFitMenuOpen)}
            >
              <QMenu bind:value={isFitMenuOpen} fit>
                <QList dense>
                  <QItem clickable>
                    <QItemSection>Same width as target</QItemSection>
                  </QItem>
                  <QItem clickable>
                    <QItemSection>Bottom left</QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </QBtn>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Interactive Menu">
        {#snippet sectionDescription()}
          Use <code>persistent</code> to ignore outside clicks, and set <code>autoClose</code> to
          <code>false</code> when the menu contains controls or multiple actions.
        {/snippet}

        <div class="row q-gutter-md">
          <div class="col-xs-12 col-sm-7 col-md-5">
            <QBtn
              class="q-menu-docs__action"
              label="Persistent content"
              onclick={() => (isPersistentMenuOpen = !isPersistentMenuOpen)}
            >
              <QMenu bind:value={isPersistentMenuOpen} persistent autoClose={false}>
                <QCard style="width: min(18rem, calc(100vw - 2rem));">
                  <QCardSection>
                    <h6 class="q-mb-sm">Menu panel</h6>
                    <p class="q-mb-none">This menu stays open when you click outside.</p>
                  </QCardSection>
                  <QCardActions align="right" class="q-gap-sm flex">
                    <QBtn flat label="Close" onclick={() => (isPersistentMenuOpen = false)} />
                  </QCardActions>
                </QCard>
              </QMenu>
            </QBtn>
          </div>
        </div>
      </QDocsSection>

      <QDocsSection title="Inside Dialog">
        {#snippet sectionDescription()}
          QMenu uses Quaff's generic overlay root when it is opened from a native QDialog, so it is
          not clipped by the dialog surface and remains interactive.
        {/snippet}

        <QBtn label="Open dialog" onclick={() => (isDialogOpen = true)} />

        <QDialog bind:value={isDialogOpen} modal>
          <QCardSection class="q-pa-none flex column items-start">
            <h6 class="q-mb-md">Dialog with menu</h6>
            <QBtn label="Open menu" onclick={() => (isDialogMenuOpen = !isDialogMenuOpen)}>
              <QMenu bind:value={isDialogMenuOpen} anchor="bottom left" self="top left">
                <QList dense>
                  <QItem clickable>
                    <QItemSection>Dialog action</QItemSection>
                  </QItem>
                  <QItem clickable>
                    <QItemSection>Another action</QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </QBtn>
          </QCardSection>
          <QCardActions align="right" class="q-mt-md q-gap-sm flex">
            <QBtn flat label="Close" onclick={() => (isDialogOpen = false)} />
          </QCardActions>
        </QDialog>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style lang="scss">
  :global(.q-menu-docs__action) {
    box-sizing: border-box;
    width: calc(100% - 1rem);
    max-width: 100%;
  }
</style>
