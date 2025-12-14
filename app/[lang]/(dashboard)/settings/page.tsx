"use client";

import { useEffect, useState } from "react";
import { defaultLocale, Locale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

type PageProps = {
  params: Promise<{ lang: string }>;
};

export default function SettingsPage({ params }: PageProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [dictionary, setDictionary] = useState(getDictionary(defaultLocale));
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    params.then(({ lang }) => {
      const nextLocale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
      setLocale(nextLocale);
      setDictionary(getDictionary(nextLocale));
    });
  }, [params]);

  const t = dictionary.settings!;

  const updateName = async () => {
    setError(null);
    setMessage(null);
    if (!name.trim()) {
      setError(t.nameLabel);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("vofl:token");
      if (!token) {
        setError(dictionary.header.login);
        return;
      }
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "name", name }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage(t.successName);
      localStorage.setItem("vofl:user", name);
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    setError(null);
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setError(t.mismatch);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("vofl:token");
      if (!token) {
        setError(dictionary.header.login);
        return;
      }
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "password",
          currentPassword,
          newPassword,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || "Update failed");
      setMessage(t.successPwd);
      // force sign out
      localStorage.removeItem("vofl:token");
      localStorage.removeItem("vofl:user");
      window.location.href = `/${locale}/auth/login`;
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{dictionary.tagline}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 text-lg font-semibold">{t.profileTitle}</div>
        <div className="flex flex-col gap-3">
          <label className="text-sm text-muted-foreground">{t.nameLabel}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder={t.nameLabel}
          />
          <Button onClick={updateName} disabled={loading} className="w-fit rounded-full px-5">
            {t.saveName}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 text-lg font-semibold">{t.passwordTitle}</div>
        <div className="grid gap-3">
          <label className="text-sm text-muted-foreground">{t.currentPwd}</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="********"
          />
          <label className="text-sm text-muted-foreground">{t.newPwd}</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="********"
          />
          <label className="text-sm text-muted-foreground">{t.confirmPwd}</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="********"
          />
          <Button onClick={updatePassword} disabled={loading} className="mt-2 w-fit rounded-full px-5">
            {t.savePwd}
          </Button>
        </div>
      </div>

      {(message || error) && (
        <Alert
          variant={error ? "destructive" : "default"}
          className={error ? "" : "border-emerald-500/40 bg-emerald-500/10"}
        >
          <AlertDescription className={error ? "text-foreground" : "text-emerald-300"}>
            {error || message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
