<script lang="ts">
  import QItem from "#components/list/QItem.svelte";
  import QItemSection from "#components/list/QItemSection.svelte";
  import QList from "#components/list/QList.svelte";
</script>

{#snippet rows()}
  <QItem>
    <QItemSection>One line</QItemSection>
  </QItem>
  <QItem>
    <QItemSection>
      Two lines
      {#snippet line1()}Supporting text{/snippet}
    </QItemSection>
  </QItem>
  <QItem>
    <QItemSection>
      Three lines
      {#snippet line1()}Supporting text{/snippet}
      {#snippet line2()}More supporting text{/snippet}
    </QItemSection>
  </QItem>
{/snippet}

<QList id="standard" aria-label="Standard rows">{@render rows()}</QList>
<QList id="dense" dense aria-label="Dense rows">{@render rows()}</QList>
<QList id="expressive" expressive aria-label="Expressive rows">{@render rows()}</QList>

<QList id="wrapped" aria-label="Wrapped rows">
  <QItem id="wrapped-two">
    <div style="display: contents">
      <QItemSection>
        Wrapped two lines
        {#snippet line1()}Supporting text{/snippet}
      </QItemSection>
    </div>
  </QItem>
  <QItem id="wrapped-three">
    <div style="display: contents">
      <div style="display: contents">
        <QItemSection>
          Wrapped three lines
          {#snippet line1()}Supporting text{/snippet}
          {#snippet line2()}More supporting text{/snippet}
        </QItemSection>
      </div>
    </div>
  </QItem>
</QList>

<QList aria-label="Wrapped rows with nested rows">
  <QItem id="mixed-row">
    <div style="display: contents">
      <QItemSection>
        Outer row with three lines
        {#snippet line1()}Supporting text{/snippet}
        {#snippet line2()}More supporting text{/snippet}
      </QItemSection>
    </div>
    <QList aria-label="Nested three-line rows">
      <QItem>
        <QItemSection>
          Nested row with three lines
          {#snippet line1()}Supporting text{/snippet}
          {#snippet line2()}More supporting text{/snippet}
        </QItemSection>
      </QItem>
    </QList>
  </QItem>
</QList>

<QList aria-label="Parent rows">
  <QItem id="outer-row">
    <QItemSection>Outer row</QItemSection>
    <QList aria-label="Nested rows">
      <QItem id="nested-row">
        <div style="display: contents">
          <QItemSection>
            Nested row
            {#snippet line1()}Supporting text{/snippet}
          </QItemSection>
        </div>
      </QItem>
    </QList>
  </QItem>
</QList>
