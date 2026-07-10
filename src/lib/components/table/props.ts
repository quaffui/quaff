import { Borderable } from "$utils";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type QTableColumn = {
  name: string;
  label: string;
  align?: "left" | "center" | "right";
  field: string | ((row: QTableRow) => string);
  format?: (val: string) => string;
  sortable?: boolean;
  sort?: (a: string, b: string) => number;
};

export type QTableRow = {
  [key: string]: string | number;
};

export type QTableSort = {
  columnField: string | ((row: QTableRow) => string);
  type: "asc" | "desc";
} | null;

export interface QTableProps extends Borderable, HTMLAttributes<HTMLDivElement> {
  /**
   * Column definitions of the table.
   */
  columns: QTableColumn[];

  /**
   * Rows of the table.
   */
  rows: QTableRow[];

  /**
   * Uses flat design, removing the box-shadow around the table.
   */
  flat?: boolean;

  /**
   * Shows the Table in dense mode (takes up less space).
   */
  dense?: boolean;

  /**
   * Optionally pass a snippet to render each table cell.
   */
  bodyCell?: Snippet<[{ column: QTableColumn; row: QTableRow; style: string }]>;
}
