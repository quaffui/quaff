<script lang="ts">
  import QBtn from "$components/button/QBtn.svelte";
  import QIcon from "$components/icon/QIcon.svelte";
  import QSelect from "$components/select/QSelect.svelte";
  import type { QTableProps, QTableColumn, QTableRow, QTableSort } from "./props";

  // #region:    --- Props
  let {
    columns = [],
    rows = [],
    flat,
    bordered,
    dense = false,
    bodyCell,
    ...props
  }: QTableProps = $props();
  // #endregion: --- Props

  // #region:    --- Reactive variables
  let page = $state(1);
  let rowsPerPage = $state(5);

  let sort: QTableSort = $state(null);
  // #endregion: --- Reactive variables

  // #region:    --- Derived values
  const rowsPerPageOptions = $derived(
    [5, 10, 25, 50].filter((option) => rows.length >= option || option === 5)
  );

  const lastPage = $derived(Math.max(1, Math.ceil(rows.length / rowsPerPage)));
  const pageStart = $derived(rowsPerPage * (page - 1));
  const numberFrom = $derived(rows.length ? pageStart + 1 : 0);
  const numberTo = $derived(Math.min(pageStart + rowsPerPage, rows.length));

  const rowsSorted = $derived.by(() => {
    if (!sort) {
      return rows;
    }

    const currentSort = sort;
    const sortColumn = columns.find((column) => column.field === currentSort.columnField);
    const direction = currentSort.type === "desc" ? -1 : 1;

    return [...rows].sort((rowA, rowB) => {
      const valueA = getField(currentSort.columnField, rowA);
      const valueB = getField(currentSort.columnField, rowB);
      const comparison = sortColumn?.sort
        ? sortColumn.sort(String(valueA), String(valueB))
        : compareValues(valueA, valueB);

      return comparison * direction;
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
    return typeof valueA === "number" && typeof valueB === "number"
      ? valueA - valueB
      : String(valueA).localeCompare(String(valueB));
  }

  function getCellStyle(column: QTableColumn) {
    if (column.align === "center") {
      return "text-align: center";
    } else if (column.align === "right") {
      return "text-align: right";
    }

    return "";
  }

  function isLeftAligned(column: QTableColumn) {
    return !column.align || column.align === "left";
  }

  function hasSort(column: QTableColumn) {
    return sort?.columnField === column.field;
  }

  function getSortIcon(column: QTableColumn) {
    return hasSort(column) && sort?.type === "desc" ? "keyboard_arrow_down" : "keyboard_arrow_up";
  }

  function getAriaSort(column: QTableColumn) {
    if (!hasSort(column)) {
      return undefined;
    }

    return sort?.type === "desc" ? "descending" : "ascending";
  }

  function setSort(column: QTableColumn) {
    if (sort?.columnField !== column.field) {
      sort = { columnField: column.field, type: "asc" };
      return;
    }

    sort = sort.type === "asc" ? { ...sort, type: "desc" } : null;
  }
  // #endregion: --- Functions

  Q.classes("q-table__table", {
    bemClasses: {
      flat,
      bordered,
      dense,
    },
    classes: [props.class],
  });
</script>

<div {...props} class="q-table" data-quaff>
  <table class="q-table__table">
    <thead>
      <tr>
        {#each columns as column (column)}
          <th style={getCellStyle(column)} aria-sort={getAriaSort(column)}>
            {#if column.sortable}
              <button class="q-table__sort-button" type="button" onclick={() => setSort(column)}>
                {#if isLeftAligned(column)}
                  {column.label}
                {/if}

                <QIcon
                  name={getSortIcon(column)}
                  class="q-icon {hasSort(column) ? 'q-icon--sort' : ''}"
                  aria-hidden="true"
                />

                {#if !isLeftAligned(column)}
                  {column.label}
                {/if}
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
          {#each columns as column (column)}
            {#if bodyCell}
              {@render bodyCell({ column, row, style: getCellStyle(column) })}
            {:else}
              <td class="q-table__body-cell" style={getCellStyle(column)}
                >{getCellValue(column, row)}</td
              >
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="q-table__footer q-mt-lg">
    Records&nbsp;per&nbsp;page:
    <QSelect
      class="q-table__footer-records-per-page-select"
      dense
      outlined
      options={rowsPerPageOptions}
      bind:value={rowsPerPage}
      disabled={rowsPerPageOptions.length <= 1}
    />
    {numberFrom}-{numberTo}&nbsp;of&nbsp;{rows.length}
    {#if lastPage > 1}
      <QBtn
        icon="chevron_left"
        size="sm"
        variant="flat"
        disabled={page === 1}
        onclick={() => page--}
      />
      <QBtn
        icon="chevron_right"
        size="sm"
        variant="flat"
        disabled={page === lastPage}
        onclick={() => page++}
      />
    {/if}
  </div>
</div>
