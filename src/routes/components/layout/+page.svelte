<script lang="ts">
  import {
    QDrawer,
    QLayout,
    QBtn,
    QToolbarTitle,
    QList,
    QHeader,
    QItem,
    QIcon,
    QItemSection,
    QRailbar,
    QFooter,
    QCard,
    QRadio,
    QSwitch,
  } from "$lib";
  import { QLayoutDocs } from "$lib/components/layout/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import { createStyles } from "$lib/utils";
  import type { QLayoutProps } from "$lib/components/layout/props";
  import { snippet } from "./docs.snippets";

  let displayLeftDrawerElement = $state<QDrawer>();
  let displayLeftDrawer = $state(false);
  let viewArr = $state([
    ["h", "h", "h"],
    ["l", "p", "r"],
    ["f", "f", "f"],
  ]);
  const view = $derived(viewArr.map((v) => v.join("")).join(" ") as QLayoutProps["view"]);

  let showHeader = $state(true);
  let showFooter = $state(true);
  let leftRailbar = $state(true);
  let leftDrawer = $state(true);
  let rightRailbar = $state(false);
  let rightDrawer = $state(false);

  const snippets = $derived(
    snippet(view, [showHeader, showFooter, leftRailbar, leftDrawer, rightRailbar, rightDrawer])
  );

  const style = $derived(
    createStyles({
      "--header-height": showHeader ? "64px" : "0px",
      "--footer-height": showFooter ? "80px" : "0px",
      "--left-railbar-width": leftRailbar ? "88px" : "0px",
      "--right-railbar-width": rightRailbar ? "88px" : "0px",
      "--left-drawer-width": leftDrawer ? "300px" : "0px",
      "--right-drawer-width": rightDrawer ? "300px" : "0px",
    }) || undefined
  );

  let leftDrawerElement = $state<QDrawer>();
  let leftDrawerShown = $state(true);

  let rightDrawerElement = $state<QDrawer>();
  let rightDrawerShown = $state(true);

  $effect(() => {
    if (!leftDrawer) {
      leftDrawerShown = false;
    } else if (!rightDrawer) {
      rightDrawerShown = false;
    }
  });
</script>

