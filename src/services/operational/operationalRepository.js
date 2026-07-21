import { OPERATIONAL_DATA_KEY } from "../../constants/storageKeys";
import { LOADING_STATUS, APPROVAL_STATUS } from "../../constants/approval";
import { fromRakeApiPayload, fromLoadingApiPayload, fromDelayApiPayload } from "../../types/transforms";
import {
  applyApprovalDecision,
  createApprovalRequestFromLoading,
  fromApprovalApiPayload,
  loadingStatusAfterApproval,
} from "../../types/approvalTransforms";
import { normalizeWagonManifest } from "../../utils/wagonInspectionUtils";

/** Bump when demo seed data changes so localStorage refreshes in development. */
const OPERATIONAL_STORE_VERSION = 5;

const SEED_RAKES = [
  {
    id: "RK-7729",
    sno: 1,
    rakeNumber: "R-2026-001",
    wagonType: "BOXNHL",
    wagonCount: 58,
    siding: "Siding-A",
    route: "R-14",
    oreType: "LUMP",
    customer: "JSW Steel",
    destination: "Visakhapatnam",
    fNote: "FN-23011",
    offerTime: "2026-03-19T04:29:00.000Z",
    isDisabled: false,
  },
  {
    id: "RK-8812",
    sno: 2,
    rakeNumber: "R-2026-002",
    wagonType: "BOXN",
    wagonCount: 45,
    siding: "Siding-C",
    route: "R-09",
    oreType: "FINES",
    customer: "Tata Steel",
    destination: "Bhilai",
    fNote: "FN-23022",
    offerTime: "2026-03-19T04:47:00.000Z",
    isDisabled: false,
  },
  {
    id: "RK-9003",
    sno: 3,
    rakeNumber: "R-2026-003",
    wagonType: "BOBRN",
    wagonCount: 59,
    siding: "Siding-D",
    route: "R-05",
    oreType: "PELLET",
    customer: "SAIL",
    destination: "Raipur",
    fNote: "FN-23041",
    offerTime: "2026-03-19T05:03:00.000Z",
    isDisabled: false,
  },
  {
    id: "RK-9104",
    sno: 4,
    rakeNumber: "R-2026-004",
    wagonType: "BCN",
    wagonCount: 52,
    siding: "Siding-B",
    route: "R-11",
    oreType: "FINES",
    customer: "NMDC",
    destination: "Kolkata",
    fNote: "FN-23055",
    offerTime: "2026-03-19T06:10:00.000Z",
    isDisabled: false,
  },
];

