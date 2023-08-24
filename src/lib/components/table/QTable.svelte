<script lang="ts">
  import { createClasses } from "$lib/utils";
  import { QIcon, QSelect, QBtn } from "$lib";
  import type { QTableProps, QTableColumn, QTableRow, QTableSort } from "./props";

  export let columns: QTableProps["columns"] = [],
    rows: QTableProps["rows"] = [],
    flat: QTableProps["flat"] = undefined,
    bordered: QTableProps["bordered"] = undefined,
    dense: QTableProps["dense"] = false,
    userClasses: QTableProps["userClasses"] = "";
  export { userClasses as class };

  function getField(fieldRaw: QTableColumn["field"], row: QTableRow): string | number {
    return typeof fieldRaw === "function" ? fieldRaw(row) : row[fieldRaw];
  }

  let page = 1;
  let rowsPerPage = 5;
  let rowsPerPageOptions = [5, 10, 25, 50].map((e) => ({
    label: e.toString(),
    value: e.toString(),
  }));

  $: classes = createClasses([], {
    component: "q-table",
    userClasses,
  });

  $: classesTable = createClasses([flat && "flat", bordered && "bordered", dense && "dense"], {
    component: "q-table",
    element: "table",
    userClasses,
  });

  let sort: QTableSort = null;
  let rowsSorted: QTableRow[] = rows;
  let rowsPaginated: QTableRow[] = [];
  let numberFrom: number = 1;
  let numberTo: number = 5;
  let numberOf: number = rows.length;

  $: numberFrom = rowsPerPage * page - rowsPerPage + 1;
  $: numberTo = rowsPerPage * page > rows.length ? rows.length : rowsPerPage * page;
  $: numberOf = rows.length;
  $: rowsPaginated = rowsSorted.slice(numberFrom - 1, numberTo);
  $: {
    if (rowsPerPage * (page - 1) >= rows.length) {
      page = 1;
    }
  }

  $: {
    if (sort) {
      rowsSorted = structuredClone(rows).sort((a: QTableRow, b: QTableRow) => {
        const valA = getField(sort!.columnField, a);
        const valB = getField(sort!.columnField, b);

        if (typeof valA === "string" && typeof valB === "string") {
          return sort?.type === "desc" ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }

        return sort?.type === "desc"
          ? parseFloat(valA.toString()) > parseFloat(valB.toString())
            ? -1
            : 1
          : parseFloat(valB.toString()) > parseFloat(valA.toString())
          ? -1
          : 1;
      });
    } else {
      rowsSorted = rows;
    }
  }

  function getThStyle(column: QTableColumn) {
    let style = allowsSort(column) ? "cursor: pointer; " : "";
    return style + getCellStyle(column);
  }

  function getCellStyle(column: QTableColumn) {
    if (column.align === "center") {
      return "text-align: center";
    } else if (column.align === "right") {
      return "text-align: right";
    }

    return "";
  }

  function allowsSort(column: QTableColumn) {
    return columns.find((col) => col.name === column.name)?.sortable;
  }

  function hasSort(column: QTableColumn, sort: QTableSort) {
    return sort?.columnField === column.field;
  }

  function setSort(column: QTableColumn) {
    const shouldRemove = hasSort(column, sort) && sort?.type === "desc";
    if (shouldRemove) {
      sort = null;
      return;
    }

    sort = {
      columnField: column.field,
      type: !sort?.type || sort?.type === "desc" ? "asc" : "desc",
    };
  }
</script>

<div class={classes} {...$$restProps}>
  <table class={classesTable}>
    <thead>
      <tr>
        {#each columns as column}
          <th style={getThStyle(column)} on:click={() => setSort(column)}>
            {#if column.align === "left"}
              {column.label}
            {/if}

            {#if allowsSort(column)}
              <QIcon
                name={sort?.type !== "desc" ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                class="q-icon {hasSort(column, sort) ? 'q-icon--sort' : ''}"
              />
            {/if}

            {#if column.align !== "left"}
              {column.label}
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rowsPaginated as row}
        <tr>
          {#each columns as column}
            <slot name="body-cell" {column} {row} style={getCellStyle(column)}>
              <td class="q-table__body-cell" style={getCellStyle(column)}
                >{getField(column.field, row)}</td
              >
            </slot>
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
    />
    {numberFrom}-{numberTo}&nbsp;of&nbsp;{numberOf}
    <QBtn
      icon="chevron_left"
      size="sm"
      flat
      disable={page === 1}
      on:click={() => (page = page - 1)}
    />
    <QBtn
      icon="chevron_right"
      size="sm"
      flat
      disable={page * rowsPerPage >= rows.length}
      on:click={() => (page = page + 1)}
    />
  </div>
</div>
