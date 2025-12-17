"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pickLocale } from "@/i18n/locale-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { applySession, getSupabaseBrowserClient } from "@/lib/auth-client";
import { LegalAgreements, legalRequiredMessage } from "@/components/legal-agreements";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default function LoginPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const langParam = resolvedParams?.lang;
  const locale = locales.includes(langParam as Locale) ? (langParam as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(true);

  const mapAuthError = (raw: string) => {
    const text = String(raw || "");
    return text || dictionary.errors.unknown;
  };

  const loginFailedFallback = pickLocale(locale, {
    zh: "登录失败",
    en: "Login failed",
    ja: "ログインに失敗しました",
    ko: "로그인에 실패했습니다",
    ru: "Не удалось войти",
    de: "Login fehlgeschlagen",
    pt: "Falha no login",
    it: "Accesso non riuscito",
    ar: "فشل تسجيل الدخول",
    es: "Error al iniciar sesión",
    fr: "Échec de la connexion",
  });
  const loginSuccessText = pickLocale(locale, {
    zh: "登录成功",
    en: "Login successful",
    ja: "ログインしました",
    ko: "로그인되었습니다",
    ru: "Вход выполнен",
    de: "Login erfolgreich",
    pt: "Login realizado",
    it: "Accesso effettuato",
    ar: "تم تسجيل الدخول",
    es: "Inicio de sesión correcto",
    fr: "Connexion réussie",
  });
  const googleErrorText = pickLocale(locale, {
    zh: "Google 登录失败",
    en: "Google sign-in failed",
    ja: "Google ログインに失敗しました",
    ko: "Google 로그인에 실패했습니다",
    ru: "Не удалось войти через Google",
    de: "Google-Login fehlgeschlagen",
    pt: "Falha ao entrar com Google",
    it: "Accesso con Google non riuscito",
    ar: "فشل تسجيل الدخول عبر Google",
    es: "Error al iniciar sesión con Google",
    fr: "Échec de la connexion avec Google",
  });
  const continueWithGoogleText = pickLocale(locale, {
    zh: "使用 Google 登录",
    en: "Continue with Google",
    ja: "Google で続行",
    ko: "Google로 계속하기",
    ru: "Продолжить с Google",
    de: "Mit Google fortfahren",
    pt: "Continuar com Google",
    it: "Continua con Google",
    ar: "المتابعة باستخدام Google",
    es: "Continuar con Google",
    fr: "Continuer avec Google",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accepted) {
      setState("error");
      setMessage(legalRequiredMessage(locale));
      return;
    }
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    setState("loading");
    setMessage("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setState("error");
      setMessage(mapAuthError(data.error || loginFailedFallback));
      return;
    }
    setState("success");
    setMessage(loginSuccessText);
    if (typeof window !== "undefined") {
      localStorage.setItem("vofl:user", email);
      await applySession(data.session);
    }
    router.push(`/${locale}`);
  };

  useEffect(() => {
    const syncSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const email = data.session.user?.email;
        if (typeof window !== "undefined" && email) {
          localStorage.setItem("vofl:user", email);
        }
        await applySession(data.session);
        router.push(`/${locale}`);
      }
    };
    syncSession().catch((err) => {
      console.error("session sync failed", err);
    });
  }, [locale, router]);

  const handleGoogleLogin = async () => {
    if (!accepted) {
      setState("error");
      setMessage(legalRequiredMessage(locale));
      return;
    }
    setState("loading");
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/${locale}` : undefined;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) {
        setState("error");
        setMessage(googleErrorText);
      }
    } catch (err) {
      console.error(err);
      setState("error");
      setMessage(googleErrorText);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-2xl shadow-black/30">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{dictionary.auth.login.title}</CardTitle>
          <CardDescription>{dictionary.auth.login.subtitle}</CardDescription>
        </div>
        <Badge>{dictionary.appName}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{dictionary.auth.form.email}</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{dictionary.auth.form.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" name="remember" className="h-4 w-4 rounded border-border bg-muted" />
              {dictionary.auth.form.remember}
            </label>
            <Link href={`/${locale}/auth/forgot`} className="text-primary hover:underline">
              {dictionary.auth.login.forgot}
            </Link>
          </div>
          <LegalAgreements locale={locale} checked={accepted} onCheckedChange={setAccepted} />
          <Button type="submit" className="w-full" disabled={state === "loading"}>
            {state === "loading" ? "..." : dictionary.auth.login.action}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center gap-2"
            onClick={handleGoogleLogin}
            disabled={state === "loading"}
          >
            <GoogleIcon />
            {continueWithGoogleText}
          </Button>
        </form>
        {message && (
          <Alert variant={state === "error" ? "destructive" : "default"} className={state === "error" ? "" : "border-primary/30 bg-primary/10"}>
            <AlertDescription className={state === "error" ? "text-foreground" : "text-primary"}>{message}</AlertDescription>
          </Alert>
        )}
        <p className="pt-2 text-center text-sm text-muted-foreground">
          {dictionary.auth.login.alt}{" "}
          <Link href={`/${locale}/auth/register`} className="text-primary hover:underline">
            {dictionary.auth.register.action}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" focusable="false">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3.1l3 2.3c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.4-.2-2H12Z"
      />
      <path
        fill="#34A853"
        d="M5.6 14.3l-.8.6-2.4 1.9C4.5 20 8 21.5 12 21.5c2.7 0 4.9-.9 6.5-2.4l-3-2.3c-.8.6-1.9 1-3.5 1-2.7 0-5-1.8-5.9-4.3Z"
      />
      <path
        fill="#4A90E2"
        d="M3.2 8.8C2.8 9.6 2.6 10.6 2.6 11.6c0 1 .2 2 .6 2.8 0 0 0-.1.1-.1l2.9-2.3c-.2-.6-.4-1.2-.4-1.9 0-.7.1-1.3.4-1.9L3.2 8.8Z"
      />
      <path
        fill="#FBBC05"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.7 14.7 1.9 12 1.9 8 1.9 4.5 3.9 2.6 6.9l3.1 2.3C6.9 7.8 9.2 6 12 6Z"
      />
    </svg>
  );
}

