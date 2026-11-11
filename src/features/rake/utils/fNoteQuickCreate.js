import { createEDemand } from "../../../services/edemandService";
import { SALES_TYPE_OPTIONS } from "../../edemand/utils/edemandMappers";
import { getErrorMessage } from "../../../api/apiError";

function toFkId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Register a new F-Note by creating an E-Demand row (fnote is stored on E_DEMAND).
 * Uses the rake row's customer, destination, and ore type when available.
 */
export async function quickCreateFNote(fnote, { customer, destination, oreType } = {}) {
  const trimmed = String(fnote ?? "").trim();
  if (!trimmed) {
    throw new Error("Enter an F-Note value before creating.");
  }

  const customerId = toFkId(customer);
  const destinationId = toFkId(destination);
  const oreTypeId = toFkId(oreType);

  if (!customerId || !destinationId || !oreTypeId) {
    throw new Error(
      "Select customer, destination, and ore type on this rake before adding a new F-Note.",
    );
  }

  const salesType = SALES_TYPE_OPTIONS[0]?.id ?? 5;

  try {
    const created = await createEDemand({
      fnote: trimmed,
      demand_date: todayISODate(),
      customer: customerId,
      destination: destinationId,
      oretype: oreTypeId,
      sales_type: salesType,
    });
    return String(created?.fNote || trimmed);
  } catch (error) {
    const message = getErrorMessage(error, "");
    if (/already uses this f-note/i.test(message)) {
      return trimmed;
    }
    throw error;
  }
}
