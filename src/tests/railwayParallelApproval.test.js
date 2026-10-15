import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  APPROVAL_DEPARTMENTS,
  APPROVAL_STATUS,
  countPendingApprovals,
  getApprovalStepState,
} from "../constants/approval";
import { applyApprovalDecision } from "../types/approvalTransforms";
import {
  canDepartmentAct,
  getPendingDepartmentForApproval,
  getPendingDepartmentsForApproval,
} from "../utils/approvalUtils";
import { mapRailwayApproval } from "../features/railway/utils/railwayApprovalMappers";

vi.mock("../services/apiClient", () => ({ apiRequest: vi.fn() }));

const { apiRequest } = await import("../services/apiClient");
const { submitRailwayDecision } = await import("../services/railwayApprovalService");

const { OPERATIONS, COMMERCIAL, CW } = APPROVAL_DEPARTMENTS;

function approvalDto(status, steps) {
  return {
    id: 21,
    loading: 4,
    rake: 9,
    rake_number: "RK-21",
    status,
    steps: Object.entries(steps).map(([department, step_status]) => ({
      department: Number(department),
      step_status,
    })),
    history: [],
    wagons: [],
  };
}

const freshApproval = () => mapRailwayApproval(approvalDto(10, { 5: 5, 10: 5, 15: 5 }));
const approve = (approval, department, extra = {}) =>
  applyApprovalDecision(approval, department, { action: "approve", actor: "Tester", ...extra });

describe("parallel Commercial / C&W approval", () => {
  it("maps the parallel status and Not Required steps from the API", () => {
    const approval = mapRailwayApproval(approvalDto(30, { 5: 10, 10: 5, 15: 20 }));
    expect(approval.status).toBe(APPROVAL_STATUS.AWAITING_COMMERCIAL_CW);
    expect(approval.cw.status).toBe("not_required");
    expect(getApprovalStepState(approval, CW)).toBe("skipped");
  });

  it("shows an approval sent to both departments in both queues", () => {
    const approval = approve(freshApproval(), OPERATIONS, { targets: [COMMERCIAL, CW] });
    expect(approval.status).toBe(APPROVAL_STATUS.AWAITING_COMMERCIAL_CW);
    expect(canDepartmentAct(approval, COMMERCIAL)).toBe(true);
    expect(canDepartmentAct(approval, CW)).toBe(true);
    expect(canDepartmentAct(approval, OPERATIONS)).toBe(false);
    expect(getPendingDepartmentForApproval(approval, CW)).toBe(CW);
    expect(getPendingDepartmentForApproval(approval, "all")).toBe(COMMERCIAL);
    expect(getApprovalStepState(approval, COMMERCIAL)).toBe("active");
    expect(getApprovalStepState(approval, CW)).toBe("active");
    expect(countPendingApprovals([approval])).toBe(1);
  });

  it("approves only after both departments approve, in either order", () => {
    const routed = approve(freshApproval(), OPERATIONS, { targets: [COMMERCIAL, CW] });
    const cwFirst = approve(routed, CW);
    expect(cwFirst.status).toBe(APPROVAL_STATUS.AWAITING_COMMERCIAL);
    expect(getPendingDepartmentsForApproval(cwFirst)).toEqual([COMMERCIAL]);
    expect(canDepartmentAct(cwFirst, CW)).toBe(false);
    expect(approve(cwFirst, COMMERCIAL).status).toBe(APPROVAL_STATUS.APPROVED);
    expect(approve(approve(routed, COMMERCIAL), CW).status).toBe(APPROVAL_STATUS.APPROVED);
  });

  it("skips the unselected department", () => {
    const commercialOnly = approve(freshApproval(), OPERATIONS, { targets: [COMMERCIAL] });
    expect(commercialOnly.status).toBe(APPROVAL_STATUS.AWAITING_COMMERCIAL);
    expect(commercialOnly.cw.status).toBe("not_required");
    expect(canDepartmentAct(commercialOnly, CW)).toBe(false);
    expect(approve(commercialOnly, COMMERCIAL).status).toBe(APPROVAL_STATUS.APPROVED);

    const cwOnly = approve(freshApproval(), OPERATIONS, { targets: [CW] });
    expect(cwOnly.status).toBe(APPROVAL_STATUS.AWAITING_CW);
    expect(canDepartmentAct(cwOnly, COMMERCIAL)).toBe(false);
  });

  it("closes the request when either parallel department rejects", () => {
    const routed = approve(freshApproval(), OPERATIONS, { targets: [COMMERCIAL, CW] });
    const rejected = applyApprovalDecision(routed, CW, { action: "reject", actor: "Tester" });
    expect(rejected.status).toBe(APPROVAL_STATUS.REJECTED);
    expect(canDepartmentAct(rejected, COMMERCIAL)).toBe(false);
  });
});

describe("submitRailwayDecision payload", () => {
  beforeEach(() => {
    apiRequest.mockReset();
    apiRequest.mockImplementation((path, options) =>
      Promise.resolve(options?.method === "PATCH" ? {} : approvalDto(30, { 5: 10, 10: 5, 15: 5 })),
    );
  });

  it("sends both targets with the Operations approval", async () => {
    await submitRailwayDecision(
      freshApproval(),
      OPERATIONS,
      { action: "approve", actor: "Tester", trackClearanceTime: "2026-10-07T10:00" },
      [COMMERCIAL, CW],
    );
    const body = JSON.parse(apiRequest.mock.calls[0][1].body);
    expect(body.approval_targets).toEqual([10, 15]);
    expect(body.status).toBe(30);
    expect(body.steps[0]).toMatchObject({ department: 5, step_status: 10 });
    expect(body.loading_status).toBeUndefined();
  });

  it("releases the loading only on the final parallel approval", async () => {
    const routed = mapRailwayApproval(approvalDto(20, { 5: 10, 10: 10, 15: 5 }));
    await submitRailwayDecision(routed, CW, { action: "approve", actor: "Tester" });
    const body = JSON.parse(apiRequest.mock.calls[0][1].body);
    expect(body.status).toBe(5);
    expect(body.loading_status).toBe(20);
    expect(body.approval_targets).toBeUndefined();
  });
});
