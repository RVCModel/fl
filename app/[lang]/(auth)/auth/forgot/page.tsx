"use client";

import { use, useState, type FormEvent } from "react";
import Link from "next/link";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default function ForgotPasswordPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const langParam = resolvedParams?.lang;
  const locale = locales.includes(langParam as Locale)
    ? (langParam as Locale)
    : defaultLocale;
  const dictionary = getDictionary(locale);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string) || "";
    setState("loading");
    setMessage("");
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setState("error");
      setMessage(data.error || "Request failed");
      return;
    }
    setState("success");
    setMessage(dictionary.auth.reset.action + " sent");
  };

  return (
    <Card className="border border-border bg-card shadow-2xl shadow-black/30">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl">
            {dictionary.auth.reset.title}
          </CardTitle>
          <CardDescription>{dictionary.auth.reset.subtitle}</CardDescription>
        </div>
        <Badge>{dictionary.appName}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{dictionary.auth.form.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={state === "loading"}>
            {state === "loading" ? "..." : dictionary.auth.reset.action}
          </Button>
        </form>
        {message && (
          <Alert
            variant={state === "error" ? "destructive" : "default"}
            className={state === "error" ? "" : "border-primary/30 bg-primary/10"}
          >
            <AlertDescription className={state === "error" ? "text-foreground" : "text-primary"}>
              {message}
            </AlertDescription>
          </Alert>
        )}
        <p className="pt-2 text-center text-sm text-muted-foreground">
          <Link
            href={`/${locale}/auth/login`}
            className="text-primary hover:underline"
          >
            {dictionary.auth.reset.alt}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
