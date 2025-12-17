"use client";

import { use, useState, type FormEvent } from "react";
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
import { LegalAgreements, legalRequiredMessage } from "@/components/legal-agreements";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default function RegisterPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const langParam = resolvedParams?.lang;
  const locale = locales.includes(langParam as Locale) ? (langParam as Locale) : defaultLocale;
  const dictionary = getDictionary(locale);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(true);

  const mapAuthError = (raw: string) => {
    const text = String(raw || "");
    return text || dictionary.errors.unknown;
  };

  const passwordMismatchText = pickLocale(locale, {
    zh: "两次密码不一致",
    en: "Passwords do not match",
    ja: "パスワードが一致しません",
    ko: "비밀번호가 일치하지 않습니다",
    ru: "Пароли не совпадают",
    de: "Passwörter stimmen nicht überein",
    pt: "As senhas não coincidem",
    it: "Le password non coincidono",
    ar: "كلمتا المرور غير متطابقتين",
    es: "Las contraseñas no coinciden",
    fr: "Les mots de passe ne correspondent pas",
  });
  const registerFailedFallback = pickLocale(locale, {
    zh: "注册失败",
    en: "Register failed",
    ja: "登録に失敗しました",
    ko: "회원가입에 실패했습니다",
    ru: "Не удалось зарегистрироваться",
    de: "Registrierung fehlgeschlagen",
    pt: "Falha no cadastro",
    it: "Registrazione non riuscita",
    ar: "فشل التسجيل",
    es: "Error al registrarse",
    fr: "Échec de l’inscription",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    const confirmPassword = (formData.get("confirmPassword") as string) || "";

    if (password !== confirmPassword) {
      setState("error");
      setMessage(passwordMismatchText);
      return;
    }
    if (!accepted) {
      setState("error");
      setMessage(legalRequiredMessage(locale));
      return;
    }

    setState("loading");
    setMessage("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setState("error");
      setMessage(mapAuthError(data.error || registerFailedFallback));
      return;
    }
    setState("success");
    setMessage(data?.needsEmailConfirm ? dictionary.auth.register.successCheckEmail : dictionary.auth.register.success);
  };

  return (
    <Card className="border border-border bg-card shadow-2xl shadow-black/30">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{dictionary.auth.register.title}</CardTitle>
          <CardDescription>{dictionary.auth.register.subtitle}</CardDescription>
        </div>
        <Badge>{dictionary.appName}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{dictionary.auth.form.name}</Label>
            <Input id="name" name="name" type="text" placeholder="Jane Doe" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{dictionary.auth.form.email}</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{dictionary.auth.form.password}</Label>
            <Input id="password" name="password" type="password" placeholder="********" autoComplete="new-password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{dictionary.auth.form.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              autoComplete="new-password"
              required
            />
          </div>
          <LegalAgreements locale={locale} checked={accepted} onCheckedChange={setAccepted} />
          <Button type="submit" className="w-full" disabled={state === "loading"}>
            {state === "loading" ? "..." : dictionary.auth.register.action}
          </Button>
        </form>
        {message && (
          <Alert variant={state === "error" ? "destructive" : "default"} className={state === "error" ? "" : "border-primary/30 bg-primary/10"}>
            <AlertDescription className={state === "error" ? "text-foreground" : "text-primary"}>{message}</AlertDescription>
          </Alert>
        )}
        <p className="pt-2 text-center text-sm text-muted-foreground">
          {dictionary.auth.register.alt}{" "}
          <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
            {dictionary.auth.login.action}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

