export function exportQuotationsToCSV(quotations, filename) {
  const headers = [
    "#",
    "Quotation No",
    "Customer Name",
    "Total Amount",
    "Status",
    "Date",
  ];
  const rows = quotations.map((q, i) => [
    i + 1,
    q.quoteNumber || q.ref || q._id,
    q.customerName || "-",
    q.totalAmount || q.amount || "-",
    q.status || "-",
    q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "-",
  ]);

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += headers.join(",") + "\n";
  rows.forEach((row) => {
    csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
  });

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
