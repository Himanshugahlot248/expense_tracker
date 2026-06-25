// Default categories seeded for a brand-new user. After seeding, categories
// live in the `categories` table and are fully editable by the user.
export const DEFAULT_CATEGORIES = [
  { name: "Petrol", icon: "Fuel", color: "#f59e0b" },
  { name: "Foods & Vegetables", icon: "Carrot", color: "#22c55e" },
  { name: "Friend Expenses", icon: "Users", color: "#ec4899" },
  { name: "Water", icon: "Droplet", color: "#06b6d4" },
  { name: "Fare", icon: "Bus", color: "#8b5cf6" },
  { name: "Maintenance", icon: "Wrench", color: "#64748b" },
  { name: "Shopping", icon: "ShoppingBag", color: "#f43f5e" },
  { name: "Other", icon: "MoreHorizontal", color: "#94a3b8" },
];

// UPI apps the user pays with — brand-ish accent colors.
export const UPI_APPS = [
  { key: "Google Pay", short: "GPay", color: "#34a853" },
  { key: "Supermoney", short: "Super", color: "#ff6b35" },
  { key: "Mobikwik", short: "MQ", color: "#2c2e83" },
  { key: "Paytm", short: "Paytm", color: "#00baf2" },
  { key: "NAVI", short: "NAVI", color: "#5b2eff" },
];

export const UPI_MAP = Object.fromEntries(UPI_APPS.map((u) => [u.key, u]));

// Used as a fallback when an expense references a category that was deleted.
export const FALLBACK_CATEGORY = { name: "Other", icon: "Tag", color: "#94a3b8" };
