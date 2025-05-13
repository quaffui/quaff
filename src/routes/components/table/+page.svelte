<script lang="ts">
  import { QTableDocs } from "$components/table/docs";
  import { QBtn, QCard, QCardSection, QCodeBlock, QIcon, QTable } from "$lib";
  import { QDocs, QDocsSection } from "$private";
  import type { QTableColumn, QTableRow } from "$components/table/props";
  import { pageTitle } from "$helpers/pageTitle";
  import snippets from "./docs.snippets";

  const columnsDefCode = `const columns = [
  {
    name: "id",        // Unique identifier for the column
    required: true,    // Column will always be displayed
    label: "Book ID",  // Display label in table header
    align: "left",     // Text alignment (left, center, right)
    field: "id",       // Row property to display
    sortable: true,    // Enable sorting on this column
  },
  // More columns...
]`;

  // Simple column definition
  const columns: QTableColumn[] = [
    {
      name: "id",
      required: true,
      label: "Book ID",
      align: "left",
      field: "id",
      sortable: true,
    },
    {
      name: "title",
      required: true,
      label: "Book Title",
      align: "left",
      field: "title",
      sortable: true,
    },
    {
      name: "author",
      required: true,
      label: "Author",
      align: "right",
      field: "author",
      sortable: true,
    },
  ];

  // Columns with actions for demo
  const columnsWithActions: QTableColumn[] = [
    ...columns,
    {
      name: "actions",
      label: "Actions",
      align: "right",
      field: "actions",
    },
  ];

  // Custom format columns
  const columnsWithFormat: QTableColumn[] = [
    {
      name: "id",
      required: true,
      label: "Book ID",
      align: "left",
      field: "id",
      sortable: true,
    },
    {
      name: "title",
      required: true,
      label: "Book Title",
      align: "left",
      field: "title",
      sortable: true,
    },
    {
      name: "author",
      required: true,
      label: "Author",
      align: "right",
      field: "author",
      sortable: true,
      format: (val) => `By ${val}`,
    },
  ];

  // Function field column example
  const columnsWithFunction: QTableColumn[] = [
    ...columns,
    {
      name: "fullInfo",
      label: "Full Information",
      align: "left",
      field: (row) => `${row.title} by ${row.author}`,
      sortable: true,
    },
  ];

  // Sample data
  const rows: QTableRow[] = [
    { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee" },
    { id: 2, title: "1984", author: "George Orwell" },
    { id: 3, title: "Pride and Prejudice", author: "Jane Austen" },
    { id: 4, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger" },
    { id: 6, title: "Moby-Dick", author: "Herman Melville" },
    { id: 7, title: "War and Peace", author: "Leo Tolstoy" },
    { id: 8, title: "The Hobbit", author: "J.R.R. Tolkien" },
    { id: 9, title: "Ulysses", author: "James Joyce" },
    { id: 10, title: "Crime and Punishment", author: "Fyodor Dostoevsky" },
    { id: 11, title: "The Adventures of Huckleberry Finn", author: "Mark Twain" },
    { id: 12, title: "One Hundred Years of Solitude", author: "Gabriel Garcia Marquez" },
    { id: 13, title: "The Brothers Karamazov", author: "Fyodor Dostoevsky" },
    { id: 14, title: "Anna Karenina", author: "Leo Tolstoy" },
    { id: 15, title: "The Count of Monte Cristo", author: "Alexandre Dumas" },
    { id: 16, title: "A Tale of Two Cities", author: "Charles Dickens" },
    { id: 17, title: "Les Misérables", author: "Victor Hugo" },
    { id: 18, title: "Don Quixote", author: "Miguel de Cervantes" },
    { id: 19, title: "Madame Bovary", author: "Gustave Flaubert" },
    { id: 20, title: "Lolita", author: "Vladimir Nabokov" },
    { id: 21, title: "Wuthering Heights", author: "Emily Brontë" },
    { id: 22, title: "Brave New World", author: "Aldous Huxley" },
    { id: 23, title: "In Search of Lost Time", author: "Marcel Proust" },
    { id: 24, title: "Great Expectations", author: "Charles Dickens" },
    { id: 25, title: "Moby Dick", author: "Herman Melville" },
    { id: 26, title: "The Odyssey", author: "Homer" },
    { id: 27, title: "Frankenstein", author: "Mary Shelley" },
    { id: 28, title: "Jane Eyre", author: "Charlotte Brontë" },
    { id: 29, title: "The Iliad", author: "Homer" },
    { id: 30, title: "Dracula", author: "Bram Stoker" },
    { id: 31, title: "The Picture of Dorian Gray", author: "Oscar Wilde" },
    { id: 32, title: "Catch-22", author: "Joseph Heller" },
    { id: 33, title: "The Grapes of Wrath", author: "John Steinbeck" },
    { id: 34, title: "Little Women", author: "Louisa May Alcott" },
    { id: 35, title: "The Sound and the Fury", author: "William Faulkner" },
  ];
</script>

<svelte:head>
  <title>{pageTitle("QTable")}</title>
</svelte:head>

<QDocs {snippets} componentDocs={QTableDocs}>
  {#snippet display()}
    <QTable {columns} rows={rows.slice(0, 3)} />
  {/snippet}

  {#snippet usage()}
    <div>
      <QDocsSection title="Basic Table">
        {#snippet sectionDescription()}
          QTable is a versatile component for displaying tabular data. It supports pagination,
          sorting, and custom cell rendering. The basic implementation requires just <code
            >columns</code
          >
          and <code>rows</code> props.
        {/snippet}

        <QCard class="q-ma-md">
          <QCardSection>
            <QTable {columns} rows={rows.slice(0, 5)} />
          </QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Column Configuration" noCode>
        {#snippet sectionDescription()}
          Each column can be configured with various properties. Required columns will always be
          displayed, and the <code>align</code> property controls text alignment. The
          <code>field</code>
          property determines what data from each row is displayed, and <code>sortable</code> enables
          sorting.
        {/snippet}

        <QCard class="q-ma-md">
          <QCardSection>
            <h6 class="q-mb-sm">Column Configuration Example</h6>
            <QCodeBlock code={columnsDefCode} language="svelte" />
          </QCardSection>
        </QCard>
      </QDocsSection>

      <QDocsSection title="Styling Options">
        {#snippet sectionDescription()}
          QTable provides styling options to customize its appearance. The <code>flat</code> prop
          removes the shadow, <code>bordered</code> adds a border around the table, and
          <code>dense</code> reduces the row height for more compact layouts.
        {/snippet}

        <div class="q-mb-md">
          <h6 class="q-mb-sm">Default Table</h6>
          <QTable {columns} rows={rows.slice(0, 3)} />
        </div>

        <div class="q-mb-md">
          <h6 class="q-mb-sm">Flat Table</h6>
          <QTable {columns} rows={rows.slice(0, 3)} flat />
        </div>

        <div class="q-mb-md">
          <h6 class="q-mb-sm">Bordered Table</h6>
          <QTable {columns} rows={rows.slice(0, 3)} bordered />
        </div>

        <div class="q-mb-md">
          <h6 class="q-mb-sm">Dense Table</h6>
          <QTable {columns} rows={rows.slice(0, 3)} dense />
        </div>

        <div>
          <h6 class="q-mb-sm">Combined Styles (Flat, Bordered, Dense)</h6>
          <QTable {columns} rows={rows.slice(0, 3)} flat bordered dense />
        </div>
      </QDocsSection>

      <QDocsSection title="Pagination">
        {#snippet sectionDescription()}
          QTable includes built-in pagination functionality. Users can navigate between pages and
          adjust the number of rows displayed per page using the controls in the table footer.
        {/snippet}

        <QTable {columns} {rows} />
      </QDocsSection>

      <QDocsSection title="Sorting">
        {#snippet sectionDescription()}
          When a column has the <code>sortable</code> property set to true, users can click on the column
          header to sort the data. Click once for ascending order, twice for descending order, and a
          third time to clear the sort.
        {/snippet}

        <QTable {columns} rows={rows.slice(0, 10)} />
      </QDocsSection>

      <QDocsSection title="Custom Data Formatting - Not supported yet">
        {#snippet sectionDescription()}
          Columns can include a <code>format</code> function to transform the displayed data without
          affecting the underlying value. This is useful for adding prefixes, suffixes, or transforming
          values into a more readable format.
        {/snippet}

        <QTable columns={columnsWithFormat} rows={rows.slice(0, 5)} />
      </QDocsSection>

      <QDocsSection title="Function Fields">
        {#snippet sectionDescription()}
          The <code>field</code> property can also be a function that receives the entire row and returns
          a computed value. This allows for displaying data that combines multiple row properties.
        {/snippet}

        <QTable columns={columnsWithFunction} rows={rows.slice(0, 5)} />
      </QDocsSection>

      <QDocsSection title="Custom Cell Rendering">
        {#snippet sectionDescription()}
          QTable allows complete customization of cell rendering through the <code>bodyCell</code> snippet.
          This enables you to include components, formatting, and interactive elements within cells.
        {/snippet}

        <QTable rows={rows.slice(0, 5)} columns={columnsWithActions} class="q-mt-md">
          {#snippet bodyCell({ row, column, style })}
            <td {style}>
              {#if column.field === "id"}
                <div class="flex items-center">
                  <QIcon name="book" class="q-mr-xs" />
                  {row.id}
                </div>
              {:else if column.field === "title"}
                <span class="text-weight-bold">{row.title}</span>
              {:else if column.field === "author"}
                <span class="text-primary">{row.author}</span>
              {:else if column.field === "actions"}
                <div class="flex justify-end q-gap-sm">
                  <QBtn icon="edit" size="sm" flat />
                  <QBtn icon="delete" size="sm" flat color="error" />
                </div>
              {/if}
            </td>
          {/snippet}
        </QTable>
      </QDocsSection>

      <QDocsSection title="Interactive Tables">
        {#snippet sectionDescription()}
          By combining QTable with other components and Svelte's reactivity, you can create
          interactive tables with features like row selection, inline editing, and dynamic
          filtering.
        {/snippet}

        <QCard class="q-ma-md">
          <QCardSection>
            <div class="flex justify-between items-center q-mb-md">
              <h6 class="q-mb-none">Interactive Book List</h6>
              <QBtn icon="add" label="Add Book" />
            </div>

            <QTable {columns} rows={rows.slice(0, 5)} dense bordered>
              {#snippet bodyCell({ row, column, style })}
                <td {style} class="cursor-pointer" onclick={() => alert(`Selected: ${row.title}`)}>
                  {#if column.field === "id"}
                    #{row.id}
                  {:else if column.field === "title"}
                    {row.title}
                  {:else if column.field === "author"}
                    {row.author}
                  {/if}
                </td>
              {/snippet}
            </QTable>
          </QCardSection>
        </QCard>
      </QDocsSection>
    </div>
  {/snippet}
</QDocs>
