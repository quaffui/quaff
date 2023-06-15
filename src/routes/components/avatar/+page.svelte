<script lang="ts">
  import { QAvatar } from "$lib";
  import { QAvatarDocs } from "$components/avatar/docs";
  import ApiDoc from "$lib/components/private/ApiDoc.svelte";
</script>

<ApiDoc QComponentDocs={QAvatarDocs}>
  <QAvatar slot="display" src="/cocktail.jpg" size="5rem" />
</ApiDoc>
