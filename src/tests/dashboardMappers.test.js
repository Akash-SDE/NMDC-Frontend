import { describe, it, expect } from "vitest";
import {
  buildDispatchGrid,
  buildMetricValues,
  buildUpcomingRakeRows,
  getDayWindow,
} from "../features/dashboard/utils/dashboardMappers";

const at = (hour, minute = 0) => new Date(2026, 8, 29, hour, minute).toISOString();

const records = {
  rakes: [
    { id: 1, rake_number: "RK-1", status: 5, offertime: at(6), siding_name: "Siding A", route_name: "R1", wagontype_name: "BOXN", oretype_name: "LUMP", destination_name: "Vizag" },
    { id: 2, rake_number: "RK-2", status: 5, offertime: at(9), siding_name: "Siding A", route_name: "R1", wagontype_name: "BOXN" },
    { id: 3, rake_number: "RK-3", status: 5, offertime: at(11), siding_name: "Siding B", route_name: "R2", wagontype_name: "BOBRN", oretype_name: "FINES", destination_name: "Bhilai" },
    { id: 4, rake_number: "RK-4", status: 50, offertime: at(12), siding_name: "Siding B", route_name: "R2" },
  ],
  loadings: [
    { id: 10, rake: 1, rake_number: "RK-1", siding_name: "Siding A", route_name: "R1", placement_time: at(7), completion_time: at(10), clearance_time: at(12), tonnage: "3450.50", overloaded_wagons: 2, weight_removed: "0" },
    { id: 11, rake: 2, rake_number: "RK-2", siding_name: "Siding A", route_name: "R1", placement_time: at(10), completion_time: null, tonnage: null, overloaded_wagons: 0, weight_removed: "0" },
  ],
  delays: [
    { id: 20, rake: "RK-2", delay_start_time: at(13), delay_end_time: at(14, 30), duration: 90 },
  ],
};

describe("dashboard mappers", () => {
  const window = getDayWindow("2026-09-29");

  it("derives metric card values for the selected day", () => {
    expect(buildMetricValues(records, window)).toEqual({
      Received: "3",
      Loaded: "1",
      "Under Loading": "1",
      "Load adjustment": "1",
      "Demurraged Hours": "1.5",
      "Gross Loading Hours": "3",
      "Dispatch Qty": "3,450.5",
    });
  });

  it("returns zero metrics for a day without activity", () => {
    const values = buildMetricValues(records, getDayWindow("2026-09-28"));
    expect(values.Received).toBe("0");
    expect(values["Under Loading"]).toBe("0");
  });

  it("builds dispatch grid rows and events from loadings and delays", () => {
    const { hierarchy, events } = buildDispatchGrid(records, window, new Date(2026, 8, 29, 16).getTime());

    expect(hierarchy.map((siding) => siding.name)).toEqual(["SIDING A", "SIDING B"]);
    expect(hierarchy[0].alert).toBe("HIGH ALERT");
    expect(hierarchy[0].routes[0]).toMatchObject({ name: "R1", code: "BOXN", count: 2 });

    const byId = Object.fromEntries(events.map((event) => [event.id, event]));
    expect(byId["loading-10"]).toMatchObject({ start: 7, end: 10, status: "completed" });
    expect(byId["loading-11"]).toMatchObject({ start: 10, end: 16, status: "loading" });
    expect(byId["delay-20"]).toMatchObject({ start: 13, end: 14.5, status: "demurrage" });
  });

  it("shows every active master siding, including idle ones, and matches activity by siding id", () => {
    const withSidings = {
      ...records,
      rakes: records.rakes.map((rake) => ({ ...rake, siding: rake.siding_name === "Siding A" ? 101 : 102 })),
      sidings: [
        { id: 101, siding_code: "SDG-A", status: true },
        { id: 102, siding_code: "SDG-B", status: true },
        { id: 103, siding_code: "SDG-C", status: true },
        { id: 104, siding_code: "SDG-OFF", status: false },
      ],
    };
    const { hierarchy, events } = buildDispatchGrid(withSidings, window, new Date(2026, 8, 29, 16).getTime());

    expect(hierarchy.map((siding) => siding.name)).toEqual(["SDG-A", "SDG-B", "SDG-C"]);
    expect(hierarchy[2].routes).toEqual([
      expect.objectContaining({ name: "No rake activity", code: "-", count: 0 }),
    ]);
    expect(events.find((event) => event.id === "loading-10").siding).toBe("siding-101");
  });

  it("lists offered rakes not yet placed as upcoming, excluding cancelled", () => {
    const rows = buildUpcomingRakeRows(records);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ sno: 1, rakeNumber: "RK-3", oreType: "FINES", siding: "Siding B" });
  });
});
