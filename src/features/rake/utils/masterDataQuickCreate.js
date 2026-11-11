import { createCustomer } from "../../../services/customerService";
import { createDestination } from "../../../services/destinationService";
import { createOreType } from "../../../services/oreTypeService";
import { createRoute } from "../../../services/routeService";
import { createSiding } from "../../../services/sidingService";
import { createWagonType } from "../../../services/wagonTypeService";

function clip(value, max = 50) {
  return String(value ?? "").trim().slice(0, max);
}

function makeCodeFromLabel(label) {
  const compact = String(label ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toUpperCase();
  return clip(compact || "NEW", 50);
}

export function extractMasterRecordId(response) {
  if (response?.id != null) return response.id;
  if (response?.data?.id != null) return response.data.id;
  return null;
}

/** @typedef {'sidings'|'routes'|'oreTypes'|'customers'|'destinations'|'wagonTypes'} MasterLookupKey */

/**
 * Create a master-data row from free-typed label (rake offering quick add).
 * @param {MasterLookupKey} lookupKey
 * @param {string} label
 * @returns {Promise<{ id: number, label: string }>}
 */
export async function quickCreateMasterData(lookupKey, label) {
  const trimmed = String(label ?? "").trim();
  if (!trimmed) {
    throw new Error("Enter a value before creating master data.");
  }

  let response;
  let displayLabel = trimmed;

  switch (lookupKey) {
    case "customers":
      response = await createCustomer({
        customer_name: clip(trimmed, 50),
        customer_code: makeCodeFromLabel(trimmed),
        status: true,
      });
      displayLabel = response?.customer_name || trimmed;
      break;
    case "sidings":
      response = await createSiding({
        siding_code: clip(trimmed, 250),
        siding_description: clip(trimmed, 250),
        status: true,
      });
      displayLabel = response?.siding_code || response?.siding_description || trimmed;
      break;
    case "routes":
      response = await createRoute({
        route_code: clip(trimmed, 250),
        status: true,
      });
      displayLabel = response?.route_code || (response?.route_no != null ? String(response.route_no) : trimmed);
      break;
    case "oreTypes":
      response = await createOreType({
        ore_type: clip(trimmed, 250),
        ore_type_desc: clip(trimmed, 250),
        status: true,
      });
      displayLabel = response?.ore_type || trimmed;
      break;
    case "destinations":
      response = await createDestination({
        destination_name: clip(trimmed, 50),
        destination_code: makeCodeFromLabel(trimmed),
        destination_address: clip(trimmed, 50),
        destination_state: null,
        status: true,
      });
      displayLabel = response?.destination_name || trimmed;
      break;
    case "wagonTypes":
      response = await createWagonType({
        wagon_type: clip(trimmed, 50),
        wagon_description: clip(trimmed, 50),
        status: true,
      });
      displayLabel = response?.wagon_type || trimmed;
      break;
    default:
      throw new Error(`Unsupported master data type: ${lookupKey}`);
  }

  const id = extractMasterRecordId(response);
  if (id == null) {
    throw new Error("Master data was created but no id was returned.");
  }

  return { id, label: displayLabel };
}
