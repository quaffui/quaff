import type { NativeProps } from "$lib/utils/types";
import type { QTableColumn, QTableRow } from "./types.js";
import { NativePropsDefaults } from "$lib/utils/types";

export interface QTableProps extends NativeProps {
  /**
   * Column definitions of the Table
   */
  columns: QTableColumn[];
  /**
   * Rows of the Table
   */
  rows: QTableRow[];
  /**
   * Uses flat design (no shadow)
   */
  flat?: boolean;
  /**
   * Adds a border around the table
   */
  bordered?: boolean;
  /**
   * Shows the Table in dense mode (takes up less space)
   */
  dense: boolean;
}

export const QTablePropsDefaults: QTableProps = {
  columns: [],
  rows: [],
  dense: false,
  ...NativePropsDefaults,
};
