"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, Settings2, Repeat } from "lucide-react";
import { toast } from "sonner";
import { UPI_APPS } from "@/lib/constants";
import { getIcon } from "@/lib/icons";
import { formatINR, todayISO } from "@/lib/format";

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export default function AddEntryModal({
  open,
  onClose,
  onSubmit,
  categories,
  onManageCategories,
  editing,
  lastEntry,
}) {
  const isEdit = Boolean(editing);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [upiApp, setUpiApp] = useState(UPI_APPS[0].key);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const amountRef = useRef(null);

  // Prefill from the expense being edited (or reset) each time the modal opens.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setUpiApp(editing.upi_app || UPI_APPS[0].key);
      setNote(editing.note || "");
      setDate(editing.spent_at);
    } else {
      setAmount("");
      setCategory(categories[0]?.name || "");
      setUpiApp(UPI_APPS[0].key);
      setNote("");
      setDate(todayISO());
    }
  }, [open, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Esc closes the sheet. Digit keys 1-9 jump-pick a category, but only when
  // focus isn't inside a text field (so typing "1" in Amount still works).
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (!typing && /^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (categories[idx]) setCategory(categories[idx].name);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, categories]);

  function repeatLast() {
    if (!lastEntry) return;
    setAmount(String(lastEntry.amount));
    setCategory(lastEntry.category);
    setUpiApp(lastEntry.upi_app || UPI_APPS[0].key);
    setNote(lastEntry.note || "");
    setDate(todayISO());
    amountRef.current?.focus();
  }

  // Keep selected category valid as the user's category list changes.
  useEffect(() => {
    if (open && !isEdit && categories.length && !categories.some((c) => c.name === category)) {
      setCategory(categories[0].name);
    }
  }, [open, categories, category, isEdit]);

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
        id: editing?.id,
        amount: amt,
        category,
        upi_app: upiApp,
        note: note.trim() || null,
        date,
      });
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
              <h2 className="text-lg font-bold">{isEdit ? "Edit expense" : "Add expense"}</h2>
              <div className="flex items-center gap-1">
                {!isEdit && lastEntry && (
                  <button
                    type="button"
                    onClick={repeatLast}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-accent-soft transition-all hover:bg-accent/10 hover:text-accent"
                    title="Repeat your last expense"
                  >
                    <Repeat className="h-3.5 w-3.5" /> Repeat last
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-xl text-white/50 transition-all hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Amount (₹)</label>
                <input
                  ref={amountRef}
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
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_AMOUNTS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        String(v) === amount
                          ? "border-accent bg-accent/20 text-accent-soft"
                          : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      +{v}
                    </button>
                  ))}
                </div>
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
                  {categories.map((c, i) => {
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
                        {i < 9 && (
                          <span className="ml-auto shrink-0 text-[10px] text-white/25">{i + 1}</span>
                        )}
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
                    <Check className="h-5 w-5" /> {isEdit ? "Save changes" : "Save expense"}
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-white/25">
                Press a number to pick a category · Enter to save · Esc to close
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
