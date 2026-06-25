# 💸 Saving Tracker

A modern, month-wise expense & savings tracker built with **Next.js 14**, **Tailwind CSS**, **Framer Motion**, **Recharts**, and **Supabase**. Phone-OTP login, per-user data isolation, animated UI, skeleton loaders, and toasts.

## Features

- 📧 **Free Email OTP login** via Supabase Auth (no SMS bill).
- 🔒 **Per-user isolation** — every row is protected by Row Level Security.
- 🗓️ **Month-wise tracking** — switch months, see totals, trends.
- 🏷️ **Categories**: Petrol, Foods & Vegetables, Friend Expenses, Water, Fare, Maintenance, Shopping, Other.
- 💰 **Salary-based savings**: enter the salary you received each month; **saving = salary − total expenses**, with a savings-rate %, so you can compare month over month.
- 💳 **UPI apps**: Google Pay, Supermoney, Mobikwik, Paytm, NAVI.
- 📊 Donut breakdown + 6-month spend-vs-save trend.
- ✨ Animations, hover/transitions, icons, toasts, loading & skeleton states.

## Setup

### 1. Install
```bash
npm install
```

### 2. Configure Supabase
Copy the env template and fill in your project values (Supabase dashboard → **Project Settings → API**):
```bash
cp .env.local.example .env.local
```
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Create the database schema
In the Supabase dashboard → **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and **Run**. This creates the `expenses`, `savings`, `monthly_budgets` tables and all RLS policies.

### 4. Enable Email OTP (free — no SMS provider needed)
1. Supabase dashboard → **Authentication → Providers → Email** → make sure **Email** is enabled.
2. (Recommended) Turn **off** "Confirm email" friction isn't needed — OTP works regardless.
3. **Make the email send the 6-digit code instead of a magic link.** Go to **Authentication → Email Templates → Magic Link** and ensure the template body contains the token, e.g.:
   ```html
   <h2>Your login code</h2>
   <p>Enter this code to sign in:</p>
   <h1>{{ .Token }}</h1>
   ```
   The `{{ .Token }}` variable is the 6-digit code our login screen asks for. (If the template only has `{{ .ConfirmationURL }}`, add the `{{ .Token }}` block above.)
4. Free tier sends a limited number of emails/hour via Supabase's built-in mailer — plenty for personal use. For higher volume, plug in your own SMTP under **Project Settings → Auth → SMTP**.

> Want phone/SMS later? Swap `signInWithOtp({ email })` / `verifyOtp({ type: "email" })` in `app/login/page.js` back to `{ phone }` / `type: "sms"` and connect an SMS provider — but that costs money per text.

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000 — you'll be redirected to `/login`.

## How auth works
- Enter your mobile number (auto-prefixed with `+91` if you type a 10-digit number).
- Supabase texts a 6-digit code; enter it to sign in.
- The session cookie is refreshed by `middleware.js`; unauthenticated users are bounced to `/login`, signed-in users land on `/dashboard`.

## Notes
- Pinned to `next@14.2.35` (latest secure 14.x). The two remaining `npm audit` advisories are self-hosted DoS issues only patched in Next 15+, which is a breaking migration — not relevant to this app's usage.
- Money is formatted as INR (`en-IN`).
