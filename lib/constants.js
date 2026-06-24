import {
  Fuel,
  Carrot,
  Users,
  Droplet,
  Bus,
  Wrench,
  ShoppingBag,
  MoreHorizontal,
  PiggyBank,
} from "lucide-react";

// Expense categories — icon + theme color used across cards, charts, pills.
export const CATEGORIES = [
  { key: "Petrol", label: "Petrol", icon: Fuel, color: "#f59e0b" },
  { key: "Foods & Vegetables", label: "Foods & Vegetables", icon: Carrot, color: "#22c55e" },
  { key: "Friend Expenses", label: "Friend Expenses", icon: Users, color: "#ec4899" },
  { key: "Water", label: "Water", icon: Droplet, color: "#06b6d4" },
  { key: "Fare", label: "Fare", icon: Bus, color: "#8b5cf6" },
  { key: "Maintenance", label: "Maintenance", icon: Wrench, color: "#64748b" },
  { key: "Shopping", label: "Shopping", icon: ShoppingBag, color: "#f43f5e" },
  { key: "Other", label: "Other", icon: MoreHorizontal, color: "#94a3b8" },
];

export const SAVING = { key: "Saving", label: "Saving", icon: PiggyBank, color: "#7c5cff" };

export const CATEGORY_MAP = Object.fromEntries(
  [...CATEGORIES, SAVING].map((c) => [c.key, c])
);

// UPI apps the user pays with — brand-ish accent colors.
export const UPI_APPS = [
  { key: "Google Pay", short: "GPay", color: "#34a853" },
  { key: "Supermoney", short: "Super", color: "#ff6b35" },
  { key: "Mobikwik", short: "MQ", color: "#2c2e83" },
  { key: "Paytm", short: "Paytm", color: "#00baf2" },
  { key: "NAVI", short: "NAVI", color: "#5b2eff" },
];

export const UPI_MAP = Object.fromEntries(UPI_APPS.map((u) => [u.key, u]));
