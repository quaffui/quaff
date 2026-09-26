<!--
@component
Tables allow for a clear presentation of data sets.
-->

<script lang="ts">
  import { useI18n } from "$internal/i18n.svelte";
  import QBtn from "$components/button/QBtn.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import QSelect from "$components/select/QSelect.svelte";
  import { capitalize } from "$utils";
  import type { QTableProps, QTableColumn, QTableRow } from "./props";

  const i18n = useI18n("table");

  // #region:    --- Props
  let {
    columns = [],
    rows = [],
    flat,
    bordered,
    dense = false,
    bodyCell,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-describedby": ariaDescribedby,
    ...props
  }: QTableProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let page = $state(1);
  let rowsPerPage = $state(5);
  let sortName = $state<string>();
  let isDescending = $state(false);
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const lastPage = $derived(Math.max(1, Math.ceil(rows.length / rowsPerPage)));
  const pageStart = $derived(rowsPerPage * (page - 1));
  const numberFrom = $derived(rows.length ? pageStart + 1 : 0);
  const numberTo = $derived(Math.min(pageStart + rowsPerPage, rows.length));
  const sortColumn = $derived(
    columns.find((column) => column.name === sortName && column.sortable)
  );
  const sortDirection = $derived(isDescending ? "descending" : "ascending");
  const sortIcon = $derived(isDescending ? "arrow_downward" : "arrow_upward");
  const rowsSorted = $derived.by(() => {
    const column = sortColumn;

    if (!column) {
      return rows;
    }

    return rows.toSorted((rowA, rowB) => {
      const valueA = getField(column.field, rowA);
      const valueB = getField(column.field, rowB);
      const comparison = column.sort
        ? column.sort(String(valueA), String(valueB))
        : compareValues(valueA, valueB);

      return isDescending ? -comparison : comparison;
    });
  });
  const rowsPaginated = $derived(rowsSorted.slice(pageStart, numberTo));
  // #endregion: --- Derived values

  // #region:    --- Effects
  $effect(() => {
    if (page > lastPage) {
      page = lastPage;
    }
  });
  // #endregion: --- Effects

  // #region:    --- Functions
  function getField(field: QTableColumn["field"], row: QTableRow) {
    return typeof field === "function" ? field(row) : row[field];
  }

  function getCellValue(column: QTableColumn, row: QTableRow) {
    const value = getField(column.field, row);
    return column.format ? column.format(String(value)) : value;
  }

  function compareValues(valueA: string | number, valueB: string | number) {
    if (typeof valueA === "number" && typeof valueB === "number") {
      return valueA - valueB;
    }

    return String(valueA).localeCompare(String(valueB), i18n.locale);
  }

  function getCellStyle(column: QTableColumn) {
    return column.align ? `text-align: ${column.align}` : "";
  }

  function setSort(column: QTableColumn) {
    if (sortName !== column.name) {
      sortName = column.name;
      isDescending = false;
    } else if (!isDescending) {
      isDescending = true;
    } else {
      sortName = undefined;
    }

    page = 1;
  }
  // #endregion: --- Functions

  Q.classes("q-table", { bemClasses: { flat, bordered, dense }, classes: [props.class] });
</script>

<div {...props} class="q-table" data-quaff>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll wide tables.) -->
  <div
    class="q-table__scroll"
    role="region"
    aria-label={ariaLabel ?? i18n.labels.label}
    aria-labelledby={ariaLabelledby}
    tabindex="0"
  >
    <table
      class="q-table__table"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
    >
      <thead>
        <tr>
          {#each columns as column (column.name)}
            {@const isSorted = sortColumn === column}
            <th
              scope="col"
              style={getCellStyle(column)}
              aria-sort={isSorted ? sortDirection : undefined}
            >
              {#if column.sortable}
                <button
                  class="q-table__sort-button"
                  type="button"
                  aria-label={i18n.labels.sortBy(column.label)}
                  style:justify-content={column.align ?? "flex-start"}
                  onclick={() => setSort(column)}
                >
                  <span>{column.label}</span>
                  <QIcon
                    name={isSorted ? sortIcon : "unfold_more"}
                    style={column.align && column.align !== "left" ? "order: -1" : undefined}
                    aria-hidden="true"
                  />
                </button>
              {:else}
                {column.label}
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each rowsPaginated as row (row)}
          <tr>
            {#each columns as column (column.name)}
              {@const style = getCellStyle(column)}
              {@const columnCell = props[`bodyCell${capitalize(column.name)}`]}
              {@const cell = typeof columnCell === "function" ? columnCell : bodyCell}
              {#if cell}
                {@render cell({ column, row, style })}
              {:else}
                <td class="q-table__body-cell" {style}>
                  {getCellValue(column, row)}
                </td>
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="q-table__footer">
    <div class="q-table__pagination">
      {i18n.labels.recordsPerPage}:
      <QSelect
        class="q-table__footer-select"
        dense
        outlined
        options={[5, 10, 25, 50]}
        bind:value={
          () => rowsPerPage,
          (value) => {
            rowsPerPage = Number(value);
            page = 1;
          }
        }
        aria-label={i18n.labels.recordsPerPage}
      />
    </div>
    <div class="q-table__pagination">
      <span aria-live="polite" aria-atomic="true"
        >{i18n.labels.pagination(numberFrom, numberTo, rows.length)}</span
      >
      {#if lastPage > 1}
        <QBtn
          icon="chevron_left"
          class="q-table__page-button"
          variant="flat"
          disabled={page === 1}
          aria-label={i18n.labels.previousPage}
          onclick={() => page--}
        />
        <QBtn
          icon="chevron_right"
          class="q-table__page-button"
          variant="flat"
          disabled={page === lastPage}
          aria-label={i18n.labels.nextPage}
          onclick={() => page++}
        />
      {/if}
    </div>
  </div>
  <span class="q-table__announcement" aria-live="polite" aria-atomic="true">
    {sortColumn ? i18n.labels.sortedBy(sortColumn.label, isDescending) : i18n.labels.unsorted}
  </span>
</div>
