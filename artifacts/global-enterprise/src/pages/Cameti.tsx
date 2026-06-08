import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import {
  FaUsers, FaPlus, FaTrash, FaWhatsapp, FaArrowLeft,
  FaPhone, FaRupeeSign, FaTimes, FaCalendarAlt,
  FaCheckCircle, FaLock, FaGavel, FaStickyNote,
  FaExclamationTriangle, FaEdit, FaSave, FaHistory,
  FaCog, FaShareAlt,
} from "react-icons/fa";

/* ── Tokens ─────────────────────────────────────────────────── */
const NAVY = "#071B4A";
const GOLD = "#D4A017";
const GREEN = "#16a34a";
const RED = "#dc2626";
const CORRECT_PIN = "1103";

/* ── CSS ─────────────────────────────────────────────────────── */
const CSS = `
@keyframes ct-pop{0%{transform:scale(0.93);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes ct-up{0%{transform:translateY(16px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes ct-fade{0%{opacity:0}100%{opacity:1}}
@keyframes ct-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@keyframes ct-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.ct-pop{animation:ct-pop .28s cubic-bezier(.34,1.56,.64,1) both}
.ct-up{animation:ct-up .3s ease both}
.ct-fade{animation:ct-fade .25s ease both}
.ct-shake{animation:ct-shake .45s ease}
.ct-skeleton{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:400% 100%;animation:ct-shimmer 1.5s infinite linear}
`;

/* ── Helpers ─────────────────────────────────────────────────── */
const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN");
const todayISO = () => new Date().toISOString().split("T")[0];
const initials = (name: string) => name.trim().charAt(0).toUpperCase();
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_NAMES_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmtDate = (d: string) => {
  const dt = new Date(d + "T00:00:00");
  return `${dt.getDate()} ${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}`;
};

/* ── Types ───────────────────────────────────────────────────── */
interface CametiGroup {
  id: number; name: string; daily_amount: number; total_members: number;
  started_on: string; pin: string; created_at: string;
}
interface Member {
  id: number; group_id: number; name: string; phone: string;
  has_taken: boolean; sort_order: number;
  total_paid?: number; days_paid?: number;
}
interface CametiMonth {
  id: number; group_id: number; month_number: number; year: number; month: number;
  winner_member_id: number | null; winner_name: string | null;
  bid_amount: number | null; profit_per_member: number | null;
  daily_reduction: number | null; status: string;
}
interface Collection {
  id: number; group_id: number; member_id: number; collected_date: string;
  amount: number; note: string | null; member_name: string; member_phone: string;
}
interface MonthStat {
  month_id: number; total_collected: number; members_paid: number; entries: number;
}
interface GroupDetail extends CametiGroup { members: Member[]; months: CametiMonth[]; }

/* ══════════════════════════════════════════════════════════════
   PIN SCREEN
══════════════════════════════════════════════════════════════ */
function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 120); }, []);

  function handleInput(val: string) {
    if (shake) return;
    const d = val.replace(/\D/g, "").slice(0, 4);
    setPin(d); setError(false);
    if (d.length === 4) {
      setTimeout(() => {
        if (d === CORRECT_PIN) { sessionStorage.setItem("cameti_auth", "1"); onUnlock(); }
        else { setError(true); setShake(true); setTimeout(() => { setShake(false); setPin(""); }, 520); }
      }, 140);
    }
  }

  return (
    <Layout>
      <style>{CSS}</style>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 cursor-default"
        style={{ background: `linear-gradient(145deg, #0a1628 0%, #112044 50%, #071535 100%)` }}
        onClick={() => inputRef.current?.focus()}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-5" style={{ background: GOLD }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-5" style={{ background: GOLD }} />
        </div>
        <input ref={inputRef} type="password" inputMode="numeric" pattern="[0-9]*"
          maxLength={4} value={pin} onChange={e => handleInput(e.target.value)}
          autoFocus autoComplete="off" className="absolute opacity-0 pointer-events-none w-0 h-0" />
        <div className={`ct-pop relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden ${shake ? "ct-shake" : ""}`}
          style={{ border: error ? "2px solid #ef4444" : "2px solid transparent" }}>
          <div className="px-8 pt-10 pb-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
              style={{ background: `linear-gradient(135deg,${NAVY},#1e3a8a)` }}>
              <FaUsers className="text-white text-3xl" />
            </div>
            <h2 className="text-2xl font-black mb-1" style={{ color: NAVY }}>Daily Cameti</h2>
            <p className="text-[11px] font-bold tracking-widest mb-8" style={{ color: GOLD }}>APNA ENTERPRISE</p>
            <div className="flex gap-4 mb-6">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-4 h-4 rounded-full border-2 transition-all duration-200"
                  style={{
                    borderColor: pin.length > i ? NAVY : "#cbd5e1",
                    background: pin.length > i ? NAVY : "transparent",
                  }} />
              ))}
            </div>
            {error ? (
              <p className="text-sm font-bold text-red-500 flex items-center gap-1.5">
                <FaExclamationTriangle className="text-xs" /> Galat PIN, dobara try karo
              </p>
            ) : (
              <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                <span>⌨️</span> Keyboard se 4-digit PIN type karo
              </p>
            )}
            <p className="text-[11px] text-slate-300 mt-3 flex items-center gap-1.5">
              <FaLock className="text-[9px]" /> Private — Sirf aapke liye
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ── Shared UI ───────────────────────────────────────────────── */
function Modal({ title, subtitle, onClose, children, wide }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`ct-pop bg-white w-full ${wide ? "sm:max-w-lg" : "sm:max-w-sm"} rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400 transition-all">
            <FaTimes className="text-sm" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, placeholder, value, onChange, type = "text" }: {
  icon: React.ComponentType<{ className?: string }>; placeholder?: string;
  value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-blue-300 bg-white transition-colors">
      <Icon className="text-slate-300 text-sm flex-shrink-0" />
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 text-sm font-semibold outline-none text-slate-700 bg-transparent" />
    </div>
  );
}

function PrimaryBtn({ loading, label, loadingLabel, type = "submit", onClick, color }: {
  loading: boolean; label: string; loadingLabel: string;
  type?: "submit" | "button"; onClick?: () => void; color?: string;
}) {
  return (
    <button type={type} disabled={loading} onClick={onClick}
      className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
      style={{ background: color ?? `linear-gradient(135deg,${NAVY},#1e40af)` }}>
      {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{loadingLabel}</> : label}
    </button>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 px-3 py-2.5 rounded-xl">
      <FaExclamationTriangle className="flex-shrink-0" /><span>{children}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: "#EEF2FF" }}>
        <Icon className="text-2xl" style={{ color: NAVY }} />
      </div>
      <p className="font-extrabold text-slate-700 text-base">{title}</p>
      <p className="text-slate-400 text-sm mt-1.5 font-medium">{sub}</p>
    </div>
  );
}

