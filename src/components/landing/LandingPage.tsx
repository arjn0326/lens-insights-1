import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Lock, MapPin, Shield, User } from "lucide-react";
import { setAuthenticated, validateCredentials } from "@/lib/demo-auth";

export function LandingPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    window.setTimeout(() => {
      if (validateCredentials(userId, password)) {
        setAuthenticated(userId);
        navigate({ to: "/app" });
      } else {
        setError("Invalid credentials. Check your User ID and password.");
        setLoading(false);
      }
    }, 480);
  };

  return (
    <div className="landing-page relative min-h-screen overflow-hidden bg-[var(--background)] text-foreground">
      <div className="landing-grid pointer-events-none absolute inset-0 opacity-[0.45]" aria-hidden />
      <div className="landing-glow pointer-events-none absolute -left-32 top-20 h-[420px] w-[420px] rounded-full bg-[var(--blue)]/10 blur-3xl" aria-hidden />
      <div
        className="landing-glow pointer-events-none absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-[var(--cyan)]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-[1200px] flex-col px-5 py-8 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:py-12">
        {/* Brand column */}
        <section className="flex flex-1 flex-col justify-center pb-10 lg:pb-0 lg:pr-4">
          <div className="mb-8 flex items-center gap-4">
            <img
              src="/images/lens-logo.png"
              alt="LENS"
              className="h-16 w-16 rounded-2xl object-cover shadow-[var(--shadow-elevated)] ring-1 ring-border"
              width={64}
              height={64}
            />
            <div>
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Louisiana
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                LENS
              </h1>
            </div>
          </div>

          <h2 className="max-w-lg font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.08] tracking-tight text-foreground">
            Louisiana Education &amp; Needs Synthesis
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Decision intelligence for leaders — parish health scores, funding flows, workforce
            signals, and full reports across all 64 parishes.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              { icon: MapPin, label: "64 parishes", sub: "Interactive map" },
              { icon: Shield, label: "6 layers", sub: "Health to pipeline" },
              { icon: Lock, label: "Secure access", sub: "Authorized users" },
            ].map(({ icon: Icon, label, sub }) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-[var(--surface-elevated)]/80 px-4 py-3 backdrop-blur-sm"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--blue)_12%,transparent)] text-[var(--blue)]">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{label}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Sign-in card */}
        <section className="w-full shrink-0 lg:w-[400px] xl:w-[420px]">
          <div className="landing-card rounded-2xl border border-border bg-[var(--surface-elevated)]/95 p-8 shadow-[var(--shadow-elevated)] backdrop-blur-md">
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--blue)]">
                Secure sign-in
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Enter the platform
              </h3>
              <p className="mt-1.5 text-[12px] text-[var(--text-muted)]">
                Demo access for DevDays reviewers and partners.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="user-id"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]"
                >
                  User ID
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="user-id"
                    type="text"
                    autoComplete="username"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. NEXUS LA"
                    className="w-full rounded-lg border border-border bg-[var(--background)] py-2.5 pl-10 pr-3 text-[14px] text-foreground outline-none transition-[box-shadow,border-color] placeholder:text-[var(--text-muted)]/70 focus:border-[var(--blue)] focus:shadow-[var(--shadow-glow)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-border bg-[var(--background)] py-2.5 pl-10 pr-10 text-[14px] text-foreground outline-none transition-[box-shadow,border-color] placeholder:text-[var(--text-muted)]/70 focus:border-[var(--blue)] focus:shadow-[var(--shadow-glow)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--text-muted)] hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-[color-mix(in_oklab,var(--sev-red)_35%,transparent)] bg-[color-mix(in_oklab,var(--sev-red)_8%,transparent)] px-3 py-2 text-[12px] text-[var(--sev-red)]"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !userId.trim() || !password}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--background)] transition-opacity hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--background)] border-t-transparent" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 border-t border-border pt-4 text-center text-[10px] leading-relaxed text-[var(--text-muted)]">
              Authorized access only · Louisiana Department of Education data
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
