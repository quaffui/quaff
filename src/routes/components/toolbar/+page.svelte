<script lang="ts">
  import { QToolbarDocs } from "$components/toolbar/docs";
  import { QDocs, QDocsSection } from "$docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QAvatar, QIconBtn, QSwitch, QToolbar } from "$lib";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QToolbarDocs });

  // #region:    --- Reactive variables
  let isMicrophoneOn = $state(true);
  let isCameraOn = $state(true);
  let isHandRaised = $state(false);
  let isVibrant = $state(false);
  let isFavorite = $state(false);
  let isBold = $state(false);
  let isItalic = $state(false);
  let isUnderlined = $state(false);
  let zoom = $state(1);
  // #endregion: --- Reactive variables
</script>

<svelte:head>
  <title>{pageTitle("QToolbar")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <div
      class="q-toolbar-docs__call flex column items-center q-gap-md q-pa-lg text-center tertiary-container"
    >
      <QAvatar size="64px" class="tertiary">AM</QAvatar>
      <span class="title-large">Design catch-up</span>
      <QToolbar floating vibrant aria-label="Call preview controls">
        <QIconBtn
          expressive
          icon={isMicrophoneOn ? "mic" : "mic_off"}
          bind:selected={isMicrophoneOn}
          aria-label="Microphone"
          title="Microphone"
        />
        <QIconBtn
          expressive
          icon={isCameraOn ? "videocam" : "videocam_off"}
          bind:selected={isCameraOn}
          aria-label="Camera"
          title="Camera"
        />
        <QIconBtn
          expressive
          icon="front_hand"
          bind:selected={isHandRaised}
          aria-label="Raise hand"
          title="Raise hand"
        />
      </QToolbar>
      <span class="body-medium">
        {isMicrophoneOn ? "Mic on" : "Mic off"} · {isCameraOn ? "Camera on" : "Camera off"}
        {isHandRaised ? " · Hand raised" : ""}
      </span>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Floating Toolbar">
      {#snippet sectionDescription()}
        Use <code>floating</code> for a compact group of actions and <code>vibrant</code> for a stronger
        color. Position the toolbar within your content, leaving at least 16px from screen edges. Use
        buttons or links for toolbar actions. Tab enters or leaves the group; arrow keys along the toolbar's
        orientation move between enabled, visible actions. Home and End move to the first and last action.
        The last focused action is remembered. Other controls, such as text inputs, keep their usual Tab
        and arrow-key behavior.
      {/snippet}

      <QSwitch bind:value={isVibrant} label="Vibrant colors" class="q-mb-md" />
      <div
        class="q-toolbar-docs__call flex column items-center q-gap-md q-pa-lg text-center secondary-container"
      >
        <QAvatar size="64px" class="tertiary">AM</QAvatar>
        <span class="title-medium">Alex Morgan</span>
        <QToolbar floating vibrant={isVibrant} aria-label="Call controls">
          <QIconBtn
            expressive
            icon={isMicrophoneOn ? "mic" : "mic_off"}
            bind:selected={isMicrophoneOn}
            aria-label="Microphone"
            title="Microphone"
          />
          <QIconBtn
            expressive
            icon={isCameraOn ? "videocam" : "videocam_off"}
            bind:selected={isCameraOn}
            aria-label="Camera"
            title="Camera"
          />
          <QIconBtn
            expressive
            icon="front_hand"
            bind:selected={isHandRaised}
            aria-label="Raise hand"
            title="Raise hand"
          />
        </QToolbar>
        <span class="body-medium" aria-live="polite">
          {isMicrophoneOn ? "Mic on" : "Mic off"} · {isCameraOn ? "Camera on" : "Camera off"}
          {isHandRaised ? " · Hand raised" : ""}
        </span>
      </div>
    </QDocsSection>

    <QDocsSection title="Docked Toolbar">
      {#snippet sectionDescription()}
        Docked toolbars fill their container's width and scroll horizontally when the actions need
        more space. Place one alongside the content it controls. Place buttons directly inside the
        toolbar to receive its button styling.
      {/snippet}

      <div class="q-toolbar-docs__viewer">
        <div class="q-toolbar-docs__photo">
          <img
            src="/cocktail.jpg"
            alt="Colorful fruit cocktail"
            style:transform={`scale(${zoom})`}
          />
        </div>
        <QToolbar aria-label="Photo controls">
          <QIconBtn
            expressive
            icon="zoom_out"
            aria-label="Zoom out"
            title="Zoom out"
            disabled={zoom === 1}
            onclick={() => (zoom -= 0.25)}
          />
          <QIconBtn
            expressive
            icon="zoom_in"
            aria-label="Zoom in"
            title="Zoom in"
            disabled={zoom === 2}
            onclick={() => (zoom += 0.25)}
          />
          <QIconBtn
            expressive
            icon="favorite"
            bind:selected={isFavorite}
            aria-label="Favorite photo"
            title="Favorite photo"
          />
        </QToolbar>
      </div>
      <p class="body-medium q-mt-sm" aria-live="polite">
        {zoom * 100}% zoom{isFavorite ? " · Added to favorites" : ""}
      </p>
    </QDocsSection>

    <QDocsSection title="Vertical Toolbar">
      {#snippet sectionDescription()}
        <code>vertical</code> uses the floating layout automatically and grows wider to fit larger
        controls. Leave at least 24px from screen edges and give each toolbar an accessible name
        with
        <code>aria-label</code>.
      {/snippet}

      <div class="q-toolbar-docs__editor flex items-center q-gap-lg q-pa-lg tertiary-container">
        <QToolbar vertical aria-label="Text formatting">
          <QIconBtn
            expressive
            icon="format_bold"
            bind:selected={isBold}
            aria-label="Bold"
            title="Bold"
          />
          <QIconBtn
            expressive
            icon="format_italic"
            bind:selected={isItalic}
            aria-label="Italic"
            title="Italic"
          />
          <QIconBtn
            expressive
            icon="format_underlined"
            bind:selected={isUnderlined}
            aria-label="Underline"
            title="Underline"
          />
        </QToolbar>
        <p
          class="title-large q-ma-none"
          class:text-bold={isBold}
          class:text-italic={isItalic}
          style:text-decoration={isUnderlined ? "underline" : undefined}
        >
          Make room for good ideas.
        </p>
      </div>
    </QDocsSection>
  {/snippet}
</QDocs>

<style lang="scss">
  .q-toolbar-docs {
    &__call {
      width: 100%;
      max-width: 24rem;
      border-radius: 24px;
    }

    &__viewer {
      max-width: 30rem;
      overflow: hidden;
      border-radius: 16px;
    }

    &__photo {
      height: 240px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &__editor {
      max-width: 30rem;
      border-radius: 24px;

      p {
        flex: 1;
        min-width: 0;
      }
    }
  }
</style>
