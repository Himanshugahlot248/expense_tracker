// Indian Rupee formatting + month helpers used throughout the UI.

// Always renders the full number, e.g. ₹1,000 (never ₹1k / ₹1L).
// Drops the paise when the amount is a whole rupee, keeps up to 2 otherwise.
export function formatINR(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

// 'YYYY-MM' for the given Date (defaults to now).
export function monthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

// First and last day of a 'YYYY-MM' month as 'YYYY-MM-DD' strings.
export function monthRange(key) {
  const [y, m] = key.split("-").map(Number);
  const start = `${key}-01`;
  const last = new Date(y, m, 0).getDate();
  const end = `${key}-${String(last).padStart(2, "0")}`;
  return { start, end };
}

// Last `count` months as keys, newest first.
export function recentMonths(count = 12) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    out.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  return out;
}

export function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
