<script lang="ts">
  import { QLinearProgressDocs, QCircularProgressDocs } from "$components/progress/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import QLinearProgress from "$lib/components/progress/QLinearProgress.svelte";
  import QCircularProgress from "$lib/components/progress/QCircularProgress.svelte";
  import snippets from "./docs.snippets";
</script>

<QDocs {snippets} componentDocs={[QLinearProgressDocs, QCircularProgressDocs]}>
  {#snippet usage()}
    <div>
      <QDocsSection title="Linear Progress">
        <QLinearProgress value={30}></QLinearProgress>
        <QLinearProgress class="q-mt-md" value={30} reverse></QLinearProgress>
        <QLinearProgress class="q-mt-md" value={30}></QLinearProgress>
        <QLinearProgress class="q-mt-md" indeterminate></QLinearProgress>
      </QDocsSection>

      <QDocsSection title="Circular Progress">
        <QCircularProgress color="primary" value={10}></QCircularProgress>
        <QCircularProgress color="secondary" class="q-ml-md" value={90}></QCircularProgress>
        <QCircularProgress color="tertiary" class="q-ml-md" value={80} indeterminate
        ></QCircularProgress>
      </QDocsSection>
      <QDocsSection title="Circular Progress sizes">
        <QCircularProgress color="primary" value={30} size="1rem" />
        <QCircularProgress color="secondary" class="q-ml-md" value={90} size="3rem" />
        <QCircularProgress color="tertiary" class="q-ml-md" indeterminate size="5rem" />
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