<QDocs componentDocs={QLayoutDocs}>
  {#snippet display()}
    <QLayout view="lhh lpr lfr" headerHeight="50px" footerHeight="50px">
      {#snippet header()}
        <QHeader elevate>
          <QBtn icon="menu" design="flat" onclick={displayLeftDrawerElement?.toggle} />
          <QToolbarTitle>Header</QToolbarTitle>
        </QHeader>
      {/snippet}
      {#snippet drawerLeft()}
        <QDrawer
          overlay
          bind:value={displayLeftDrawer}
          bordered
          class="no-round"
          bind:this={displayLeftDrawerElement}
        >
          <QList dense>
            <QItem to="#">
              <QIcon name="home" />
              <QItemSection>Home</QItemSection>
            </QItem>
            <QItem to="#">
              <QIcon name="help" />
              <QItemSection>About</QItemSection>
            </QItem>
            <QItem to="#">
              <QIcon name="shopping_cart" />
              <QItemSection>Store</QItemSection>
            </QItem>
            <QItem to="#">
              <QIcon name="mail" />
              <QItemSection>Contact</QItemSection>
            </QItem>
          </QList>
        </QDrawer>
      {/snippet}
      {#snippet railbarRight()}
        <QRailbar side="right" bordered>
          <QList>
            <QItem to="#">
              <QIcon name="home" />
              <QItemSection>Home</QItemSection>
            </QItem>
            <QItem to="#">
              <QIcon name="help" />
              <QItemSection>About</QItemSection>
            </QItem>
          </QList>
        </QRailbar>
      {/snippet}
      {#snippet footer()}
        <QFooter class="no-round flex flex-center">
          <h3 class="small center">Footer</h3>
        </QFooter>
      {/snippet}
    </QLayout>
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection {snippets} title="Trying different layouts">
        <QCard bordered class="q-pa-none" style="height: 80vh">
          <QLayout {view} {style}>
            {#snippet header()}
              {#if showHeader}
                <QHeader elevate>
                  {#if leftDrawer}
                    <QBtn icon="menu" design="flat" onclick={leftDrawerElement?.toggle} />
                  {/if}
                  <div class="flex column">
                    <QRadio bind:selected={viewArr[0][0]} value="h" label="h" />
                    <QRadio style="margin: 0" bind:selected={viewArr[0][0]} value="l" label="l" />
                  </div>
                  <div class="max flex column items-center" style="flex-grow: 1">
                    <QRadio
                      style="width: fit-content"
                      bind:selected={viewArr[0][1]}
                      value="h"
                      label="h"
                    />
                    <QRadio
                      style="width: fit-content; margin: 0"
                      bind:selected={viewArr[0][1]}
                      value="H"
                      label="H"
                    />
                  </div>
                  <div class="flex column">
                    <QRadio bind:selected={viewArr[0][2]} value="h" label="h" />
                    <QRadio style="margin: 0" bind:selected={viewArr[0][2]} value="r" label="r" />
                  </div>
                  {#if rightDrawer}
                    <QBtn icon="menu" design="flat" onclick={rightDrawerElement?.toggle} />
                  {/if}
                </QHeader>
              {/if}
            {/snippet}

            {#snippet railbarLeft()}
              {#if leftRailbar}
                <QRailbar bordered>
                  <QList>
                    <QItem to="#">
                      <QIcon name="home" />
                      <QItemSection>Home</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="help" />
                      <QItemSection>About</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="shopping_cart" />
                      <QItemSection>Store</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="mail" />
                      <QItemSection>Contact</QItemSection>
                    </QItem>
                  </QList>
                </QRailbar>
              {/if}
            {/snippet}

            {#snippet railbarRight()}
              {#if rightRailbar}
                <QRailbar side="right" bordered>
                  <QList>
                    <QItem to="#">
                      <QIcon name="home" />
                      <QItemSection>Home</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="help" />
                      <QItemSection>About</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="shopping_cart" />
                      <QItemSection>Store</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="mail" />
                      <QItemSection>Contact</QItemSection>
                    </QItem>
                  </QList>
                </QRailbar>
              {/if}
            {/snippet}
            {#snippet drawerLeft()}
              {#if leftDrawer}
                <QDrawer
                  bordered
                  width={160}
                  persistent
                  bind:value={leftDrawerShown}
                  bind:this={leftDrawerElement}
                >
                  <QList>
                    <QItem to="#">
                      <QIcon name="home" />
                      <QItemSection>Home</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="help" />
                      <QItemSection>About</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="shopping_cart" />
                      <QItemSection>Store</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="mail" />
                      <QItemSection>Contact</QItemSection>
                    </QItem>
                  </QList>
                </QDrawer>
              {/if}
            {/snippet}
            {#snippet drawerRight()}
              {#if rightDrawer}
                <QDrawer
                  side="right"
                  bordered
                  persistent
                  width={160}
                  bind:value={rightDrawerShown}
                  bind:this={rightDrawerElement}
                >
                  <QList>
                    <QItem to="#">
                      <QIcon name="home" />
                      <QItemSection>Home</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="help" />
                      <QItemSection>About</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="shopping_cart" />
                      <QItemSection>Store</QItemSection>
                    </QItem>
                    <QItem to="#">
                      <QIcon name="mail" />
                      <QItemSection>Contact</QItemSection>
                    </QItem>
                  </QList>
                </QDrawer>
              {/if}
            {/snippet}
            {#snippet footer()}
              <QFooter reveal>
                {#if leftDrawer}
                  <QBtn icon="menu" design="flat" onclick={leftDrawerElement?.toggle} />
                {/if}
                <div class="flex column">
                  <QRadio bind:selected={viewArr[2][0]} value="f" label="f" />
                  <QRadio style="margin: 0" bind:selected={viewArr[2][0]} value="l" label="l" />
                </div>
                <div class="max flex column items-center" style="flex-grow: 1">
                  <QRadio
                    style="width: fit-content"
                    bind:selected={viewArr[2][1]}
                    value="f"
                    label="f"
                  />
                  <QRadio
                    style="width: fit-content; margin: 0"
                    bind:selected={viewArr[2][1]}
                    value="F"
                    label="F"
                  />
                </div>
                <div class="flex column">
                  <QRadio bind:selected={viewArr[2][2]} value="f" label="f" />
                  <QRadio style="margin: 0" bind:selected={viewArr[2][2]} value="r" label="r" />
                </div>
                {#if rightDrawer}
                  <QBtn icon="menu" design="flat" onclick={rightDrawerElement?.toggle} />
                {/if}
              </QFooter>
            {/snippet}
            {#snippet content()}
              <QList style="text-align: center">
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={showHeader} />
                  </QItemSection>
                  <QItemSection>Header</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={leftRailbar} />
                  </QItemSection>
                  <QItemSection>Left Railbar</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={rightRailbar} />
                  </QItemSection>
                  <QItemSection>Right Railbar</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={leftDrawer} />
                  </QItemSection>
                  <QItemSection>Left Drawer</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={rightDrawer} />
                  </QItemSection>
                  <QItemSection>Right Drawer</QItemSection>
                </QItem>
                <QItem>
                  <QItemSection type="toggle">
                    <QSwitch bind:value={showFooter} />
                  </QItemSection>
                  <QItemSection>Footer</QItemSection>
                </QItem>
              </QList>

              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat, atque eveniet,
                ipsam blanditiis ab alias tenetur sint quidem adipisci amet repellat facilis quos
                recusandae sapiente laudantium. Est autem minima commodi? Illo inventore nisi iure
                modi illum et dolore quasi. Quod aperiam ea laboriosam alias laudantium eum. Labore
                cum laboriosam tempora molestiae vitae odit deleniti eum! Veritatis eos quo nemo
                quis? In asperiores reiciendis, dolores consequatur omnis molestiae fugit sit
                similique saepe pariatur sint, harum dolorem. Magnam eius eos minus consequatur non
                molestias dolore labore ipsum perferendis in? Officiis, fugiat accusantium. Totam ea
                voluptatem reprehenderit ipsa sit laudantium facilis exercitationem mollitia, modi
                atque perspiciatis dolorem enim voluptates asperiores eveniet tempore voluptatibus
                porro officiis eos harum dolor velit a odit tenetur. Rerum! Laborum ducimus minus
                harum non reiciendis quod mollitia corrupti aliquam placeat. Nemo voluptates
                laboriosam quas aut exercitationem obcaecati quo, deserunt, quisquam tempora
                recusandae nobis libero impedit iure eum ad omnis. Maiores minima voluptates
                dignissimos, numquam libero pariatur deleniti quibusdam eligendi, ullam consequatur
                odit. Et, eaque, fuga vitae accusamus facere vel dolor iste quos quidem eligendi eum
                reprehenderit nisi odit deleniti! Beatae placeat quibusdam temporibus libero laborum
                corrupti sint maiores. Soluta atque vero, natus ipsa inventore aspernatur quos enim
                ab assumenda. Maiores assumenda ratione illo? Dolor hic similique ipsum repellendus
                fugiat. Voluptatibus eaque dignissimos sapiente natus quod! Nulla distinctio magnam
                ea corporis iure harum, officiis id eligendi quia vel sint fugiat itaque maiores!
                Atque minima optio, accusamus ratione obcaecati exercitationem corporis. Inventore
                nisi illum fuga debitis error asperiores aperiam illo, sunt neque adipisci. Ut
                magnam iusto illo, quisquam assumenda laudantium praesentium, reprehenderit
                consectetur rerum dignissimos autem. Sequi suscipit minus illum quia. At molestiae
                vero, nisi placeat quis architecto id? Tempore labore magni nulla ut nisi sint modi
                incidunt sed nam aperiam assumenda quas, illo perferendis velit a qui itaque, beatae
                deserunt. Provident reiciendis, ex ab sequi eum non ratione, ut obcaecati
                perspiciatis veritatis dicta velit, quisquam incidunt aliquam id molestiae
                molestias! Accusantium dolores blanditiis velit autem. Ab error esse a et. Ducimus
                rerum eos non quidem, dolores inventore voluptatibus doloribus, cumque nihil debitis
                quaerat. Cum obcaecati distinctio cumque aliquam quia dolorem animi doloribus quo
                dolor, at, eveniet itaque praesentium corrupti molestiae? Soluta recusandae quis,
                accusamus praesentium fuga aliquam, architecto aperiam iste ducimus voluptate
                impedit cumque aspernatur corrupti, rem unde! Sunt ex cum corrupti aut quo hic
                blanditiis suscipit quis voluptatum itaque. Corporis magni ipsa esse libero eaque
                molestiae voluptatem, aliquam tempore inventore ab quis obcaecati fugiat at
                accusantium accusamus ad excepturi illum placeat aut, rem, necessitatibus adipisci.
                Quisquam voluptates illum eum. Optio aut quibusdam dolorem soluta libero numquam eum
                aliquid nostrum dignissimos aspernatur, molestiae eius. Velit, similique? Distinctio
                unde deleniti, corrupti saepe voluptates ipsam accusamus iure totam dolore
                repellendus reprehenderit. Modi. Vel perferendis placeat tenetur fugiat vitae,
                officia, consequatur quidem nam facilis numquam architecto obcaecati assumenda ipsum
                incidunt atque ullam, autem dolorem provident aut rem. Commodi natus saepe nobis
                minus ea? Dicta, in tenetur! Beatae repudiandae id veritatis quasi alias molestias
                esse aliquam dolor vero quae aut amet earum cupiditate accusantium sunt pariatur,
                laudantium commodi laboriosam! Accusantium dolore odio asperiores deleniti? Nihil
                illo saepe ad. Necessitatibus doloremque explicabo animi accusamus at veniam illum.
                Pariatur ea, numquam illo sint soluta obcaecati vel perspiciatis incidunt sapiente
                iure eius commodi, tempore veritatis quaerat provident! Tempora, quos odit. Ullam
                odit iusto iure nulla, perspiciatis facere ex nemo ad eos id, sit suscipit
                cupiditate reiciendis repellat autem. Veritatis fuga ipsam voluptas cumque ea
                similique neque atque. Odio nesciunt quo, deserunt harum suscipit illum, veniam
                quidem, aspernatur possimus placeat dolore temporibus quos! Facilis voluptas ea
                cupiditate, sequi doloribus minima numquam porro molestiae sapiente reiciendis
                necessitatibus sit qui.
              </p>
            {/snippet}
          </QLayout>
        </QCard>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>

<style lang="scss">
  :global(.q-layout__content > .q-list) {
    max-width: fit-content;
    margin-inline: auto;
  }
</style>
