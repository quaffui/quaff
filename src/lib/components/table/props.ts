import type { NativeProps } from "$lib/utils/types";
import type { HTMLAttributes } from "svelte/elements";

export type QTableColumn = {
  name: string;
  required?: boolean;
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

export interface QTableProps extends NativeProps, HTMLAttributes<HTMLDivElement> {
  /**
   * Column definitions of the table.
   * @default []
   */
  columns: QTableColumn[];

  /**
   * Rows of the table.
   * @default []
   */
  rows: QTableRow[];

  /**
   * Uses flat design, removing the box-shadow around the table.
   * @default false
   */
  flat?: boolean;

  /**
   * Adds a border around the table.
   * @default false
   */
  bordered?: boolean;

  /**
   * Shows the Table in dense mode (takes up less space).
   * @default false
   */
  dense?: boolean;
}
