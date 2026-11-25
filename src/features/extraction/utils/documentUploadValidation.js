import { DOCUMENT_TYPES } from "./rakeExtractionStatus";

function pickExtracted(text, pattern, flags = "i") {
  if (!text) return null;
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern, flags);
  const m = text.match(re);
  return m?.[1]?.trim() || null;
}

export function normalizeRakeNumber(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function normalizeFNote(value) {
  let s = String(value ?? "").trim();
  if (!s) return "";
  s = s.replace(/^F[-\s]?NOTE[-\s]*/i, "");
  s = s.replace(/^EDRM[-\s]*/i, "");
  return s.replace(/\s+/g, "").toUpperCase();
}

/** Rake number on tax invoice (NMDC layout). */
export function parseInvoiceRakeNumber(text) {
  return (
    pickExtracted(text, /Rake\s*No\.?\s*:?\s*([A-Z0-9][A-Z0-9\-/_]*)/i) ||
    pickExtracted(text, /Rake\s*Number\s*:?\s*([A-Z0-9][A-Z0-9\-/_]*)/i)
  );
}

/** F-Note and E.D.R.M. number from RTP PDF text. */
export function parseRtpReferenceNumbers(text) {
  const fNote =
    pickExtracted(text, /F[-\s]?Note\s*(?:No\.?|Number)?\s*:?\s*([A-Z0-9][A-Z0-9\-/_]*)/i) ||
    pickExtracted(text, /Internal\s+Ref\.?\s*No\.?\s*:?\s*(\d+)/i);

  const edrm =
    pickExtracted(
      text,
      /E\.?\s*D\.?\s*R\.?\s*M\.?\s*(?:No\.?|Number)?\s*:?\s*([A-Z0-9][A-Z0-9\-/_]*)/i,
    ) || pickExtracted(text, /EDRM\s*(?:No\.?|Number)?\s*:?\s*([A-Z0-9][A-Z0-9\-/_]*)/i);

  return { fNote, edrm };
}

export function getRakeFNoteFromRow(row) {
  if (!row) return "";
  return (
    row.f_note ??
    row.f_note_number ??
    row.fnote ??
    row.fNote ??
    row.fn_note ??
    ""
  );
}

/**
 * @returns {{ ok: true } | { ok: false, title: string, message: string }}
 */
export function validateDocumentBeforeUpload(documentType, pdfText, row) {
  if (documentType === DOCUMENT_TYPES.INVOICE) {
    const expected = normalizeRakeNumber(row?.rake_number);
    const found = parseInvoiceRakeNumber(pdfText);
    if (!expected || !found) return { ok: true };
    if (normalizeRakeNumber(found) !== expected) {
      return {
        ok: false,
        title: "Invoice rake number mismatch",
        message: `This rake is ${row.rake_number}, but the invoice shows rake ${found}. Upload anyway and run extraction?`,
      };
    }
    return { ok: true };
  }

  if (documentType === DOCUMENT_TYPES.RTP) {
    const expectedFNote = normalizeFNote(getRakeFNoteFromRow(row));
    if (!expectedFNote) return { ok: true };

    const { fNote, edrm } = parseRtpReferenceNumbers(pdfText);
    const mismatches = [];

    if (fNote && normalizeFNote(fNote) !== expectedFNote) {
      mismatches.push(`F-Note in PDF is ${fNote} (expected ${getRakeFNoteFromRow(row)})`);
    }
    if (edrm && normalizeFNote(edrm) !== expectedFNote) {
      mismatches.push(`E.D.R.M. Number in PDF is ${edrm} (expected ${getRakeFNoteFromRow(row)})`);
    }

    if (mismatches.length) {
      return {
        ok: false,
        title: "RTP reference mismatch",
        message: `${mismatches.join(". ")}. Upload anyway and run extraction?`,
      };
    }
    return { ok: true };
  }

  return { ok: true };
}