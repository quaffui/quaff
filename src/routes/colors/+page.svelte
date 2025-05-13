<script lang="ts">
  import { pageTitle } from "$helpers/pageTitle";

  const colors = [
    "red",
    "pink",
    "purple",
    "deep-purple",
    "indigo",
    "blue",
    "light-blue",
    "cyan",
    "teal",
    "green",
    "light-green",
    "lime",
    "yellow",
    "amber",
    "orange",
    "deep-orange",
    "brown",
    "blue-grey",
    "grey",
  ];

  const textColor = (color: string, index: number) => {
    const colorsTooLightForIndex5LightText = ["lime", "yellow"];

    // Change to a light text color at index 6 for light colors
    // and at index 5 for the rest
    const switchingTextColorIndex = 5 + Number(colorsTooLightForIndex5LightText.includes(color));

    return index <= switchingTextColorIndex ? `${color}-10` : `${color}-1`;
  };
</script>

<svelte:head>
  <title>{pageTitle("Colors")}</title>
</svelte:head>

<div class="q-page">
  <h1 class="q-mb-xl">Colors</h1>

  <div class="row q-gutter-md">
    {#each colors as color (color)}
      <div class="col-xs-12 col-sm-6 col-md-3 col-lg-2 palette">
        <div class="bg-{color} text-{color}-10 title-large q-pa-sm">{color}</div>
        {#each { length: 10 }, index (index)}
          {@const shadeNumber = index + 1}
          <div class="bg-{color}-{shadeNumber} q-pa-sm text-{textColor(color, shadeNumber)}">
            {color}-{shadeNumber}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .palette {
    font-size: 1rem;
    text-align: center;
    border-radius: 1.25rem;
    overflow: hidden;

    .heading {
      font-weight: bolder;
    }

    > * {
      border-radius: unset;
    }
  }
</style>
