import { describe, it, expect } from "vitest";
import {
  eDemandFormToApi,
  eDemandToForm,
  mapEDemand,
  mapEPermit,
} from "../features/edemand/utils/edemandMappers";
import {
  mapReportDelay,
  mapReportLoading,
  mapReportRake,
} from "../features/reports/utils/reportApiMappers";

const demandDto = {
  id: 7,
  fnote: "FN-2609-01",
  demand_date: "2026-09-29",
  customer: 1,
  customer_name: "Akash Kumar",
  destination: 2,
  destination_name: "Visakhapatnam Port",
  oretype: 3,
  oretype_name: "LUMP",
  sales_type: 10,
  sales_type_name: "AUCTION",
  status: 5,
};

describe("E-Demand mappers", () => {
  it("maps API rows to table rows with labels and ids", () => {
    const row = mapEDemand(demandDto);
    expect(row).toMatchObject({
      id: 7,
      fNote: "FN-2609-01",
      date: "2026-09-29",
      customer: "Akash Kumar",
      customerId: 1,
      destination: "Visakhapatnam Port",
      oreType: "LUMP",
      salesType: "AUCTION",
      salesTypeId: 10,
    });
  });

  it("round-trips a row through the form back to an API payload", () => {
    const form = eDemandToForm(mapEDemand(demandDto));
    expect(form).toEqual({
      fNote: "FN-2609-01",
      date: "2026-09-29",
      customer: "1",
      destination: "2",
      oreType: "3",
      salesType: "10",
    });
    expect(eDemandFormToApi(form)).toEqual({
      fnote: "FN-2609-01",
      demand_date: "2026-09-29",
      customer: 1,
      destination: 2,
      oretype: 3,
      sales_type: 10,
    });
  });

  it("sends a blank F-Note as null so the backend can assign one", () => {
    expect(eDemandFormToApi({ ...eDemandToForm(mapEDemand(demandDto)), fNote: "  " }).fnote).toBeNull();
  });

  it("maps E-Permit rows with numeric quantity", () => {
    const permit = mapEPermit({
      id: 3,
      loading: 9,
      rake: 11,
      rake_number: "RK-2609-01",
      customer_name: "Akash Kumar",
      stockpile_name: "SP-1",
      quantity: "3480.00",
      completion_time: "2026-09-28T23:00:00Z",
      epermit_number: null,
      railway_transit_pass: "",
      updated_by_name: "",
    });
    expect(permit).toMatchObject({
      loadingId: 9,
      rakeNumber: "RK-2609-01",
      quantity: 3480,
      ePermitNumber: "",
      railwayTransitPass: "",
    });
  });
});

describe("report API mappers", () => {
  it("maps rake and loading rows into report facts shape", () => {
    expect(
      mapReportRake({ id: 1, rake_number: "RK-1", wagontype_name: "BOXN", wagoncount: 58, oretype_name: "FINES", offertime: "2026-09-29T01:00:00Z" }),
    ).toEqual({ id: 1, rakeNumber: "RK-1", wagonType: "BOXN", wagonCount: 58, oreType: "FINES", offerTime: "2026-09-29T01:00:00Z" });

    const loading = mapReportLoading({
      id: 4,
      rake: 1,
      rake_number: "RK-1",
      wagontype_name: "BOXN",
      wagoncount: 58,
      siding_name: "SDG-1",
      tonnage: "3500.00",
      wagon_sick: 10,
      wagon_sick_name: "Yes",
      manual_loading_track: 5,
      weight_removed: "1.5",
      status_description: "Ready for Dispatch",
      is_disabled: false,
    });
    expect(loading).toMatchObject({
      rakeId: 1,
      wagonSupply: "BOXN/58",
      siding: "SDG-1",
      wagonSick: "Yes",
      manualLoadingTrack: "R3",
      weightRemoved: 1.5,
      status: "Ready for Dispatch",
      isDisabled: false,
    });
  });

  it("links delays to rakes by rake number", () => {
    const delay = mapReportDelay(
      { id: 5, rake: "RK-1", category_name: "Wagon Supply", delay_start_time: "a", delay_end_time: "b", reason: "Late" },
      { "RK-1": 1 },
    );
    expect(delay).toMatchObject({ rakeId: 1, rakeNumber: "RK-1", category: "Wagon Supply", reason: "Late" });
    expect(mapReportDelay({ id: 6, rake: "RK-X" }, { "RK-1": 1 }).rakeId).toBeNull();
  });
});
