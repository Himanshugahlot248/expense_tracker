-- ============================================================
-- Saving Tracker — Supabase schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run
-- Every row is scoped to auth.uid(); RLS guarantees per-user isolation.
--
-- Savings model: each month you record the SALARY you received.
-- Saving for a month = salary − sum(expenses in that month).
-- ============================================================

-- ---------- EXPENSES ----------
create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  amount      numeric(12, 2) not null check (amount > 0),
  category    text not null,
  upi_app     text not null,
  note        text,
  spent_at    date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists expenses_user_date_idx
  on public.expenses (user_id, spent_at desc);

-- ---------- CATEGORIES (user-editable expense categories) ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  icon        text not null default 'Tag',
  color       text not null default '#7c5cff',
  sort        integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists categories_user_idx
  on public.categories (user_id, sort);

-- ---------- MONTHLY INCOME (salary received that month) ----------
create table if not exists public.monthly_income (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  month       text not null,            -- 'YYYY-MM'
  salary      numeric(12, 2) not null check (salary >= 0),
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique (user_id, month)
);

create index if not exists income_user_month_idx
  on public.monthly_income (user_id, month);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.expenses       enable row level security;
alter table public.categories     enable row level security;
alter table public.monthly_income enable row level security;

-- EXPENSES policies
drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);

drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);

drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

-- CATEGORIES policies
drop policy if exists "categories_all_own" on public.categories;
create policy "categories_all_own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- MONTHLY INCOME policies
drop policy if exists "income_all_own" on public.monthly_income;
create policy "income_all_own" on public.monthly_income
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- (Optional) clean up the old savings table if you ran the v1 schema ----------
-- drop table if exists public.savings;
-- drop table if exists public.monthly_budgets;
