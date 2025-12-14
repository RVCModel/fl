"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { useLocale } from "@/components/locale-provider";
import { locales } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import { LogoIcon } from "@/components/logo";
import {
  Activity,
  Check,
  ChevronDown,
  Droplets,
  Globe2,
  LogIn,
  Settings,
  UserRoundPlus,
  LogOut,
  History as HistoryIcon,
  CreditCard,
  Waves,
  User,
} from "lucide-react";

type NavItem = {
  key: "demix" | "dereverb" | "bpm" | "history";
  href: string;
  icon: ReactElement;
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = [
    { key: "demix", href: "", icon: <Waves className="h-5 w-5" /> },
    { key: "dereverb", href: "/dereverb", icon: <Droplets className="h-5 w-5" /> },
    { key: "bpm", href: "/bpm", icon: <Activity className="h-5 w-5" /> },
    { key: "history", href: "/history", icon: <HistoryIcon className="h-5 w-5" /> },
  ];

  const activePath = pathname.replace(/^\/[^/]+/, "") || "/";
  const localeLabel =
    locale === "zh" ? "中文" : locale === "ja" ? "日本語" : "English";

  const handleLocaleChange = (target: string) => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = target;
    const nextPath = `/${segments.join("/")}`;
    router.push(nextPath);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("vofl:user");
    setUserLabel(stored);
    const onStorage = () => {
      setUserLabel(localStorage.getItem("vofl:user"));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    // Sync Supabase session (incl. social login) into header state/localStorage
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email || null;
      if (email && typeof window !== "undefined") {
        localStorage.setItem("vofl:user", email);
      }
      if (data.session?.access_token && typeof window !== "undefined") {
        localStorage.setItem("vofl:token", data.session.access_token);
      }
      setUserLabel(email);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email || null;
      if (typeof window !== "undefined") {
        if (email) {
          localStorage.setItem("vofl:user", email);
        } else {
          localStorage.removeItem("vofl:user");
        }
        if (session?.access_token) {
          localStorage.setItem("vofl:token", session.access_token);
        } else {
          localStorage.removeItem("vofl:token");
        }
      }
      setUserLabel(email);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!userLabel || typeof window === "undefined") {
        setIsAdmin(false);
        return;
      }
      const token = localStorage.getItem("vofl:token");
      if (!token) {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch("/api/tickets", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        setIsAdmin(!!data?.isAdmin);
      } catch {
        setIsAdmin(false);
      }
    };
    run();
  }, [userLabel]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (langOpen && langRef.current && !langRef.current.contains(target)) {
        setLangOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [langOpen, menuOpen, profileOpen]);

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("supabase signOut failed", err);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("vofl:user");
      localStorage.removeItem("vofl:token");
    }
    setUserLabel(null);
    router.push(`/${locale}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#17171e] text-foreground">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-foreground/5 bg-[#17171e] px-8 text-foreground">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-3" aria-label="demixr">
            <LogoIcon size={40} className="drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                Demixr
              </span>
              <span className="-mt-0.5 text-xs text-muted-foreground">{dictionary.brandSubtitle}</span>
            </div>
          </Link>
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg bg-white/20 text-foreground shadow-sm backdrop-blur-sm hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-foreground/80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <rect x="4.5" y="4.5" width="6" height="6" rx="1.6" />
                <rect x="4.5" y="13.5" width="6" height="6" rx="1.6" />
                <rect x="13.5" y="13.5" width="6" height="6" rx="1.6" />
                <path d="M15.5 5.5 17 4l1.5 1.5L17 7z" />
              </svg>
            </Button>
            {menuOpen && (
              <div className="absolute left-0 top-12 min-w-[240px] rounded-2xl border border-white/10 bg-[#17171e] p-3 shadow-2xl">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const itemPath = item.href || "/";
                    const isActive =
                      activePath === itemPath ||
                      activePath.startsWith(itemPath + "/") ||
                      (itemPath === "/" && activePath === "/");
                                        const subtitles: Record<NavItem["key"], string> = {
                      demix: "Vocals ? Music",
                      dereverb: "Dry/Wet ? Echo",
                      bpm: "Tempo ? Grid",
                      history: "Recent jobs",
                    };
                    const labels: Record<NavItem["key"], string> = {
                      demix: dictionary.nav.demix,
                      dereverb: dictionary.nav.dereverb,
                      bpm: dictionary.nav.bpm,
                      history: dictionary.nav.history || "History",
                    };
                    return (
                      <Link
                        key={item.key}
                        href={`/${locale}${item.href}`}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition",
                          isActive
                            ? "bg-primary/20 text-foreground"
                            : "hover:bg-white/5 text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-primary">
                            {item.icon}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold">{dictionary.nav[item.key]}</div>
                            <div className="text-xs text-muted-foreground">
                              {subtitles[item.key]}
                            </div>
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={langRef}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full border border-transparent bg-transparent px-3 py-2 text-sm text-slate-200 shadow-none transition hover:bg-white/5"
              onClick={() => setLangOpen((v) => !v)}
            >
              <Globe2 className="h-4 w-4 text-slate-300" />
              <span className="tracking-tight">{localeLabel}</span>
              <ChevronDown className="ml-1 h-4 w-4 text-slate-400" />
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-12 min-w-[140px] rounded-2xl border border-white/10 bg-[#17171e] p-2 shadow-xl">
                {locales.map((option) => (
                  <button
                    key={option}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-foreground/5",
                      locale === option ? "text-foreground" : "text-muted-foreground",
                    )}
                    onClick={() => {
                      handleLocaleChange(option);
                      setLangOpen(false);
                    }}
                  >
                    <span>{option.toUpperCase()}</span>
                    {locale === option && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {userLabel ? (
            <div className="relative" ref={profileRef}>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-3 rounded-full border border-transparent bg-transparent px-3 py-2 text-slate-200 shadow-none transition hover:bg-white/5"
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-semibold text-white">
                  <User className="h-4 w-4" />
                </span>
                <span className="text-sm">{userLabel || "用户名"}</span>
                <ChevronDown className="ml-1 h-4 w-4 text-slate-400" />
              </Button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 rounded-2xl border border-white/10 bg-[#17171e] p-2 shadow-2xl">
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-foreground/5"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${locale}/history`);
                    }}
                  >
                    <HistoryIcon className="h-4 w-4" />
                    {dictionary.nav.history || "历史记录"}
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-foreground/5"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${locale}/billing`);
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                    {dictionary.nav.billing || (locale === "en" ? "Subscription" : locale === "ja" ? "購読" : "订阅")}
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-foreground/5"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${locale}/tickets`);
                    }}
                  >
                    <User className="h-4 w-4" />
                    {dictionary.nav.tickets || (locale === "en" ? "Support Tickets" : locale === "ja" ? "サポート" : "工单反馈")}
                  </button>
                  {isAdmin && (
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-foreground/5"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push(`/${locale}/tickets/manage`);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      {dictionary.nav.ticketManage ||
                        (locale === "en" ? "Ticket Management" : locale === "ja" ? "チケット管理" : "工单管理")}
                    </button>
                  )}
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-foreground/5"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${locale}/settings`);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    {dictionary.nav.settings || (locale === "en" ? "Settings" : locale === "ja" ? "設定" : "设置")}
                  </button>
                  <div className="my-1 h-px bg-white/10" />
                  <button
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {dictionary.header.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border border-white/10 bg-white/5 px-4 text-white shadow-sm transition hover:bg-white/10"
                >
                  <LogIn className="mr-1 h-4 w-4" />
                  {dictionary.header.login}
                </Button>
              </Link>
              <Link href={`/${locale}/auth/register`}>
                <Button size="sm" className="rounded-full">
                  <UserRoundPlus className="mr-1 h-4 w-4" />
                  {dictionary.auth.register.action}
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
