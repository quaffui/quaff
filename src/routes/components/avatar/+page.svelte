<script lang="ts">
  import QItemSection from "./../../../lib/components/list/QItemSection.svelte";
  import QTabs from "./../../../lib/components/tabs/QTabs.svelte";
  import { QCard, QCardSection } from "$lib";
  import QAvatar from "$lib/components/avatar/QAvatar.svelte";
  import QIcon from "$lib/components/icon/QIcon.svelte";
  import QTab from "$lib/components/tabs/QTab.svelte";
  import QList from "$lib/components/list/QList.svelte";
  import QItem from "$lib/components/list/QItem.svelte";
  import QSeparator from "$lib/components/separator/QSeparator.svelte";

  let api: "props" | "slots" | "types" = "props";
</script>

<div style="margin: 1rem">
  <div class="grid" style="min-height: 400px">
    <QCard class="s6 flex center-align primary-container">
      <h1 class="large" slot="title">Avatar</h1>
    </QCard>
    <QCard class="s6 q-mt-none q-pa-none secondary-container">
      <QCardSection class="no-padding">
        <div
          class="flex center-align middle-align"
          style="position: absolute; height: 100%; width: 100%; z-index: 1;"
        >
          <QAvatar src="/cocktail.jpg" size="5rem" />
        </div>
        <img
          class="responsive medium"
          src="/beer-splash.jpeg"
          alt=""
          style="filter:brightness(0.3)"
        />
      </QCardSection>
      <QCardSection class="flex center-align middle-align">
        <h3 class="small">
          Avatars can be used in many different ways as with icons, for user profile images or
          videos, for example. They can have many different shapes, the default one being round.
        </h3>
      </QCardSection>
    </QCard>
  </div>
  <QCard class="q-px-none q-pb-none">
    <div slot="title" class="flex between-align middle-align q-px-md">
      <h5>
        <QIcon name="info" />
        <span class="q-ml-md">QAvatar API</span>
      </h5>
      <QTabs bind:value={api} class="no-margin">
        <QTab name="props">
          <h6>Props</h6>
        </QTab>
        <QTab name="slots">
          <h6>Slots</h6>
        </QTab>
        <QTab name="types">
          <h6>Types</h6>
        </QTab>
      </QTabs>
    </div>
    <QSeparator />
    <QCardSection>
      {#if api === "props"}
        <QList separator>
          <QItem>
            <span class="small-padding surface-variant small-round">
              <b>shape</b>
              <span style="opacity:0.75; cursor: pointer" on:click={() => (api = "types")}>
                : QAvatarShapeOptions = "circle"
              </span>
            </span>
            <span>Shape of the avatar.</span>
          </QItem>
          <QItem>
            <span class="small-padding surface-variant small-round">
              <b>size</b>
              <span style="opacity:0.75; cursor: pointer" on:click={() => (api = "types")}>
                : QAvatarSizeOptions = "md"
              </span>
            </span>
            <span>
              Size of the avatar, can be a custom size using CSS units. If no unit is specified,
              "px" will be used.
            </span>
          </QItem>
          <QItem>
            <span class="small-padding surface-variant small-round">
              <b>src</b>
              <span style="opacity:0.75;"> : string | undefined = undefined </span>
            </span>
            <span>
              Source of the image to use as the avatar. Can be a url or a path to a local file.
            </span>
          </QItem>
          <QItem>
            <span class="small-padding surface-variant small-round">
              <b>video</b>
              <span style="opacity:0.75;"> : boolean = false </span>
            </span>
            <span>
              If set to true, will use the <b>src</b> prop as a video source.
            </span>
          </QItem>
        </QList>
      {:else if api === "slots"}
        <QList>
          <QItem>
            <span class="small-padding surface-variant small-round">
              <b>default</b>
            </span>
            <span> The default slot should be used to display initials inside the avatar. </span>
          </QItem>
        </QList>
      {:else}
        <QList>
          <QItem>
            <QItemSection>
              <span class="small-padding surface-variant small-round">
                <b>QAvatarShapeOptions</b>
              </span>
            </QItemSection>
            <QItemSection>
              <span>
                circle | rounded | top-round | left-round | right-round | bottom-round |
                top-left-round | top-right-round | bottom-left-round | bottom-right-round
              </span>
            </QItemSection>
          </QItem>
          <QItem>
            <QItemSection>
              <span class="small-padding surface-variant small-round">
                <b>QAvatarSizeOptions</b>
              </span>
            </QItemSection>
            <QItemSection>
              <span> xs | sm | md | lg | xl | string | number </span>
            </QItemSection>
          </QItem>
        </QList>
      {/if}
    </QCardSection>
  </QCard>
</div>
