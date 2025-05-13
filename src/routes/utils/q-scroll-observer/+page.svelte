<script lang="ts">
  import { QDocs, QDocsSection } from "$private";
  import { QCodeBlock, QScrollObserver } from "$lib";
  import { pageTitle } from "$helpers/pageTitle";

  const displayObserver = new QScrollObserver("#display-observer");
  const usageObserver = new QScrollObserver("#usage-observer");

  const usageObserverProperties = $derived({
    position: usageObserver.position,
    direction: usageObserver.direction,
    changedDirection: usageObserver.changedDirection,
    delta: usageObserver.delta,
    inflectionPoint: usageObserver.inflectionPoint,
  });
</script>

<svelte:head>
  <title>{pageTitle("QScrollObserver")}</title>
</svelte:head>

<QDocs
  docName="QScrollObserver"
  docDescription="A utility to observe scroll events on a target element. It provides derived properties for various scroll metrics."
>
  {#snippet display()}
    <div
      id="display-observer"
      class="q-pa-md"
      style="max-height: 100%; max-width: 40%; overflow: auto; justify-self: start;"
    >
      <h6>Scroll me</h6>

      Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit ipsam, odio corrupti illum
      possimus, suscipit doloremque asperiores quidem iure nostrum dolor enim deleniti eum! Incidunt
      quisquam eligendi illum dolores nobis! Modi optio commodi veritatis molestias esse maiores
      cupiditate a consectetur facere, deleniti veniam quo ullam quod inventore eaque minima laborum
      nisi adipisci eligendi laboriosam ducimus amet? Deserunt sapiente blanditiis ab! Perferendis
      iure, magnam, quod eius assumenda beatae expedita explicabo quo sed magni laboriosam? Quidem
      velit culpa, reprehenderit, reiciendis rerum praesentium eum quos nemo assumenda
      necessitatibus quibusdam rem autem eaque possimus. Dolor assumenda nam doloremque esse veniam
      asperiores aspernatur exercitationem, quaerat quos sed perspiciatis atque porro voluptatum
      temporibus hic est minima ad. Earum rerum cumque voluptates minus, labore adipisci expedita
      voluptatibus. Eos vero eaque minima possimus optio accusamus necessitatibus ipsam molestiae
      facere dolore, quod odit, ad, adipisci voluptatum aspernatur aliquam! Delectus porro quibusdam
      qui. Voluptate dolore consequatur qui suscipit. Deleniti, autem? Rem in impedit consequuntur
      nihil, error illo autem fugit molestiae provident nam quasi illum inventore iste doloremque
      numquam obcaecati? Dolorum, totam molestias sunt fuga mollitia minus iure doloremque culpa
      beatae. Voluptatibus odit ad architecto ipsum illum aliquam distinctio adipisci. Fugiat eius
      quis ea delectus voluptates culpa ut iusto impedit iste, omnis temporibus aspernatur dolor
      facere, expedita molestias laborum tempora rerum? Voluptatibus inventore quos nobis fugit
      incidunt impedit repudiandae, autem sit fuga laborum? Itaque, officiis placeat officia quis
      adipisci perspiciatis recusandae ex error reprehenderit, nemo provident sunt fugit commodi
      doloribus quae. Perferendis cumque corrupti a alias eius quo nemo aspernatur doloribus
      molestias voluptas in cum sint qui repellendus cupiditate molestiae voluptates aliquam quia,
      enim officia ipsum fuga harum hic. Culpa, excepturi. Voluptate cum autem quaerat, ex nesciunt
      at alias amet dolorem modi! Nihil quia exercitationem veniam asperiores laboriosam dolore
      nobis? Dolorum impedit debitis aliquid id fugit asperiores nulla, aperiam dolor quidem?
    </div>

    <div class="flex column q-gap-sm">
      <div>
        Scroll position: {displayObserver.position}
      </div>
      <div>
        Scroll direction: {displayObserver.direction}
      </div>
      <div>
        Changed direction: {displayObserver.changedDirection}
      </div>
      <div>
        Delta: {displayObserver.delta}
      </div>
      <div>
        Inflection point: {displayObserver.inflectionPoint}
      </div>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Observing an element">
      {#snippet sectionDescription()}
        <p>
          There are two ways to start observing an element. The first is to pass the element
          reference to the constructor, either using <code>bind:this</code> or using a
          <code>document.querySelector</code> call. The second is to pass the element's selector to
          the constructor. This will use <code>document.querySelector</code> to find the element.
        </p>

        <h6>Example:</h6>
        <QCodeBlock language="ts" code="const scroll = new QScrollObserver('#my-element-id')" />

        <p>
          Then, you will be able to watch the reactive properties of the observer using Svelte's
          <code>$derived</code> or <code>$effect</code> runes or inside the markup directly.
        </p>

        <p>
          You don't have to worry about cleaning up the observer, as it will be automatically
          cleaned up when the element is destroyed. However, if you want to stop observing the
          element manually, you can call the <code>destroy</code> method on the observer.
        </p>

        <p>
          For more control, you can pass options to the constructor: <code>debounce: number</code>,
          to specify at what interval is milliseconds the observer should be triggered, and
          <code>horizontal: boolean</code>
          to specify if the observer should track horizontal scroll events rather than vertical. By default,
          the observer will track vertical scroll events only with no debounce.
        </p>

        <p>
          For now, the observer only supports observing one direction at a time. If you want to
          observe both directions, you will need to create two observers, one for each direction.
          This is subject to change in the future.
        </p>
      {/snippet}
    </QDocsSection>

    <QDocsSection title="Properties and methods">
      {#snippet sectionDescription()}
        <p>The observer has the following properties:</p>
        <ul class="q-ml-md">
          <li><code>position</code>: The current scroll position of the target element.</li>
          <li><code>direction</code>: The direction of the last scroll event.</li>
          <li>
            <code>changedDirection</code>: A boolean indicating if the scroll direction has changed
            since the last event.
          </li>
          <li>
            <code>delta</code>: The change in scroll position since the last event, i.e the amound
            scrolled during the event.
          </li>
          <li>
            <code>inflectionPoint</code>: The point at which the scroll direction last changed.
          </li>
        </ul>
        <p>
          The observer also has a <code>destroy</code> method that can be used to stop observing the
          target element and clean up the observer.
        </p>
      {/snippet}
    </QDocsSection>

    <QDocsSection title="Live example">
      <div class="flex items-center q-gap-lg">
        <div
          id="usage-observer"
          class="q-pa-md surface"
          style="max-height: 400px; max-width: 40%; overflow: auto; justify-self: start;"
        >
          <h6>Scroll me</h6>

          Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit ipsam, odio corrupti illum
          possimus, suscipit doloremque asperiores quidem iure nostrum dolor enim deleniti eum!
          Incidunt quisquam eligendi illum dolores nobis! Modi optio commodi veritatis molestias
          esse maiores cupiditate a consectetur facere, deleniti veniam quo ullam quod inventore
          eaque minima laborum nisi adipisci eligendi laboriosam ducimus amet? Deserunt sapiente
          blanditiis ab! Perferendis iure, magnam, quod eius assumenda beatae expedita explicabo quo
          sed magni laboriosam? Quidem velit culpa, reprehenderit, reiciendis rerum praesentium eum
          quos nemo assumenda necessitatibus quibusdam rem autem eaque possimus. Dolor assumenda nam
          doloremque esse veniam asperiores aspernatur exercitationem, quaerat quos sed perspiciatis
          atque porro voluptatum temporibus hic est minima ad. Earum rerum cumque voluptates minus,
          labore adipisci expedita voluptatibus. Eos vero eaque minima possimus optio accusamus
          necessitatibus ipsam molestiae facere dolore, quod odit, ad, adipisci voluptatum
          aspernatur aliquam! Delectus porro quibusdam qui. Voluptate dolore consequatur qui
          suscipit. Deleniti, autem? Rem in impedit consequuntur nihil, error illo autem fugit
          molestiae provident nam quasi illum inventore iste doloremque numquam obcaecati? Dolorum,
          totam molestias sunt fuga mollitia minus iure doloremque culpa beatae. Voluptatibus odit
          ad architecto ipsum illum aliquam distinctio adipisci. Fugiat eius quis ea delectus
          voluptates culpa ut iusto impedit iste, omnis temporibus aspernatur dolor facere, expedita
          molestias laborum tempora rerum? Voluptatibus inventore quos nobis fugit incidunt impedit
          repudiandae, autem sit fuga laborum? Itaque, officiis placeat officia quis adipisci
          perspiciatis recusandae ex error reprehenderit, nemo provident sunt fugit commodi
          doloribus quae. Perferendis cumque corrupti a alias eius quo nemo aspernatur doloribus
          molestias voluptas in cum sint qui repellendus cupiditate molestiae voluptates aliquam
          quia, enim officia ipsum fuga harum hic. Culpa, excepturi. Voluptate cum autem quaerat, ex
          nesciunt at alias amet dolorem modi! Nihil quia exercitationem veniam asperiores
          laboriosam dolore nobis? Dolorum impedit debitis aliquid id fugit asperiores nulla,
          aperiam dolor quidem?
        </div>

        <QCodeBlock
          language="ts"
          code={JSON.stringify(usageObserverProperties, null, 2)}
          class="q-mt-md"
        />
      </div>
    </QDocsSection>
  {/snippet}
</QDocs>
