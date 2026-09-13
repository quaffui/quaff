<script lang="ts">
  import { QAvatarDocs } from "$components/avatar/docs";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";
  import { QAvatar, QBtn } from "$lib";
  import { QDocs, QDocsSection } from "$docs";
  import snippets from "./docs.snippets";

  docsCtx.set({ snippets, componentDocs: QAvatarDocs });

  let paused = $state(false);
</script>

<svelte:head>
  <title>{pageTitle("QAvatar")}</title>
</svelte:head>

<QDocs>
  {#snippet display()}
    <QAvatar src="/cocktail.jpg" size="5rem" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Default slot">
        {#snippet sectionDescription()}
          Use the default snippet for initials or a custom icon. Initials use Material 3
          <code>title-medium</code> typography with <code>primary-container</code> and
          <code>on-primary-container</code> colors. Color classes can override these defaults.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar>AM</QAvatar>
          <QAvatar class="secondary-container">SC</QAvatar>
          <QAvatar class="primary">PR</QAvatar>
          <QAvatar class="primary-container">PC</QAvatar>
        </div>
      </QDocsSection>

      <QDocsSection title="Avatar Sizes">
        {#snippet sectionDescription()}
          The default is <code>sm</code> (2.5rem), matching the Material 3 list avatar. Quaff also
          provides <code>xs</code> (2rem), <code>md</code> (3rem), <code>lg</code> (3.5rem), and
          <code>xl</code> (4rem). These measurements use rem units and scale with the root font.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" size="xs" />
          <QAvatar src="/cocktail.jpg" />
          <QAvatar src="/cocktail.jpg" size="md" />
          <QAvatar src="/cocktail.jpg" size="lg" />
          <QAvatar src="/cocktail.jpg" size="xl" />
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Avatar Sizes">
        {#snippet sectionDescription()}
          You can also set a custom size for the avatar component by using the size prop. The size
          can be set using standard CSS units like rem, em, px, etc. If no unit is provided, the
          value will be treated as px. Material 3 input chips use a 1.5rem avatar; use <code
            >size="1.5rem"</code
          > for that context.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" size="1.5rem" />
          <QAvatar src="/cocktail.jpg" size="5rem" />
        </div>
      </QDocsSection>

      <QDocsSection title="Avatar Shapes">
        {#snippet sectionDescription()}
          Material 3 avatars use a circle. Quaff also offers custom shapes such as square,
          top-round, bottom-round, left-round, right-round, and partially rounded corners.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" />
          <QAvatar src="/cocktail.jpg" shape="square" />
          <QAvatar src="/cocktail.jpg" shape="top-round" />
          <QAvatar src="/cocktail.jpg" shape="bottom-left-round" />
        </div>
      </QDocsSection>

      <QDocsSection title="Avatar Videos">
        {#snippet sectionDescription()}
          Video avatars are a Quaff extension. They autoplay, remain muted and loop by default. Bind <code
            >paused</code
          > to provide a play/pause control, as shown below.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.mp4" size="lg" video bind:paused aria-hidden="true" />
          <QAvatar
            src="/cocktail.mp4"
            shape="square"
            size="lg"
            video
            bind:paused
            aria-hidden="true"
          />
          <QAvatar
            src="/cocktail.mp4"
            shape="left-round"
            size="lg"
            video
            bind:paused
            aria-hidden="true"
          />
          <QAvatar
            src="/cocktail.mp4"
            shape="top-right-round"
            size="lg"
            video
            bind:paused
            aria-hidden="true"
          />
          <QBtn
            label={paused ? "Play avatars" : "Pause avatars"}
            onclick={() => (paused = !paused)}
          />
        </div>
      </QDocsSection>

      <QDocsSection title="Avatar Accessibility">
        {#snippet sectionDescription()}
          Images default to <code>alt=""</code> when decorative or already identified by nearby
          text. Provide meaningful <code>alt</code> text for informative images. For initials, icons
          or video, use <code>role="img"</code> with an accessible name when they convey an
          identity. Use a labelled button or link around an interactive avatar. Video captions and
          fallback content can be supplied through <code>videoAccessibility</code>; fallback text
          alone is not a caption track or pause control.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" alt="Cocktail avatar" />
          <QAvatar role="img" aria-label="Alex Morgan">AM</QAvatar>
          <QAvatar
            src="/cocktail.mp4"
            size="lg"
            video
            bind:paused
            role="img"
            aria-label="Cocktail video"
          >
            {#snippet videoAccessibility()}
              <p>Your browser does not support the video tag.</p>
            {/snippet}
          </QAvatar>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