const SEED_LOADING = [
  {
    id: "LD-7729",
    rakeId: "RK-7729",
    rakeNumber: "R-2026-001",
    wagonSupply: "BOXNHL/58",
    siding: "Siding-A",
    route: "R-14",
    customer: "JSW Steel",
    destination: "Visakhapatnam",
    fNote: "FN-23011",
    placementTime: "2026-03-19T03:50:00.000Z",
    offerTime: "2026-03-19T04:29:00.000Z",
    operatorFtp: "FTP-14",
    wagonSick: "No",
    tonnage: "3450",
    stockpile: "SP-12",
    manualLoadingTrack: "R3",
    completionTime: "2026-03-19T07:50:00.000Z",
    clearanceTime: "2026-03-19T08:12:00.000Z",
    overloadedWagons: 0,
    weightRemoved: 0,
    isDisabled: false,
    status: LOADING_STATUS.READY_FOR_DISPATCH,
    isSubmitted: true,
  },
  {
    id: "LD-8812",
    rakeId: "RK-8812",
    rakeNumber: "R-2026-002",
    wagonSupply: "BOXN/45",
    siding: "Siding-C",
    route: "R-09",
    customer: "Tata Steel",
    destination: "Bhilai",
    fNote: "FN-23022",
    placementTime: "2026-03-19T04:35:00.000Z",
    offerTime: "2026-03-19T04:47:00.000Z",
    operatorFtp: "FTP-22",
    wagonSick: "Yes",
    tonnage: "2880",
    stockpile: "SP-04",
    manualLoadingTrack: "",
    completionTime: "2026-03-19T09:10:00.000Z",
    clearanceTime: null,
    overloadedWagons: 0,
    weightRemoved: 0,
    isDisabled: false,
    status: LOADING_STATUS.AWAITING_APPROVAL,
    isSubmitted: true,
  },
  {
    id: "LD-9003",
    rakeId: "RK-9003",
    rakeNumber: "R-2026-003",
    wagonSupply: "BOBRN/59",
    siding: "Siding-D",
    route: "R-05",
    customer: "SAIL",
    destination: "Raipur",
    fNote: "FN-23041",
    placementTime: "2026-03-19T04:41:00.000Z",
    offerTime: "2026-03-19T05:03:00.000Z",
    operatorFtp: "FTP-07",
    wagonSick: "No",
    tonnage: "3520",
    stockpile: "SP-18",
    manualLoadingTrack: "R4",
    completionTime: "2026-03-19T08:38:00.000Z",
    clearanceTime: null,
    overloadedWagons: 0,
    weightRemoved: 0,
    isDisabled: false,
    status: LOADING_STATUS.AWAITING_APPROVAL,
    isSubmitted: true,
  },
  {
    id: "LD-9104",
    rakeId: "RK-9104",
    rakeNumber: "R-2026-004",
    wagonSupply: "BCN/52",
    siding: "Siding-B",
    route: "R-11",
    customer: "NMDC",
    destination: "Kolkata",
    fNote: "FN-23055",
    placementTime: "2026-03-19T05:50:00.000Z",
    offerTime: "2026-03-19T06:10:00.000Z",
    operatorFtp: "FTP-31",
    wagonSick: "No",
    tonnage: "3100",
    stockpile: "SP-09",
    completionTime: "2026-03-19T10:00:00.000Z",
    clearanceTime: "2026-03-19T10:15:00.000Z",
    overloadedWagons: 1,
    weightRemoved: 12,
    isDisabled: false,
    status: LOADING_STATUS.AWAITING_APPROVAL,
    isSubmitted: true,
  },
];

