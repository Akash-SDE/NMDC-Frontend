import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

/** Extract plain text from a PDF file in the browser (for pre-upload checks). */
export async function extractTextFromPdfFile(file) {
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const parts = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => (typeof item.str === "string" ? item.str : ""))
      .join(" ");
    parts.push(pageText);
  }
  return parts.join("\n");
}