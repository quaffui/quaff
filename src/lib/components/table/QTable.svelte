<script lang="ts">
  import { QIcon, QSelect, QBtn } from "$lib";
  import type { QTableProps, QTableColumn, QTableRow, QTableSort } from "./props";

  let {
    columns = [],
    rows = [],
    flat,
    bordered,
    dense = false,
    bodyCell,
    ...props
  }: QTableProps = $props();

  function getField(fieldRaw: QTableColumn["field"], row: QTableRow): string | number {
    return typeof fieldRaw === "function" ? fieldRaw(row) : row[fieldRaw];
  }

  let page = $state(1);
  let rowsPerPage = $state(5);
  let rowsPerPageOptions = $state(
    [5, 10, 25, 50].map((e) => ({
      label: e.toString(),
      value: e.toString(),
    }))
  );
  let sort: QTableSort = $state(null);

  const numberFrom: number = $derived(rowsPerPage * page - rowsPerPage + 1);
  const numberTo: number = $derived(
    rowsPerPage * page > rows.length ? rows.length : rowsPerPage * page
  );
  const numberOf: number = $derived(rows.length);

  $effect(() => {
    if (rowsPerPage * (page - 1) >= rows.length) {
      page = 1;
    }
  });

  const rowsSorted: QTableRow[] = $derived.by(() => {
    if (sort) {
      return structuredClone(rows).sort((a: QTableRow, b: QTableRow) => {
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
    }

    return rows;
  });

  const rowsPaginated: QTableRow[] = $derived(rowsSorted.slice(numberFrom - 1, numberTo));

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
          <th style={getThStyle(column)} onclick={() => setSort(column)}>
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
      {#each rowsPaginated as row (row)}
        <tr>
          {#each columns as column (column)}
            {#if bodyCell}
              {@render bodyCell({ column, row, style: getCellStyle(column) })}
            {:else}
              <td class="q-table__body-cell" style={getCellStyle(column)}
                >{getField(column.field, row)}</td
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
    />
    {numberFrom}-{numberTo}&nbsp;of&nbsp;{numberOf}
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
      disabled={page * rowsPerPage >= rows.length}
      onclick={() => page++}
    />
  </div>
</div>
