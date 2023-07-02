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