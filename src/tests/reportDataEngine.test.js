import { describe, it, expect } from "vitest";
import { applyFilterOptions, toReportRequest } from "../pages/admin/reports/reportDataEngine";

describe("toReportRequest", () => {
  it("maps UI filter ids to API params and drops empty values", () => {
    const request = toReportRequest({
      fromDate: "2026-09-01",
      toDate: "2026-09-29",
      siding: "SDG-BCH-1A",
      customer: "",
      oreType: "LUMP",
      salesType: "LTA",
      threshold: "6.5",
      includeReason: true,
      rakeNumber: "RK",
    });
    expect(request).toMatchObject({
      from_date: "2026-09-01",
      to_date: "2026-09-29",
      siding: "SDG-BCH-1A",
      ore_type: "LUMP",
      sales_type: "LTA",
      threshold: 6.5,
    });
    expect(request).not.toHaveProperty("customer");
    expect(request).not.toHaveProperty("includeReason");
    expect(request).not.toHaveProperty("rakeNumber");
    expect(typeof request.time_zone).toBe("string");
  });

  it("ignores invalid thresholds and an inverted date range end", () => {
    const request = toReportRequest({ fromDate: "2026-09-10", toDate: "2026-09-01", threshold: "-2" });
    expect(request.from_date).toBe("2026-09-10");
    expect(request).not.toHaveProperty("to_date");
    expect(request).not.toHaveProperty("threshold");
  });

  it("produces the same key for filters the server does not use", () => {
    const base = JSON.stringify(toReportRequest({ siding: "A" }));
    expect(JSON.stringify(toReportRequest({ siding: "A", pendingPermit: true, rakeNumber: "x" }))).toBe(base);
  });
});

describe("applyFilterOptions", () => {
  it("fills select options from the server and leaves other filters alone", () => {
    const filters = [
      { id: "fromDate", type: "date" },
      { id: "siding", type: "select", options: [] },
      { id: "category", type: "select", options: [] },
    ];
    const merged = applyFilterOptions(filters, {
      siding: [{ value: "SDG-1", label: "SDG-1" }],
    });
    expect(merged[0]).toBe(filters[0]);
    expect(merged[1].options).toEqual([{ value: "SDG-1", label: "SDG-1" }]);
    expect(merged[2].options).toEqual([]);
  });
});
