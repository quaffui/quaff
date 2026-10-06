<script lang="ts">
  import { resolve } from "$app/paths";
  import { QTableDocs } from "$components/table/docs";
  import type { QTableColumn, QTableRow } from "$components/table/props";
  import { QDocs, QDocsSection } from "$docs";
  import QLanguageExample from "$docs/QLanguageExample.svelte";
  import { docsCtx } from "$docs/QDocs.svelte";
  import { pageMeta } from "$docs/metadata";
  import { useMeta } from "$lib/meta";
  import { QBtn, QCheckbox, QIcon, QInput, QSelect, QSwitch, QTable } from "$lib";
  import snippets from "./docs.snippets";

  useMeta(
    pageMeta(
      "QTable — Data Table",
      "Display structured data with QTable for Svelte. Configure columns, pagination, sorting, value formatting, custom cells, localization, and row actions."
    )
  );

  const SPECIMENS: QTableRow[] = [
    { id: "AT-021", name: "Copper Dune", kind: "Iron", mass: 1840, cabinet: "A", drawer: 3 },
    { id: "AT-022", name: "Blue Moraine", kind: "Stone", mass: 128, cabinet: "B", drawer: 1 },
    { id: "AT-023", name: "Lantern Ridge", kind: "Stony-iron", mass: 642, cabinet: "C", drawer: 2 },
    { id: "AT-024", name: "Quiet Basin", kind: "Stone", mass: 73, cabinet: "B", drawer: 4 },
    { id: "AT-025", name: "Red Mesa", kind: "Iron", mass: 2560, cabinet: "A", drawer: 1 },
    { id: "AT-026", name: "Silver Strand", kind: "Stony-iron", mass: 385, cabinet: "C", drawer: 3 },
    { id: "AT-027", name: "North Cairn", kind: "Stone", mass: 910, cabinet: "B", drawer: 2 },
    { id: "AT-028", name: "Ochre Valley", kind: "Iron", mass: 1165, cabinet: "A", drawer: 2 },
    { id: "AT-029", name: "Glass Plain", kind: "Stone", mass: 46, cabinet: "B", drawer: 3 },
    { id: "AT-030", name: "Amber Crest", kind: "Stony-iron", mass: 724, cabinet: "C", drawer: 1 },
    { id: "AT-031", name: "Pale Summit", kind: "Stone", mass: 302, cabinet: "B", drawer: 5 },
    { id: "AT-032", name: "Ember Field", kind: "Iron", mass: 2095, cabinet: "A", drawer: 4 },
  ];
  const INTAKE: QTableRow = {
    id: "AT-033",
    name: "Orchid Canyon",
    kind: "Stone",
    mass: 218,
    cabinet: "B",
    drawer: 6,
  };
  const KINDS = ["Stone", "Stony-iron", "Iron"];
  const COLUMNS: QTableColumn[] = [
    { name: "id", label: "Accession", field: "id", sortable: true },
    { name: "specimen", label: "Specimen", field: "name", sortable: true },
    { name: "kind", label: "Class", field: "kind", sortable: true },
  ];
  const SELECTION_COLUMNS: QTableColumn[] = [
    { name: "select", label: "Select", field: "id", align: "center" },
    ...COLUMNS,
  ];
  docsCtx.set({
    snippets,
    componentDocs: QTableDocs,
  });

  let dense = $state(false);
  let flat = $state(true);
  let bordered = $state(true);
  let query = $state<string | number | null>("");
  let kind = $state("All classes");
  let received = $state(false);
  let selectedIds = $state<string[]>([]);
  const inventory = $derived(received ? [...SPECIMENS, INTAKE] : SPECIMENS);
  const normalizedQuery = $derived(
    String(query ?? "")
      .trim()
      .toLowerCase()
  );
  const filteredRows = $derived(
    inventory.filter(
      (row) =>
        (kind === "All classes" || row.kind === kind) &&
        `${row.id} ${row.name}`.toLowerCase().includes(normalizedQuery)
    )
  );

  function setSelected(id: string, selected: boolean) {
    selectedIds = selected ? [...selectedIds, id] : selectedIds.filter((value) => value !== id);
  }

  function receiveSpecimen() {
    received = true;
    query = INTAKE.name;
    kind = "All classes";
  }

  function clearFilters() {
    query = "";
    kind = "All classes";
  }
</script>

