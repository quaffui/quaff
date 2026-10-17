<script lang="ts">
  import QFooter from "#components/footer/QFooter.svelte";
  import QLayout from "#components/layout/QLayout.svelte";
</script>

<div id="frame" style="height: 500px;">
  <QLayout view="hhh lpr fff">
    {#snippet footer()}
      <QFooter id="footer" reveal>Footer</QFooter>
    {/snippet}
    <div style="height: 2000px;">Content</div>
  </QLayout>
</div>
