"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/format";
import EmptyState from "./ui/EmptyState";
import { PieChart as PieIcon } from "lucide-react";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-white/10 bg-bg-card px-3 py-2 text-sm shadow-card">
      <p className="font-medium">{p.name}</p>
      <p className="text-white/60">{formatINR(p.value)}</p>
    </div>
  );
}

export default function CategoryDonut({ data, total, colorOf }) {
  const slices = data.filter((d) => d.value > 0);
  const color = (name) => colorOf?.(name) || "#7c5cff";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <h3 className="mb-1 text-sm font-semibold text-white/80">Spending by category</h3>
      <p className="mb-2 text-xs text-white/40">Where your money went this month</p>

      {slices.length === 0 ? (
        <EmptyState
          icon={PieIcon}
          title="Nothing to chart yet"
          subtitle="Add an expense to see the breakdown."
        />
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                stroke="none"
              >
                {slices.map((s) => (
                  <Cell key={s.name} fill={color(s.name)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-white/40">Total spent</span>
            <span className="text-xl font-bold">{formatINR(total)}</span>
          </div>
        </div>
      )}

      {slices.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {slices.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: color(s.name) }}
              />
              {s.name}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
