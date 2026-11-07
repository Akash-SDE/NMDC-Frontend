export function fmt(val) {
  return val === null || val === undefined || val === "" ? "—" : String(val);
}

export function fmtCurrency(val) {
  if (val === null || val === undefined || val === "") return "—";
  const n = Number(val);
  if (Number.isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(iso) {
  if (!iso) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  }
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getFileName(pdfPath) {
  if (!pdfPath) return "—";
  return pdfPath.split("/").pop();
}

/** Raw OCR / PDF text from backend (`extracted_text`; some callers may use `extracted_data`). */
export function getExtractedRaw(record) {
  if (!record) return "";
  const raw = record.extracted_text ?? record.extracted_data;
  return raw == null ? "" : String(raw).trim();
}

function pickExtracted(text, pattern, flags = "i") {
  if (!text) return null;
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, flags);
  const m = text.match(re);
  return m?.[1]?.trim() || null;
}

/** Fill missing structured fields from invoice OCR text (NMDC tax invoice layout). */
export function enrichRecordFromExtractedText(record) {
  const text = getExtractedRaw(record);
  if (!text || !record) return record;

  const merged = { ...record };
  const setIfEmpty = (key, value) => {
    if (value == null || value === "") return;
    if (merged[key] == null || merged[key] === "") merged[key] = value;
  };

  setIfEmpty("invoice_number", pickExtracted(text, /Invoice No\.?\s*:\s*([A-Z0-9]+)/i));
  setIfEmpty(
    "tax_invoice_number",
    merged.invoice_number || pickExtracted(text, /Agreement\/PO No\s*\n\s*([A-Z0-9]+)/i),
  );
  setIfEmpty("invoice_date", pickExtracted(text, /(?:^|\n)\s*Date\s*:\s*(\d{2}[-/]\d{2}[-/]\d{4})/i));
  setIfEmpty("document_type", text.toUpperCase().includes("TAX INVOICE") ? "TAX INVOICE" : null);
  setIfEmpty("rr_number", pickExtracted(text, /Rake No\.?\s*:\s*([A-Z0-9]+)/i));
  setIfEmpty("fnr", merged.rr_number || pickExtracted(text, /Rake No\.?\s*:\s*([A-Z0-9]+)/i));
  setIfEmpty("f_note_number", pickExtracted(text, /Internal Ref\.?\s*No\.?\s*:\s*(\d+)/i));
  setIfEmpty("consignor_gstin", pickExtracted(text, /GSTIN\s*:\s*([A-Z0-9]+)/i));
  setIfEmpty("consignor_name", text.includes("NMDC Limited") ? "NMDC Limited" : null);
  setIfEmpty(
    "consignee_name",
    pickExtracted(
      text,
      /Details Of Customer \(Billed To\)\s*Customer Code\s*:\s*\d+\s*(.+?)(?:\n|GSTIN|PAN)/is,
    ),
  );
  setIfEmpty("commodity_description", pickExtracted(text, /Commodity\s*\n\s*([A-Z0-9 %\.]+)/i));
  setIfEmpty(
    "total_freight",
    pickExtracted(text, /(?:Total|Grand Total|Invoice Value)[^\n]*?([\d,]+\.?\d*)/i),
  );

  return merged;
}

function rowIsEmpty(value) {
  return value === "—";
}

function sectionIsEmpty(section) {
  return section.rows.every(([, value]) => rowIsEmpty(value));
}

/** Key/value rows from raw text when structured columns were not populated. */
export function extractedTextToRows(text) {
  if (!text) return [];

  const specs = [
    ["Invoice No", /Invoice No\.?\s*:\s*([^\n]+)/i],
    ["Date", /(?:^|\n)\s*Date\s*:\s*([^\n]+)/i],
    ["Rake No", /Rake No\.?\s*:\s*([^\n]+)/i],
    ["Internal Ref No", /Internal Ref\.?\s*No\.?\s*:\s*([^\n]+)/i],
    ["GSTIN", /GSTIN\s*:\s*([^\n]+)/i],
    ["Customer / Consignee", /Customer Code\s*:\s*\d+\s*([^\n]+)/i],
    ["Commodity", /Commodity\s*\n\s*([^\n]+)/i],
    ["Agreement / PO No", /Agreement\/PO No\s*\n\s*([^\n]+)/i],
  ];

  const rows = [];
  const seen = new Set();
  for (const [label, re] of specs) {
    const value = pickExtracted(text, re);
    if (value && !seen.has(label)) {
      seen.add(label);
      rows.push([label, value]);
    }
  }

  if (rows.length) return rows;

  const cleaned = text.replace(/^--- Page \d+ ---\s*/gm, "").trim();
  if (!cleaned) return [];
  return [["Extracted text", cleaned]];
}

function invoiceStructuredFieldsEmpty(record) {
  const enriched = enrichRecordFromExtractedText(record);
  const keys = [
    "tax_invoice_number",
    "invoice_number",
    "invoice_date",
    "f_note_number",
    "consignor_name",
    "consignee_name",
    "commodity_description",
    "total_freight",
    "freight",
    "gst_amount",
    "rr_number",
  ];
  return keys.every((k) => enriched[k] == null || enriched[k] === "");
}

export function buildDocumentSections(record, titlePrefix, options = {}) {
  const slot = options.slot || "rr";
  let source = record;

  if (!source) {
    return [{ title: titlePrefix, rows: [["Status", "Pending"]] }];
  }

  const rawText = getExtractedRaw(record);

  if (slot === "invoice") {
    source = enrichRecordFromExtractedText(source);
    if (rawText && invoiceStructuredFieldsEmpty(record)) {
      return [
        {
          title: `${titlePrefix} — Extracted data`,
          rows: extractedTextToRows(rawText),
        },
      ];
    }
  }

  const sections =
    slot === "invoice"
      ? buildInvoiceSections(source, titlePrefix)
      : buildRailwayReceiptSections(source, titlePrefix);

  return sections.filter((sec) => !sectionIsEmpty(sec));
}

function buildInvoiceSections(record, titlePrefix) {
  return [
    {
      title: `${titlePrefix} — Invoice`,
      rows: [
        ["Tax Invoice No", fmt(record.tax_invoice_number)],
        ["Invoice Number", fmt(record.invoice_number)],
        ["Invoice Date", fmtDate(record.invoice_date)],
        ["F-Note Number", fmt(record.f_note_number)],
        ["F-Note Date", fmtDate(record.f_note_date)],
        ["Form Number", fmt(record.form_number)],
        ["Document Type", fmt(record.document_type)],
      ],
    },
    {
      title: `${titlePrefix} — References`,
      rows: [
        ["Rake / RR Number", fmt(record.rr_number)],
        ["FNR", fmt(record.fnr)],
        ["Status", fmt(record.status)],
        ["PDF File", getFileName(record.pdf_file)],
      ],
    },
    {
      title: `${titlePrefix} — Parties`,
      rows: [
        ["Consignor", fmt(record.consignor_name)],
        ["Consignor GSTIN", fmt(record.consignor_gstin)],
        ["Consignee", fmt(record.consignee_name)],
        ["Consignee GSTIN", fmt(record.consignee_gstin)],
      ],
    },
    {
      title: `${titlePrefix} — Shipment & amounts`,
      rows: [
        ["From Station", fmt(record.from_station_name)],
        ["To Station", fmt(record.to_station_name)],
        ["Commodity", fmt(record.commodity_description)],
        ["HSN Code", fmt(record.hsn_code)],
        ["Total Freight", fmtCurrency(record.total_freight)],
        ["Freight", fmtCurrency(record.freight)],
        ["GST Amount", fmtCurrency(record.gst_amount)],
        ["Error", fmt(record.error_message)],
      ],
    },
  ];
}

function buildRailwayReceiptSections(record, titlePrefix) {
  return [
    {
      title: `${titlePrefix} — Receipt`,
      rows: [
        ["RR Number", fmt(record.rr_number)],
        ["RR Date", fmtDate(record.rr_date)],
        ["FNR", fmt(record.fnr)],
        ["Status", fmt(record.status)],
        ["PDF File", getFileName(record.pdf_file)],
      ],
    },
    {
      title: `${titlePrefix} — Invoice`,
      rows: [
        ["Tax Invoice No", fmt(record.tax_invoice_number)],
        ["Invoice Number", fmt(record.invoice_number)],
        ["Invoice Date", fmtDate(record.invoice_date)],
        ["F-Note Number", fmt(record.f_note_number)],
        ["F-Note Date", fmtDate(record.f_note_date)],
        ["Form Number", fmt(record.form_number)],
        ["Document Type", fmt(record.document_type)],
      ],
    },
    {
      title: `${titlePrefix} — Route`,
      rows: [
        ["From Station", fmt(record.from_station_name)],
        ["From Code", fmt(record.from_station_code)],
        ["To Station", fmt(record.to_station_name)],
        ["To Code", fmt(record.to_station_code)],
        ["Distance (km)", fmt(record.distance_km)],
        ["Zone", fmt(record.zone)],
        ["Wagons", fmt(record.wagons)],
      ],
    },
    {
      title: `${titlePrefix} — Parties & charges`,
      rows: [
        ["Consignor", fmt(record.consignor_name)],
        ["Consignee", fmt(record.consignee_name)],
        ["Commodity", fmt(record.commodity_description)],
        ["Total Freight", fmtCurrency(record.total_freight)],
        ["Error", fmt(record.error_message)],
      ],
    },
  ];
}
