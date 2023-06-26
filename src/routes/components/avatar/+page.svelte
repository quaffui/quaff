<script lang="ts">
  import { QAvatar } from "$lib";
  import { QAvatarDocs } from "$components/avatar/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";
</script>

<QDocs QComponentDocs={QAvatarDocs}>
  <QAvatar slot="display" src="/cocktail.jpg" size="5rem" />

  <div slot="usage">
    <QDocsSection {snippets} title="Default slot">
      <div class="flex q-gap-lg middle-align">
        <QAvatar class="green">GR</QAvatar>
        <QAvatar class="red5">RD</QAvatar>
        <QAvatar class="primary">PR</QAvatar>
        <QAvatar class="primary-container">PC</QAvatar>
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Avatar Sizes">
      <div class="flex q-gap-lg middle-align">
        <QAvatar src="/cocktail.jpg" size="xs" />
        <QAvatar src="/cocktail.jpg" size="sm" />
        <QAvatar src="/cocktail.jpg" />
        <QAvatar src="/cocktail.jpg" size="lg" />
        <QAvatar src="/cocktail.jpg" size="xl" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Custom Avatar Sizes">
      <div class="flex q-gap-lg middle-align">
        <QAvatar src="/cocktail.jpg" size="5rem" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Avatar Shapes">
      <div class="flex q-gap-lg middle-align">
        <QAvatar src="/cocktail.jpg" />
        <QAvatar src="/cocktail.jpg" shape="rounded" />
        <QAvatar src="/cocktail.jpg" shape="top-round" />
        <QAvatar src="/cocktail.jpg" shape="bottom-left-round" />
      </div>
    </QDocsSection>

    <QDocsSection {snippets} title="Avatar Videos">
      <div class="flex q-gap-lg middle-align">
        <QAvatar src="/sea.mp4" size="lg" video />
        <QAvatar src="/sea.mp4" shape="rounded" size="lg" video />
        <QAvatar src="/sea.mp4" shape="left-round" size="lg" video />
        <QAvatar src="/sea.mp4" shape="top-right-round" size="lg" video />
      </div>
    </QDocsSection>
  </div>
</QDocs>
