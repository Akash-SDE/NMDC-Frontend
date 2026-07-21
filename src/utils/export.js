export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = columns.map((col) => col.label);
  const rows = data.map((row) =>
    columns.map((col) => {
      let value = row[col.key] || "";
      // Escape commas and quotes
      if (
        typeof value === "string" &&
        (value.includes(",") || value.includes('"'))
      ) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }),
  );

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printTable(title) {
  const printWindow = window.open("", "_blank");
  const tableEl = document.querySelector("[data-print-table]");
  if (!tableEl || !printWindow) return;

  const tableHtml = tableEl.outerHTML.replace(/\shidden\s/g, " ");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Inter, system-ui, sans-serif; padding: 20px; }
        h1 { font-size: 20px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
        th { background: #f8fafc; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${tableHtml}
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
