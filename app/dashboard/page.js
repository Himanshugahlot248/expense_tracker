"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Plus, TrendingDown, PiggyBank, Wallet, Percent, Pencil, Tags } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_CATEGORIES, FALLBACK_CATEGORY } from "@/lib/constants";
import { formatINR, monthKey, monthRange, recentMonths, monthLabel } from "@/lib/format";
import StatCard from "@/components/StatCard";
import MonthPicker from "@/components/MonthPicker";
import TransactionList from "@/components/TransactionList";
import TransactionsToolbar from "@/components/TransactionsToolbar";
import AddEntryModal from "@/components/AddEntryModal";
import SalaryModal from "@/components/SalaryModal";
import CategoryManager from "@/components/CategoryManager";
import { DashboardSkeleton, ChartSkeleton } from "@/components/ui/Skeletons";
import { exportExpensesCSV } from "@/lib/csv";

const CategoryDonut = dynamic(() => import("@/components/CategoryDonut"), {
  ssr: false,
  loading: () => <ChartSkeleton className="h-80 rounded-2xl" />,
});
const TrendChart = dynamic(() => import("@/components/TrendChart"), {
  ssr: false,
  loading: () => <ChartSkeleton className="h-80 rounded-2xl" />,
});

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [month, setMonth] = useState(monthKey());
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [salary, setSalary] = useState(0);
  const [categories, setCategories] = useState([]);
  const [trend, setTrend] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [upiFilter, setUpiFilter] = useState("all");

  const cache = useRef(new Map());

  // ---- categories: load once, seed defaults for new users ----
  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Couldn't load categories.");
      return;
    }
    if (!data || data.length === 0) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const rows = DEFAULT_CATEGORIES.map((c, i) => ({ ...c, user_id: user.id, sort: i }));
      const { data: seeded, error: seedErr } = await supabase
        .from("categories")
        .insert(rows)
        .select();
      if (seedErr) {
        toast.error("Couldn't set up categories.");
        return;
      }
      setCategories(seeded.sort((a, b) => a.sort - b.sort));
    } else {
      setCategories(data);
    }
  }, [supabase]);

  const loadMonth = useCallback(
    async (key, { force = false } = {}) => {
      if (!force && cache.current.has(key)) {
        const c = cache.current.get(key);
        setExpenses(c.expenses);
        setSalary(c.salary);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { start, end } = monthRange(key);
      const [exp, inc] = await Promise.all([
        supabase
          .from("expenses")
          .select("*")
          .gte("spent_at", start)
          .lte("spent_at", end)
          .order("spent_at", { ascending: false }),
        supabase.from("monthly_income").select("salary").eq("month", key).maybeSingle(),
      ]);
      if (exp.error || inc.error) {
        toast.error("Couldn't load data. Check your Supabase setup.");
        setLoading(false);
        return;
      }
      const data = { expenses: exp.data || [], salary: Number(inc.data?.salary || 0) };
      cache.current.set(key, data);
      setExpenses(data.expenses);
      setSalary(data.salary);
      setLoading(false);
    },
    [supabase]
  );

  const loadTrend = useCallback(async () => {
    const months = recentMonths(6).reverse();
    const oldest = monthRange(months[0]).start;
    const [exp, inc] = await Promise.all([
      supabase.from("expenses").select("amount,spent_at").gte("spent_at", oldest),
      supabase.from("monthly_income").select("month,salary").in("month", months),
    ]);
    const buckets = Object.fromEntries(
      months.map((m) => [m, { label: monthLabel(m).slice(0, 3), salary: 0, spent: 0, saved: 0 }])
    );
    (exp.data || []).forEach((r) => {
      const k = r.spent_at.slice(0, 7);
      if (buckets[k]) buckets[k].spent += Number(r.amount);
    });
    (inc.data || []).forEach((r) => {
      if (buckets[r.month]) buckets[r.month].salary = Number(r.salary);
    });
    months.forEach((m) => {
      buckets[m].saved = Math.max(0, buckets[m].salary - buckets[m].spent);
    });
    setTrend(months.map((m) => buckets[m]));
  }, [supabase]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadMonth(month);
  }, [month, loadMonth]);

  useEffect(() => {
    loadTrend();
  }, [loadTrend, expenses.length, salary]);

  // ---- derived ----
  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.name, c])),
    [categories]
  );
  const colorOf = useCallback(
    (name) => catMap[name]?.color || FALLBACK_CATEGORY.color,
    [catMap]
  );

  const totalSpent = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount), 0),
    [expenses]
  );
  const saved = Math.max(0, salary - totalSpent);
  const overspent = salary > 0 && totalSpent > salary;
  const savingsRate = salary > 0 ? Math.round((saved / salary) * 100) : 0;

  const byCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });
    // include all known categories (so legend is stable) plus any orphaned names
    const names = new Set([...categories.map((c) => c.name), ...Object.keys(map)]);
    return [...names].map((name) => ({ name, value: map[name] || 0 }));
  }, [expenses, categories]);

  const transactions = useMemo(
    () =>
      [...expenses].sort(
        (a, b) =>
          new Date(b.spent_at) - new Date(a.spent_at) ||
          new Date(b.created_at) - new Date(a.created_at)
      ),
    [expenses]
  );

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (upiFilter !== "all" && t.upi_app !== upiFilter) return false;
      if (q && !`${t.category} ${t.note || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [transactions, query, categoryFilter, upiFilter]);

  const isFiltered = query !== "" || categoryFilter !== "all" || upiFilter !== "all";
  const lastEntry = transactions[0] || null;

  // Highest-spending category this month (for the "Total spent" card).
  const topCategory = useMemo(() => {
    let best = null;
    for (const c of byCategory) {
      if (c.value > 0 && (!best || c.value > best.value)) best = c;
    }
    return best;
  }, [byCategory]);

  function patchCache(key, patch) {
    const prev = cache.current.get(key) || { expenses: [], salary: 0 };
    cache.current.set(key, { ...prev, ...patch });
  }

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Session expired — please sign in again");
    return user;
  }

  // ---- expense CRUD ----
  async function handleSave(entry) {
    const user = await getUser();

    // Edit path
    if (entry.id) {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          amount: entry.amount,
          category: entry.category,
          upi_app: entry.upi_app,
          note: entry.note,
          spent_at: entry.date,
        })
        .eq("id", entry.id)
        .select()
        .single();
      if (error) throw error;

      // If the date moved to another month, drop it from this view.
      const stillThisMonth = data.spent_at.slice(0, 7) === month;
      cache.current.clear();
      setExpenses((prev) =>
        stillThisMonth
          ? prev.map((x) => (x.id === data.id ? data : x))
          : prev.filter((x) => x.id !== data.id)
      );
      setEditing(null);
      toast.success("Expense updated");
      return;
    }

    // Insert path
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        amount: entry.amount,
        category: entry.category,
        upi_app: entry.upi_app,
        note: entry.note,
        spent_at: entry.date,
      })
      .select()
      .single();
    if (error) throw error;

    const targetMonth = data.spent_at.slice(0, 7);
    const cached = cache.current.get(targetMonth);
    if (cached) patchCache(targetMonth, { expenses: [data, ...cached.expenses] });
    if (targetMonth === month) setExpenses((prev) => [data, ...prev]);
    toast.success("Expense added");
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(t) {
    setEditing(t);
    setModalOpen(true);
  }
  function handleExport() {
    if (!filteredTransactions.length) return;
    exportExpensesCSV(filteredTransactions, month);
    toast.success("CSV downloaded");
  }

  async function handleDelete(t) {
    setDeletingId(t.id);
    const { error } = await supabase.from("expenses").delete().eq("id", t.id);
    setDeletingId(null);
    if (error) {
      toast.error("Couldn't delete");
      return;
    }
    setExpenses((prev) => prev.filter((x) => x.id !== t.id));
    const cached = cache.current.get(month);
    if (cached) patchCache(month, { expenses: cached.expenses.filter((x) => x.id !== t.id) });
    toast.success("Deleted");
  }

  async function handleSetSalary(amount) {
    const user = await getUser();
    const { error } = await supabase.from("monthly_income").upsert(
      { user_id: user.id, month, salary: amount, updated_at: new Date().toISOString() },
      { onConflict: "user_id,month" }
    );
    if (error) throw error;
    patchCache(month, { salary: amount });
    setSalary(amount);
    toast.success("Salary updated");
  }

  // ---- category CRUD ----
  async function handleAddCategory(draft) {
    const user = await getUser();
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...draft, user_id: user.id, sort: categories.length })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("A category with that name already exists");
      throw error;
    }
    setCategories((prev) => [...prev, data]);
  }

  async function handleUpdateCategory(id, draft) {
    const user = await getUser();
    const old = categories.find((c) => c.id === id);
    const { data, error } = await supabase
      .from("categories")
      .update({ name: draft.name, icon: draft.icon, color: draft.color })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("A category with that name already exists");
      throw error;
    }
    // Renaming: carry the change onto existing expenses so history stays consistent.
    if (old && old.name !== draft.name) {
      await supabase
        .from("expenses")
        .update({ category: draft.name })
        .eq("user_id", user.id)
        .eq("category", old.name);
      cache.current.clear();
      await loadMonth(month, { force: true });
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
  }

  async function handleDeleteCategory(c) {
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) throw error;
    setCategories((prev) => prev.filter((x) => x.id !== c.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            Dashboard
          </motion.h1>
          <p className="text-sm text-white/50">Your money, month by month.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <MonthPicker value={month} onChange={setMonth} />
          <button onClick={() => setCatOpen(true)} className="btn-ghost">
            <Tags className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </button>
          <button onClick={() => setSalaryOpen(true)} className="btn-ghost">
            <Pencil className="h-4 w-4" />
            <span>{salary > 0 ? "Edit salary" : "Set salary"}</span>
          </button>
          <button onClick={openAdd} className="btn-primary">
            <Plus className="h-5 w-5" /> <span className="hidden sm:inline">Add expense</span>
          </button>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {salary === 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSalaryOpen(true)}
              className="card flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/[0.03]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Set your salary for {monthLabel(month)}</p>
                <p className="text-xs text-white/40">
                  We&apos;ll calculate your saving as salary − expenses.
                </p>
              </div>
              <Plus className="h-5 w-5 text-white/40" />
            </motion.button>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              index={0}
              label="Salary"
              value={formatINR(salary)}
              icon={Wallet}
              accent="#7c5cff"
              sub={salary > 0 ? "Received this month" : "Not set yet"}
            />
            <StatCard
              index={1}
              label="Total spent"
              value={formatINR(totalSpent)}
              icon={TrendingDown}
              accent="#ef4444"
              sub={topCategory ? `Top: ${topCategory.name}` : `${expenses.length} expenses`}
            />
            <StatCard
              index={2}
              label="Saved"
              value={overspent ? "—" : formatINR(saved)}
              icon={PiggyBank}
              accent={overspent ? "#ef4444" : "#22c55e"}
              sub={overspent ? "Over budget!" : "Salary − expenses"}
            />
            <StatCard
              index={3}
              label="Savings rate"
              value={salary > 0 ? `${savingsRate}%` : "—"}
              icon={Percent}
              accent={savingsRate >= 20 ? "#22c55e" : "#f59e0b"}
              sub="Of your salary"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryDonut data={byCategory} total={totalSpent} colorOf={colorOf} />
            <TrendChart data={trend} />
          </div>

          <div className="card overflow-hidden">
            <TransactionsToolbar
              query={query}
              setQuery={setQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              upiFilter={upiFilter}
              setUpiFilter={setUpiFilter}
              categories={categories}
              count={filteredTransactions.length}
              total={transactions.length}
              onExport={handleExport}
              canExport={filteredTransactions.length > 0}
            />
            <TransactionList
              items={filteredTransactions}
              onDelete={handleDelete}
              onEdit={openEdit}
              deletingId={deletingId}
              catMap={catMap}
              filtered={isFiltered}
            />
          </div>
        </>
      )}

      <button
        onClick={openAdd}
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white shadow-glow transition-transform hover:scale-105 active:scale-95 sm:hidden"
        aria-label="Add expense"
      >
        <Plus className="h-7 w-7" />
      </button>

      <AddEntryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
        categories={categories}
        editing={editing}
        lastEntry={lastEntry}
        onManageCategories={() => {
          setModalOpen(false);
          setCatOpen(true);
        }}
      />
      <SalaryModal
        open={salaryOpen}
        onClose={() => setSalaryOpen(false)}
        month={month}
        current={salary}
        onSubmit={handleSetSalary}
      />
      <CategoryManager
        open={catOpen}
        onClose={() => setCatOpen(false)}
        categories={categories}
        onAdd={handleAddCategory}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
}
