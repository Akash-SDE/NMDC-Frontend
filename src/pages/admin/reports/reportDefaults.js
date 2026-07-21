export const DEFAULT_TABLE_MIN_WIDTH = "min-w-[980px]";
export const WIDE_TABLE_MIN_WIDTH = "min-w-[1200px]";
export const DEFAULT_EMPTY_MESSAGE = "No records found for the selected filters.";
export const SELECT_PLACEHOLDER = "All";

export function createReportConfig({
  title,
  subtitle,
  filters,
  columns,
  rows = [],
  tableMinWidth = DEFAULT_TABLE_MIN_WIDTH,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}) {
  return {
    title,
    subtitle,
    filters,
    columns,
    rows,
    tableMinWidth,
    emptyMessage,
  };
}