function ConfirmDialog({ msg, sub, onConfirm, onCancel }: {
  msg: string; sub: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
      <div className="ct-pop bg-white rounded-3xl p-7 max-w-xs w-full shadow-2xl">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50">
          <FaExclamationTriangle className="text-red-500 text-xl" />
        </div>
        <p className="font-extrabold text-slate-800 text-center text-base mb-1">{msg}</p>
        <p className="text-sm text-slate-400 text-center mb-6">{sub}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600">Nahi</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>Haan, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GROUP DETAIL VIEW
══════════════════════════════════════════════════════════════ */
function GroupDetail({ groupId, onBack }: { groupId: number; onBack: () => void }) {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [summary, setSummary] = useState<Member[]>([]);
  const [monthStats, setMonthStats] = useState<MonthStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"aaj" | "members" | "months" | "boli">("aaj");

  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showBoli, setShowBoli] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [delMember, setDelMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [historyMember, setHistoryMember] = useState<Member | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, sRes, msRes] = await Promise.all([
        fetch(`/api/cameti/groups/${groupId}`),
        fetch(`/api/cameti/groups/${groupId}/summary`),
        fetch(`/api/cameti/groups/${groupId}/month-stats`),
      ]);
      const [g, s, ms] = await Promise.all([gRes.json(), sRes.json(), msRes.json()]);
      setGroup(g); setSummary(s); setMonthStats(ms);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !group) {
    return (
      <Layout>
        <style>{CSS}</style>
        <div className="flex-1 flex items-center justify-center" style={{ background: "#f4f6fb" }}>
          <div className="text-center">
            <div className="w-12 h-12 ct-skeleton rounded-2xl mx-auto mb-3" />
            <p className="text-slate-400 font-semibold text-sm">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentMonth = group.months.find(m => m.status === "open") ?? null;
  const latestClosed = [...group.months].filter(m => m.status === "closed").pop() ?? null;
  const reduction = latestClosed?.daily_reduction ?? 0;
  const effectiveDaily = group.daily_amount - reduction;

  /* ── Cumulative stats ── */
  const startDate = new Date(group.started_on + "T00:00:00");
  const daysElapsed = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / 86400000) + 1);
  const totalExpected = daysElapsed * effectiveDaily * group.members.length;
  const totalCollected = summary.reduce((s, m) => s + (m.total_paid ?? 0), 0);
  const totalPending = Math.max(0, totalExpected - totalCollected);
  const collectionPct = totalExpected > 0 ? Math.min(100, (totalCollected / totalExpected) * 100) : 0;
  const memberPending = summary
    .map(m => ({
      ...m,
      expected: daysElapsed * effectiveDaily,
      pending: Math.max(0, daysElapsed * effectiveDaily - (m.total_paid ?? 0)),
      pendingDays: Math.max(0, daysElapsed - Math.round((m.total_paid ?? 0) / effectiveDaily)),
    }))
    .filter(m => m.pending > 0)
    .sort((a, b) => b.pending - a.pending);

  /* ── WA helpers ── */
  function buildBulkWAReport() {
    const lines = [
      `🏦 *Apna Enterprise - Daily Cameti*`,
      `📅 ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
      ``,
      `📊 *${group!.name} — Poori Report*`,
      `⏳ Din Chale: ${daysElapsed} din`,
      `💰 Jama: ${fmt(totalCollected)}`,
      `❌ Pending: ${fmt(totalPending)}`,
      `📈 Progress: ${collectionPct.toFixed(1)}%`,
      ``,
    ];
    if (memberPending.length > 0) {
      lines.push(`⚠️ *Pending Members (${memberPending.length}):*`);
      memberPending.forEach(m => {
        lines.push(`• ${m.name} — ${fmt(m.pending)} (${m.pendingDays} din)`);
      });
      lines.push(``);
    } else {
      lines.push(`✅ Sab ne puri payment di hai!`);
      lines.push(``);
    }
    lines.push(`_Apna Enterprise, Firozepur_`);
    return encodeURIComponent(lines.join("\n"));
  }

  /* ── add member ── */
  async function addMember(name: string, phone: string) {
    const r = await fetch(`/api/cameti/groups/${group!.id}/members`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, sort_order: group!.members.length }),
    });
    if (!r.ok) throw new Error();
    await load();
  }

  /* ── edit member ── */
  async function doEditMember(id: number, name: string, phone: string) {
    await fetch(`/api/cameti/members/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setEditMember(null); await load();
  }

  /* ── delete member ── */
  async function doDeleteMember(id: number) {
    await fetch(`/api/cameti/members/${id}`, { method: "DELETE" });
    setDelMember(null); await load();
  }

  /* ── edit group ── */
  async function doEditGroup(name: string, daily: number, startedOn: string) {
    await fetch(`/api/cameti/groups/${group!.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, daily_amount: daily, started_on: startedOn }),
    });
    setShowSettings(false); await load();
  }

  /* ── boli ── */
  async function recordBoli(winner_member_id: number, bid_amount: number) {
    if (!currentMonth) return;
    await fetch(`/api/cameti/months/${currentMonth.id}/boli`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner_member_id, bid_amount, total_members: group!.total_members }),
    });
    const nextNum = (currentMonth.month_number ?? 0) + 1;
    const now = new Date();
    await fetch(`/api/cameti/groups/${group!.id}/months`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month_number: nextNum, year: now.getFullYear(), month: now.getMonth() + 1 }),
    });
    await load();
  }

  return (
    <Layout>
      <style>{CSS}</style>
      {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} onAdd={addMember} />}
      {showSettings && <GroupSettingsModal group={group} onClose={() => setShowSettings(false)} onSave={doEditGroup} />}
      {showBoli && (
        <BoliModal
          members={group.members}
          dailyAmount={group.daily_amount}
          totalMembers={group.total_members}
          onClose={() => setShowBoli(false)}
          onConfirm={async (wid, bid) => { await recordBoli(wid, bid); setShowBoli(false); }}
        />
      )}
      {delMember && (
        <ConfirmDialog msg={`${delMember.name} ko delete karo?`}
          sub="Inki saari collections bhi delete ho jaengi."
          onConfirm={() => doDeleteMember(delMember.id)} onCancel={() => setDelMember(null)} />
      )}
      {editMember && (
        <EditMemberModal member={editMember} onClose={() => setEditMember(null)} onSave={doEditMember} />
      )}
      {historyMember && (
        <MemberHistoryModal member={historyMember} effectiveDaily={effectiveDaily} onClose={() => setHistoryMember(null)} />
      )}

      <div className="flex-1 flex flex-col" style={{ background: "#f4f6fb" }}>

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden pb-20 pt-7 px-4"
          style={{ background: `linear-gradient(145deg,${NAVY} 0%,#1e3a8a 60%,#1e40af 100%)` }}>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden
            style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative max-w-3xl mx-auto">
            {/* Nav */}
            <div className="flex items-center justify-between mb-7">
              <button onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-2xl transition-all active:scale-95 text-white"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <FaArrowLeft className="text-xs" /> Back
              </button>
              <div className="flex items-center gap-2">
                {/* WA Report */}
                <a href={`https://wa.me/?text=${buildBulkWAReport()}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-2xl text-white transition-all active:scale-95"
                  style={{ background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.3)" }}
                  title="WA Pe Share Karo">
                  <FaShareAlt className="text-xs" /> Report
                </a>
                {/* Settings */}
                <button onClick={() => setShowSettings(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-2xl text-white transition-all active:scale-95"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)" }}
                  title="Group Settings">
                  <FaCog className="text-sm" />
                </button>
              </div>
            </div>

            {/* Group name */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: `${GOLD}bb` }}>Daily Cameti</p>
              <h1 className="text-xl font-black text-white">{group.name}</h1>
              <p className="text-white/40 text-xs font-medium mt-0.5">Started {fmtDate(group.started_on)}</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Members", val: group.members.length, c: "rgba(255,255,255,0.12)" },
                { label: "Daily", val: fmt(effectiveDaily), c: "rgba(212,160,23,0.2)" },
                { label: "Jama", val: fmt(totalCollected), c: "rgba(34,197,94,0.18)" },
                { label: "Pending", val: fmt(totalPending), c: "rgba(239,68,68,0.2)" },
              ].map(({ label, val, c }) => (
                <div key={label} className="rounded-2xl p-2.5 text-center"
                  style={{ background: c, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className="text-white font-black text-sm leading-none truncate">{val}</p>
                  <p className="text-white/50 text-[9px] font-bold uppercase mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-4 -mt-8 max-w-3xl mx-auto w-full">

          {/* ── Overview Card ── */}
          {group.members.length > 0 && (
            <div className="ct-up bg-white rounded-3xl shadow-sm mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">📊 Poori Cameti Ka Hisaab</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#EEF2FF", color: NAVY }}>
                    {daysElapsed} din chalu
                  </span>
                  {/* Boli button */}
                  <button onClick={() => setShowBoli(true)}
                    className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full transition-all active:scale-95"
                    style={{ background: `rgba(212,160,23,0.15)`, color: "#92400e", border: "1px solid rgba(212,160,23,0.3)" }}>
                    <FaGavel className="text-[9px]" /> Boli
                  </button>
                </div>
              </div>

              <div className="px-4 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold text-slate-400">Jama / Kul Expected</p>
                  <p className="text-[11px] font-extrabold" style={{ color: NAVY }}>
                    {fmt(totalCollected)} / {fmt(totalExpected)}
                  </p>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${collectionPct}%`,
                      background: collectionPct >= 90
                        ? `linear-gradient(90deg,${GREEN},#22c55e)`
                        : collectionPct >= 60
                          ? `linear-gradient(90deg,#f59e0b,#fbbf24)`
                          : `linear-gradient(90deg,${RED},#f87171)`,
                    }} />
                </div>
                <p className="text-right text-[9px] font-bold text-slate-400 mb-3">{collectionPct.toFixed(1)}% complete</p>

                <div className="grid grid-cols-3 gap-2 pb-3">
                  {[
                    { label: "Jama Hua", val: fmt(totalCollected), color: GREEN, bg: "#dcfce7" },
                    { label: "Pending", val: fmt(totalPending), color: RED, bg: "#fee2e2" },
                    { label: `${daysElapsed} din × ${fmt(effectiveDaily)}`, val: `${group.members.length} members`, color: NAVY, bg: "#EEF2FF" },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} className="rounded-2xl py-2.5 px-1 text-center" style={{ background: bg }}>
                      <p className="text-xs font-black leading-tight truncate" style={{ color }}>{val}</p>
                      <p className="text-[8px] font-bold text-slate-500 mt-0.5 truncate">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* WA Bulk Reminder */}
              {memberPending.length > 0 && (
                <div style={{ borderTop: "1px solid #f1f5f9" }} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: RED }}>
                      Baaki ({memberPending.length} log)
                    </p>
                    <div className="flex gap-2">
                      <a href={`https://wa.me/?text=${buildBulkWAReport()}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-xl text-white transition-all active:scale-95"
                        style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                        <FaWhatsapp className="text-[10px]" /> Bulk Reminder
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {memberPending.map((m, idx) => {
                      const waMsg = encodeURIComponent(`Sat Sri Akal ${m.name} Ji 🙏\n*Apna Enterprise — Cameti Reminder*\n\n📅 ${m.pendingDays} din ki payment baaki hai\n💰 Pending Amount: ${fmt(m.pending)}\n\nKripya jaldi payment karein. 🙏\n\n_Apna Enterprise, Firozepur_`);
                      return (
                        <div key={m.id}
                          className="ct-up flex items-center justify-between rounded-2xl px-3 py-2"
                          style={{ background: "#fff5f5", border: "1px solid #fee2e2", animationDelay: `${idx * 20}ms` }}>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
                              style={{ background: "#fee2e2", color: RED }}>{initials(m.name)}</div>
                            <div>
                              <p className="text-xs font-extrabold text-slate-800">{m.name}</p>
                              <p className="text-[9px] font-bold text-slate-400">{m.pendingDays} din · {m.days_paid} din paid</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black" style={{ color: RED }}>{fmt(m.pending)}</p>
                            {m.phone && (
                              <a href={`https://wa.me/91${m.phone.replace(/\D/g, "")}?text=${waMsg}`}
                                target="_blank" rel="noreferrer"
                                className="w-7 h-7 flex items-center justify-center rounded-xl text-white transition-all active:scale-90"
                                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                                <FaWhatsapp className="text-xs" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {memberPending.length === 0 && totalExpected > 0 && (
                <div style={{ borderTop: "1px solid #f1f5f9" }} className="px-4 py-3 flex items-center gap-2 justify-center">
                  <FaCheckCircle className="text-green-500" />
                  <p className="text-sm font-extrabold text-green-600">Sab ne puri cameti di hai! 🎉</p>
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {[
              { key: "aaj", label: "💰 Collection" },
              { key: "members", label: "👥 Members" },
              { key: "months", label: "📅 Months" },
              { key: "boli", label: "🏆 Auction" },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as typeof activeTab)}
                className="flex-shrink-0 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all active:scale-95"
                style={activeTab === t.key
                  ? { background: NAVY, color: "white", boxShadow: `0 4px 14px ${NAVY}55` }
                  : { background: "white", color: "#94a3b8", border: "1.5px solid #f1f5f9" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Collection ── */}
          {activeTab === "aaj" && (
            <CollectionSession
              groupId={group.id}
              members={group.members}
              effectiveDaily={effectiveDaily}
              currentMonthId={currentMonth?.id ?? null}
              onMonthNeeded={async () => {
                const now = new Date();
                await fetch(`/api/cameti/groups/${group!.id}/months`, {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ month_number: 1, year: now.getFullYear(), month: now.getMonth() + 1 }),
                });
                await load();
              }}
              onRefreshParent={load}
            />
          )}

          {/* ── Tab: Members ── */}
          {activeTab === "members" && (
            <div className="pb-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                  {group.members.length} Members
                </p>
                <button onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-2xl text-white transition-all active:scale-95"
                  style={{ background: `linear-gradient(135deg,${NAVY},#1e40af)` }}>
                  <FaPlus /> Add Member
                </button>
              </div>
              <div className="space-y-2.5">
                {summary.map((m, idx) => {
                  const mPending = Math.max(0, daysElapsed * effectiveDaily - (m.total_paid ?? 0));
                  return (
                    <div key={m.id}
                      className="ct-up bg-white rounded-3xl overflow-hidden shadow-sm"
                      style={{ border: `1.5px solid ${m.has_taken ? "#fef9c3" : "#f1f5f9"}`, animationDelay: `${idx*30}ms` }}>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-1.5 self-stretch flex-shrink-0 -ml-4 mr-1"
                          style={{ background: m.has_taken ? GOLD : mPending > 0 ? RED : GREEN }} />
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0"
                          style={{ background: m.has_taken ? "#fef9c3" : mPending > 0 ? "#fee2e2" : "#dcfce7",
                            color: m.has_taken ? "#92400e" : mPending > 0 ? RED : GREEN }}>
                          {initials(m.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-sm text-slate-800 truncate">{m.name}</p>
                            {m.has_taken && <span className="text-[9px] font-extrabold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex-shrink-0">🏆 Won</span>}
                          </div>
                          <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <FaPhone className="text-[8px]" />{m.phone}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-green-600">{fmt(m.total_paid ?? 0)}</p>
                          <p className="text-[9px] font-bold" style={{ color: mPending > 0 ? RED : "#94a3b8" }}>
                            {mPending > 0 ? `${fmt(mPending)} baaki` : `${m.days_paid ?? 0} din paid`}
                          </p>
                        </div>
                        {/* Action buttons */}
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button onClick={() => setHistoryMember(m)}
                            className="w-7 h-7 flex items-center justify-center rounded-xl bg-blue-50 text-blue-400 hover:bg-blue-100 transition-all" title="Payment History">
                            <FaHistory className="text-xs" />
                          </button>
                          <button onClick={() => setEditMember(m)}
                            className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all" title="Edit">
                            <FaEdit className="text-xs" />
                          </button>
                          <button onClick={() => setDelMember(m)}
                            className="w-7 h-7 flex items-center justify-center rounded-xl text-slate-200 hover:text-red-400 hover:bg-red-50 transition-all" title="Delete">
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                      {/* Mini progress bar */}
                      {daysElapsed > 0 && (
                        <div className="h-1 bg-slate-100 mx-4 mb-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, ((m.total_paid ?? 0) / (daysElapsed * effectiveDaily)) * 100)}%`,
                              background: mPending > 0 ? `linear-gradient(90deg,${RED},#f87171)` : `linear-gradient(90deg,${GREEN},#22c55e)`,
                            }} />
                        </div>
                      )}
                    </div>
                  );
                })}
                {summary.length === 0 && <EmptyState icon={FaUsers} title="Koi member nahi" sub="Add Member se member add karo" />}
              </div>
            </div>
          )}

          {/* ── Tab: Months ── */}
          {activeTab === "months" && (
            <div className="pb-10 space-y-3">
              {group.months.length === 0 && (
                <EmptyState icon={FaCalendarAlt} title="Koi month nahi" sub="Pehli collection karo — month apne aap ban jaega" />
              )}
              {[...group.months].reverse().map((mn, idx) => {
                const ms = monthStats.find(s => s.month_id === mn.id);
                const monthExpected = group.members.length * effectiveDaily * 30;
                const monthPct = ms && monthExpected > 0 ? Math.min(100, (ms.total_collected / monthExpected) * 100) : 0;
                return (
                  <div key={mn.id}
                    className="ct-up bg-white rounded-3xl p-5 shadow-sm"
                    style={{ border: `1.5px solid ${mn.status === "open" ? "#bfdbfe" : "#f1f5f9"}`, animationDelay: `${idx*35}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black" style={{ color: NAVY }}>Month {mn.month_number}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${mn.status === "open" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                          {mn.status === "open" ? "🟢 Active" : "✅ Closed"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">
                        {MONTH_NAMES_FULL[(mn.month - 1) % 12]} {mn.year}
                      </p>
                    </div>

                    {/* Month collection stats */}
                    {ms && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <p className="text-[10px] font-bold text-slate-400">Collection Progress</p>
                          <p className="text-[10px] font-extrabold" style={{ color: NAVY }}>{fmt(ms.total_collected)}</p>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                          <div className="h-full rounded-full" style={{
                            width: `${monthPct}%`,
                            background: mn.status === "closed" ? `linear-gradient(90deg,${GREEN},#22c55e)` : `linear-gradient(90deg,#3b82f6,#6366f1)`
                          }} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Jama", val: fmt(ms.total_collected), c: "#dcfce7", tc: GREEN },
                            { label: "Members Paid", val: `${ms.members_paid}/${group.members.length}`, c: "#EEF2FF", tc: NAVY },
                            { label: "Entries", val: ms.entries, c: "#fef9c3", tc: "#92400e" },
                          ].map(({ label, val, c, tc }) => (
                            <div key={label} className="rounded-xl py-2 text-center" style={{ background: c }}>
                              <p className="text-xs font-black" style={{ color: tc }}>{val}</p>
                              <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mn.status === "closed" && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[
                          { label: "Boli Amount", val: fmt(mn.bid_amount ?? 0), c: "#fef9c3", tc: "#92400e" },
                          { label: "Profit/Member", val: fmt(mn.profit_per_member ?? 0), c: "#dcfce7", tc: GREEN },
                          { label: "Daily Kami", val: `−${fmt(mn.daily_reduction ?? 0)}`, c: "#fee2e2", tc: RED },
                        ].map(({ label, val, c, tc }) => (
                          <div key={label} className="rounded-2xl p-2.5 text-center" style={{ background: c }}>
                            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
                            <p className="text-sm font-black" style={{ color: tc }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {mn.winner_name && (
                      <div className="mt-3 flex items-center gap-2 bg-yellow-50 rounded-2xl px-3 py-2">
                        <FaGavel className="text-yellow-600 text-sm flex-shrink-0" />
                        <p className="text-sm font-extrabold text-yellow-800">Winner: {mn.winner_name}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Tab: Boli History ── */}
          {activeTab === "boli" && (
            <div className="pb-10 space-y-3">
              <div className="flex justify-end mb-2">
                <button onClick={() => setShowBoli(true)}
                  className="flex items-center gap-2 text-xs font-extrabold px-4 py-2 rounded-2xl text-white transition-all active:scale-95"
                  style={{ background: `linear-gradient(135deg,${GOLD},#b8860b)` }}>
                  <FaGavel /> New Boli
                </button>
              </div>
              {group.months.filter(m => m.status === "closed").length === 0 && (
                <EmptyState icon={FaGavel} title="Koi auction nahi" sub="New Boli button se auction record karo" />
              )}
              {group.months.filter(m => m.status === "closed").map((mn, idx) => (
                <div key={mn.id}
                  className="ct-up bg-white rounded-3xl p-5 shadow-sm"
                  style={{ border: "1.5px solid #fef9c3", animationDelay: `${idx*35}ms` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Month {mn.month_number} · {MONTH_NAMES[(mn.month - 1) % 12]} {mn.year}</p>
                      <p className="text-xl font-black" style={{ color: NAVY }}>🏆 {mn.winner_name ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black" style={{ color: GOLD }}>{fmt(mn.bid_amount ?? 0)}</p>
                      <p className="text-[10px] font-bold text-slate-400">Boli Amount</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <div className="flex-1 bg-green-50 rounded-2xl p-2.5 text-center">
                      <p className="text-[9px] font-bold text-green-700 uppercase">Profit per Member</p>
                      <p className="text-base font-black text-green-700">{fmt(mn.profit_per_member ?? 0)}</p>
                    </div>
                    <div className="flex-1 bg-red-50 rounded-2xl p-2.5 text-center">
                      <p className="text-[9px] font-bold text-red-600 uppercase">Daily Reduction</p>
                      <p className="text-base font-black text-red-600">−{fmt(mn.daily_reduction ?? 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ══════════════════════════════════════════════════════════════
   COLLECTION SESSION
══════════════════════════════════════════════════════════════ */
function CollectionSession({ groupId, members, effectiveDaily, currentMonthId, onMonthNeeded, onRefreshParent }: {
  groupId: number; members: Member[]; effectiveDaily: number;
  currentMonthId: number | null; onMonthNeeded: () => Promise<void>;
  onRefreshParent: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [existing, setExisting] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [showNoteFor, setShowNoteFor] = useState<number | null>(null);

  const fetchExisting = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/cameti/groups/${groupId}/collections?date=${d}`);
      const cols: Collection[] = await r.json();
      setExisting(cols);
      const paidIds = new Set(cols.map(c => c.member_id));
      const newChecked: Record<number, boolean> = {};
      const newAmounts: Record<number, string> = {};
      members.forEach(m => {
        if (!paidIds.has(m.id)) {
          newChecked[m.id] = true;
          newAmounts[m.id] = String(effectiveDaily);
        }
      });
      setChecked(newChecked);
      setAmounts(newAmounts);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [groupId, members, effectiveDaily]);

  useEffect(() => { fetchExisting(date); setSaved(false); }, [date, fetchExisting]);

  const paidIds = new Set(existing.map(c => c.member_id));
  const unpaidMembers = members.filter(m => !paidIds.has(m.id));
  const paidMembers = members.filter(m => paidIds.has(m.id));
  const selectedCount = Object.values(checked).filter(Boolean).length;
  const total = members
    .filter(m => !paidIds.has(m.id) && checked[m.id])
    .reduce((s, m) => s + (Number(amounts[m.id]) || 0), 0);
  const totalExpected = members.length * effectiveDaily;
  const todayCollected = existing.reduce((s, c) => s + c.amount, 0);
  const isToday = date === todayISO();

  function toggleAll() {
    const allChecked = unpaidMembers.every(m => checked[m.id]);
    const next: Record<number, boolean> = {};
    unpaidMembers.forEach(m => { next[m.id] = !allChecked; });
    setChecked(prev => ({ ...prev, ...next }));
  }

  async function saveRound() {
    const entries = unpaidMembers
      .filter(m => checked[m.id] && Number(amounts[m.id]) > 0)
      .map(m => ({
        member_id: m.id,
        amount: Number(amounts[m.id]),
        collected_date: date,
        month_id: currentMonthId,
        note: notes[m.id] || undefined,
      }));
    if (!entries.length) return;
    if (!currentMonthId) await onMonthNeeded();
    setSaving(true);
    try {
      await fetch(`/api/cameti/groups/${groupId}/collections`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      setSaved(true);
      setNotes({});
      await fetchExisting(date);
      onRefreshParent();
    } finally { setSaving(false); }
  }

  async function deleteEntry(id: number) {
    await fetch(`/api/cameti/collections/${id}`, { method: "DELETE" });
    await fetchExisting(date);
    onRefreshParent();
  }

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="pb-20">
      {/* Date bar */}
      <div className="bg-white rounded-3xl shadow-sm mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0" }}>
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-slate-400 text-sm flex-shrink-0" />
            <input type="date" value={date} max={todayISO()}
              onChange={e => { setDate(e.target.value); setSaved(false); }}
              className="flex-1 text-sm font-bold outline-none text-slate-700 bg-transparent" />
            {!isToday && (
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">
                Pehle Ki Date
              </span>
            )}
            <button onClick={() => setDate(todayISO())}
              className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl"
              style={{ background: isToday ? "#EEF2FF" : "#f1f5f9", color: NAVY }}>
              Aaj
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-extrabold text-slate-500">{dateLabel} — Collection</p>
            <p className="text-xs font-extrabold" style={{ color: NAVY }}>{fmt(todayCollected)} / {fmt(totalExpected)}</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, totalExpected > 0 ? (todayCollected / totalExpected) * 100 : 0)}%`,
                background: `linear-gradient(90deg,${GREEN},#22c55e)`,
              }} />
          </div>
          <div className="grid grid-cols-3 gap-2 pb-3">
            {[
              { label: "Jama", val: fmt(todayCollected), color: GREEN, bg: "#dcfce7" },
              { label: "Baaki", val: `${unpaidMembers.length} log`, color: RED, bg: "#fee2e2" },
              { label: "Paid", val: `${paidIds.size}/${members.length}`, color: NAVY, bg: "#EEF2FF" },
            ].map(({ label, val, color, bg }) => (
              <div key={label} className="rounded-2xl py-2 text-center" style={{ background: bg }}>
                <p className="text-sm font-black" style={{ color }}>{val}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* PENDING */}
          {unpaidMembers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: RED }} />
                  <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    Baaki / Pending ({unpaidMembers.length})
                  </p>
                </div>
                <button onClick={toggleAll}
                  className="text-[10px] font-extrabold px-3 py-1 rounded-xl border transition-all active:scale-95"
                  style={{ borderColor: "#e2e8f0", color: NAVY, background: "white" }}>
                  {unpaidMembers.every(m => checked[m.id]) ? "✗ Sab Hatao" : "✓ Sab Select"}
                </button>
              </div>

              <div className="space-y-2">
                {unpaidMembers.map((m, idx) => {
                  const isChecked = !!checked[m.id];
                  const amt = Number(amounts[m.id] ?? effectiveDaily);
                  const daysCovered = effectiveDaily > 0 ? Math.round(amt / effectiveDaily) : 1;
                  const isMultiDay = amt !== effectiveDaily && amt > 0;
                  const waMsg = encodeURIComponent(`Sat Sri Akal ${m.name} Ji 🙏\n*Apna Enterprise — Cameti Reminder*\n\nAaj ki cameti ₹${effectiveDaily} pending hai.\nKripya jaldi payment karein. 🙏\n\n_Apna Enterprise, Firozepur_`);

                  return (
                    <div key={m.id}
                      className="ct-up bg-white rounded-2xl shadow-sm overflow-hidden transition-all"
                      style={{
                        border: `1.5px solid ${isChecked ? "#bfdbfe" : "#f1f5f9"}`,
                        background: isChecked ? "#f0f9ff" : "white",
                        animationDelay: `${idx * 25}ms`,
                      }}>
                      <div className="flex items-center gap-3 px-3 py-3">
                        {/* Checkbox */}
                        <button onClick={() => setChecked(p => ({ ...p, [m.id]: !p[m.id] }))}
                          className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all"
                          style={{ borderColor: isChecked ? "#3b82f6" : "#cbd5e1", background: isChecked ? "#3b82f6" : "white" }}>
                          {isChecked && <span className="text-white text-[10px] font-black">✓</span>}
                        </button>

                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                          style={{ background: isChecked ? "#dbeafe" : "#fee2e2", color: isChecked ? "#1d4ed8" : RED }}>
                          {initials(m.name)}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-sm text-slate-800 truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{m.phone}</p>
                        </div>

                        {/* Amount input */}
                        <div className={`flex items-center gap-1 border-2 rounded-xl px-2 py-1.5 transition-all ${isChecked ? "border-blue-200 bg-white" : "border-slate-100 bg-slate-50 opacity-50"}`}>
                          <FaRupeeSign className="text-slate-400 text-[10px] flex-shrink-0" />
                          <input type="number" disabled={!isChecked}
                            value={amounts[m.id] ?? effectiveDaily}
                            onChange={e => setAmounts(p => ({ ...p, [m.id]: e.target.value }))}
                            className="w-14 text-sm font-extrabold outline-none text-slate-700 bg-transparent disabled:text-slate-300" />
                        </div>

                        {/* Note toggle */}
                        {isChecked && (
                          <button onClick={() => setShowNoteFor(showNoteFor === m.id ? null : m.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
                            style={{ background: notes[m.id] ? "#fef9c3" : "#f1f5f9", color: notes[m.id] ? "#92400e" : "#94a3b8" }}>
                            <FaStickyNote className="text-xs" />
                          </button>
                        )}

                        {/* WA */}
                        {m.phone && (
                          <a href={`https://wa.me/91${m.phone.replace(/\D/g, "")}?text=${waMsg}`}
                            target="_blank" rel="noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-white flex-shrink-0 transition-all active:scale-90"
                            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                            <FaWhatsapp className="text-sm" />
                          </a>
                        )}
                      </div>

                      {/* Note input */}
                      {isChecked && showNoteFor === m.id && (
                        <div className="px-3 pb-2.5">
                          <input
                            type="text"
                            placeholder="Note likhein (optional)..."
                            value={notes[m.id] ?? ""}
                            onChange={e => setNotes(p => ({ ...p, [m.id]: e.target.value }))}
                            className="w-full text-xs font-semibold outline-none bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-slate-700"
                          />
                        </div>
                      )}

                      {/* Multi-day / custom badge */}
                      {isChecked && isMultiDay && (
                        <div className="px-3 pb-2.5">
                          <div className="flex items-center gap-1.5 bg-amber-50 rounded-xl px-2.5 py-1.5">
                            <FaStickyNote className="text-amber-400 text-[10px]" />
                            <p className="text-[10px] font-bold text-amber-700">
                              {amt > effectiveDaily
                                ? `${daysCovered} din ki cameti (${fmt(amt)})`
                                : `Custom: ${fmt(amt)}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Save button */}
              {selectedCount > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between bg-blue-50 rounded-2xl px-4 py-3 mb-3 border border-blue-100">
                    <p className="text-sm font-bold text-blue-700">{selectedCount} member — Total</p>
                    <p className="text-base font-black" style={{ color: NAVY }}>{fmt(total)}</p>
                  </div>
                  <button disabled={saving} onClick={saveRound}
                    className="w-full py-4 rounded-2xl font-extrabold text-base text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg,${GREEN},#15803d)` }}>
                    <FaSave />
                    {saving ? "Save ho rha hai..." : `✓ Collection Save Karo (${fmt(total)})`}
                  </button>
                  {saved && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                      <FaCheckCircle /> Saved! Collection record ho gayi.
                    </div>
                  )}
                </div>
              )}
              {selectedCount === 0 && (
                <div className="mt-3 text-center text-slate-400 text-sm font-semibold py-2">
                  Kisi member ko select karo
                </div>
              )}
            </div>
          )}

          {unpaidMembers.length === 0 && members.length > 0 && (
            <div className="text-center py-8 bg-white rounded-3xl mb-4" style={{ border: "1.5px solid #bbf7d0" }}>
              <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
              <p className="font-extrabold text-slate-700 text-base">Sab ne de di! 🎉</p>
              <p className="text-slate-400 text-sm mt-1">{dateLabel} ki saari collection ho gayi.</p>
            </div>
          )}

          {members.length === 0 && (
            <EmptyState icon={FaUsers} title="Koi member nahi" sub="Members tab se member add karo" />
          )}

          {/* PAID */}
          {paidMembers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-2 h-2 rounded-full" style={{ background: GREEN }} />
                <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                  Jama Ho Gayi ({paidMembers.length})
                </p>
              </div>
              <div className="space-y-2">
                {paidMembers.map((m, idx) => {
                  const col = existing.find(c => c.member_id === m.id);
                  const daysCovered = col && effectiveDaily > 0 ? Math.round(col.amount / effectiveDaily) : 1;
                  return (
                    <div key={m.id}
                      className="ct-up bg-white rounded-2xl flex items-center gap-3 px-4 py-3.5 shadow-sm"
                      style={{ border: "1.5px solid #bbf7d0", animationDelay: `${idx * 25}ms` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ background: "#dcfce7", color: GREEN }}>
                        {initials(m.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-slate-800 truncate">{m.name}</p>
                        {col?.note && <p className="text-[9px] text-amber-600 font-semibold">📝 {col.note}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-green-600">{fmt(col?.amount ?? 0)}</p>
                        {col && daysCovered > 1 ? (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            {daysCovered} din
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                            ✓ Paid
                          </span>
                        )}
                      </div>
                      {col && (
                        <button onClick={() => deleteEntry(col.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-xl text-slate-200 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Edit Member Modal ── */
function EditMemberModal({ member, onClose, onSave }: {
  member: Member; onClose: () => void;
  onSave: (id: number, name: string, phone: string) => Promise<void>;
}) {
  const [name, setName] = useState(member.name);
  const [phone, setPhone] = useState(member.phone);
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setErr("Name aur phone required hai"); return; }
    setSaving(true); setErr("");
    try { await onSave(member.id, name, phone); }
    catch { setErr("Kuch galat hua. Dobara try karo."); } finally { setSaving(false); }
  }

  return (
    <Modal title="Member Edit Karo" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <InputField icon={FaUsers} placeholder="Member ka naam" value={name} onChange={setName} />
        <InputField icon={FaPhone} placeholder="Phone number" value={phone} onChange={setPhone} type="tel" />
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Save Karo" loadingLabel="Saving..." />
      </form>
    </Modal>
  );
}

/* ── Group Settings Modal ── */
function GroupSettingsModal({ group, onClose, onSave }: {
  group: GroupDetail; onClose: () => void;
  onSave: (name: string, daily: number, startedOn: string) => Promise<void>;
}) {
  const [name, setName] = useState(group.name);
  const [daily, setDaily] = useState(String(group.daily_amount));
  const [startedOn, setStartedOn] = useState(group.started_on);
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr("Naam required hai"); return; }
    setSaving(true); setErr("");
    try { await onSave(name, Number(daily) || group.daily_amount, startedOn); }
    catch { setErr("Kuch galat hua."); } finally { setSaving(false); }
  }

  return (
    <Modal title="⚙️ Group Settings" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Group Name</p>
          <InputField icon={FaEdit} placeholder="Group ka naam" value={name} onChange={setName} />
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Daily Amount (per member)</p>
          <InputField icon={FaRupeeSign} placeholder="Daily amount" value={daily} onChange={setDaily} type="number" />
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</p>
          <InputField icon={FaCalendarAlt} value={startedOn} onChange={setStartedOn} type="date" />
        </div>
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Settings Save Karo" loadingLabel="Saving..." />
      </form>
    </Modal>
  );
}

/* ── Member History Modal ── */
function MemberHistoryModal({ member, effectiveDaily, onClose }: {
  member: Member; effectiveDaily: number; onClose: () => void;
}) {
  const [history, setHistory] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cameti/members/${member.id}/history`)
      .then(r => r.json())
      .then(d => setHistory(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [member.id]);

  const totalPaid = history.reduce((s, c) => s + c.amount, 0);

  return (
    <Modal title={`${member.name} — History`} subtitle={`Total Paid: ${fmt(totalPaid)}`} onClose={onClose} wide>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8 text-slate-400 font-semibold">Koi payment nahi mili</div>
      ) : (
        <div className="space-y-2">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Total Paid", val: fmt(totalPaid), c: "#dcfce7", tc: GREEN },
              { label: "Entries", val: history.length, c: "#EEF2FF", tc: NAVY },
              { label: "Avg Per Entry", val: fmt(Math.round(totalPaid / (history.length || 1))), c: "#fef9c3", tc: "#92400e" },
            ].map(({ label, val, c, tc }) => (
              <div key={label} className="rounded-2xl py-2.5 text-center" style={{ background: c }}>
                <p className="text-sm font-black" style={{ color: tc }}>{val}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          {/* Entries */}
          {history.map((c, idx) => {
            const daysCovered = effectiveDaily > 0 ? Math.round(c.amount / effectiveDaily) : 1;
            return (
              <div key={c.id}
                className="ct-up flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3"
                style={{ animationDelay: `${idx * 20}ms` }}>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{fmtDate(c.collected_date)}</p>
                  {c.note && <p className="text-[10px] text-amber-600 font-semibold">📝 {c.note}</p>}
                  {daysCovered > 1 && (
                    <p className="text-[10px] text-blue-500 font-bold">{daysCovered} din ki payment</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-600">{fmt(c.amount)}</p>
                  {daysCovered > 1 && (
                    <p className="text-[9px] text-slate-400">{daysCovered}× {fmt(effectiveDaily)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

/* ── Add Member Modal ── */
function AddMemberModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: string, p: string) => Promise<void> }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setErr("Naam aur phone required hai"); return; }
    setSaving(true); setErr("");
    try { await onAdd(name, phone); onClose(); }
    catch { setErr("Kuch galat hua. Dobara try karo."); } finally { setSaving(false); }
  }
  return (
    <Modal title="Member Add Karo" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <InputField icon={FaUsers} placeholder="Member ka naam" value={name} onChange={setName} />
        <InputField icon={FaPhone} placeholder="Phone number" value={phone} onChange={setPhone} type="tel" />
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Add Member" loadingLabel="Adding..." />
      </form>
    </Modal>
  );
}

/* ── Boli Modal ── */
function BoliModal({ members, dailyAmount, totalMembers, onClose, onConfirm }: {
  members: Member[]; dailyAmount: number; totalMembers: number;
  onClose: () => void; onConfirm: (winnerId: number, bid: number) => Promise<void>;
}) {
  const eligible = members.filter(m => !m.has_taken);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");
  const bid = Number(bidAmount);
  const profitPer = bid > 0 ? Math.floor(bid / totalMembers) : 0;
  const dailyReduction = profitPer > 0 ? Math.floor(profitPer / 30) : 0;
  const newDaily = dailyAmount - dailyReduction;

  async function submit() {
    if (!winnerId) { setErr("Winner select karo"); return; }
    if (bid <= 0) { setErr("Boli amount enter karo"); return; }
    setSaving(true); setErr("");
    try { await onConfirm(winnerId, bid); onClose(); }
    catch { setErr("Kuch galat hua."); } finally { setSaving(false); }
  }

  return (
    <Modal title="🏆 Auction Record Karo" subtitle="Is month ki boli" onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Winner Select Karo</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {eligible.map(m => (
              <button key={m.id} type="button" onClick={() => setWinnerId(m.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 text-left transition-all"
                style={winnerId === m.id ? { borderColor: GOLD, background: "#fef9c3" } : { borderColor: "#f1f5f9", background: "white" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: "#EEF2FF", color: NAVY }}>{initials(m.name)}</div>
                <div className="min-w-0">
                  <p className="font-extrabold text-xs text-slate-800 truncate">{m.name}</p>
                  <p className="text-[9px] text-slate-400">{m.phone}</p>
                </div>
              </button>
            ))}
          </div>
          {eligible.length === 0 && (
            <p className="text-sm text-slate-400 font-medium text-center py-3">Sab members ne le li hai cameti!</p>
          )}
        </div>
        <InputField icon={FaRupeeSign} placeholder="Boli Amount (e.g. 8000)" value={bidAmount} onChange={setBidAmount} type="number" />
        {bid > 0 && (
          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Boli</p>
              <p className="text-sm font-black" style={{ color: GOLD }}>{fmt(bid)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Profit/Member</p>
              <p className="text-sm font-black text-green-600">{fmt(profitPer)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase">New Daily</p>
              <p className="text-sm font-black" style={{ color: RED }}>{fmt(newDaily)}</p>
            </div>
          </div>
        )}
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Auction Confirm Karo" loadingLabel="Saving..."
          type="button" onClick={submit} color={`linear-gradient(135deg,${GOLD},#b8860b)`} />
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   GROUPS LIST (HOME)
══════════════════════════════════════════════════════════════ */
function GroupsList({ onSelect }: { onSelect: (id: number) => void }) {
  const [groups, setGroups] = useState<CametiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/cameti/groups"); setGroups(await r.json()); }
    catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createGroup(name: string, dailyAmt: number, startDate: string) {
    const r = await fetch("/api/cameti/groups", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, daily_amount: dailyAmt, total_members: 12, started_on: startDate }),
    });
    if (!r.ok) throw new Error();
    await load();
  }

  const totalMembers = groups.reduce((s, g) => s + g.total_members, 0);

  return (
    <Layout>
      <style>{CSS}</style>
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={createGroup} />}

      <div className="flex-1 flex flex-col" style={{ background: "#f4f6fb" }}>
        {/* Hero */}
        <div className="relative overflow-hidden pb-24 pt-7 px-4"
          style={{ background: `linear-gradient(145deg,#0a1628 0%,#112044 55%,#071535 100%)` }}>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden
            style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-24 opacity-10 pointer-events-none" aria-hidden
            style={{ background: `radial-gradient(ellipse at 50% 0%,${GOLD} 0%,transparent 70%)` }} />

          <div className="relative max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg,${GOLD}33,${GOLD}11)`, border: `1px solid ${GOLD}44` }}>
                  <FaUsers className="text-lg" style={{ color: GOLD }} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white leading-none">Daily Cameti</h1>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: `${GOLD}bb`, letterSpacing: "0.15em" }}>
                    APNA ENTERPRISE
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl transition-all active:scale-95 text-white"
                style={{ background: `linear-gradient(135deg,${GOLD},#b8860b)` }}>
                <FaPlus /> New Group
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Groups", val: groups.length, c: "rgba(255,255,255,0.1)" },
                { label: "Total Members", val: totalMembers, c: "rgba(34,197,94,0.18)" },
                { label: "Active Groups", val: groups.length, c: `rgba(212,160,23,0.18)` },
              ].map(({ label, val, c }) => (
                <div key={label} className="rounded-2xl p-3.5 text-center" style={{ background: c, border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-white font-black text-xl leading-none">{val}</p>
                  <p className="text-white/50 text-[9px] font-bold uppercase mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Groups */}
        <div className="px-4 -mt-12 max-w-3xl mx-auto w-full pb-10">
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-24 ct-skeleton rounded-3xl" />)}
            </div>
          ) : groups.length === 0 ? (
            <EmptyState icon={FaUsers} title="Koi cameti group nahi" sub="'New Group' se pehla group banao" />
          ) : (
            <div className="space-y-3">
              {groups.map((g, idx) => {
                const start = new Date(g.started_on + "T00:00:00");
                const days = Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1);
                return (
                  <button key={g.id} onClick={() => onSelect(g.id)}
                    className="ct-up w-full bg-white rounded-3xl p-5 text-left shadow-sm hover:shadow-lg transition-all active:scale-[0.98]"
                    style={{ border: "1.5px solid #f1f5f9", animationDelay: `${idx*40}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl"
                          style={{ background: "#EEF2FF", color: NAVY }}>
                          {initials(g.name)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-800">{g.name}</h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Started {fmtDate(g.started_on)} · {days} din chalu
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-black" style={{ color: NAVY }}>{fmt(g.daily_amount)}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Daily/Member</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                        {g.total_members} Members
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: GREEN }}>
                        {fmt(g.daily_amount * g.total_members)}/day Group Total
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ── Create Group Modal ── */
function CreateGroupModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, daily: number, startDate: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [daily, setDaily] = useState("300");
  const [startDate, setStartDate] = useState(todayISO());
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr("Group ka naam enter karo"); return; }
    setSaving(true); setErr("");
    try { await onCreate(name, Number(daily) || 300, startDate); onClose(); }
    catch { setErr("Kuch galat hua."); } finally { setSaving(false); }
  }

  return (
    <Modal title="New Cameti Group" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Group Name</p>
          <InputField icon={FaEdit} placeholder="e.g. Apna Cameti 2025" value={name} onChange={setName} />
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Daily Amount (per member)</p>
          <InputField icon={FaRupeeSign} placeholder="e.g. 300" value={daily} onChange={setDaily} type="number" />
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</p>
          <InputField icon={FaCalendarAlt} value={startDate} onChange={setStartDate} type="date" />
        </div>
        {/* Preview */}
        {Number(daily) > 0 && (
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Preview (12 members default)</p>
            <p className="text-sm font-extrabold text-slate-700">
              {fmt(Number(daily))} × 12 = <span style={{ color: GREEN }}>{fmt(Number(daily) * 12)}/day</span>
            </p>
          </div>
        )}
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Group Banao" loadingLabel="Creating..." />
      </form>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT — PIN + ROUTER
══════════════════════════════════════════════════════════════ */
export default function Cameti() {
  const [authed, setAuthed] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("cameti_auth") === "1") setAuthed(true);
  }, []);

  if (!authed) return <PinScreen onUnlock={() => setAuthed(true)} />;
  if (selectedGroupId !== null)
    return <GroupDetail groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />;
  return <GroupsList onSelect={setSelectedGroupId} />;
}
