/** @typedef {import('../types/railwayWagon').WagonNumberList} WagonNumberList */
/** @typedef {import('../types/railwayWagon').DepartmentInspection} DepartmentInspection */

export function parseWagonNumbersInput(input) {
  if (!input) return [];
  return String(input)
    .split(/[\n,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function formatWagonNumbersInput(numbers) {
  return Array.isArray(numbers) ? numbers.join(", ") : "";
}

export function wagonListFromInput(input) {
  const numbers = parseWagonNumbersInput(input);
  return { numbers, count: numbers.length };
}

export function emptyWagonList() {
  return { numbers: [], count: 0 };
}

export function normalizeWagonList(value) {
  if (!value) return emptyWagonList();
  if (Array.isArray(value)) {
    const numbers = value.map(String);
    return { numbers, count: numbers.length };
  }
  const numbers = Array.isArray(value.numbers) ? value.numbers.map(String) : [];
  return {
    numbers,
    count: Number.isFinite(value.count) ? value.count : numbers.length,
  };
}

export function emptyDepartmentInspection() {
  return {
    trackClearanceTime: null,
    topViewRemarks: "",
    overloaded: emptyWagonList(),
    unevenRake: emptyWagonList(),
    uneven: emptyWagonList(),
    sick: emptyWagonList(),
    repair: emptyWagonList(),
    doorUnlock: emptyWagonList(),
    singleBar: emptyWagonList(),
    downsideCheck: emptyWagonList(),
    doorUnlockPassed: null,
    singleBarPassed: null,
    downsideCheckPassed: null,
  };
}

export function normalizeDepartmentInspection(value) {
  const base = emptyDepartmentInspection();
  if (!value) return base;

  return {
    ...base,
    ...value,
    overloaded: normalizeWagonList(value.overloaded),
    unevenRake: normalizeWagonList(value.unevenRake),
    uneven: normalizeWagonList(value.uneven),
    sick: normalizeWagonList(value.sick),
    repair: normalizeWagonList(value.repair),
    doorUnlock: normalizeWagonList(value.doorUnlock),
    singleBar: normalizeWagonList(value.singleBar),
    downsideCheck: normalizeWagonList(value.downsideCheck),
  };
}

/**
 * Build inspection payload from form state for a given department tab.
 * @param {string} department
 * @param {DepartmentInspection} form
 */
export function buildInspectionPayload(department, form) {
  const normalized = normalizeDepartmentInspection(form);

  if (department === "operations") {
    return {
      trackClearanceTime: normalized.trackClearanceTime,
      doorUnlockPassed: normalized.doorUnlockPassed,
      singleBarPassed: normalized.singleBarPassed,
      downsideCheckPassed: normalized.downsideCheckPassed,
      uneven: normalized.uneven,
      sick: normalized.sick,
      repair: normalized.repair,
      doorUnlock: normalized.doorUnlock,
      singleBar: normalized.singleBar,
      downsideCheck: normalized.downsideCheck,
    };
  }

  if (department === "commercial") {
    return {
      topViewRemarks: normalized.topViewRemarks,
      overloaded: normalized.overloaded,
      unevenRake: normalized.unevenRake,
      doorUnlockPassed: normalized.doorUnlockPassed,
      singleBarPassed: normalized.singleBarPassed,
      downsideCheckPassed: normalized.downsideCheckPassed,
      uneven: normalized.uneven,
      sick: normalized.sick,
      repair: normalized.repair,
    };
  }

  return {
    doorUnlockPassed: normalized.doorUnlockPassed,
    singleBarPassed: normalized.singleBarPassed,
    downsideCheckPassed: normalized.downsideCheckPassed,
    uneven: normalized.uneven,
    sick: normalized.sick,
    repair: normalized.repair,
    doorUnlock: normalized.doorUnlock,
    singleBar: normalized.singleBar,
    downsideCheck: normalized.downsideCheck,
  };
}

export function wagonListFromNumbers(numbers) {
  return normalizeWagonList({ numbers: numbers ?? [] });
}

function getManifestFlaggedWagons(manifest, flag) {
  if (!manifest?.wagons) return [];
  return manifest.wagons
    .filter((wagon) => wagon.flags?.includes(flag))
    .map((wagon) => wagon.wagonNumber);
}

function deriveChecklistPassed(manifest, flag) {
  const flagged = getManifestFlaggedWagons(manifest, flag);
  if (flagged.length > 0) return false;
  if (manifest?.wagons?.length > 0) return true;
  return null;
}

function buildTopViewRemarksFromManifest(manifest) {
  const segments = [
    { flag: "overloaded", label: "Overloaded" },
    { flag: "uneven_rake", label: "Uneven rake" },
    { flag: "uneven", label: "Uneven" },
    { flag: "sick", label: "Sick" },
    { flag: "repair", label: "Repair" },
    { flag: "door_unlock", label: "Door/unlock" },
    { flag: "single_bar", label: "Single bar" },
    { flag: "downside_check", label: "Downside check" },
  ]
    .map(({ flag, label }) => {
      const wagons = getManifestFlaggedWagons(manifest, flag);
      return wagons.length ? `${label}: ${wagons.join(", ")}` : null;
    })
    .filter(Boolean);

  if (segments.length === 0) return "";
  return `Auto-filled from railway wagon register — ${segments.join("; ")}.`;
}

export function buildCommercialInspectionFromManifest(manifest) {
  const base = emptyDepartmentInspection();
  if (!manifest) return base;

  return {
    ...base,
    topViewRemarks: buildTopViewRemarksFromManifest(manifest),
    overloaded: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "overloaded")),
    unevenRake: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "uneven_rake")),
    uneven: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "uneven")),
    sick: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "sick")),
    repair: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "repair")),
    doorUnlockPassed: deriveChecklistPassed(manifest, "door_unlock"),
    singleBarPassed: deriveChecklistPassed(manifest, "single_bar"),
    downsideCheckPassed: deriveChecklistPassed(manifest, "downside_check"),
  };
}

