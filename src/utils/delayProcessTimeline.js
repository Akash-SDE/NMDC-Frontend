import { APPROVAL_STEP_LABELS, APPROVAL_STEP_ORDER } from "../constants/approval";

/** Minimum gap (minutes) before a process stage is flagged as a delay. */
export const PROCESS_DELAY_THRESHOLDS = {
  wagonSupply: 90,
  loading: 300,
  approvalQueue: 45,
  railwayStep: 60,
  clearance: 30,
  demurrage: 300,
};

export const DELAY_SOURCE = {
  MANUAL: "manual",
  SYSTEM: "system",
  APPROVAL: "approval",
};

export const PROCESS_STAGES = {
  WAGON_SUPPLY: "Wagon Supply",
  LOADING: "Loading",
  APPROVAL_QUEUE: "Approval Queue",
  RAILWAY_OPERATIONS: "Railway Operations",
  RAILWAY_COMMERCIAL: "Railway Commercial",
  RAILWAY_CW: "Railway C&W",
  CLEARANCE: "Track Clearance",
  DISPATCH: "Dispatch Ready",
};

function parseTimestamp(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function minutesBetween(start, end) {
  const startMs = parseTimestamp(start);
  const endMs = parseTimestamp(end);
  if (!startMs || !endMs || endMs <= startMs) return null;
  return Math.floor((endMs - startMs) / 60000);
}

function formatDurationLabel(minutes) {
  if (minutes === null || minutes === undefined) return "-";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours === 0) return `${remainder}m`;
  return `${hours}h ${remainder}m`;
}

function buildGapDelay({
  id,
  loading,
  start,
  end,
  threshold,
  processStage,
  category,
  reason,
  reportedBy = "System",
  source = DELAY_SOURCE.SYSTEM,
}) {
  const durationMinutes = minutesBetween(start, end);
  if (durationMinutes === null || durationMinutes < threshold) return null;

  return {
    id,
    source,
    processStage,
    category,
    reason,
    reportedBy,
    rakeId: loading?.rakeId ?? "",
    loadingId: loading?.id ?? "",
    rakeNumber: loading?.rakeNumber ?? "",
    startTime: start,
    endTime: end,
    durationMinutes,
    durationLabel: formatDurationLabel(durationMinutes),
    isDisabled: false,
    isReadOnly: true,
  };
}

function buildApprovalStepDelays(loading, approval) {
  if (!loading || !approval) return [];

  const delays = [];
  const completion = loading.completionTime;
  const createdAt = approval.createdAt;

  delays.push(
    buildGapDelay({
      id: `SYS-${loading.id}-approval-queue`,
      loading,
      start: completion,
      end: approval.operations?.approvedAt,
      threshold: PROCESS_DELAY_THRESHOLDS.approvalQueue,
      processStage: PROCESS_STAGES.APPROVAL_QUEUE,
      category: "Operational Issue",
      reason: "Extended wait after loading completion before Railway Operations clearance",
      source: DELAY_SOURCE.APPROVAL,
    }),
  );

  const stepPairs = [
    {
      key: "operations",
      stage: PROCESS_STAGES.RAILWAY_OPERATIONS,
      start: completion || createdAt,
      end: approval.operations?.approvedAt,
      pendingReason: "Awaiting Railway Operations inspection and track clearance",
    },
    {
      key: "commercial",
      stage: PROCESS_STAGES.RAILWAY_COMMERCIAL,
      start: approval.operations?.approvedAt,
      end: approval.commercial?.approvedAt,
      pendingReason: "Awaiting Railway Commercial verification",
    },
    {
      key: "cw",
      stage: PROCESS_STAGES.RAILWAY_CW,
      start: approval.commercial?.approvedAt,
      end: approval.cw?.approvedAt,
      pendingReason: "Awaiting Railway C&W safety inspection",
    },
  ];

  stepPairs.forEach(({ key, stage, start, end, pendingReason }) => {
    delays.push(
      buildGapDelay({
        id: `SYS-${loading.id}-${key}-wait`,
        loading,
        start,
        end,
        threshold: PROCESS_DELAY_THRESHOLDS.railwayStep,
        processStage: stage,
        category: "Railway Delay",
        reason: pendingReason,
        reportedBy: APPROVAL_STEP_LABELS[key] ?? "Railway Approval",
        source: DELAY_SOURCE.APPROVAL,
      }),
    );
  });

  const clearanceTime =
    approval.operations?.trackClearanceTime ||
    approval.operations?.inspection?.trackClearanceTime ||
    loading.clearanceTime;
  const opsApprovedAt = approval.operations?.approvedAt;

  delays.push(
    buildGapDelay({
      id: `SYS-${loading.id}-clearance`,
      loading,
      start: opsApprovedAt,
      end: clearanceTime,
      threshold: PROCESS_DELAY_THRESHOLDS.clearance,
      processStage: PROCESS_STAGES.CLEARANCE,
      category: "Railway Delay",
      reason: "Delay between operations approval and track clearance recording",
      source: DELAY_SOURCE.APPROVAL,
    }),
  );

  delays.push(
    buildGapDelay({
      id: `SYS-${loading.id}-demurrage`,
      loading,
      start: loading.placementTime || loading.offerTime,
      end: clearanceTime || loading.completionTime,
      threshold: PROCESS_DELAY_THRESHOLDS.demurrage,
      processStage: PROCESS_STAGES.DISPATCH,
      category: "Operational Issue",
      reason: "Demurrage window exceeded (placement/clearance beyond threshold)",
      source: DELAY_SOURCE.SYSTEM,
    }),
  );

  return delays.filter(Boolean);
}

