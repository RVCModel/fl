"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { getValidAccessToken } from "@/lib/auth-client";

type Ticket = {
  id: string;
  user_id: string;
  category: "demix" | "billing" | "other";
  subject: string;
  status: "open" | "answered" | "closed";
  created_at: string;
  updated_at: string;
  user?: { email: string | null; full_name: string | null } | null;
};

type TicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: "user" | "admin";
  body: string;
  created_at: string;
};

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type SupportTicketsProps = {
  dictionary: Dictionary;
  locale: string;
  mode?: "user" | "admin";
};

export function SupportTickets({ dictionary, mode = "user" }: SupportTicketsProps) {
  const t = dictionary.tickets;

  const [isAdmin, setIsAdmin] = useState(false);
  const [scopeAll, setScopeAll] = useState(mode === "admin");
  const [filterStatus, setFilterStatus] = useState<"all" | Ticket["status"]>("all");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);

  const [category, setCategory] = useState<Ticket["category"]>("demix");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    const base = filterStatus === "all" ? tickets : tickets.filter((x) => x.status === filterStatus);
    return base;
  }, [tickets, filterStatus]);

  const statusLabel = (s: Ticket["status"]) => t.statuses[s];
  const categoryLabel = (c: Ticket["category"]) => t.categories[c];
  const userLabel = (x: Ticket) =>
    x.user?.full_name?.trim() || x.user?.email?.trim() || x.user_id;

  const messageBubbles = useMemo(() => {
    return messages.map((m) => {
      const isAdminMsg = m.sender_role === "admin";
      const label = isAdminMsg ? t.admin : t.you;
      return { ...m, isAdminMsg, label };
    });
  }, [messages, t.admin, t.you]);

  const loadTickets = async (nextScopeAll: boolean) => {
    setError(null);
    const token = await getValidAccessToken();
    if (!token) {
      setError(dictionary.errors.needLogin);
      return;
    }
    const url = nextScopeAll ? "/api/tickets?scope=all" : "/api/tickets";
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = (await safeJson(res)) as any;
    if (!res.ok) {
      setError(t.loadFailed);
      return;
    }
    const admin = !!data?.isAdmin;
    setIsAdmin(admin);
    if (mode === "admin" && !admin) {
      setError(t.adminOnly);
      return;
    }
    if (mode === "admin" && admin) {
      setScopeAll(true);
    }
    setTickets((data?.tickets ?? []) as Ticket[]);
  };

  const loadTicketDetail = async (ticketId: string) => {
    setError(null);
    const token = await getValidAccessToken();
    if (!token) {
      setError(dictionary.errors.needLogin);
      return;
    }
    const res = await fetch(`/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await safeJson(res)) as any;
    if (!res.ok) {
      setError(t.loadFailed);
      return;
    }
    setSelectedTicket(data.ticket as Ticket);
    setMessages((data.messages ?? []) as TicketMessage[]);
  };

  useEffect(() => {
    loadTickets(mode === "admin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadTicketDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const createTicket = async () => {
    if (mode === "admin") return;
    setError(null);
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError(dictionary.errors.needLogin);
        return;
      }
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category, subject, content }),
      });
      const data = (await safeJson(res)) as any;
      if (!res.ok) throw new Error(data?.error || t.createFailed);
      setSubject("");
      setContent("");
      await loadTickets(false);
      if (data?.ticketId) setSelectedId(String(data.ticketId));
    } catch (e: any) {
      setError(e?.message || t.createFailed);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedId) return;
    const msg = reply.trim();
    if (!msg) return;
    setError(null);
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError(dictionary.errors.needLogin);
        return;
      }
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: msg }),
      });
      const data = (await safeJson(res)) as any;
      if (!res.ok) throw new Error(data?.error || t.replyFailed);
      setReply("");
      await loadTicketDetail(selectedId);
      await loadTickets(mode === "admin");
    } catch (e: any) {
      setError(e?.message || t.replyFailed);
    } finally {
      setLoading(false);
    }
  };

  const setTicketStatus = async (status: Ticket["status"]) => {
    if (!selectedId) return;
    setError(null);
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError(dictionary.errors.needLogin);
        return;
      }
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = (await safeJson(res)) as any;
      if (!res.ok) throw new Error(data?.error || t.replyFailed);
      await loadTicketDetail(selectedId);
      await loadTickets(mode === "admin");
    } catch (e: any) {
      setError(e?.message || t.replyFailed);
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async () => {
    if (!selectedId || mode !== "admin") return;
    if (!confirm(t.deleteConfirm)) return;
    setError(null);
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError(dictionary.errors.needLogin);
        return;
      }
      const res = await fetch(`/api/tickets/${selectedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await safeJson(res)) as any;
      if (!res.ok) throw new Error(data?.error || t.replyFailed);
      setSelectedId(null);
      setSelectedTicket(null);
      setMessages([]);
      await loadTickets(true);
    } catch (e: any) {
      setError(e?.message || t.replyFailed);
    } finally {
      setLoading(false);
    }
  };

  const showCreate = mode !== "admin";
  const listScopeAll = mode === "admin";

  return (
    <div className="w-full">
      <div className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">{t.title}</div>
        <div className="text-sm text-muted-foreground">{t.subtitle}</div>
      </div>

      <div className="mt-6 flex flex-col gap-10">
        {showCreate && (
          <section>
            <div className="border-t border-border/40 pt-6">
              <div className="mb-4 text-sm font-semibold">{t.newTitle}</div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">{t.category}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Ticket["category"])}
                    className="h-10 w-full rounded-md border border-white/10 bg-[#17171e] px-3 text-sm text-slate-200 outline-none focus:border-white/20"
                  >
                    <option className="bg-[#17171e] text-slate-200" value="demix">
                      {t.categories.demix}
                    </option>
                    <option className="bg-[#17171e] text-slate-200" value="billing">
                      {t.categories.billing}
                    </option>
                    <option className="bg-[#17171e] text-slate-200" value="other">
                      {t.categories.other}
                    </option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">{t.subject}</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-10 w-full rounded-md border border-white/10 bg-transparent px-3 text-sm text-foreground outline-none focus:border-white/20"
                    placeholder={t.subjectPlaceholder}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">{t.content}</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] w-full resize-none rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-white/20"
                    placeholder={t.contentPlaceholder}
                  />
                </div>

                <div>
                  <Button
                    onClick={createTicket}
                    disabled={loading || !content.trim()}
                    className="rounded-full px-5"
                  >
                    {t.submit}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="border-t border-border/40 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold">{listScopeAll ? t.allTickets : t.myTickets}</div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">{t.status}</div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="h-9 rounded-md border border-white/10 bg-[#17171e] px-3 text-sm text-slate-200 outline-none focus:border-white/20"
                >
                  <option className="bg-[#17171e] text-slate-200" value="all">
                    {t.statusAll}
                  </option>
                  <option className="bg-[#17171e] text-slate-200" value="open">
                    {t.statuses.open}
                  </option>
                  <option className="bg-[#17171e] text-slate-200" value="answered">
                    {t.statuses.answered}
                  </option>
                  <option className="bg-[#17171e] text-slate-200" value="closed">
                    {t.statuses.closed}
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-border/40">
              {filteredTickets.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">{t.empty}</div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filteredTickets.map((x) => (
                    <button
                      key={x.id}
                      className={cn(
                        "flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/15",
                        selectedId === x.id && "bg-muted/15",
                      )}
                      onClick={() => setSelectedId(x.id)}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {x.subject?.trim() ? x.subject : categoryLabel(x.category)}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {mode === "admin" && <span className="truncate">{userLabel(x)}</span>}
                          <span>
                            {t.createdAt}: {formatDate(x.created_at)}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-border/40 bg-transparent px-3 py-1 text-xs text-muted-foreground">
                        {statusLabel(x.status)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedTicket && (
              <div className="mt-8 border-t border-border/40 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold">
                      {selectedTicket.subject?.trim()
                        ? selectedTicket.subject
                        : categoryLabel(selectedTicket.category)}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {mode === "admin" && <span className="truncate">{userLabel(selectedTicket)}</span>}
                      <span>
                        {t.createdAt}: {formatDate(selectedTicket.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mode === "admin" && (
                      <Button
                        variant="outline"
                        className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                        disabled={loading}
                        onClick={deleteTicket}
                      >
                        {t.delete}
                      </Button>
                    )}
                    {selectedTicket.status !== "closed" ? (
                      <Button
                        variant="outline"
                        className="rounded-full"
                        disabled={loading}
                        onClick={() => setTicketStatus("closed")}
                      >
                        {t.close}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="rounded-full"
                        disabled={loading}
                        onClick={() => setTicketStatus("open")}
                      >
                        {t.reopen}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 max-h-[260px] overflow-auto pr-1">
                  <div className="flex flex-col gap-3">
                    {messageBubbles.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "flex w-full",
                          m.isAdminMsg ? "justify-start" : "justify-end",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[84%] rounded-2xl border px-4 py-3 text-sm",
                            m.isAdminMsg
                              ? "border-border/40 bg-muted/10"
                              : "border-border/40 bg-primary/10",
                          )}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="text-xs font-medium text-foreground/80">{m.label}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(m.created_at)}</div>
                          </div>
                          <div className="mt-1 whitespace-pre-wrap text-foreground/90">{m.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="min-h-[90px] w-full resize-none rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:border-white/20"
                    placeholder={t.replyPlaceholder}
                  />
                  <div className="flex items-center justify-end">
                    <Button onClick={sendReply} disabled={loading || !reply.trim()} className="rounded-full px-5">
                      {t.send}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6">
                <Alert variant="destructive">
                  <AlertDescription className="text-foreground">{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
