<script lang="ts">
  import { QAvatarDocs } from "$components/avatar/docs";
  import { pageTitle } from "$helpers/pageTitle";
  import { QAvatar } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import snippets from "./docs.snippets";
</script>

<svelte:head>
  <title>{pageTitle("QAvatar")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QAvatarDocs}>
  {#snippet display()}
    <QAvatar src="/cocktail.jpg" size="5rem" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Default slot">
        {#snippet sectionDescription()}
          The default slot can be used to display a custom content inside the avatar. This can be
          useful when you want to display a user's initials or a custom icon.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar class="bg-green">GR</QAvatar>
          <QAvatar class="bg-red-5">RD</QAvatar>
          <QAvatar class="primary">PR</QAvatar>
          <QAvatar class="primary-container">PC</QAvatar>
        </div>
      </QDocsSection>

      <QDocsSection title="Avatar Sizes">
        {#snippet sectionDescription()}
          The avatar component comes with a set of predefined sizes. Those include: xs, sm, md
          (default), lg and xl.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" size="xs" />
          <QAvatar src="/cocktail.jpg" size="sm" />
          <QAvatar src="/cocktail.jpg" />
          <QAvatar src="/cocktail.jpg" size="lg" />
          <QAvatar src="/cocktail.jpg" size="xl" />
        </div>
      </QDocsSection>

      <QDocsSection title="Custom Avatar Sizes">
        {#snippet sectionDescription()}
          You can also set a custom size for the avatar component by using the size prop. The size
          can be set using standard CSS units like rem, em, px, etc. If no unit is provided, the
          value will be treated as px.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" size="5rem" />
        </div>
      </QDocsSection>

      <QDocsSection title="Avatar Shapes">
        {#snippet sectionDescription()}
          The avatar component comes with a set of predefined shapes to customize the avatar with.
          Those include: circle (default), square, top-round, bottom-round, left-round, right-round,
          and other combinations.
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
          The avatar component can also display videos. The video will be played automatically when
          the avatar is rendered and will loop indefinitely.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.mp4" size="lg" video />
          <QAvatar src="/cocktail.mp4" shape="square" size="lg" video />
          <QAvatar src="/cocktail.mp4" shape="left-round" size="lg" video />
          <QAvatar src="/cocktail.mp4" shape="top-right-round" size="lg" video />
        </div>
      </QDocsSection>

      <QDocsSection title="Avatar Accessibility">
        {#snippet sectionDescription()}
          The avatar component is accessible by default. It includes the alt attribute for images
          and allows to add accessibility attributes for videos. You can customize those by using
          the alt prop and the videoAccessibility snippet respectively.
        {/snippet}

        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" alt="Cocktail avatar" />
          <QAvatar src="/cocktail.mp4" size="lg" video aria-label="Sea">
            {#snippet videoAccessibility()}
              <p>Your browser does not support the video tag.</p>
            {/snippet}
          </QAvatar>
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
