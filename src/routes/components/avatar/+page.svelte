<script lang="ts">
  import { QAvatar } from "$lib";
  import { QAvatarDocs } from "$components/avatar/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
</script>

<QDocs QComponentDocs={QAvatarDocs} usagePath="avatar">
  <QAvatar slot="display" src="/cocktail.jpg" size="5rem" />

  <div slot="usage">
    <QDocsSection title="Avatar Sizes">
      <div class="flex avatar-gap" style="align-items: center">
        <QAvatar src="/cocktail.jpg" shape="circle" size="xs" />
        <QAvatar src="/cocktail.jpg" shape="circle" size="sm" />
        <QAvatar src="/cocktail.jpg" shape="circle" />
        <QAvatar src="/cocktail.jpg" shape="circle" size="lg" />
        <QAvatar src="/cocktail.jpg" shape="circle" size="xl" />
      </div>
    </QDocsSection>

    <QDocsSection title="Custom Avatar Sizes">
      <div class="flex avatar-gap" style="align-items: center">
        <QAvatar src="/cocktail.jpg" shape="circle" size="5rem" />
      </div>
    </QDocsSection>

    <QDocsSection title="Avatar Shapes">
      <div class="flex avatar-gap" style="align-items: center">
        <QAvatar src="/cocktail.jpg" shape="circle" />
        <QAvatar src="/cocktail.jpg" shape="rounded" />
        <QAvatar src="/cocktail.jpg" shape="top-round" />
        <QAvatar src="/cocktail.jpg" shape="bottom-left-round" />
      </div>
    </QDocsSection>

    <QDocsSection title="Avatar Videos">
      <div class="flex avatar-gap" style="align-items: center">
        <QAvatar src="/sea.mp4" shape="circle" size="lg" video />
        <QAvatar src="/sea.mp4" shape="rounded" size="lg" video />
        <QAvatar src="/sea.mp4" shape="left-round" size="lg" video />
        <QAvatar src="/sea.mp4" shape="top-right-round" size="lg" video />
      </div>
    </QDocsSection>
  </div>
</QDocs>

<style lang="scss">
  .avatar-gap {
    gap: 2em;
  }
</style>
