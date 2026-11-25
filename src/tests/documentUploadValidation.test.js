import { describe, expect, it } from "vitest";
import {
  normalizeFNote,
  normalizeRakeNumber,
  parseInvoiceRakeNumber,
  parseRtpReferenceNumbers,
  validateDocumentBeforeUpload,
} from "../features/extraction/utils/documentUploadValidation";
import { DOCUMENT_TYPES } from "../features/extraction/utils/rakeExtractionStatus";

describe("documentUploadValidation", () => {
  it("normalizes rake numbers", () => {
    expect(normalizeRakeNumber(" rk-21 ")).toBe("RK-21");
  });

  it("parses invoice rake number", () => {
    const text = "Tax Invoice\nRake No. : RK-2609-01\nDate : 01-01-2026";
    expect(parseInvoiceRakeNumber(text)).toBe("RK-2609-01");
  });

  it("flags invoice rake mismatch", () => {
    const text = "Rake No. : RK-OTHER";
    const result = validateDocumentBeforeUpload(DOCUMENT_TYPES.INVOICE, text, {
      rake_number: "RK-2609-01",
    });
    expect(result.ok).toBe(false);
  });

  it("parses RTP F-Note and E.D.R.M.", () => {
    const text = "F-Note No: 12345\nE.D.R.M. Number : 12345";
    expect(parseRtpReferenceNumbers(text)).toEqual({ fNote: "12345", edrm: "12345" });
  });

  it("flags RTP F-Note mismatch", () => {
    const text = "F-Note Number: 99999";
    const result = validateDocumentBeforeUpload(DOCUMENT_TYPES.RTP, text, {
      f_note: "12345",
    });
    expect(result.ok).toBe(false);
  });

  it("flags RTP E.D.R.M. mismatch", () => {
    const text = "E.D.R.M. No: 88888";
    const result = validateDocumentBeforeUpload(DOCUMENT_TYPES.RTP, text, {
      f_note: "12345",
    });
    expect(result.ok).toBe(false);
  });

  it("allows upload when RTP references match", () => {
    const text = "F-Note: 12345\nE.D.R.M. Number: 12345";
    const result = validateDocumentBeforeUpload(DOCUMENT_TYPES.RTP, text, {
      f_note: "12345",
    });
    expect(result.ok).toBe(true);
  });

  it("skips check when identifiers missing in PDF", () => {
    const result = validateDocumentBeforeUpload(DOCUMENT_TYPES.INVOICE, "No rake here", {
      rake_number: "RK-1",
    });
    expect(result.ok).toBe(true);
  });

  it("normalizes F-Note variants", () => {
    expect(normalizeFNote("F-NOTE-12345")).toBe("12345");
  });
});