"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Pencil, Trash2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ICON_OPTIONS, COLOR_OPTIONS, getIcon } from "@/lib/icons";

const EMPTY = { name: "", icon: "Tag", color: "#7c5cff" };

export default function CategoryManager({ open, onClose, categories, onAdd, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null); // category id or 'new' or null
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function startAdd() {
    setDraft(EMPTY);
    setEditing("new");
  }
  function startEdit(c) {
    setDraft({ name: c.name, icon: c.icon, color: c.color });
    setEditing(c.id);
  }
  function cancel() {
    setEditing(null);
    setDraft(EMPTY);
  }

  async function save() {
    const name = draft.name.trim();
    if (!name) {
      toast.error("Give the category a name");
      return;
    }
    setBusy(true);
    try {
      if (editing === "new") {
        await onAdd({ ...draft, name });
        toast.success("Category added");
      } else {
        await onUpdate(editing, { ...draft, name });
        toast.success("Category updated");
      }
      cancel();
    } catch (err) {
      toast.error(err.message || "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function remove(c) {
    if (categories.length <= 1) {
      toast.error("Keep at least one category");
      return;
    }
    setDeletingId(c.id);
    try {
      await onDelete(c);
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err.message || "Could not delete");
    } finally {
      setDeletingId(null);
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
              <h2 className="text-lg font-bold">Manage categories</h2>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl text-white/50 transition-all hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Editor form */}
            <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="rounded-2xl border border-white/10 bg-bg-soft/50 p-4">
                    <input
                      autoFocus
                      placeholder="Category name"
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className="input mb-3"
                    />

                    <p className="label">Icon</p>
                    <div className="mb-3 grid max-h-32 grid-cols-8 gap-1.5 overflow-y-auto pr-1">
                      {ICON_OPTIONS.map((name) => {
                        const Icon = getIcon(name);
                        const active = draft.icon === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setDraft({ ...draft, icon: name })}
                            className={`grid aspect-square place-items-center rounded-lg border transition-all ${
                              active ? "border-transparent" : "border-white/10 hover:border-white/25"
                            }`}
                            style={active ? { background: `${draft.color}26`, borderColor: draft.color } : {}}
                          >
                            <Icon className="h-4 w-4" style={{ color: active ? draft.color : "#9ca3af" }} />
                          </button>
                        );
                      })}
                    </div>

                    <p className="label">Color</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setDraft({ ...draft, color: c })}
                          className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                          style={{
                            background: c,
                            outline: draft.color === c ? "2px solid white" : "none",
                            outlineOffset: 2,
                          }}
                          aria-label={c}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={save} disabled={busy} className="btn-primary flex-1 py-2.5">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        {editing === "new" ? "Add" : "Save"}
                      </button>
                      <button onClick={cancel} className="btn-ghost">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!editing && (
              <button onClick={startAdd} className="btn-primary mb-4 w-full">
                <Plus className="h-5 w-5" /> Add category
              </button>
            )}

            {/* List */}
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {categories.map((c) => {
                  const Icon = getIcon(c.icon);
                  return (
                    <motion.li
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
                    >
                      <div
                        className="grid h-9 w-9 place-items-center rounded-lg"
                        style={{ background: `${c.color}22`, color: c.color }}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="flex-1 truncate text-sm font-medium">{c.name}</span>
                      <button
                        onClick={() => startEdit(c)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-white/40 transition-all hover:bg-white/5 hover:text-white"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(c)}
                        disabled={deletingId === c.id}
                        className="grid h-8 w-8 place-items-center rounded-lg text-white/40 transition-all hover:bg-danger/10 hover:text-danger"
                        aria-label="Delete"
                      >
                        {deletingId === c.id ? (
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
