<script lang="ts">
  import { QFooterDocs } from "$components/footer/docs";
  import { QFooter, QLayout } from "$lib";
  import { QDocs, QDocsSection } from "$private";

  import snippets from "./docs.snippets";

  const lorem = `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolores tempora itaque nulla tenetur distinctio reiciendis quidem. Enim illum dolorum pariatur consequuntur, est aperiam atque quasi dolor quam ratione dicta nostrum.
            Minus tenetur quam doloremque vel tempore saepe veniam fuga animi nostrum error consequuntur suscipit amet culpa, blanditiis optio quasi. Sit, sint. At facilis fugiat cumque. Velit esse officia aspernatur qui?
            Recusandae cum, sit sint animi veniam voluptatem. Nemo, animi deserunt unde libero reprehenderit nulla accusamus iusto iure, fugiat eius sequi nesciunt doloribus quo a. Dicta eius provident autem animi labore.
            Quos quisquam quod commodi architecto. Unde, iusto sint dolor nostrum magnam modi maxime nihil commodi aliquid eligendi reprehenderit, molestias nobis quod voluptates, temporibus odit laboriosam numquam labore mollitia quo ea!
            Labore sequi ipsum quidem natus excepturi alias porro molestias rerum accusamus ipsa repudiandae nisi nam libero, nostrum facilis vel illum possimus fuga suscipit consequuntur error, aliquam earum. Ratione, quo sed.
            Temporibus magnam odit libero dolorum suscipit, exercitationem illo animi nihil assumenda in incidunt nostrum quisquam vero voluptatem sit. Fuga nam eos saepe quasi maiores hic iste ipsum laudantium in vero!
            Corrupti repellat veniam id quos facilis quae at accusantium! Dolorem, vel inventore aliquid, autem iusto necessitatibus molestias soluta officia culpa voluptatibus illum asperiores. Ex voluptatibus in cum illum nesciunt nostrum!
            Excepturi, esse officia inventore quisquam eaque molestias? Aperiam totam inventore repellendus itaque beatae, unde voluptas eius cupiditate alias commodi voluptatem eum sequi! Distinctio, inventore? Odit modi impedit culpa ipsum voluptatem?
            Praesentium ea, non veritatis aliquid ad explicabo? Tempora accusamus nobis corporis. Itaque ipsa dicta possimus quaerat dolores quibusdam dolor! Dolores, nesciunt mollitia. Reprehenderit molestias aspernatur unde non, enim incidunt totam.
            Accusamus odio ullam debitis similique quae! Id rem laborum dolorem eveniet voluptates, nostrum pariatur alias perferendis. Laboriosam voluptates vitae facilis asperiores labore temporibus officia enim voluptatem animi sunt, eos accusamus.
            Dolor necessitatibus in distinctio omnis molestiae sapiente possimus? Est, repellat in harum numquam eius accusantium aperiam magnam architecto animi omnis saepe deserunt. Deleniti facere nemo mollitia sunt, quisquam quidem quibusdam.
            Tempora enim obcaecati officiis fugiat nulla nostrum nobis quos, placeat vero quasi natus ea sequi provident aspernatur alias consequatur, praesentium laborum culpa dignissimos? Voluptatibus rem recusandae ipsum dolorem culpa facere?
            Iure fuga necessitatibus maiores recusandae sed maxime nostrum ratione ab nesciunt praesentium accusamus facere optio ullam, deleniti suscipit eos, temporibus mollitia repellendus autem dolor, rem nihil. Neque repellat at debitis.
            Odit aspernatur, alias aliquam explicabo velit repudiandae placeat repellat numquam cupiditate dolorum? Quos ipsam doloremque perspiciatis, illum reprehenderit iusto? Error, esse adipisci dolor iste maiores quibusdam atque libero quos beatae?
            Ea tempore voluptate, sunt exercitationem nihil sed repellendus quaerat repellat doloribus omnis temporibus dolorem ipsum architecto voluptates inventore ratione velit natus nulla tempora, aperiam expedita aliquam eum provident. Rerum, explicabo.
            Iure quasi perferendis possimus? Vitae nobis quisquam vel, necessitatibus eum amet cum quam, eaque illum hic veritatis, quod asperiores harum nostrum! Fugiat, repudiandae incidunt. Sint, aliquid voluptas! Sed, incidunt facilis!
            Est, totam? Rerum dolores culpa, dignissimos quis eligendi modi aliquam at porro nemo impedit fuga accusantium distinctio sunt harum perspiciatis quo in numquam delectus ea quod. Error officia praesentium dignissimos!
            Corporis ipsum eos necessitatibus veniam labore eligendi, exercitationem magnam, quasi quod praesentium officiis esse, quos nemo perspiciatis harum laborum sit animi nulla impedit modi. Doloremque quae veritatis quia. Exercitationem, perferendis.
            Odit corporis explicabo labore nisi officiis illum a. Provident repellat vitae pariatur molestias quae hic molestiae, neque eaque at velit quidem deserunt error architecto. Non a tenetur nihil eveniet inventore.
            Voluptas, molestiae consequatur vero sunt id hic modi expedita pariatur ullam vel, magni excepturi libero minus maxime perspiciatis voluptatibus enim amet, error optio fugit maiores debitis ab. Assumenda, veritatis ad.`;
</script>

<QDocs {snippets} componentDocs={QFooterDocs}>
  {#snippet display()}
    <QLayout class="surface" style="height: 100%; width: 75%; min-width: unset; min-height: unset">
      {#snippet footer()}
        <QFooter bordered>
          <h5>Hello world</h5>
        </QFooter>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Footer">
        {#snippet sectionDescription()}
          <p>
            The <code>QFooter</code> component is used to create a footer for your layout. It supports
            various customization options such as visibility, borders, and reveal behavior.
          </p>
          <p>
            You can easily add a separation between the footer and the content above it by using the
            <code>bordered</code> prop. This will add a border to the top of the footer.
          </p>
        {/snippet}

        <QLayout style="border: 1px solid var(--outline)">
          <div class="q-pa-md" style="max-height: 10rem">
            {lorem}
          </div>

          {#snippet footer()}
            <QFooter bordered height={60}>
              <span>Basic Footer Content</span>
            </QFooter>
          {/snippet}
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Reveal Footer">
        {#snippet sectionDescription()}
          The <code>reveal</code> prop allows the footer to hide when scrolling down and reappear
          when scrolling up. You can customize the reveal offset using the <code>revealOffset</code>
          prop.
        {/snippet}

        <QLayout style="border: 1px solid var(--outline); height: 15rem">
          <div class="q-pa-md" style="max-height: 10rem">
            {lorem}
          </div>

          {#snippet footer()}
            <QFooter reveal revealOffset={100} bordered>
              <span>Reveal Footer Content</span>
            </QFooter>
          {/snippet}
        </QLayout>
      </QDocsSection>

      <QDocsSection title="Custom Height Footer">
        {#snippet sectionDescription()}
          You can specify the height of the footer using the <code>height</code> prop. As of now, the
          height can only be set in pixels (passing a number). The default height is 64px.
        {/snippet}

        <QLayout style="border: 1px solid var(--outline)">
          <div class="q-pa-md" style="max-height: 10rem">
            {lorem}
          </div>

          {#snippet footer()}
            <QFooter height={100} bordered>
              <span>Custom Height Footer Content</span>
            </QFooter>
          {/snippet}
        </QLayout>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