const SEED_APPROVALS = [
  {
    id: "APR-7729",
    loadingId: "LD-7729",
    rakeId: "RK-7729",
    rakeNumber: "R-2026-001",
    customer: "JSW Steel",
    siding: "Siding-A",
    status: APPROVAL_STATUS.APPROVED,
    operations: {
      status: "approved",
      approvedBy: "Station Master",
      approvedAt: "2026-03-19T08:00:00.000Z",
      remarks: "Operational readiness verified. Track clearance granted.",
      trackClearanceTime: "2026-03-19T08:12:00.000Z",
    },
    commercial: {
      status: "approved",
      approvedBy: "Commercial Officer",
      approvedAt: "2026-03-19T08:20:00.000Z",
      remarks: "Wagon and documentation verified.",
    },
    cw: {
      status: "approved",
      approvedBy: "C&W Inspector",
      approvedAt: "2026-03-19T08:35:00.000Z",
      remarks: "Safety and technical inspection passed.",
      wagonObservations: "All wagons fit for dispatch.",
    },
    history: [],
    createdAt: "2026-03-19T07:55:00.000Z",
    updatedAt: "2026-03-19T08:35:00.000Z",
  },
  {
    id: "APR-8812",
    loadingId: "LD-8812",
    rakeId: "RK-8812",
    rakeNumber: "R-2026-002",
    customer: "Tata Steel",
    siding: "Siding-C",
    status: APPROVAL_STATUS.AWAITING_OPERATIONS,
    operations: { status: "pending", approvedBy: null, approvedAt: null, remarks: "" },
    commercial: { status: "pending", approvedBy: null, approvedAt: null, remarks: "" },
    cw: { status: "pending", approvedBy: null, approvedAt: null, remarks: "" },
    history: [
      {
        step: "system",
        action: "created",
        actor: "Loading System",
        timestamp: "2026-03-19T09:12:00.000Z",
        remarks: "Demo: awaiting Railway Operations approval.",
      },
    ],
    createdAt: "2026-03-19T09:12:00.000Z",
    updatedAt: "2026-03-19T09:12:00.000Z",
  },
  {
    id: "APR-9003",
    loadingId: "LD-9003",
    rakeId: "RK-9003",
    rakeNumber: "R-2026-003",
    customer: "SAIL",
    siding: "Siding-D",
    status: APPROVAL_STATUS.AWAITING_COMMERCIAL,
    operations: {
      status: "approved",
      approvedBy: "Station Master",
      approvedAt: "2026-03-19T08:45:00.000Z",
      remarks: "Track cleared for commercial verification.",
      trackClearanceTime: "2026-03-19T08:50:00.000Z",
      inspection: {
        trackClearanceTime: "2026-03-19T08:50:00.000Z",
        doorUnlockPassed: true,
        singleBarPassed: true,
        downsideCheckPassed: false,
        uneven: { numbers: ["W-9003-011", "W-9003-014"], count: 2 },
        sick: { numbers: ["W-9003-022"], count: 1 },
        repair: { numbers: [], count: 0 },
      },
    },
    commercial: { status: "pending", approvedBy: null, approvedAt: null, remarks: "" },
    cw: { status: "pending", approvedBy: null, approvedAt: null, remarks: "" },
    history: [],
    createdAt: "2026-03-19T08:40:00.000Z",
    updatedAt: "2026-03-19T08:45:00.000Z",
  },
  {
    id: "APR-9104",
    loadingId: "LD-9104",
    rakeId: "RK-9104",
    rakeNumber: "R-2026-004",
    customer: "NMDC",
    siding: "Siding-B",
    status: APPROVAL_STATUS.AWAITING_CW,
    operations: {
      status: "approved",
      approvedBy: "Station Master",
      approvedAt: "2026-03-19T10:12:00.000Z",
      remarks: "Track cleared.",
      trackClearanceTime: "2026-03-19T10:15:00.000Z",
      inspection: {
        trackClearanceTime: "2026-03-19T10:15:00.000Z",
        doorUnlockPassed: true,
        singleBarPassed: true,
        downsideCheckPassed: true,
        uneven: { numbers: ["W-9104-008"], count: 1 },
        sick: { numbers: [], count: 0 },
        repair: { numbers: ["W-9104-031"], count: 1 },
      },
    },
    commercial: {
      status: "approved",
      approvedBy: "Commercial Officer",
      approvedAt: "2026-03-19T10:25:00.000Z",
      remarks: "Commercial checks complete.",
      inspection: {
        topViewRemarks: "Minor uneven profile on rear wagons. Overload corrected on W-9104-019.",
        overloaded: { numbers: ["W-9104-019"], count: 1 },
        unevenRake: { numbers: ["W-9104-041", "W-9104-042"], count: 2 },
        doorUnlockPassed: true,
        singleBarPassed: false,
        downsideCheckPassed: true,
        uneven: { numbers: ["W-9104-041"], count: 1 },
        sick: { numbers: [], count: 0 },
        repair: { numbers: [], count: 0 },
      },
    },
    cw: { status: "pending", approvedBy: null, approvedAt: null, remarks: "" },
    history: [],
    createdAt: "2026-03-19T10:05:00.000Z",
    updatedAt: "2026-03-19T10:25:00.000Z",
  },
];

const SEED_DELAYS = [
  {
    id: "DL-001",
    rakeId: "RK-7729",
    loadingId: "LD-7729",
    rakeNumber: "R-2026-001",
    category: "Wagon Supply",
    startTime: "2026-03-19T04:00:00.000Z",
    endTime: "2026-03-19T04:25:00.000Z",
    reason: "Late wagon placement",
    reportedBy: "Shift Controller",
    isDisabled: false,
  },
  {
    id: "DL-002",
    rakeId: "RK-8812",
    loadingId: "LD-8812",
    rakeNumber: "R-2026-002",
    category: "Loading",
    startTime: "2026-03-19T08:00:00.000Z",
    endTime: "2026-03-19T09:05:00.000Z",
    reason: "Crane breakdown during loading",
    reportedBy: "Loading Supervisor",
    isDisabled: false,
  },
];

