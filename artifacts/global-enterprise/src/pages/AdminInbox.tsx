import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FaEnvelope, FaEnvelopeOpen, FaInbox, FaPhoneAlt, FaTrash, FaArrowLeft,
  FaCheck, FaRedo,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";

export type AdminMessage = {
  id: number | string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type InboxResponse = { messages: AdminMessage[]; unreadCount: number };

export function useAdminInbox(token: string | null, enabled = true) {
  return useQuery<InboxResponse>({
    queryKey: ["admin-inbox"],
    enabled: Boolean(token) && enabled,
    refetchInterval: 30_000,
    queryFn: async () => {
      const response = await fetch("/api/admin/inbox", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to load inbox");
      return response.json();
    },
  });
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function preview(value: string) {
  return value.replace(/\s+/g, " ").trim() || "No message preview";
}

export default function AdminInbox({ token }: { token: string | null }) {
  const queryClient = useQueryClient();
  const inbox = useAdminInbox(token, true);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [detail, setDetail] = useState<AdminMessage | null>(null);
  const [busyId, setBusyId] = useState<number | string | null>(null);
  const [error, setError] = useState("");

  const messages = useMemo(
    () => [...(inbox.data?.messages ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
    [inbox.data],
  );

  async function openMessage(message: AdminMessage) {
    setSelectedId(message.id);
    setDetail(message);
    setError("");
    try {
      const response = await fetch(`/api/admin/inbox/${encodeURIComponent(String(message.id))}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to load this message");
      const body = await response.json();
      setDetail(body.message ?? body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load this message");
    }
  }

  async function setRead(message: AdminMessage, isRead: boolean) {
    setBusyId(message.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/inbox/${encodeURIComponent(String(message.id))}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isRead }),
      });
      if (!response.ok) throw new Error("Unable to update message");
      await queryClient.invalidateQueries({ queryKey: ["admin-inbox"] });
      setDetail((current) => current ? { ...current, isRead } : current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update message");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMessage(message: AdminMessage) {
    if (!window.confirm(`Delete the message from ${message.fullName}? This cannot be undone.`)) return;
    setBusyId(message.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/inbox/${encodeURIComponent(String(message.id))}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to delete message");
      if (selectedId === message.id) {
        setSelectedId(null);
        setDetail(null);
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-inbox"] });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete message");
    } finally {
      setBusyId(null);
    }
  }

  if (inbox.isLoading) {
    return <div className="admin-inbox-card p-6 space-y-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 rounded-lg bg-slate-100 animate-pulse" />)}</div>;
  }
  if (inbox.isError) {
    return <div className="admin-inbox-card p-10 text-center"><FaEnvelope className="mx-auto mb-3 text-3xl text-slate-300" /><p className="font-semibold text-slate-700">Inbox could not be loaded</p><p className="mt-1 text-sm text-slate-500">Please check your connection and try again.</p><Button variant="outline" className="mt-4 gap-2" onClick={() => inbox.refetch()}><FaRedo /> Try again</Button></div>;
  }

  return (
    <div className="admin-inbox-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
        <div><h2 className="text-lg font-bold text-slate-900">Inbox</h2><p className="mt-1 text-sm text-slate-500">{inbox.data?.unreadCount ?? 0} unread {(inbox.data?.unreadCount ?? 0) === 1 ? "message" : "messages"}</p></div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => inbox.refetch()}><FaRedo /> Refresh</Button>
      </div>
      {error && <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {!messages.length ? (
        <div className="px-6 py-20 text-center"><FaInbox className="mx-auto mb-4 text-4xl text-slate-300" /><p className="font-semibold text-slate-700">Your inbox is empty</p><p className="mt-1 text-sm text-slate-500">Messages submitted through Contact Us will appear here.</p></div>
      ) : (
        <div className="grid min-h-[460px] md:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)]">
          <div className={`divide-y divide-slate-100 ${detail ? "hidden md:block" : ""}`}>
            {messages.map((message) => (
              <button key={message.id} type="button" onClick={() => openMessage(message)} className={`w-full border-l-4 p-4 text-left transition-colors hover:bg-slate-50 ${selectedId === message.id ? "border-primary bg-primary/5" : "border-transparent"} ${message.isRead ? "" : "bg-blue-50/50"}`}>
                <div className="flex items-start gap-3"><span className={`mt-1 shrink-0 text-sm ${message.isRead ? "text-slate-400" : "text-primary"}`}>{message.isRead ? <FaEnvelopeOpen /> : <FaEnvelope />}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className={`truncate text-sm ${message.isRead ? "text-slate-700" : "text-slate-950"}`}>{message.fullName}</strong><time className="shrink-0 text-[10px] text-slate-400">{formatTime(message.createdAt)}</time></span><span className={`mt-1 block truncate text-sm ${message.isRead ? "font-medium text-slate-600" : "font-bold text-slate-900"}`}>{message.subject || "(No subject)"}</span><span className="mt-1 block truncate text-xs text-slate-500">{preview(message.message)}</span></span></div>
              </button>
            ))}
          </div>
          {detail && (
            <article className="p-5 sm:p-7">
              <button type="button" onClick={() => { setSelectedId(null); setDetail(null); }} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary md:hidden"><FaArrowLeft /> Back to messages</button>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Message details</p><h3 className="mt-2 text-xl font-bold text-slate-900">{detail.subject || "(No subject)"}</h3><time className="mt-1 block text-xs text-slate-500">{formatTime(detail.createdAt)}</time></div><div className="flex gap-2"><Button variant="outline" size="sm" disabled={busyId === detail.id} onClick={() => setRead(detail, !detail.isRead)} className="gap-2">{detail.isRead ? <><FaEnvelope /> Mark unread</> : <><FaCheck /> Mark read</>}</Button><Button variant="outline" size="sm" disabled={busyId === detail.id} onClick={() => deleteMessage(detail)} className="gap-2 text-red-600 hover:text-red-700"><FaTrash /> Delete</Button></div></div>
              <div className="grid gap-3 border-b border-slate-100 py-5 text-sm sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</p><p className="mt-1 font-semibold text-slate-800">{detail.fullName}</p></div><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</p><a href={`mailto:${detail.email}`} className="mt-1 block break-all text-primary hover:underline">{detail.email || "—"}</a></div><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</p><a href={`tel:${detail.phone}`} className="mt-1 inline-flex items-center gap-1 text-slate-700 hover:text-primary"><FaPhoneAlt className="text-xs" />{detail.phone || "—"}</a></div></div>
              <div className="whitespace-pre-wrap break-words py-6 text-sm leading-7 text-slate-700">{detail.message || "No message content."}</div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}