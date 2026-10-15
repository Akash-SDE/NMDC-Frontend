export const SALES_TYPE_OPTIONS = [
  { id: 5, label: "LTA" },
  { id: 10, label: "AUCTION" },
];

export function mapEDemand(dto) {
  return {
    id: dto.id,
    fNote: dto.fnote || "",
    date: dto.demand_date || "",
    customer: dto.customer_name || "",
    customerId: dto.customer ?? null,
    destination: dto.destination_name || "",
    destinationId: dto.destination ?? null,
    oreType: dto.oretype_name || "",
    oreTypeId: dto.oretype ?? null,
    salesType: dto.sales_type_name || "",
    salesTypeId: dto.sales_type ?? null,
    status: dto.status ?? null,
    createdAt: dto.created_on || null,
    updatedAt: dto.modified_on || null,
  };
}

export function eDemandFormToApi(form) {
  return {
    fnote: String(form.fNote || "").trim() || null,
    demand_date: form.date,
    customer: Number(form.customer),
    destination: Number(form.destination),
    oretype: Number(form.oreType),
    sales_type: Number(form.salesType),
  };
}

export function eDemandToForm(row) {
  const asValue = (value) => (value == null ? "" : String(value));
  return {
    fNote: row.fNote || "",
    date: row.date || "",
    customer: asValue(row.customerId),
    destination: asValue(row.destinationId),
    oreType: asValue(row.oreTypeId),
    salesType: asValue(row.salesTypeId),
  };
}

export function mapEPermit(dto) {
  return {
    id: dto.id,
    loadingId: dto.loading,
    rakeId: dto.rake ?? null,
    rakeNumber: dto.rake_number || "",
    customer: dto.customer_name || "",
    stockpile: dto.stockpile_name || "",
    quantity: Number(dto.quantity) || 0,
    completedOn: dto.completion_time || null,
    ePermitNumber: dto.epermit_number || "",
    railwayTransitPass: dto.railway_transit_pass || "",
    updatedBy: dto.updated_by_name || "",
    updatedAt: dto.modified_on || null,
  };
}