export function buildOperationsInspectionFromManifest(manifest) {
  const base = emptyDepartmentInspection();
  if (!manifest) return base;

  return {
    ...base,
    uneven: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "uneven")),
    sick: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "sick")),
    repair: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "repair")),
    doorUnlockPassed: deriveChecklistPassed(manifest, "door_unlock"),
    singleBarPassed: deriveChecklistPassed(manifest, "single_bar"),
    downsideCheckPassed: deriveChecklistPassed(manifest, "downside_check"),
  };
}

export function buildCwInspectionFromManifest(manifest) {
  const base = emptyDepartmentInspection();
  if (!manifest) return base;

  return {
    ...base,
    doorUnlock: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "door_unlock")),
    singleBar: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "single_bar")),
    downsideCheck: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "downside_check")),
    uneven: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "uneven")),
    sick: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "sick")),
    repair: wagonListFromNumbers(getManifestFlaggedWagons(manifest, "repair")),
    doorUnlockPassed: deriveChecklistPassed(manifest, "door_unlock"),
    singleBarPassed: deriveChecklistPassed(manifest, "single_bar"),
    downsideCheckPassed: deriveChecklistPassed(manifest, "downside_check"),
  };
}

export function buildDepartmentInspectionFromManifest(department, manifest) {
  if (department === "commercial") {
    return buildCommercialInspectionFromManifest(manifest);
  }
  if (department === "operations") {
    return buildOperationsInspectionFromManifest(manifest);
  }
  if (department === "cw") {
    return buildCwInspectionFromManifest(manifest);
  }
  return emptyDepartmentInspection();
}

export function summarizeInspection(inspection) {
  if (!inspection) return [];
  const normalized = normalizeDepartmentInspection(inspection);
  const parts = [];

  if (normalized.overloaded.count > 0) {
    parts.push(`Overloaded: ${normalized.overloaded.count}`);
  }
  if (normalized.unevenRake.count > 0) {
    parts.push(`Uneven rake: ${normalized.unevenRake.count}`);
  }
  if (normalized.uneven.count > 0) {
    parts.push(`Uneven: ${normalized.uneven.count}`);
  }
  if (normalized.sick.count > 0) {
    parts.push(`Sick: ${normalized.sick.count}`);
  }
  if (normalized.repair.count > 0) {
    parts.push(`Repair: ${normalized.repair.count}`);
  }
  if (normalized.doorUnlock.count > 0) {
    parts.push(`Door/unlock issues: ${normalized.doorUnlock.count}`);
  }
  if (normalized.singleBar.count > 0) {
    parts.push(`Single bar issues: ${normalized.singleBar.count}`);
  }
  if (normalized.downsideCheck.count > 0) {
    parts.push(`Downside check issues: ${normalized.downsideCheck.count}`);
  }

  return parts;
}

/** @param {import('../types/railwayWagon').RailwayWagonManifest|null} value */
export function normalizeWagonManifest(value, fallback = {}) {
  if (!value) return null;
  const wagons = Array.isArray(value.wagons)
    ? value.wagons.map((wagon, index) => ({
        wagonNumber: String(wagon.wagonNumber ?? "").trim(),
        position: wagon.position ?? index + 1,
        flags: Array.isArray(wagon.flags) ? wagon.flags.filter(Boolean) : [],
      })).filter((wagon) => wagon.wagonNumber)
    : [];

  return {
    rakeNumber: value.rakeNumber ?? fallback.rakeNumber ?? "",
    rakeId: value.rakeId ?? fallback.rakeId ?? "",
    totalWagons: value.totalWagons ?? wagons.length,
    wagons,
    source: value.source ?? "Railway entry",
    receivedAt: value.receivedAt ?? null,
    updatedAt: value.updatedAt ?? null,
  };
}

export function createEmptyWagonManifest(approval) {
  return {
    rakeNumber: approval.rakeNumber,
    rakeId: approval.rakeId,
    totalWagons: 0,
    wagons: [],
    source: "Railway manual entry",
    receivedAt: new Date().toISOString(),
    updatedAt: null,
  };
}

export function addWagonToManifest(manifest, wagonNumber, flags = []) {
  const trimmed = String(wagonNumber || "").trim();
  if (!trimmed) return manifest;

  const existing = manifest.wagons.filter(
    (wagon) => wagon.wagonNumber.toLowerCase() !== trimmed.toLowerCase(),
  );

  const wagons = [
    ...existing,
    {
      wagonNumber: trimmed,
      position: existing.length + 1,
      flags: [...flags],
    },
  ];

  return normalizeWagonManifest(
    {
      ...manifest,
      wagons,
      totalWagons: wagons.length,
      updatedAt: new Date().toISOString(),
      source: manifest.source?.includes("manual")
        ? manifest.source
        : `${manifest.source || "Railway API"} + manual entry`,
    },
    manifest,
  );
}

export function removeWagonFromManifest(manifest, wagonNumber) {
  const wagons = manifest.wagons
    .filter((wagon) => wagon.wagonNumber !== wagonNumber)
    .map((wagon, index) => ({ ...wagon, position: index + 1 }));

  return normalizeWagonManifest(
    {
      ...manifest,
      wagons,
      totalWagons: wagons.length,
      updatedAt: new Date().toISOString(),
    },
    manifest,
  );
}
