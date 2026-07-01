"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/format";
import EmptyState from "./ui/EmptyState";
import { BarChart3 } from "lucide-react";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-bg-card px-3 py-2 text-sm shadow-card">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: <span className="text-white">{formatINR(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function TrendChart({ data }) {
  const hasData = data.some((d) => d.spent > 0 || d.salary > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <h3 className="mb-1 text-sm font-semibold text-white/80">6-month trend</h3>
      <p className="mb-3 text-xs text-white/40">Salary · spent · saved over time</p>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No history yet"
          subtitle="Set a salary and log expenses to build your monthly trend."
        />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={2}>
            <defs>
              <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#7c5cff" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="savedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatINR(v)}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }} />
            <Bar dataKey="salary" name="Salary" fill="url(#salaryGrad)" radius={[5, 5, 0, 0]} maxBarSize={22} />
            <Bar dataKey="spent" name="Spent" fill="url(#spentGrad)" radius={[5, 5, 0, 0]} maxBarSize={22} />
            <Bar dataKey="saved" name="Saved" fill="url(#savedGrad)" radius={[5, 5, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
