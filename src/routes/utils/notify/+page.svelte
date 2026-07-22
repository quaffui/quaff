<script lang="ts">
  import { resolve } from "$app/paths";
  import { QBtn, QCodeBlock, Notify } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import { pageTitle } from "$helpers/pageTitle";
  import type { NotifyDismiss, NotifyOptions } from "$lib";

  let saveStatus = $state("");
  let dismiss = $state<NotifyDismiss>();

  function clearNotifications() {
    dismiss = undefined;
    Notify.clear();
  }

  function replaceNotification(options: string | NotifyOptions) {
    clearNotifications();
    return Notify.create(options);
  }

  function showBasic() {
    saveStatus = "Preferences saved";
    replaceNotification("Preferences saved");
  }

  function showAction() {
    replaceNotification({
      message: "Draft deleted",
      actions: [{ label: "Undo", handler: () => (saveStatus = "Draft restored") }],
    });
  }

  function showQueue() {
    clearNotifications();
    Notify.create({ message: "First update", timeout: 4000 });
    Notify.create({ message: "Second update", timeout: 4000 });
  }

  function showPersistent() {
    dismiss = replaceNotification({
      message: "You are offline",
      timeout: 0,
    });
  }

  function hidePersistent() {
    dismiss?.();
    dismiss = undefined;
  }

  function showWithDefaults() {
    Notify.setDefaults({ timeout: 8000 });
    replaceNotification("Uses the configured default timeout");
    Notify.setDefaults();
  }
</script>

<svelte:head>
  <title>{pageTitle("Notify")}</title>
</svelte:head>

<QDocs
  docName="Notify"
  docDescription="Create Material Design snackbars from code anywhere in your app."
>
  {#snippet display()}
    <QBtn label="Notify me" onclick={() => replaceNotification("Message sent")} />
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Create a Notification" noCode>
      {#snippet sectionDescription()}
        <code>Notify.create</code> accepts either a message string or an options object. It returns a
        function that closes that notification.
      {/snippet}

      <div class="flex items-center q-gap-md q-mb-md">
        <QBtn label="Save preferences" onclick={showBasic} />
        <span aria-live="polite">{saveStatus}</span>
      </div>
      <QCodeBlock language="ts" code="Notify.create(&quot;Preferences saved&quot;)" />
    </QDocsSection>

    <QDocsSection title="Single Action" noCode>
      {#snippet sectionDescription()}
        Add one action through <code>actions</code>. The notification stays visible until the user
        selects the action or closes it.
      {/snippet}

      <QBtn class="q-mb-md" label="Delete draft" onclick={showAction} />
      <QCodeBlock
        language="ts"
        code={`Notify.create({
  message: "Draft deleted",
  actions: [{ label: "Undo", handler: restoreDraft }]
})`}
      />
    </QDocsSection>

    <QDocsSection title="Notification Queue" noCode>
      {#snippet sectionDescription()}
        If you create several notifications, they wait in a queue and appear one at a time.
      {/snippet}

      <div class="flex q-gap-md">
        <QBtn label="Show two updates" onclick={showQueue} />
        <QBtn label="Clear notifications" variant="flat" onclick={clearNotifications} />
      </div>
    </QDocsSection>

    <QDocsSection title="Close from Code" noCode>
      {#snippet sectionDescription()}
        Set <code>timeout</code> to zero to keep a notification visible. <code>Notify.create</code> returns
        a function that closes it. Call that function when the message is no longer needed.
      {/snippet}

      <div class="flex q-gap-md q-mb-md">
        <QBtn label="Simulate offline" onclick={showPersistent} />
        <QBtn
          label="Restore connection"
          variant="flat"
          disabled={!dismiss}
          onclick={hidePersistent}
        />
      </div>
      <QCodeBlock
        language="ts"
        code={`const dismiss = Notify.create({
  message: "You are offline",
  timeout: 0
})

// When the connection returns
dismiss()`}
      />
    </QDocsSection>

    <QDocsSection title="Defaults" noCode>
      {#snippet sectionDescription()}
        <code>Notify.setDefaults</code> replaces the defaults used by later notifications. Call it without
        arguments to reset them.
      {/snippet}

      <QBtn label="Show with defaults" onclick={showWithDefaults} />
    </QDocsSection>

    <QDocsSection title="Supported Features" noCode>
      {#snippet sectionDescription()}
        Notify supports one action and shows one snackbar at the bottom. It does not support extra
        positions, captions, or decorative icons because Material Design snackbars do not use them.
        Use the <a href={resolve("/components/snackbar", {})}>QSnackbar component</a> when one component
        controls when it is shown.
      {/snippet}
    </QDocsSection>
  {/snippet}
</QDocs>
