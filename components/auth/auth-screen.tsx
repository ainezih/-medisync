"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import appConfig from "@/app.config";
import { useLang } from "@/components/i18n/language-provider";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { createClient } from "@/lib/supabase/client";

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const { ui, t, lang } = useLang();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function enter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("name") ?? "");

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(ui.authError);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(ui.authError);
        setLoading(false);
        return;
      }
      setCheckEmail(true);
      setLoading(false);
    }
  }

  const isLogin = mode === "login";
  const stats = appConfig.marketing.stats.slice(0, 3);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Left — brand panel */}
      <section
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{ backgroundImage: "var(--grad-brand)" }}
      >
        <span className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-black/15 blur-3xl" />

        <Link href="/" className="relative">
          <Logo onDark />
        </Link>

        <div className="relative max-w-md">
          <p className="text-xs uppercase tracking-[0.22em] text-white/70">
            {t(appConfig.marketing.badge)}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
            {t(appConfig.tagline)}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/85">{ui.authBlurb}</p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.value} className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="font-display text-2xl font-semibold tabular-nums">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-white/75">{t(s.label)}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/65">
          © {appConfig.name} · {appConfig.domain}
        </p>
      </section>

      {/* Right — form */}
      <section className="relative flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute right-5 top-5">
          <LanguageToggle />
        </div>

        <div className="w-full max-w-sm space-y-7">
          <Link href="/" className="inline-flex lg:hidden">
            <Logo />
          </Link>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {appConfig.name}
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {isLogin ? ui.welcomeBack : ui.createAccount}
            </h2>
          </div>

          {checkEmail ? (
            <div className="space-y-4">
              <p className="rounded-lg bg-info/10 px-3 py-3 text-center text-sm text-info">
                {ui.checkEmail}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                  {ui.signIn}
                </Link>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={enter} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">{ui.fullName}</Label>
                    <Input id="name" name="name" placeholder={lang === "tr" ? "Adın Soyadın" : "Jane Doe"} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">{ui.email}</Label>
                  <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{ui.password}</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isLogin ? ui.signIn : ui.getStarted}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? ui.noAccount : ui.haveAccount}{" "}
                <Link
                  href={isLogin ? "/signup" : "/login"}
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  {isLogin ? ui.getStarted : ui.signIn}
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
