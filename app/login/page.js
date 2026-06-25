"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck, Loader2, ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState("email"); // 'email' | 'otp'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const cleanEmail = () => email.trim().toLowerCase();
  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function sendOtp(e) {
    e?.preventDefault();
    const addr = cleanEmail();
    if (!validEmail(addr)) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    // shouldCreateUser: creates the account on first login automatically.
    const { error } = await supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Code sent to ${addr}`);
    setStep("otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 250);
  }

  async function verifyOtp(e) {
    e?.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail(),
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Invalid or expired code");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      return;
    }
    toast.success("Welcome!");
    router.replace("/dashboard");
    router.refresh();
  }

  function handleOtpChange(i, val) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKey(i, e) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (text.length) {
      e.preventDefault();
      const next = text.split("");
      while (next.length < 6) next.push("");
      setOtp(next);
      otpRefs.current[Math.min(text.length, 5)]?.focus();
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        className="card w-full max-w-md p-8"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent shadow-glow"
          >
            <Wallet className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">Saving Tracker</h1>
          <p className="mt-1 text-sm text-white/50">
            Track every rupee, month by month.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={sendOtp}
              className="space-y-4"
            >
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    inputMode="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-12"
                  />
                </div>
                <p className="mt-2 text-xs text-white/40">
                  We&apos;ll email you a free 6-digit verification code.
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send code"
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={verifyOtp}
              className="space-y-5"
            >
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Change email
              </button>

              <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent-soft">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">Code sent to {cleanEmail()}</span>
              </div>

              <div>
                <label className="label">Enter 6-digit code</label>
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      className="h-14 w-12 rounded-xl border border-white/10 bg-bg-soft/80 text-center text-xl font-semibold text-white outline-none transition-all focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/40">
                  Check your inbox (and spam). The code expires in a few minutes.
                </p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Verifying…
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="w-full text-center text-sm text-white/50 transition-colors hover:text-white"
              >
                Didn&apos;t get it? Resend code
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
