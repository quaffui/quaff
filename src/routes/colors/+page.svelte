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

  const textColor = (color: string, step: number) => {
    if (step <= 5 + Number(["lime", "yellow"].includes(color))) {
      return `${color}-10`;
    } else {
      return `${color}-1`;
    }
  };
</script>

<div class="q-page">
  <h1 class="q-mb-xl">Colors</h1>

  <div class="row q-gutter-md">
    {#each colors as color (color)}
      <div class="col-xs-12 col-sm-6 col-md-3 col-lg-2 palette">
        <div class="bg-{color} text-{color}-10 title-large q-pa-sm">{color}</div>
        {#each { length: 10 }, step (step)}
          {@const stepp = step + 1}
          <div class="bg-{color}-{stepp} q-pa-sm text-{textColor(color, stepp)}">
            {color}-{stepp}
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
