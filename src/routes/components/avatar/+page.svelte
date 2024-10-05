<script lang="ts">
  import { QAvatar } from "$lib";
  import { QAvatarDocs } from "$components/avatar/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import snippets from "./docs.snippets";
</script>

<QDocs componentDocs={QAvatarDocs}>
  {#snippet display()}
    <QAvatar src="/cocktail.jpg" size="5rem" />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection snippet={snippets["Default slot"]} title="Default slot">
        <div class="flex q-gap-lg items-center">
          <QAvatar class="bg-green">GR</QAvatar>
          <QAvatar class="bg-red-5">RD</QAvatar>
          <QAvatar class="primary">PR</QAvatar>
          <QAvatar class="primary-container">PC</QAvatar>
        </div>
      </QDocsSection>

      <QDocsSection snippet={snippets["Avatar Sizes"]} title="Avatar Sizes">
        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" size="xs" />
          <QAvatar src="/cocktail.jpg" size="sm" />
          <QAvatar src="/cocktail.jpg" />
          <QAvatar src="/cocktail.jpg" size="lg" />
          <QAvatar src="/cocktail.jpg" size="xl" />
        </div>
      </QDocsSection>

      <QDocsSection snippet={snippets["Custom Avatar Sizes"]} title="Custom Avatar Sizes">
        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" size="5rem" />
        </div>
      </QDocsSection>

      <QDocsSection snippet={snippets["Avatar Shapes"]} title="Avatar Shapes">
        <div class="flex q-gap-lg items-center">
          <QAvatar src="/cocktail.jpg" />
          <QAvatar src="/cocktail.jpg" shape="rounded" />
          <QAvatar src="/cocktail.jpg" shape="top-round" />
          <QAvatar src="/cocktail.jpg" shape="bottom-left-round" />
        </div>
      </QDocsSection>

      <QDocsSection snippet={snippets["Avatar Videos"]} title="Avatar Videos">
        <div class="flex q-gap-lg items-center">
          <QAvatar src="/sea.mp4" size="lg" video />
          <QAvatar src="/sea.mp4" shape="rounded" size="lg" video />
          <QAvatar src="/sea.mp4" shape="left-round" size="lg" video />
          <QAvatar src="/sea.mp4" shape="top-right-round" size="lg" video />
        </div>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
