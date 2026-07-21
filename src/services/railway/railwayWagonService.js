/**
 * Mock Railway API — wagon manifest by rake number.
 * Replace with HTTP call when backend endpoint is available.
 */

/** @type {Record<string, import('../../types/railwayWagon').RailwayWagonManifest>} */
const DEMO_MANIFESTS = {
  "R-2026-001": {
    rakeNumber: "R-2026-001",
    rakeId: "RK-7729",
    totalWagons: 58,
    source: "Railway API (demo)",
    receivedAt: "2026-03-19T07:45:00.000Z",
    wagons: buildDemoWagons(58, "W-7729"),
  },
  "R-2026-002": {
    rakeNumber: "R-2026-002",
    rakeId: "RK-8812",
    totalWagons: 45,
    source: "Railway API (demo)",
    receivedAt: "2026-03-19T09:05:00.000Z",
    wagons: [
      ...buildDemoWagons(42, "W-8812"),
      { wagonNumber: "W-8812-043", position: 43, flags: ["overloaded"] },
      { wagonNumber: "W-8812-044", position: 44, flags: ["uneven_rake"] },
      { wagonNumber: "W-8812-045", position: 45, flags: ["overloaded", "uneven_rake"] },
    ],
  },
  "R-2026-003": {
    rakeNumber: "R-2026-003",
    rakeId: "RK-9003",
    totalWagons: 59,
    source: "Railway API (demo)",
    receivedAt: "2026-03-19T08:35:00.000Z",
    wagons: [
      ...buildDemoWagons(56, "W-9003"),
      { wagonNumber: "W-9003-057", position: 57, flags: ["uneven"] },
      { wagonNumber: "W-9003-058", position: 58, flags: ["sick"] },
      { wagonNumber: "W-9003-059", position: 59, flags: ["repair"] },
    ],
  },
  "R-2026-004": {
    rakeNumber: "R-2026-004",
    rakeId: "RK-9104",
    totalWagons: 52,
    source: "Railway API (demo)",
    receivedAt: "2026-03-19T09:55:00.000Z",
    wagons: [
      ...buildDemoWagons(48, "W-9104"),
      { wagonNumber: "W-9104-049", position: 49, flags: ["door_unlock"] },
      { wagonNumber: "W-9104-050", position: 50, flags: ["single_bar"] },
      { wagonNumber: "W-9104-051", position: 51, flags: ["downside_check"] },
      { wagonNumber: "W-9104-052", position: 52, flags: ["uneven", "repair"] },
    ],
  },
};

function buildDemoWagons(count, prefix) {
  return Array.from({ length: count }, (_, index) => ({
    wagonNumber: `${prefix}-${String(index + 1).padStart(3, "0")}`,
    position: index + 1,
    flags: [],
  }));
}

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWagonManifestByRakeNumber(rakeNumber) {
  await delay();
  return DEMO_MANIFESTS[rakeNumber] ?? null;
}

export async function fetchWagonManifestByRakeId(rakeId) {
  await delay();
  const manifest = Object.values(DEMO_MANIFESTS).find((item) => item.rakeId === rakeId);
  return manifest ?? null;
}

export function getFlaggedWagons(manifest, flag) {
  if (!manifest) return [];
  return manifest.wagons.filter((wagon) => wagon.flags?.includes(flag)).map((w) => w.wagonNumber);
}
