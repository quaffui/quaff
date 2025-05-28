<script lang="ts">
  import { goto } from "$app/navigation";
  import { QCard, QCardSection } from "$components";
  import QDocs from "$components/private/QDocs.svelte";
  import { pageTitle } from "$helpers/pageTitle";

  const utils = [
    {
      name: "Quaff",
      description:
        "Main class of the framework, for managing different states like dark mode or breakpoints.",
      href: "/utils/quaff",
      hovered: false,
    },
    {
      name: "QTheme",
      description: "Class for managing the application's color theme.",
      href: "/utils/qtheme",
      hovered: false,
    },
    {
      name: "QScrollObserver",
      description: "Utility for observing different properties related to scrolling.",
      href: "/utils/qscrollobserver",
      hovered: false,
    },
  ];
</script>

<svelte:head>
  <title>{pageTitle("Utils")}</title>
</svelte:head>

<QDocs docName="Utils" docDescription="Utilities and helper functions/classes for various tasks.">
  <div class="row q-gap-md q-mt-lg">
    {#each utils as util (util.name)}
      <div
        class="col-sm-6 col-lg-4 col-xs-12"
        role="link"
        tabindex="0"
        style="grid-auto-rows: 1fr; cursor: pointer;"
        onmouseenter={() => (util.hovered = true)}
        onmouseleave={() => (util.hovered = false)}
        onclick={() => goto(util.href)}
        onkeypress={(e) => {
          if (e.key === "Enter") {
            goto(util.href);
          }
        }}
      >
        <QCard
          class={["q-utils__card", util.hovered && "q-utils__card--hovered"]}
          style="height: 100%; transition: all 0.3s; overflow: hidden"
          fill={util.hovered ? "primary" : undefined}
        >
          <QCardSection class="text-center headline-medium">
            {util.name}
          </QCardSection>

          <QCardSection class="text-center" style="text-wrap: balance;">
            {util.description}
          </QCardSection>
        </QCard>
      </div>
    {/each}
  </div>
</QDocs>

<style>
  :global(.q-utils__card)::before {
    content: "";
    position: absolute;
    inset: 0;

    background-image: url("cocktail-close-up-2.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: hue-rotate(var(--q-hue-rotate)) brightness(var(--q-brightness));

    opacity: 0;
    transition: opacity 0.3s;
  }

  :global(.q-utils__card--hovered)::before {
    opacity: 1;
  }
</style>