function buildLoadingStageDelays(loading) {
  if (!loading) return [];

  return [
    buildGapDelay({
      id: `SYS-${loading.id}-wagon-supply`,
      loading,
      start: loading.offerTime,
      end: loading.placementTime,
      threshold: PROCESS_DELAY_THRESHOLDS.wagonSupply,
      processStage: PROCESS_STAGES.WAGON_SUPPLY,
      category: "Wagon Supply",
      reason: "Late wagon placement after rake offer",
    }),
    buildGapDelay({
      id: `SYS-${loading.id}-loading`,
      loading,
      start: loading.placementTime || loading.offerTime,
      end: loading.completionTime,
      threshold: PROCESS_DELAY_THRESHOLDS.loading,
      processStage: PROCESS_STAGES.LOADING,
      category: "Operational Issue",
      reason: "Loading cycle exceeded gross loading hour threshold",
    }),
  ].filter(Boolean);
}

function buildApprovalRemarkDelays(loading, approval) {
  if (!approval) return [];

  return APPROVAL_STEP_ORDER.flatMap((department) => {
    const step = approval[department];
    if (!step?.approvedAt || !step.remarks?.trim()) return [];

    const lower = step.remarks.toLowerCase();
    const looksLikeDelay =
      lower.includes("delay") ||
      lower.includes("wait") ||
      lower.includes("hold") ||
      lower.includes("breakdown") ||
      lower.includes("late");

    if (!looksLikeDelay) return [];

    return [
      {
        id: `APR-${loading.id}-${department}-remark`,
        source: DELAY_SOURCE.APPROVAL,
        processStage: APPROVAL_STEP_LABELS[department],
        category: "Railway Delay",
        reason: step.remarks.trim(),
        reportedBy: step.approvedBy || APPROVAL_STEP_LABELS[department],
        rakeId: loading.rakeId,
        loadingId: loading.id,
        rakeNumber: loading.rakeNumber,
        startTime: step.approvedAt,
        endTime: step.approvedAt,
        durationMinutes: 0,
        durationLabel: "Note",
        isDisabled: false,
        isReadOnly: true,
      },
    ];
  });
}

export function buildProcessMilestones(loading, approval) {
  if (!loading) return [];

  const milestones = [
    { key: "offer", label: "Rake Offered", at: loading.offerTime, stage: PROCESS_STAGES.WAGON_SUPPLY },
    { key: "placement", label: "Wagon Placement", at: loading.placementTime, stage: PROCESS_STAGES.WAGON_SUPPLY },
    { key: "completion", label: "Loading Completed", at: loading.completionTime, stage: PROCESS_STAGES.LOADING },
    {
      key: "submitted",
      label: "Submitted for Railway Approval",
      at: approval?.createdAt ?? (loading.isSubmitted ? loading.completionTime : null),
      stage: PROCESS_STAGES.APPROVAL_QUEUE,
    },
    {
      key: "operations",
      label: "Railway Operations Approved",
      at: approval?.operations?.approvedAt,
      stage: PROCESS_STAGES.RAILWAY_OPERATIONS,
      meta: approval?.operations?.trackClearanceTime
        ? `Clearance ${approval.operations.trackClearanceTime}`
        : "",
    },
    {
      key: "commercial",
      label: "Railway Commercial Approved",
      at: approval?.commercial?.approvedAt,
      stage: PROCESS_STAGES.RAILWAY_COMMERCIAL,
    },
    {
      key: "cw",
      label: "Railway C&W Approved",
      at: approval?.cw?.approvedAt,
      stage: PROCESS_STAGES.RAILWAY_CW,
    },
    {
      key: "clearance",
      label: "Track Clearance Recorded",
      at:
        loading.clearanceTime ||
        approval?.operations?.trackClearanceTime ||
        approval?.operations?.inspection?.trackClearanceTime,
      stage: PROCESS_STAGES.CLEARANCE,
    },
    {
      key: "dispatch",
      label: "Ready for Dispatch",
      at: approval?.status === "APPROVED" ? approval.updatedAt : null,
      stage: PROCESS_STAGES.DISPATCH,
    },
  ];

  return milestones.filter((item) => item.at);
}

