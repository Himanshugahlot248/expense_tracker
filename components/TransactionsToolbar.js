"use client";

import { Search, X, Download, Filter } from "lucide-react";
import { UPI_APPS } from "@/lib/constants";

export default function TransactionsToolbar({
  query,
  setQuery,
  categoryFilter,
  setCategoryFilter,
  upiFilter,
  setUpiFilter,
  categories,
  count,
  total,
  onExport,
  canExport,
}) {
  const hasFilters = query || categoryFilter !== "all" || upiFilter !== "all";

  return (
    <div className="flex flex-col gap-3 border-b border-white/5 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white/80">Expenses</h3>
          <span className="text-xs text-white/40">
            {count === total ? `${total}` : `${count} of ${total}`}
          </span>
        </div>
        <button
          onClick={onExport}
          disabled={!canExport}
          className="btn-ghost py-2 text-xs disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search category or note…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input py-2.5 pl-9 pr-9 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-white/40 hover:bg-white/10 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="hidden h-4 w-4 text-white/30 sm:block" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-full py-2.5 text-sm sm:w-auto"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={upiFilter}
            onChange={(e) => setUpiFilter(e.target.value)}
            className="input w-full py-2.5 text-sm sm:w-auto"
          >
            <option value="all">All apps</option>
            {UPI_APPS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.key}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