const SEED_EDEMANDS = [
  {
    id: 1,
    fNote: "10",
    date: "2025-04-01",
    customer: "Vaswani Industries",
    destination: "JCB",
    oreType: "CLO",
    salesType: "LTA",
  },
  {
    id: 2,
    fNote: "1002",
    date: "2026-01-12",
    customer: "Rashtriya Ispat Nigam Ltd",
    destination: "VSPS",
    oreType: "F",
    salesType: "LTA",
  },
  {
    id: 3,
    fNote: "1003",
    date: "2026-01-12",
    customer: "Rashtriya Ispat Nigam Ltd",
    destination: "VSPS",
    oreType: "F",
    salesType: "LTA",
  },
  {
    id: 4,
    fNote: "1004",
    date: "2026-01-12",
    customer: "Rashtriya Ispat Nigam Ltd",
    destination: "VSPS",
    oreType: "F",
    salesType: "LTA",
  },
  {
    id: 5,
    fNote: "1006",
    date: "2026-01-12",
    customer: "Rashtriya Ispat Nigam Ltd",
    destination: "VSPS",
    oreType: "L",
    salesType: "LTA",
  },
];

function buildSeedEPermits(loadingRecords) {
  return loadingRecords
    .filter((record) => record.completionTime && !record.isDisabled)
    .map((loading, index) => ({
      id: index + 1,
      loadingId: loading.id,
      rakeNumber: loading.rakeNumber,
      customer: loading.customer,
      stockpile: loading.stockpile,
      quantity: Number(loading.tonnage) || 0,
      completedOn: loading.completionTime,
      ePermitNumber: `EPM-24030${index + 1}`,
      railwayTransitPass: `RTP-9030${index + 1}`,
      updatedBy: "System",
      updatedAt: null,
    }));
}

function defaultStore() {
  const loadingRecords = SEED_LOADING.map(fromLoadingApiPayload);
  return {
    version: OPERATIONAL_STORE_VERSION,
    rakes: SEED_RAKES.map(fromRakeApiPayload),
    loadingRecords,
    delayRecords: SEED_DELAYS.map(fromDelayApiPayload),
    approvalRequests: SEED_APPROVALS.map(fromApprovalApiPayload),
    upcomingDrafts: [],
    eDemands: [...SEED_EDEMANDS],
    ePermits: buildSeedEPermits(loadingRecords),
  };
}

function readStore() {
  try {
    const raw = localStorage.getItem(OPERATIONAL_DATA_KEY);
    if (!raw) {
      const store = defaultStore();
      writeStore(store);
      return store;
    }

    const parsed = JSON.parse(raw);
    if (parsed.version !== OPERATIONAL_STORE_VERSION) {
      const store = defaultStore();
      writeStore(store);
      return store;
    }

    return {
      version: OPERATIONAL_STORE_VERSION,
      rakes: (parsed.rakes ?? SEED_RAKES).map(fromRakeApiPayload),
      loadingRecords: (parsed.loadingRecords ?? SEED_LOADING).map(
        fromLoadingApiPayload,
      ),
      delayRecords: (parsed.delayRecords ?? SEED_DELAYS).map(fromDelayApiPayload),
      approvalRequests: (parsed.approvalRequests?.length
        ? parsed.approvalRequests
        : SEED_APPROVALS
      ).map(fromApprovalApiPayload),
      upcomingDrafts: parsed.upcomingDrafts ?? [],
      eDemands: parsed.eDemands?.length ? parsed.eDemands : [...SEED_EDEMANDS],
      ePermits: parsed.ePermits?.length
        ? parsed.ePermits
        : buildSeedEPermits((parsed.loadingRecords ?? SEED_LOADING).map(fromLoadingApiPayload)),
    };
  } catch {
    const store = defaultStore();
    writeStore(store);
    return store;
  }
}

function writeStore(data) {
  localStorage.setItem(OPERATIONAL_DATA_KEY, JSON.stringify(data));
}

