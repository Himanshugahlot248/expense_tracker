"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, Receipt } from "lucide-react";
import { CATEGORY_MAP, UPI_MAP } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import EmptyState from "./ui/EmptyState";

export default function TransactionList({ items, onDelete, deletingId }) {
  if (!items.length) {
    return (
      <div className="card">
        <EmptyState
          icon={Receipt}
          title="No expenses this month"
          subtitle="Tap “Add expense” to log your first one."
        />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <h3 className="text-sm font-semibold text-white/80">Expenses</h3>
        <span className="text-xs text-white/40">{items.length} entries</span>
      </div>
      <ul className="divide-y divide-white/5">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const meta = CATEGORY_MAP[t.category] || CATEGORY_MAP.Other;
            const Icon = meta.icon;
            const upi = UPI_MAP[t.upi_app];
            return (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
              >
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.category}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-white/40">
                    <span>
                      {new Date(t.spent_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {upi && (
                      <>
                        <span>·</span>
                        <span
                          className="rounded-full px-1.5 py-0.5"
                          style={{ background: `${upi.color}22`, color: upi.color }}
                        >
                          {t.upi_app}
                        </span>
                      </>
                    )}
                    {t.note && (
                      <>
                        <span>·</span>
                        <span className="truncate">{t.note}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-white">
                  −{formatINR(t.amount)}
                </span>
                <button
                  onClick={() => onDelete(t)}
                  disabled={deletingId === t.id}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/30 opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                  aria-label="Delete"
                >
                  {deletingId === t.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
