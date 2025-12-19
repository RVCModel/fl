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
import { locales, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import { LogoIcon } from "@/components/logo";
import {
  Activity,
  Check,
  ChevronDown,
  Droplets,
  Globe2,
  Menu,
  Settings,
  LogOut,
  CreditCard,
  Waves,
  Layers,
  User,
  History as HistoryIcon,
} from "lucide-react";

type NavItem = {
  key: "demix" | "dereverb" | "bpm" | "stems";
  href: string;
  icon: ReactElement;
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, dictionary } = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = [
    { key: "demix", href: "", icon: <Waves className="h-4 w-4" /> },
    { key: "dereverb", href: "/dereverb", icon: <Droplets className="h-4 w-4" /> },
    { key: "stems", href: "/stems", icon: <Layers className="h-4 w-4" /> },
    { key: "bpm", href: "/bpm", icon: <Activity className="h-4 w-4" /> },
  ];

  const localeLabels: Record<Locale, string> = {
    zh: "中文",
    en: "English",
    ja: "日本語",
    ko: "한국어",
    ru: "Русский",
    de: "Deutsch",
    pt: "Português",
    it: "Italiano",
    ar: "العربية",
    es: "Español",
    fr: "Français",
  };

  const activePath = pathname.replace(/^\/[^/]+/, "") || "/";
  const localeLabel = localeLabels[locale] ?? locale.toUpperCase();

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
    const onScroll = () => {
      setIsScrolled((window.scrollY || 0) > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname, locale]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (navOpen && navRef.current && !navRef.current.contains(target)) {
        setNavOpen(false);
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
  }, [langOpen, navOpen, profileOpen]);

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
    <div className="flex min-h-screen flex-col bg-[#17171e] pt-16 text-foreground">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b px-4 transition-colors duration-200 sm:px-8",
          isScrolled
            ? "border-white/10 bg-[#17171e]/70 backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-[#17171e] backdrop-blur-none",
        )}
      >
        
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-3" aria-label="demixr">
            <LogoIcon size={36} className="text-white" />
            <span className="text-lg font-bold tracking-tight text-white">
              Demixr
            </span>
          </Link>

          {/* Mobile Navigation Button */}
          <div className="relative md:hidden" ref={navRef}>
            <Button
              variant="ghost"
              size="icon"
              // 提亮了移动端菜单按钮颜色: text-gray-200
              className="h-9 w-9 rounded-full text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
              aria-haspopup="true"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((v) => !v)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {navOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 top-16 z-40 bg-black/40"
                  aria-label="Close navigation menu"
                  onClick={() => setNavOpen(false)}
                />
                <div className="fixed inset-x-0 top-16 z-40 border-b border-white/10 bg-[#17171e]/80 p-3 shadow-2xl backdrop-blur-xl backdrop-saturate-150">
                  <div className="grid gap-1">
                    {navItems.map((item) => {
                      const itemPath = item.href || "/";
                      const isActive =
                        activePath === itemPath ||
                        activePath.startsWith(itemPath + "/") ||
                        (itemPath === "/" && activePath === "/");

                      return (
                        <Link
                          key={item.key}
                          href={`/${locale}${item.href}`}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                            // 提亮了移动端菜单颜色
                            isActive ? "bg-white/10 text-white" : "text-gray-200 hover:bg-white/5 hover:text-white",
                          )}
                          onClick={() => setNavOpen(false)}
                        >
                          <span className="opacity-90">{item.icon}</span>
                          <span className="flex-1">{dictionary.nav[item.key]}</span>
                          {item.key === "stems" && (
                            <Badge className="h-4 rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-black">
                              NEW
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex">
          {navItems.map((item) => {
            const itemPath = item.href || "/";
            const isActive =
              activePath === itemPath ||
              activePath.startsWith(itemPath + "/") ||
              (itemPath === "/" && activePath === "/");

            return (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className={cn(
                  "group flex items-center gap-2 text-sm font-medium transition-colors",
                  // 提亮了未选中颜色: text-gray-200 (接近白色)，选中为纯白 text-white
                  isActive ? "text-white font-semibold" : "text-gray-200 hover:text-white"
                )}
              >
                {/* 提亮了图标不透明度: opacity-90 */}
                <span className={cn("opacity-90 group-hover:opacity-100 transition-opacity", isActive ? "opacity-100" : "")}>
                   {item.icon} 
                </span>
                <span>{dictionary.nav[item.key]}</span>
                {item.key === "stems" && (
                  <Badge className="ml-1 h-4 rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-black hover:bg-emerald-400">
                    NEW
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <Button
              variant="ghost"
              size="icon"
              // 提亮了地球图标颜色
              className="h-9 w-9 text-gray-200 hover:bg-white/10 hover:text-white rounded-full transition-colors"
              onClick={() => setLangOpen((v) => !v)}
            >
              <Globe2 className="h-5 w-5" />
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-12 min-w-[140px] rounded-xl border border-white/10 bg-[#17171e] p-2 shadow-xl ring-1 ring-black/5 z-50">
                {locales.map((option) => (
                  <button
                    key={option}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-white/5",
                      locale === option ? "text-white" : "text-gray-300"
                    )}
                    onClick={() => {
                      handleLocaleChange(option);
                      setLangOpen(false);
                    }}
                  >
                    <span>{localeLabels[option]}</span>
                    {locale === option && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {userLabel ? (
            // Logged In: Simplified Profile Trigger
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                // 提亮了用户图标颜色
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-200 hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={profileOpen}
                title={userLabel}
              >
                <User className="h-5 w-5" />
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-xl border border-white/10 bg-[#17171e] p-2 shadow-2xl z-50">
                   <div className="mb-2 px-3 py-2 text-xs font-medium text-gray-400 border-b border-white/5 truncate">
                      {userLabel}
                   </div>
                   
                   <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${locale}/history`);
                    }}
                  >
                    <HistoryIcon className="h-4 w-4" />
                    {dictionary.nav.history || "History"}
                  </button>

                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${locale}/billing`);
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                    {dictionary.nav.billing || "Subscription"}
                  </button>

                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${locale}/tickets`);
                    }}
                  >
                    <User className="h-4 w-4" />
                    {dictionary.nav.tickets || "Support Tickets"}
                  </button>

                  {isAdmin && (
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push(`/${locale}/tickets/manage`);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      {dictionary.nav.ticketManage || "Ticket Management"}
                    </button>
                  )}

                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(`/${locale}/settings`);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                    {dictionary.nav.settings || "Settings"}
                  </button>

                  <div className="my-1 h-px bg-white/10" />

                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
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
            // Logged Out Actions
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/auth/login`}>
                <Button 
                  size="sm" 
                  className="rounded-full bg-white px-5 text-black hover:bg-gray-200 font-bold"
                >
                  {dictionary.header.login}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
