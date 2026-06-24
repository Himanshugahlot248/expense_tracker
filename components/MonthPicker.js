"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { monthLabel, monthKey } from "@/lib/format";

export default function MonthPicker({ value, onChange }) {
  function shift(delta) {
    const [y, m] = value.split("-").map(Number);
    onChange(monthKey(new Date(y, m - 1 + delta, 1)));
  }

  const isCurrent = value === monthKey();

  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-bg-soft/60 p-1">
      <button
        onClick={() => shift(-1)}
        className="grid h-9 w-9 place-items-center rounded-lg text-white/60 transition-all hover:bg-white/5 hover:text-white active:scale-95"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-w-[140px] text-center text-sm font-semibold"
      >
        {monthLabel(value)}
      </motion.span>
      <button
        onClick={() => shift(1)}
        disabled={isCurrent}
        className="grid h-9 w-9 place-items-center rounded-lg text-white/60 transition-all hover:bg-white/5 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