<QDocs>
  {#snippet display()}
    <div class="table-preview q-pa-md text-on-surface">
      <p class="label-large text-on-surface-variant q-ma-none q-mb-md">
        ATLAS · SPECIMEN CATALOGUE
      </p>
      <QTable
        columns={COLUMNS.slice(0, 2)}
        rows={SPECIMENS.slice(0, 3)}
        flat
        bordered
        dense
        aria-label="Featured specimens"
      />
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Basic Usage and Pagination">
      {#snippet sectionDescription()}
        Pass <code>columns</code> and <code>rows</code> to display a dataset. Each column needs a
        unique <code>name</code>, a header <code>label</code> and a <code>field</code> that reads a row
        value. This fictional meteorite catalogue has twelve records: use the footer to change pages or
        the number of rows shown. Select a sortable heading once for ascending order, twice for descending
        order, and a third time to clear sorting.
      {/snippet}

      <div class="demo-panel q-pa-lg">
        <div class="q-mb-lg">
          <h6>Atlas specimen catalogue</h6>
          <p class="body-small text-on-surface-variant q-ma-none q-mt-xs">
            12 records · accession, specimen and class
          </p>
        </div>
        <QTable
          columns={[
            { name: "id", label: "Accession", field: "id", sortable: true },
            { name: "specimen", label: "Specimen", field: "name", sortable: true },
            { name: "kind", label: "Class", field: "kind", sortable: true },
          ]}
          rows={[
            { id: "AT-021", name: "Copper Dune", kind: "Iron" },
            { id: "AT-022", name: "Blue Moraine", kind: "Stone" },
            { id: "AT-023", name: "Lantern Ridge", kind: "Stony-iron" },
            { id: "AT-024", name: "Quiet Basin", kind: "Stone" },
            { id: "AT-025", name: "Red Mesa", kind: "Iron" },
            { id: "AT-026", name: "Silver Strand", kind: "Stony-iron" },
            { id: "AT-027", name: "North Cairn", kind: "Stone" },
            { id: "AT-028", name: "Ochre Valley", kind: "Iron" },
            { id: "AT-029", name: "Glass Plain", kind: "Stone" },
            { id: "AT-030", name: "Amber Crest", kind: "Stony-iron" },
            { id: "AT-031", name: "Pale Summit", kind: "Stone" },
            { id: "AT-032", name: "Ember Field", kind: "Iron" },
          ]}
          aria-label="Specimen catalogue"
        />
        <p class="body-small text-on-surface-variant q-ma-none q-mt-md">
          On narrow screens, scroll the table sideways. Its scroll area and sort buttons are
          keyboard accessible.
        </p>
      </div>
    </QDocsSection>

    <QDocsSection title="Formatting and Custom Sorting">
      {#snippet sectionDescription()}
        Use <code>format</code> to change a displayed value while retaining its raw value for
        sorting. A function <code>field</code> can combine row properties. A custom
        <code>sort</code>
        receives strings and defines the ascending comparison; QTable reverses it for descending order.
        Try sorting Class, Mass and Storage below.
      {/snippet}

      <div class="demo-panel q-pa-lg">
        <QTable
          columns={[
            { name: "specimen", label: "Specimen", field: "name", sortable: true },
            {
              name: "kind",
              label: "Class",
              field: "kind",
              sortable: true,
              sort: (a, b) => KINDS.indexOf(a) - KINDS.indexOf(b),
            },
            {
              name: "mass",
              label: "Mass",
              field: "mass",
              align: "right",
              sortable: true,
              format: (value) => `${Number(value).toLocaleString("en-US")} g`,
            },
            {
              name: "storage",
              label: "Storage",
              sortable: true,
              field: (row) => `${row.cabinet} / ${String(row.drawer).padStart(2, "0")}`,
            },
          ]}
          rows={SPECIMENS}
          flat
          bordered
          aria-label="Specimen measurements and storage"
        />
        <dl class="column-notes flex q-gap-md q-mt-lg body-small">
          <div>
            <dt class="text-weight-medium q-mb-xs">Class</dt>
            <dd class="text-on-surface-variant q-ma-none">
              Custom order: Stone → Stony-iron → Iron.
            </dd>
          </div>
          <div>
            <dt class="text-weight-medium q-mb-xs">Mass</dt>
            <dd class="text-on-surface-variant q-ma-none">
              Formatted in grams, sorted numerically and aligned right.
            </dd>
          </div>
          <div>
            <dt class="text-weight-medium q-mb-xs">Storage</dt>
            <dd class="text-on-surface-variant q-ma-none">
              Cabinet and drawer combined into one field, with padded drawer numbers.
            </dd>
          </div>
        </dl>
      </div>
    </QDocsSection>

    <QDocsSection title="Table Appearance">
      {#snippet sectionDescription()}
        <code>flat</code> removes the table shadow, <code>bordered</code> adds an outline, and
        <code>dense</code> reduces cell padding and the minimum row height. Toggle each option on the
        same table to compare their effects.
      {/snippet}

      <div class="demo-panel q-pa-lg">
        <fieldset class="appearance-controls flex q-gap-md q-mb-lg">
          <legend class="label-large q-mb-md">Table options</legend>
          <QSwitch bind:value={dense} label="Dense" />
          <QSwitch bind:value={flat} label="Flat" />
          <QSwitch bind:value={bordered} label="Bordered" />
        </fieldset>
        <QTable
          columns={COLUMNS}
          rows={SPECIMENS.slice(0, 3)}
          {dense}
          {flat}
          {bordered}
          aria-label="Table appearance preview"
        />
      </div>
    </QDocsSection>

    <QDocsSection title="Filtering and Custom Cells">
      {#snippet sectionDescription()}
        Filtering and selection are application state. Pass filtered <code>rows</code> to QTable;
        use <code>bodyCell</code> for every default cell, or <code>bodyCellSelect</code> to override
        only the column named <code>select</code>. Cell snippets return a <code>&lt;td&gt;</code>
        and preserve its supplied <code>style</code>. This generic snippet reads string fields
        directly; custom snippets handle their own formatting and computed fields. Selections here
        remain checked when filtering or changing pages.
      {/snippet}

      <div class="demo-panel q-pa-lg">
        <div class="flex justify-between items-center q-gap-md q-mb-lg">
          <h6>Browse the collection</h6>
          <QBtn
            icon="add"
            label={received ? "Specimen added" : "Add specimen"}
            variant="tonal"
            disabled={received}
            onclick={receiveSpecimen}
          />
        </div>
        <div class="filter-controls q-gap-md q-mb-md">
          <QInput
            bind:value={query}
            label="Search specimens"
            outlined
            placeholder="Name or accession"
          >
            {#snippet prepend()}<QIcon name="search" aria-hidden="true" />{/snippet}
          </QInput>
          <QSelect
            bind:value={kind}
            options={["All classes", ...KINDS]}
            label="Meteorite class"
            outlined
          />
        </div>
        <div class="flex justify-between items-center q-gap-md q-mb-lg">
          <p class="body-small q-ma-none" role="status">
            {filteredRows.length} of {inventory.length} specimens shown
          </p>
          <QBtn label="Clear filters" variant="flat" onclick={clearFilters} />
        </div>
        <QTable
          columns={SELECTION_COLUMNS}
          rows={filteredRows}
          flat
          bordered
          aria-label="Selectable specimens"
        >
          {#snippet bodyCell({ row, column, style })}
            <td {style}>{row[String(column.field)]}</td>
          {/snippet}
          {#snippet bodyCellSelect({ row, style })}
            <td {style} class="selection-cell">
              <QCheckbox
                label={`Select ${row.name}`}
                bind:value={
                  () => selectedIds.includes(String(row.id)),
                  (value) => setSelected(String(row.id), !!value)
                }
              />
            </td>
          {/snippet}
        </QTable>
        {#if !filteredRows.length}
          <p class="body-medium text-on-surface-variant q-ma-none q-mt-md">
            No specimens match. Try another name or clear the filters.
          </p>
        {/if}
        <div class="flex justify-between items-center q-gap-md q-mt-md">
          <p class="body-small q-ma-none" role="status">{selectedIds.length} selected</p>
          <QBtn
            label="Clear selection"
            variant="outlined"
            disabled={!selectedIds.length}
            onclick={() => (selectedIds = [])}
          />
        </div>
      </div>
    </QDocsSection>

    <QDocsSection title="Localization" noCode>
      {#snippet sectionDescription()}
        Choose a language to translate pagination, sorting labels and announcements. Column headings
        and specimen names remain your content. The language chooser is scoped to this example; see <a
          class="q-docs-link"
          href={resolve("/utils/quaff#language", {})}>language setup</a
        > for application configuration.
      {/snippet}

      <div class="demo-panel q-pa-lg">
        <QLanguageExample>
          <QTable
            columns={COLUMNS}
            rows={SPECIMENS}
            flat
            bordered
            aria-label="Localized specimen catalogue"
          />
        </QLanguageExample>
      </div>
    </QDocsSection>
  {/snippet}
</QDocs>

<style lang="scss">
  @use "$css/mixins";

  .table-preview {
    width: 100%;
    max-width: 560px;
    max-height: 100%;
    overflow: auto;
    background: var(--surface-container-low);
    border-radius: 16px;
  }

  .demo-panel {
    min-width: 0;
    background: var(--surface-container-low);
    border-radius: 16px;
  }

  .column-notes > div {
    flex: 1 1 180px;
  }

  .appearance-controls {
    border: 0;
  }

  .filter-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  }

  .selection-cell :global(.q-checkbox__label) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @include mixins.up-to-sm {
    .demo-panel {
      @include mixins.padding("a-md");
    }
  }
</style>