export function buildRakeProcessDelayInsights({
  loading,
  approval,
  manualDelays = [],
}) {
  if (!loading) {
    return {
      milestones: [],
      delays: manualDelays.map(normalizeManualDelay),
      summary: emptySummary(),
    };
  }

  const systemDelays = [
    ...buildLoadingStageDelays(loading),
    ...buildApprovalStepDelays(loading, approval),
    ...buildApprovalRemarkDelays(loading, approval),
  ];

  const normalizedManual = manualDelays
    .filter((item) => !item.isDisabled)
    .map((item) => normalizeManualDelay(item, loading));

  const delays = [...normalizedManual, ...systemDelays].sort(
    (a, b) => parseTimestamp(a.startTime) - parseTimestamp(b.startTime),
  );

  const milestones = buildProcessMilestones(loading, approval);
  const totalDelayMinutes = delays.reduce(
    (sum, item) => sum + (item.durationMinutes ?? 0),
    0,
  );

  return {
    milestones,
    delays,
    summary: {
      totalEvents: delays.length,
      manualCount: normalizedManual.length,
      systemCount: systemDelays.filter((d) => d.source === DELAY_SOURCE.SYSTEM).length,
      approvalCount: systemDelays.filter((d) => d.source === DELAY_SOURCE.APPROVAL).length,
      totalDelayMinutes,
      totalDelayLabel: formatDurationLabel(totalDelayMinutes),
      criticalCount: delays.filter((d) => (d.durationMinutes ?? 0) >= 120).length,
      currentStage: resolveCurrentStage(loading, approval),
      approvalStatus: approval?.status ?? "NOT_SUBMITTED",
    },
  };
}

function normalizeManualDelay(item, loading) {
  const durationMinutes = minutesBetween(item.startTime, item.endTime);
  return {
    ...item,
    source: DELAY_SOURCE.MANUAL,
    processStage: item.processStage || inferManualStage(item.category),
    durationMinutes,
    durationLabel: formatDurationLabel(durationMinutes),
    isReadOnly: false,
    loadingId: item.loadingId || loading?.id || "",
    rakeId: item.rakeId || loading?.rakeId || "",
  };
}

function inferManualStage(category) {
  const value = String(category || "").toLowerCase();
  if (value.includes("wagon")) return PROCESS_STAGES.WAGON_SUPPLY;
  if (value.includes("railway")) return PROCESS_STAGES.RAILWAY_OPERATIONS;
  if (value.includes("weather") || value.includes("mechanical")) return PROCESS_STAGES.LOADING;
  return PROCESS_STAGES.LOADING;
}

function resolveCurrentStage(loading, approval) {
  if (approval?.status === "APPROVED") return PROCESS_STAGES.DISPATCH;
  if (approval?.status === "AWAITING_CW") return PROCESS_STAGES.RAILWAY_CW;
  if (approval?.status === "AWAITING_COMMERCIAL") return PROCESS_STAGES.RAILWAY_COMMERCIAL;
  if (approval?.status === "AWAITING_OPERATIONS") return PROCESS_STAGES.RAILWAY_OPERATIONS;
  if (loading.completionTime && loading.isSubmitted) return PROCESS_STAGES.APPROVAL_QUEUE;
  if (loading.completionTime) return PROCESS_STAGES.LOADING;
  if (loading.placementTime) return PROCESS_STAGES.LOADING;
  return PROCESS_STAGES.WAGON_SUPPLY;
}

function emptySummary() {
  return {
    totalEvents: 0,
    manualCount: 0,
    systemCount: 0,
    approvalCount: 0,
    totalDelayMinutes: 0,
    totalDelayLabel: "0m",
    criticalCount: 0,
    currentStage: PROCESS_STAGES.WAGON_SUPPLY,
    approvalStatus: "NOT_SUBMITTED",
  };
}

export function buildAllProcessDelayRows({
  loadingRecords = [],
  approvals = [],
  manualDelays = [],
}) {
  const approvalByLoading = Object.fromEntries(
    approvals.map((approval) => [approval.loadingId, approval]),
  );

  const manualByLoading = manualDelays.reduce((accumulator, delay) => {
    const key = delay.loadingId || delay.rakeNumber;
    if (!accumulator[key]) accumulator[key] = [];
    accumulator[key].push(delay);
    return accumulator;
  }, {});

  return loadingRecords
    .filter((loading) => !loading.isDisabled)
    .flatMap((loading) => {
      const approval = approvalByLoading[loading.id] ?? null;
      const relatedManual =
        manualByLoading[loading.id] ??
        manualByLoading[loading.rakeNumber] ??
        manualDelays.filter(
          (item) =>
            item.loadingId === loading.id ||
            item.rakeId === loading.rakeId ||
            item.rakeNumber === loading.rakeNumber,
        );

      return buildRakeProcessDelayInsights({
        loading,
        approval,
        manualDelays: relatedManual,
      }).delays;
    });
}

export { formatDurationLabel, minutesBetween };
