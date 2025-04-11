<script lang="ts">
  import {
    QDialog,
    QBtn,
    QCard,
    QCardSection,
    QCardActions,
    QRadio,
    QList,
    QItem,
    QItemSection,
    QIcon,
  } from "$lib";
  import { QDialogDocs } from "$components/dialog/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import type { QDialogPositionOptions } from "$components/dialog/props";
  import snippets from "./docs.snippets";

  let basicDialogOpen = $state(false);
  let modalDialogOpen = $state(false);
  let persistentDialogOpen = $state(false);
  let fullscreenDialogOpen = $state(false);
  let customDialogOpen = $state(false);
  let combinedDialogOpen = $state(false);

  let dialogRef = $state<QDialog>();
  let positionDialogRef = $state<QDialog>();

  let selectedPosition: QDialogPositionOptions = $state("default");
</script>

<QDocs {snippets} componentDocs={QDialogDocs}>
  {#snippet display()}
    <QBtn label="Open Dialog" onclick={() => (basicDialogOpen = true)} />
    <QDialog bind:value={basicDialogOpen}>
      <QCard style="min-width: 300px">
        <QCardSection>
          <h6 class="q-mb-sm">Dialog Title</h6>
          <p>This is a simple dialog example.</p>
        </QCardSection>
        <QCardActions align="right">
          <QBtn flat label="Close" onclick={() => (basicDialogOpen = false)} />
        </QCardActions>
      </QCard>
    </QDialog>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Dialog">
        {#snippet sectionDescription()}
          QDialog is a versatile component for showing content in an overlay. It's commonly used for
          confirmations, settings panels, or any content that requires user attention without
          leaving the current page.
        {/snippet}

        <QBtn label="Open Basic Dialog" onclick={() => (basicDialogOpen = true)} />

        <QDialog bind:value={basicDialogOpen}>
          <QCard style="min-width: 300px">
            <QCardSection>
              <h6 class="q-mb-sm">Basic Dialog</h6>
              <p>
                This is a simple dialog that can be closed by clicking outside or pressing Escape.
              </p>
            </QCardSection>
            <QCardActions align="right">
              <QBtn flat label="Close" onclick={() => (basicDialogOpen = false)} />
            </QCardActions>
          </QCard>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Modal Dialog">
        {#snippet sectionDescription()}
          Modal dialogs are more disruptive as they prevent interaction with the page behind them.
          They're useful when you need the user's full attention or a decision before proceeding.
        {/snippet}

        <QBtn label="Open Modal Dialog" onclick={() => (modalDialogOpen = true)} />

        <QDialog bind:value={modalDialogOpen} modal>
          <QCard style="min-width: 300px">
            <QCardSection>
              <h6 class="q-mb-sm">Modal Dialog</h6>
              <p>
                This is a modal dialog. Unlike regular dialogs, it blocks interaction with the
                background content. It can still be closed by clicking outside or pressing Escape.
              </p>
            </QCardSection>
            <QCardActions align="right">
              <QBtn flat label="Cancel" onclick={() => (modalDialogOpen = false)} />
              <QBtn label="Confirm" onclick={() => (modalDialogOpen = false)} />
            </QCardActions>
          </QCard>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Persistent Dialog">
        {#snippet sectionDescription()}
          Persistent dialogs cannot be closed by clicking outside or pressing Escape. They require
          an explicit action from the user, making them suitable for critical confirmations or
          mandatory forms.
        {/snippet}

        <QBtn label="Open Persistent Dialog" onclick={() => (persistentDialogOpen = true)} />

        <QDialog bind:value={persistentDialogOpen} persistent>
          <QCard style="min-width: 300px">
            <QCardSection>
              <h6 class="q-mb-sm">Persistent Dialog</h6>
              <p>
                This dialog cannot be dismissed by clicking outside or pressing Escape. Try it! The
                dialog will animate to indicate it's persistent.
              </p>
            </QCardSection>
            <QCardActions align="right">
              <QBtn label="I understand" onclick={() => (persistentDialogOpen = false)} />
            </QCardActions>
          </QCard>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Dialog Positioning">
        {#snippet sectionDescription()}
          Dialogs can be positioned at different locations on the screen using the
          <code>position</code> prop. Available positions are: default (center), top, right, bottom,
          and left. Avoid repositioning the dialog at the same time as opening it. This will cause animation
          issues as the dialog doesn't have time to reposition before being visible.
        {/snippet}

        <div class="q-ma-sm row">
          <div class="col-3 flex column q-gap-md">
            <QRadio bind:selected={selectedPosition} label="Default (Center)" value="default" />
            <QRadio bind:selected={selectedPosition} label="Top" value="top" />
            <QRadio bind:selected={selectedPosition} label="Right" value="right" />
            <QRadio bind:selected={selectedPosition} label="Bottom" value="bottom" />
            <QRadio bind:selected={selectedPosition} label="Left" value="left" />
          </div>
          <div class="col-9 flex items-center">
            <QBtn label="Open Position Dialog" onclick={positionDialogRef?.toggle} />
          </div>
        </div>

        <QDialog bind:this={positionDialogRef} position={selectedPosition}>
          <QCard style="min-width: 300px">
            <QCardSection>
              <h6 class="q-mb-sm">Position: {selectedPosition}</h6>
              <p>This dialog is positioned at the {selectedPosition} of the screen.</p>
            </QCardSection>
            <QCardActions align="right">
              <QBtn flat label="Close" onclick={positionDialogRef?.hide} />
            </QCardActions>
          </QCard>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Fullscreen Dialog">
        {#snippet sectionDescription()}
          Fullscreen dialogs occupy the entire viewport, providing maximum space for complex content
          or mobile interfaces. They're ideal for immersive experiences or detailed forms.
        {/snippet}

        <QBtn label="Open Fullscreen Dialog" onclick={() => (fullscreenDialogOpen = true)} />

        <QDialog bind:value={fullscreenDialogOpen} fullscreen>
          <div class="full-height column no-wrap">
            <div class="q-px-md q-py-sm flex justify-between">
              <h6 class="q-mb-none">Fullscreen Dialog</h6>
              <QBtn flat round icon="close" onclick={() => (fullscreenDialogOpen = false)} />
            </div>

            <div class="q-pa-md">
              <p>
                This dialog takes up the full screen, making it ideal for detailed forms, complex
                interfaces, or when you need maximum screen real estate on mobile devices.
              </p>
              <p>
                Fullscreen dialogs typically have their own navigation structure, including a way to
                close the dialog (usually a close button in the header).
              </p>
            </div>

            <div class="q-pa-md row justify-end">
              <QBtn label="Close" onclick={() => (fullscreenDialogOpen = false)} />
            </div>
          </div>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Programmatic Control">
        {#snippet sectionDescription()}
          QDialog can be controlled programmatically using the <code>bind:value</code> directive or
          by obtaining a reference to the dialog instance and calling its <code>show()</code>,
          <code>hide()</code>, or
          <code>toggle()</code> methods.
        {/snippet}

        <div class="flex q-gap-md">
          <QBtn label="Open Dialog" onclick={dialogRef?.show} />
          <QBtn label="Toggle Dialog" onclick={dialogRef?.toggle} />
        </div>

        <QDialog bind:value={customDialogOpen} bind:this={dialogRef}>
          <QCard style="min-width: 300px">
            <QCardSection>
              <h6 class="q-mb-sm">Programmatic Control</h6>
              <p>
                This dialog can be controlled both through the bound value and by calling methods
                directly on the component reference.
              </p>
            </QCardSection>
            <QCardActions align="right">
              <QBtn flat label="Close with hide()" onclick={dialogRef?.hide} />
              <QBtn flat label="Close with value" onclick={() => (customDialogOpen = false)} />
            </QCardActions>
          </QCard>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Combined Features">
        {#snippet sectionDescription()}
          QDialog features can be combined to create exactly the dialog experience you need. Here's
          an example of a modal, persistent dialog positioned at the top of the screen.
        {/snippet}

        <QBtn label="Combined Features Dialog" onclick={() => (combinedDialogOpen = true)} />

        <QDialog bind:value={combinedDialogOpen} modal persistent position="top">
          <QCard style="min-width: 300px">
            <QCardSection>
              <h6 class="q-mb-sm">Combined Features</h6>
              <div>
                This dialog combines multiple features:
                <ul>
                  <li>Modal (blocks background interaction)</li>
                  <li>Persistent (can't dismiss with outside click)</li>
                  <li>Positioned at the top</li>
                </ul>
              </div>
            </QCardSection>
            <QCardActions align="right">
              <QBtn label="I understand" onclick={() => (combinedDialogOpen = false)} />
            </QCardActions>
          </QCard>
        </QDialog>
      </QDocsSection>

      <QDocsSection title="Accessibility">
        {#snippet sectionDescription()}
          QDialog is built with accessibility in mind. It manages focus appropriately, can be closed
          with the Escape key (unless persistent), and includes proper ARIA attributes.
        {/snippet}

        <QList dense>
          <QItem>
            <QItemSection type="avatar">
              <QIcon name="chevron_right" />
            </QItemSection>
            <QItemSection>Modal dialogs trap focus within them when open</QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="avatar">
              <QIcon name="chevron_right" />
            </QItemSection>
            <QItemSection>Escape key closes non-persistent dialogs</QItemSection>
          </QItem>
          <QItem>
            <QItemSection type="avatar">
              <QIcon name="chevron_right" />
            </QItemSection>
            <QItemSection
              >Modal dialogs prevent screen reader access to background content</QItemSection
            >
          </QItem>
          <QItem>
            <QItemSection type="avatar">
              <QIcon name="chevron_right" />
            </QItemSection>
            <QItemSection>Proper ARIA attributes are applied automatically</QItemSection>
          </QItem>
        </QList>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
