<script lang="ts">
  import { QIcon } from "$lib";
  import { QIconDocs } from "$components/icon/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
</script>

<QDocs QComponentDocs={QIconDocs}>
  <QIcon slot="display" name="check" />

  <div slot="usage">
    <QDocsSection title="Default">
      <div class="flex q-gap-lg items-center">
        <QIcon name="check" />
        <QIcon name="edit" />
      </div>
    </QDocsSection>
    <QDocsSection title="Color">
      <div class="flex q-gap-lg items-center">
        <QIcon name="check" color="green" />
        <QIcon name="check" color="purple" />
        <QIcon name="check" color="blue" />
      </div>
    </QDocsSection>
    <QDocsSection title="Sizes">
      <div class="flex q-gap-lg items-center">
        <QIcon name="check" size="xs" />
        <QIcon name="check" size="sm" />
        <QIcon name="check" size="md" />
        <QIcon name="check" size="lg" />
        <QIcon name="check" size="xl" />
      </div>
    </QDocsSection>
    <QDocsSection title="Types">
      <div class="flex q-gap-lg items-center">
        <QIcon name="table" type="rounded" />
        <QIcon name="table" type="outlined" />
        <QIcon name="table" type="sharp" />
      </div>
    </QDocsSection>
    <QDocsSection title="Image">
      <div class="flex q-gap-lg items-center">
        <QIcon img="/cocktail.jpg" />
      </div>
    </QDocsSection>
  </div>
</QDocs>
