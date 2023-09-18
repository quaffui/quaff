<script lang="ts">
  import { QTable, QBtn, QIcon } from "$lib";
  import { QTableDocs } from "$components/table/docs";
  import QDocs from "$lib/components/private/QDocs.svelte";
  import QDocsSection from "$lib/components/private/QDocsSection.svelte";
  import type { QTableColumn, QTableRow } from "$lib/components/table/props";

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

  const columnsWithActions: QTableColumn[] = [
    ...columns,
    {
      name: "actions",
      label: "Actions",
      align: "right",
      field: "actions",
    },
  ];

  const rows: QTableRow[] = [
    {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
    },
    {
      id: 3,
      title: "Pride and Prejudice",
      author: "Jane Austen",
    },
    {
      id: 4,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
    },
    {
      id: 5,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
    },
    {
      id: 6,
      title: "Moby-Dick",
      author: "Herman Melville",
    },
    {
      id: 7,
      title: "War and Peace",
      author: "Leo Tolstoy",
    },
    {
      id: 8,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
    },
    {
      id: 9,
      title: "Ulysses",
      author: "James Joyce",
    },
    {
      id: 10,
      title: "Crime and Punishment",
      author: "Fyodor Dostoevsky",
    },
    {
      id: 11,
      title: "The Adventures of Huckleberry Finn",
      author: "Mark Twain",
    },
    {
      id: 12,
      title: "One Hundred Years of Solitude",
      author: "Gabriel Garcia Marquez",
    },
    {
      id: 13,
      title: "The Brothers Karamazov",
      author: "Fyodor Dostoevsky",
    },
    {
      id: 14,
      title: "Anna Karenina",
      author: "Leo Tolstoy",
    },
    {
      id: 15,
      title: "The Count of Monte Cristo",
      author: "Alexandre Dumas",
    },
    {
      id: 16,
      title: "A Tale of Two Cities",
      author: "Charles Dickens",
    },
    {
      id: 17,
      title: "Les Misérables",
      author: "Victor Hugo",
    },
    {
      id: 18,
      title: "Don Quixote",
      author: "Miguel de Cervantes",
    },
    {
      id: 19,
      title: "Madame Bovary",
      author: "Gustave Flaubert",
    },
    {
      id: 20,
      title: "Lolita",
      author: "Vladimir Nabokov",
    },
    {
      id: 21,
      title: "Wuthering Heights",
      author: "Emily Brontë",
    },
    {
      id: 22,
      title: "Brave New World",
      author: "Aldous Huxley",
    },
    {
      id: 23,
      title: "In Search of Lost Time",
      author: "Marcel Proust",
    },
    {
      id: 24,
      title: "Great Expectations",
      author: "Charles Dickens",
    },
    {
      id: 25,
      title: "Moby Dick",
      author: "Herman Melville",
    },
    {
      id: 26,
      title: "The Odyssey",
      author: "Homer",
    },
    {
      id: 27,
      title: "Frankenstein",
      author: "Mary Shelley",
    },
    {
      id: 28,
      title: "Jane Eyre",
      author: "Charlotte Brontë",
    },
    {
      id: 29,
      title: "The Iliad",
      author: "Homer",
    },
    {
      id: 30,
      title: "Dracula",
      author: "Bram Stoker",
    },
    {
      id: 31,
      title: "The Picture of Dorian Gray",
      author: "Oscar Wilde",
    },
    {
      id: 32,
      title: "Catch-22",
      author: "Joseph Heller",
    },
    {
      id: 33,
      title: "The Grapes of Wrath",
      author: "John Steinbeck",
    },
    {
      id: 34,
      title: "Little Women",
      author: "Louisa May Alcott",
    },
    {
      id: 35,
      title: "The Sound and the Fury",
      author: "William Faulkner",
    },
  ];
</script>

<QDocs componentDocs={QTableDocs}>
  <QTable slot="display" {columns} rows={rows.slice(0, 1)} />

  <div slot="usage">
    <QDocsSection title="Default">
      <QTable {columns} {rows} class="q-mt-md" />
    </QDocsSection>
    <QDocsSection title="Flat & Bordered">
      <QTable {columns} {rows} flat bordered class="q-mt-md" />
    </QDocsSection>
    <QDocsSection title="Dense">
      <QTable {columns} {rows} dense class="q-mt-md" />
    </QDocsSection>
    <QDocsSection title="Slots">
      <QTable {rows} columns={columnsWithActions} dense class="q-mt-md">
        <td slot="body-cell" let:row let:column let:style {style}>
          {#if column.field === "id"}
            <QIcon name="book" /> {row.id}
          {:else if column.field === "title"}
            <b>{row.title}</b>
          {:else if column.field === "author"}
            {row.author}
          {:else if column.field === "actions"}
            <QBtn icon="edit" rounded flat />
            <QBtn icon="delete" rounded flat />
          {/if}
        </td>
      </QTable>
    </QDocsSection>
  </div>
</QDocs>
