export const SALES_TYPE_OPTIONS = [
  { id: 5, label: "LTA" },
  { id: 10, label: "AUCTION" },
];

export const EDEMAND_STATUS = {
  APPROVED: 5,
  PENDING: 10,
  CANCELLED: 50,
};

export const EDEMAND_STATUS_OPTIONS = [
  { id: EDEMAND_STATUS.APPROVED, label: "Approved" },
  { id: EDEMAND_STATUS.PENDING, label: "Pending" },
];

export function getEDemandStatusMeta(row) {
  const code = row?.status ?? EDEMAND_STATUS.APPROVED;
  const label =
    row?.statusDescription ||
    (code === EDEMAND_STATUS.PENDING
      ? "Pending"
      : code === EDEMAND_STATUS.CANCELLED
        ? "Cancelled"
        : "Approved");
  if (code === EDEMAND_STATUS.PENDING) {
    return {
      label,
      badgeClass: "border-amber-200 bg-amber-50 text-amber-800",
      dotClass: "bg-amber-500",
    };
  }
  if (code === EDEMAND_STATUS.CANCELLED) {
    return {
      label,
      badgeClass: "border-slate-200 bg-slate-100 text-slate-600",
      dotClass: "bg-slate-400",
    };
  }
  return {
    label: label === "Active" ? "Approved" : label,
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClass: "bg-emerald-500",
  };
}

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
    status: dto.status ?? EDEMAND_STATUS.APPROVED,
    statusDescription: dto.status_description || "",
    createdAt: dto.created_on || null,
    updatedAt: dto.modified_on || null,
  };
}

export function eDemandFormToApi(form) {
  const status = Number(form.status);
  const safeStatus =
    status === EDEMAND_STATUS.PENDING ? EDEMAND_STATUS.PENDING : EDEMAND_STATUS.APPROVED;
  return {
    fnote: String(form.fNote || "").trim() || null,
    demand_date: form.date,
    customer: Number(form.customer),
    destination: Number(form.destination),
    oretype: Number(form.oreType),
    sales_type: Number(form.salesType),
    status: safeStatus,
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
    status: asValue(row.status ?? EDEMAND_STATUS.APPROVED),
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
