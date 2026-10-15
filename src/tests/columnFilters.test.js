import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ALL_ROWS_PAGE_SIZE,
  deriveColumnOptions,
  filterRowsByColumns,
  useServerColumnFilters,
} from "../hooks/useColumnFilters";

const COLUMNS = [
  { key: "code", label: "Code" },
  { key: "status", label: "Status", type: "select" },
  { key: "capacity", label: "Capacity", getValue: (row) => `${row.capacity} t` },
  { key: "actions", type: "none" },
];

const ROWS = [
  { id: 1, code: "BCH-01", status: "Active", capacity: 4000 },
  { id: 2, code: "KRK-02", status: "Inactive", capacity: 3500 },
  { id: 3, code: "bch-03", status: "Active", capacity: 4500 },
];

describe("filterRowsByColumns", () => {
  it("matches text columns case-insensitively by substring", () => {
    expect(filterRowsByColumns(ROWS, COLUMNS, { code: "bch" }).map((r) => r.id)).toEqual([1, 3]);
  });

  it("matches select columns exactly and combines filters with AND", () => {
    expect(filterRowsByColumns(ROWS, COLUMNS, { status: "active" }).map((r) => r.id)).toEqual([1, 3]);
    expect(filterRowsByColumns(ROWS, COLUMNS, { status: "Active", code: "03" }).map((r) => r.id)).toEqual([3]);
    expect(filterRowsByColumns(ROWS, COLUMNS, { status: "Act" })).toEqual([]);
  });

  it("filters on the displayed value from getValue", () => {
    expect(filterRowsByColumns(ROWS, COLUMNS, { capacity: "500 t" }).map((r) => r.id)).toEqual([2, 3]);
  });

  it("ignores blank filters and columns without filters", () => {
    expect(filterRowsByColumns(ROWS, COLUMNS, { code: "  ", actions: "x" })).toHaveLength(3);
  });
});

describe("deriveColumnOptions", () => {
  it("builds sorted unique options from the rows", () => {
    expect(deriveColumnOptions(COLUMNS[1], ROWS)).toEqual([
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ]);
  });

  it("uses explicit options when provided", () => {
    const column = { key: "status", type: "select", options: ["Open", { value: "c", label: "Closed" }] };
    expect(deriveColumnOptions(column, ROWS)).toEqual([
      { value: "Open", label: "Open" },
      { value: "c", label: "Closed" },
    ]);
  });
});

describe("useServerColumnFilters", () => {
  it("keeps server paging until a filter is set, then fetches everything and pages locally", () => {
    const rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, code: i % 2 ? "ODD" : "EVEN", status: "Active" }));
    const { result, rerender } = renderHook((props) => useServerColumnFilters(COLUMNS, props), {
      initialProps: { rows: rows.slice(0, 10), totalCount: 25, currentPage: 2, pageSize: 10 },
    });

    expect(result.current.serverPage).toBe(2);
    expect(result.current.serverPageSize).toBe(10);
    expect(result.current.count).toBe(25);

    act(() => result.current.setFilter("code", "odd"));
    expect(result.current.serverPage).toBe(1);
    expect(result.current.serverPageSize).toBe(ALL_ROWS_PAGE_SIZE);

    rerender({ rows, totalCount: 25, currentPage: 2, pageSize: 10 });
    expect(result.current.count).toBe(12);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.pageRows.map((r) => r.id)).toEqual([22, 24]);

    act(() => result.current.clearFilters());
    expect(result.current.isFiltering).toBe(false);
    expect(result.current.serverPage).toBe(2);
  });
});
