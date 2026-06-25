"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { UPI_APPS } from "@/lib/constants";
import { getIcon } from "@/lib/icons";
import { formatINR, todayISO } from "@/lib/format";

export default function AddEntryModal({ open, onClose, onSubmit, categories, onManageCategories }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [upiApp, setUpiApp] = useState(UPI_APPS[0].key);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  // Keep selected category valid as the user's category list changes.
  useEffect(() => {
    if (open && categories.length && !categories.some((c) => c.name === category)) {
      setCategory(categories[0].name);
    }
  }, [open, categories, category]);

  function reset() {
    setAmount("");
    setCategory(categories[0]?.name || "");
    setUpiApp(UPI_APPS[0].key);
    setNote("");
    setDate(todayISO());
  }

  async function submit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        amount: amt,
        category,
        upi_app: upiApp,
        note: note.trim() || null,
        date,
      });
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-h-[92vh] w-full max-w-md overflow-y-auto rounded-b-none rounded-t-3xl p-6 sm:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add expense</h2>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl text-white/50 transition-all hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Amount (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  autoFocus
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input text-lg font-semibold"
                />
                {amount > 0 && (
                  <p className="mt-1.5 text-xs text-white/40">{formatINR(amount)}</p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="label mb-0">Category</label>
                  <button
                    type="button"
                    onClick={onManageCategories}
                    className="flex items-center gap-1 text-xs text-accent-soft transition-colors hover:text-accent"
                  >
                    <Settings2 className="h-3.5 w-3.5" /> Manage
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((c) => {
                    const Icon = getIcon(c.icon);
                    const active = category === c.name;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.name)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                          active
                            ? "border-transparent text-white"
                            : "border-white/10 text-white/60 hover:border-white/20"
                        }`}
                        style={active ? { background: `${c.color}26`, borderColor: c.color } : {}}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: c.color }} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label">Paid via</label>
                <div className="flex flex-wrap gap-2">
                  {UPI_APPS.map((u) => {
                    const active = upiApp === u.key;
                    return (
                      <button
                        key={u.key}
                        type="button"
                        onClick={() => setUpiApp(u.key)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                          active ? "border-transparent text-white" : "border-white/10 text-white/60 hover:border-white/20"
                        }`}
                        style={active ? { background: `${u.color}33`, borderColor: u.color } : {}}
                      >
                        {u.key}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    value={date}
                    max={todayISO()}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Note (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. weekly groceries"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" /> Save expense
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
