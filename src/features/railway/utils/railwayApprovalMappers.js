import {
  APPROVAL_DEPARTMENTS,
  APPROVAL_STATUS,
} from "../../../constants/approval";
import { emptyDepartmentInspection, wagonListFromNumbers } from "../../../utils/wagonInspectionUtils";

export const RAILWAY_STATUS_CODE = {
  APPROVED: 5,
  AWAITING_OPERATIONS: 10,
  AWAITING_COMMERCIAL: 15,
  AWAITING_CW: 20,
  REJECTED: 25,
};

export const DEPARTMENT_CODE = {
  [APPROVAL_DEPARTMENTS.OPERATIONS]: 5,
  [APPROVAL_DEPARTMENTS.COMMERCIAL]: 10,
  [APPROVAL_DEPARTMENTS.CW]: 15,
};

export const STEP_STATUS_CODE = {
  pending: 5,
  approved: 10,
  rejected: 15,
};

export const ACTION_CODE = {
  created: 5,
  approved: 10,
  rejected: 15,
};

const STATUS_FROM_CODE = Object.fromEntries(
  Object.entries(RAILWAY_STATUS_CODE).map(([key, code]) => [code, key]),
);

const DEPARTMENT_FROM_CODE = Object.fromEntries(
  Object.entries(DEPARTMENT_CODE).map(([key, code]) => [code, key]),
);

const STEP_STATUS_FROM_CODE = Object.fromEntries(
  Object.entries(STEP_STATUS_CODE).map(([key, code]) => [code, key]),
);

const ACTION_FROM_CODE = Object.fromEntries(
  Object.entries(ACTION_CODE).map(([key, code]) => [code, key]),
);

const ISSUE_FIELDS = [
  ["overloaded", 5],
  ["unevenRake", 10],
  ["uneven", 15],
  ["sick", 20],
  ["repair", 25],
  ["doorUnlock", 30],
  ["singleBar", 35],
  ["downsideCheck", 40],
];

const FLAG_CODE = {
  overloaded: 5,
  uneven_rake: 10,
  uneven: 15,
  sick: 20,
  repair: 25,
  door_unlock: 30,
  single_bar: 35,
  downside_check: 40,
};

const FLAG_FROM_CODE = Object.fromEntries(
  Object.entries(FLAG_CODE).map(([flag, code]) => [code, flag]),
);

const ISSUE_FIELD_BY_CODE = Object.fromEntries(
  ISSUE_FIELDS.map(([field, code]) => [code, field]),
);

function emptyStep() {
  return {
    status: "pending",
    approvedBy: null,
    approvedAt: null,
    remarks: "",
    trackClearanceTime: null,
    wagonObservations: "",
    inspection: emptyDepartmentInspection(),
  };
}

function inspectionFromStep(step = {}) {
  const inspection = emptyDepartmentInspection();
  for (const wagon of step.wagons || []) {
    const field = ISSUE_FIELD_BY_CODE[wagon.issue];
    if (!field || !wagon.wagon_number) continue;
    inspection[field] = wagonListFromNumbers([
      ...(inspection[field]?.numbers || []),
      wagon.wagon_number,
    ]);
  }
  inspection.trackClearanceTime = step.track_clearance_time || null;
  inspection.topViewRemarks = step.top_view_remarks || "";
  inspection.doorUnlockPassed = step.door_unlock_passed ?? null;
  inspection.singleBarPassed = step.single_bar_passed ?? null;
  inspection.downsideCheckPassed = step.downside_check_passed ?? null;
  return inspection;
}

function mapStep(step) {
  if (!step) return emptyStep();
  const inspection = inspectionFromStep(step);
  return {
    status: STEP_STATUS_FROM_CODE[step.step_status] || "pending",
    approvedBy: step.actor_name || null,
    approvedAt: step.approved_at || null,
    remarks: step.remarks || "",
    trackClearanceTime: step.track_clearance_time || null,
    wagonObservations: step.wagon_observations || "",
    inspection,
  };
}

export function mapRailwayApproval(dto) {
  const stepsByDepartment = Object.fromEntries(
    (dto.steps || []).map((step) => [DEPARTMENT_FROM_CODE[step.department], step]),
  );
  const wagons = (dto.wagons || []).map((wagon, index) => ({
    wagonNumber: wagon.wagon_number,
    position: wagon.position ?? index + 1,
    flags: (wagon.flags || [])
      .map((flag) => FLAG_FROM_CODE[flag.flag] || FLAG_FROM_CODE[flag])
      .filter(Boolean),
  }));

  return {
    id: dto.id,
    loadingId: dto.loading,
    rakeId: dto.rake,
    rakeNumber: dto.rake_number || "",
    customer: dto.customer_name || "",
    siding: dto.siding_name || "",
    tonnage: dto.tonnage ?? "",
    completionTime: dto.completion_time || null,
    status: STATUS_FROM_CODE[dto.status] || APPROVAL_STATUS.AWAITING_OPERATIONS,
    operations: mapStep(stepsByDepartment[APPROVAL_DEPARTMENTS.OPERATIONS]),
    commercial: mapStep(stepsByDepartment[APPROVAL_DEPARTMENTS.COMMERCIAL]),
    cw: mapStep(stepsByDepartment[APPROVAL_DEPARTMENTS.CW]),
    history: (dto.history || []).map((entry) => ({
      step: DEPARTMENT_FROM_CODE[entry.department] || "system",
      action: ACTION_FROM_CODE[entry.action] || "created",
      actor: entry.actor_name || "",
      timestamp: entry.acted_on,
      remarks: entry.remarks || "",
    })),
    wagonManifest: {
      rakeNumber: dto.rake_number || "",
      rakeId: dto.rake,
      totalWagons: wagons.length,
      wagons,
      source: "Railway approval",
      receivedAt: dto.created_on || null,
      updatedAt: dto.modified_on || null,
    },
    createdAt: dto.created_on || null,
    updatedAt: dto.modified_on || null,
  };
}

export function stepToApi(step, department) {
  const inspection = step?.inspection || emptyDepartmentInspection();
  return {
    department: DEPARTMENT_CODE[department],
    step_status: STEP_STATUS_CODE[step?.status] || STEP_STATUS_CODE.pending,
    actor_name: step?.approvedBy || "",
    approved_at: step?.approvedAt || null,
    remarks: step?.remarks || "",
    track_clearance_time: inspection.trackClearanceTime || step?.trackClearanceTime || null,
    wagon_observations: step?.wagonObservations || "",
    top_view_remarks: inspection.topViewRemarks || "",
    door_unlock_passed: inspection.doorUnlockPassed ?? null,
    single_bar_passed: inspection.singleBarPassed ?? null,
    downside_check_passed: inspection.downsideCheckPassed ?? null,
    wagons: ISSUE_FIELDS.flatMap(([field, issue]) =>
      (inspection[field]?.numbers || [])
        .map((number) => String(number || "").trim())
        .filter(Boolean)
        .map((wagon_number) => ({ issue, wagon_number })),
    ),
  };
}

export function manifestToApiWagons(manifest) {
  return (manifest?.wagons || []).map((wagon, index) => ({
    wagon_number: wagon.wagonNumber,
    position: wagon.position ?? index + 1,
    flags: (wagon.flags || []).map((flag) => FLAG_CODE[flag]).filter((code) => code != null),
  }));
}
