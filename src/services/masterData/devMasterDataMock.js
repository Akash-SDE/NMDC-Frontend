const stores = {
  siding: [
    {
      id: 1,
      siding_code: "SID-KO-001",
      siding_description: "Kolkata Port Trust Siding",
      daily_capacity: 500,
      status: true,
    },
    {
      id: 2,
      siding_code: "SID-JA-042",
      siding_description: "Jamshedpur Yard Siding",
      daily_capacity: 420,
      status: true,
    },
  ],
  wagontype: [
    {
      id: 1,
      wagon_type: "BOXN",
      wagon_description: "Open bottom hopper wagon",
      status: true,
    },
  ],
  oretypes: [
    {
      id: 1,
      ore_type: "Lump",
      ore_type_desc: "High-grade lump ore",
      status: true,
    },
  ],
  customer: [
    {
      id: 1,
      customer_code: "CUST-001",
      customer_name: "SAIL Bokaro",
      customer_address: "Bokaro, Jharkhand",
      customer_state: "Jharkhand",
      status: true,
    },
  ],
  destination: [
    {
      id: 1,
      destination_code: "DST-VSP",
      destination_name: "Visakhapatnam Port",
      destination_address: "VSP",
      destination_state: "Andhra Pradesh",
      status: true,
    },
  ],
  routes: [
    {
      id: 1,
      route_no: 101,
      route_code: "BCL-VSP",
      status: true,
    },
  ],
  stockpile: [
    {
      id: 1,
      stockpile_code: "SP-01",
      stockpile_desc: "North yard stockpile",
      status: true,
    },
  ],
  delayreasons: [
    {
      id: 1,
      delay_reason_type: "Weather",
      delay_reason_description: "Heavy rainfall disruption",
      status: true,
    },
  ],
};

let nextId = 100;

function parseBody(options) {
  if (!options.body) return {};
  try {
    return JSON.parse(options.body);
  } catch {
    return {};
  }
}

function listResponse(records) {
  return { count: records.length, results: records };
}

function matchResource(path) {
  const match = path.match(/^\/master-data\/v1\/([^/]+)(?:\/(.+))?$/);
  if (!match) return null;
  const [, resource, rest] = match;
  if (!stores[resource]) return null;
  return { resource, rest: rest ?? "" };
}

function filterRecords(records, filters) {
  const entries = Object.entries(filters || {}).filter(
    ([, value]) => value !== undefined && value !== null && String(value).trim() !== "",
  );
  if (entries.length === 0) return records;

  return records.filter((record) =>
    entries.every(([key, value]) => {
      const fieldValue = record[key];
      if (fieldValue === undefined || fieldValue === null) return false;
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    }),
  );
}

export function handleDevMasterDataRequest(path, options = {}) {
  const parsed = matchResource(path);
  if (!parsed) {
    throw new Error(`Unsupported mock master-data path: ${path}`);
  }

  const { resource, rest } = parsed;
  const method = (options.method || "GET").toUpperCase();
  const body = parseBody(options);
  const records = stores[resource];

  if (rest === "list" && method === "POST") {
    return listResponse(filterRecords(records, body));
  }

  if (!rest && method === "POST") {
    const created = { id: nextId++, ...body };
    records.push(created);
    return created;
  }

  const idMatch = rest.match(/^(\d+)$/);
  if (idMatch) {
    const id = Number(idMatch[1]);
    const index = records.findIndex((row) => row.id === id);
    if (index === -1) throw new Error("Record not found.");

    if (method === "PUT" || method === "PATCH") {
      records[index] = { ...records[index], ...body, id };
      return records[index];
    }

    if (method === "DELETE") {
      records.splice(index, 1);
      return null;
    }
  }

  throw new Error(`Unsupported mock master-data request: ${method} ${path}`);
}
