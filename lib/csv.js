// Turn a month's expenses into a downloadable CSV file (client-side).
function escapeCell(value) {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportExpensesCSV(expenses, monthKeyStr) {
  const header = ["Date", "Category", "Paid via", "Amount (INR)", "Note"];
  const rows = expenses.map((e) => [
    e.spent_at,
    e.category,
    e.upi_app || "",
    Number(e.amount).toFixed(2),
    e.note || "",
  ]);
  const csv = [header, ...rows].map((r) => r.map(escapeCell).join(",")).join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `saving-tracker-${monthKeyStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