function syncEPermitsFromLoading(store) {
  const loadingRecords = store.loadingRecords.filter(
    (record) => record.completionTime && !record.isDisabled,
  );
  const existingByLoadingId = Object.fromEntries(
    (store.ePermits ?? []).map((permit) => [permit.loadingId, permit]),
  );

  store.ePermits = loadingRecords.map((loading, index) => {
    const existing = existingByLoadingId[loading.id];
    return {
      id: existing?.id ?? index + 1,
      loadingId: loading.id,
      rakeNumber: loading.rakeNumber,
      customer: loading.customer,
      stockpile: loading.stockpile,
      quantity: Number(loading.tonnage) || 0,
      completedOn: loading.completionTime,
      ePermitNumber: existing?.ePermitNumber ?? `EPM-${loading.id.slice(-4)}`,
      railwayTransitPass:
        existing?.railwayTransitPass ?? `RTP-${loading.id.slice(-4)}`,
      updatedBy: existing?.updatedBy ?? "",
      updatedAt: existing?.updatedAt ?? null,
    };
  });
}

/** Local repository simulating REST API until backend endpoints exist. */
export const operationalRepository = {
  loadAll() {
    return readStore();
  },

  saveAll(data) {
    writeStore(data);
    return data;
  },

  async listRakes() {
    const store = readStore();
    return store.rakes;
  },

  async getRakeById(id) {
    const store = readStore();
    return store.rakes.find((r) => r.id === id) ?? null;
  },

  async getRakeByNumber(rakeNumber) {
    const store = readStore();
    return store.rakes.find((r) => r.rakeNumber === rakeNumber) ?? null;
  },

  async upsertRake(rake) {
    const store = readStore();
    const canonical = fromRakeApiPayload(rake);
    const index = store.rakes.findIndex((r) => r.id === canonical.id);
    if (index >= 0) store.rakes[index] = canonical;
    else store.rakes.unshift(canonical);
    writeStore(store);
    return canonical;
  },

  async deleteRake(id) {
    const store = readStore();
    store.rakes = store.rakes.filter((r) => r.id !== id);
    writeStore(store);
  },

  async listLoading() {
    return readStore().loadingRecords;
  },

  async getLoadingById(id) {
    return readStore().loadingRecords.find((r) => r.id === id) ?? null;
  },

  async getLoadingByRakeId(rakeId) {
    return readStore().loadingRecords.find((r) => r.rakeId === rakeId) ?? null;
  },

  async upsertLoading(record) {
    const store = readStore();
    const canonical = fromLoadingApiPayload(record);
    const index = store.loadingRecords.findIndex((r) => r.id === canonical.id);
    if (index >= 0) store.loadingRecords[index] = canonical;
    else store.loadingRecords.unshift(canonical);
    syncEPermitsFromLoading(store);
    writeStore(store);
    return canonical;
  },

  async listDelays() {
    return readStore().delayRecords;
  },

  async getDelayById(id) {
    return readStore().delayRecords.find((r) => r.id === id) ?? null;
  },

  async getDelaysByRakeId(rakeId) {
    return readStore().delayRecords.filter((r) => r.rakeId === rakeId);
  },

  async getDelaysByLoadingId(loadingId) {
    return readStore().delayRecords.filter((r) => r.loadingId === loadingId);
  },

  async upsertDelay(record) {
    const store = readStore();
    const canonical = fromDelayApiPayload(record);
    const index = store.delayRecords.findIndex((r) => r.id === canonical.id);
    if (index >= 0) store.delayRecords[index] = canonical;
    else store.delayRecords.unshift(canonical);
    writeStore(store);
    return canonical;
  },

  async saveUpcomingDrafts(drafts) {
    const store = readStore();
    store.upcomingDrafts = drafts;
    writeStore(store);
    return drafts;
  },

  async listUpcomingDrafts() {
    return readStore().upcomingDrafts;
  },

  async listApprovals() {
    return readStore().approvalRequests;
  },

  async getApprovalById(id) {
    return readStore().approvalRequests.find((item) => item.id === id) ?? null;
  },

  async getApprovalByLoadingId(loadingId) {
    return readStore().approvalRequests.find((item) => item.loadingId === loadingId) ?? null;
  },

  async createApprovalForLoading(loadingId) {
    const store = readStore();
    const loading = store.loadingRecords.find((item) => item.id === loadingId);
    if (!loading) throw new Error("Loading record not found");

    const existing = store.approvalRequests.find((item) => item.loadingId === loadingId);
    if (existing) return existing;

    const approval = createApprovalRequestFromLoading(loading);
    store.approvalRequests.unshift(approval);

    const loadingIndex = store.loadingRecords.findIndex((item) => item.id === loadingId);
    if (loadingIndex >= 0) {
      store.loadingRecords[loadingIndex] = {
        ...store.loadingRecords[loadingIndex],
        status: LOADING_STATUS.AWAITING_APPROVAL,
        isSubmitted: true,
        clearanceTime: null,
      };
    }

    writeStore(store);
    return approval;
  },

  async completeLoading(loadingId) {
    const store = readStore();
    const loadingIndex = store.loadingRecords.findIndex((item) => item.id === loadingId);
    if (loadingIndex < 0) throw new Error("Loading record not found");

    const loading = store.loadingRecords[loadingIndex];
    if (!loading.completionTime) {
      throw new Error("Completion time is required before final submit.");
    }

    store.loadingRecords[loadingIndex] = {
      ...loading,
      status: LOADING_STATUS.AWAITING_APPROVAL,
      isSubmitted: true,
      clearanceTime: null,
    };

    writeStore(store);
    return this.createApprovalForLoading(loadingId);
  },

  async updateApprovalWagonManifest(approvalId, manifest) {
    const store = readStore();
    const index = store.approvalRequests.findIndex((item) => item.id === approvalId);
    if (index < 0) throw new Error("Approval request not found");

    const current = store.approvalRequests[index];
    store.approvalRequests[index] = {
      ...current,
      wagonManifest: normalizeWagonManifest(manifest, current),
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.approvalRequests[index];
  },

  async submitApprovalDecision(approvalId, department, decision) {
    const store = readStore();
    const index = store.approvalRequests.findIndex((item) => item.id === approvalId);
    if (index < 0) throw new Error("Approval request not found");

    const updated = applyApprovalDecision(store.approvalRequests[index], department, decision);
    store.approvalRequests[index] = updated;

    const loadingIndex = store.loadingRecords.findIndex(
      (item) => item.id === updated.loadingId,
    );
    if (loadingIndex >= 0) {
      const loading = store.loadingRecords[loadingIndex];
      const nextLoading = {
        ...loading,
        status: loadingStatusAfterApproval(updated),
      };

      if (
        department === "operations" &&
        decision.action === "approve"
      ) {
        const clearance =
          updated.operations.trackClearanceTime ||
          updated.operations.inspection?.trackClearanceTime;
        if (clearance) {
          nextLoading.clearanceTime = clearance;
        }
      }

      store.loadingRecords[loadingIndex] = nextLoading;
    }

    writeStore(store);
    return updated;
  },

  async listEDemands() {
    return readStore().eDemands ?? [];
  },

  async saveEDemands(demands) {
    const store = readStore();
    store.eDemands = demands;
    writeStore(store);
    return demands;
  },

  async upsertEDemand(demand) {
    const store = readStore();
    const index = store.eDemands.findIndex((item) => item.id === demand.id);
    if (index >= 0) store.eDemands[index] = demand;
    else store.eDemands.unshift(demand);
    writeStore(store);
    return demand;
  },

  async deleteEDemand(id) {
    const store = readStore();
    store.eDemands = store.eDemands.filter((item) => item.id !== id);
    writeStore(store);
  },

  async listEPermits() {
    const store = readStore();
    syncEPermitsFromLoading(store);
    writeStore(store);
    return store.ePermits ?? [];
  },

  async updateEPermit(id, patch, updatedBy = "") {
    const store = readStore();
    syncEPermitsFromLoading(store);
    const index = store.ePermits.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("E-Permit record not found");

    store.ePermits[index] = {
      ...store.ePermits[index],
      ...patch,
      updatedBy: updatedBy || store.ePermits[index].updatedBy,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.ePermits[index];
  },
};
