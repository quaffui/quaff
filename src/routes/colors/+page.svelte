<script lang="ts">
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
</script>

<div class="q-page">
  <h1 class="q-mb-xl">Colors</h1>

  <div class="row q-gutter-md">
    {#each colors as color (color)}
      <div class="col-xs-12 col-sm-6 col-md-3 col-lg-2 palette">
        <div class="bg-{color} text-grey-10 heading q-pa-sm">{color}</div>
        {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as step (step)}
          <div class="bg-{color}-{step} q-pa-sm {step < 5 ? 'text-grey-8' : ''}">
            {color}-{step}
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
      font-weight: bold;
    }

    > * {
      border-radius: unset;
    }
  }
</style>
