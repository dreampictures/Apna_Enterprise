import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import {
  FaUsers, FaPlus, FaTrash, FaWhatsapp, FaArrowLeft,
  FaPhone, FaRupeeSign, FaTimes, FaCalendarAlt,
  FaCheckCircle, FaLock, FaGavel, FaChartBar,
  FaUserCheck, FaMoneyBillWave, FaStickyNote,
  FaExclamationTriangle, FaEdit,
} from "react-icons/fa";

/* ── Tokens ─────────────────────────────────────────────────── */
const NAVY = "#071B4A";
const GOLD = "#D4A017";
const GREEN = "#16a34a";
const RED = "#dc2626";
const CORRECT_PIN = "1103";
const PHONE_NUM = "8437566186";

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
const fmtDate = (d: string) => {
  const dt = new Date(d);
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
        <div className="ct-pop relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
          <div className="h-1.5" style={{ background: `linear-gradient(90deg,${GOLD},#f0c040,${GOLD})` }} />
          <div className="px-10 pt-10 pb-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-5"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1e40af)` }}>
              <FaUsers className="text-3xl text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: NAVY }}>Daily Cameti</h1>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-8" style={{ color: GOLD }}>APNA ENTERPRISE</p>
            <div className={`flex gap-5 mb-4 ${shake ? "ct-shake" : ""}`}>
              {[0,1,2,3].map(i => (
                <div key={i} className="transition-all duration-200 rounded-full"
                  style={{ width: i < pin.length ? 18 : 16, height: i < pin.length ? 18 : 16,
                    background: i < pin.length ? NAVY : "transparent",
                    border: `2.5px solid ${i < pin.length ? NAVY : "#cbd5e1"}`,
                    boxShadow: i < pin.length ? `0 0 12px ${NAVY}66` : "none" }} />
              ))}
            </div>
            <div className="h-7 flex items-center justify-center mb-6">
              {error
                ? <p className="ct-fade text-sm font-bold text-red-500 bg-red-50 px-4 py-1 rounded-full">❌ Galat PIN</p>
                : <p className="text-sm text-slate-400 font-medium">⌨️ Keyboard se 4-digit PIN type karo</p>}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <FaLock className="text-[11px]" /><span>Private — Sirf aapke liye</span>
            </div>
          </div>
        </div>
        <p className="mt-8 text-white/30 text-xs font-semibold tracking-widest uppercase">Apna Enterprise · Firozepur</p>
      </div>
    </Layout>
  );
}

/* ── Reusable UI ─────────────────────────────────────────────── */
function Modal({ title, subtitle, onClose, children, wide }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(7,27,74,0.55)", backdropFilter: "blur(6px)" }}>
      <div className={`ct-pop bg-white rounded-t-[28px] sm:rounded-[24px] shadow-2xl w-full ${wide ? "sm:max-w-xl" : "sm:max-w-md"}`}>
        <div className="h-1 rounded-t-[24px]" style={{ background: `linear-gradient(90deg,${GOLD},#f0c040,${GOLD})` }} />
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold" style={{ color: NAVY }}>{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all">
            <FaTimes className="text-sm" />
          </button>
        </div>
        <div className="px-6 py-5 pb-7 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, placeholder, value, onChange, type = "text", disabled }: {
  icon: React.ElementType; placeholder?: string; value: string;
  onChange: (v: string) => void; type?: string; disabled?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3 transition-all ${disabled ? "bg-slate-50 border-slate-100" : "border-slate-100 bg-slate-50 focus-within:border-blue-400 focus-within:bg-blue-50/30"}`}>
      <Icon className="text-slate-300 text-sm flex-shrink-0" />
      <input className="flex-1 text-sm outline-none bg-transparent font-semibold text-slate-700 placeholder-slate-300 disabled:text-slate-400"
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} type={type} disabled={disabled} />
    </div>
  );
}

function PrimaryBtn({ loading, label, loadingLabel, color, onClick, type = "submit" }: {
  loading: boolean; label: string; loadingLabel: string; color?: string;
  onClick?: () => void; type?: "submit" | "button";
}) {
  return (
    <button type={type} disabled={loading} onClick={onClick}
      className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white mt-1 disabled:opacity-60 transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
      style={{ background: color ?? `linear-gradient(135deg,${NAVY},#1e40af)` }}>
      {loading ? loadingLabel : label}
    </button>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-red-600 font-bold bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
      <FaExclamationTriangle className="flex-shrink-0" /><span>{children}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="ct-fade text-center py-14 bg-white rounded-3xl" style={{ border: "1.5px dashed #e2e8f0" }}>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF2FF" }}>
        <Icon className="text-2xl" style={{ color: NAVY, opacity: 0.2 }} />
      </div>
      <p className="text-slate-700 font-extrabold text-base">{title}</p>
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
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">No</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>Yes, Delete</button>
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
  const [todayCollections, setTodayCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"aaj" | "members" | "months" | "boli">("aaj");

  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCollect, setShowCollect] = useState(false);
  const [showBoli, setShowBoli] = useState(false);
  const [delMember, setDelMember] = useState<Member | null>(null);
  const [delCollection, setDelCollection] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, sRes, cRes] = await Promise.all([
        fetch(`/api/cameti/groups/${groupId}`),
        fetch(`/api/cameti/groups/${groupId}/summary`),
        fetch(`/api/cameti/groups/${groupId}/collections?date=${todayISO()}`),
      ]);
      const [g, s, c] = await Promise.all([gRes.json(), sRes.json(), cRes.json()]);
      setGroup(g); setSummary(s); setTodayCollections(c);
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
  const todayCollected = todayCollections.reduce((s, c) => s + c.amount, 0);
  const membersPaidToday = new Set(todayCollections.map(c => c.member_id));
  const totalExpected = group.total_members * effectiveDaily;

  /* ── add member ── */
  async function addMember(name: string, phone: string) {
    const r = await fetch(`/api/cameti/groups/${group!.id}/members`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, sort_order: group!.members.length }),
    });
    if (!r.ok) throw new Error();
    await load();
  }

  /* ── delete member ── */
  async function doDeleteMember(id: number) {
    await fetch(`/api/cameti/members/${id}`, { method: "DELETE" });
    setDelMember(null); await load();
  }

  /* ── delete collection ── */
  async function doDeleteCollection(id: number) {
    await fetch(`/api/cameti/collections/${id}`, { method: "DELETE" });
    setDelCollection(null); await load();
  }

  /* ── collect today ── */
  async function collectToday(entries: { member_id: number; amount: number }[]) {
    await fetch(`/api/cameti/groups/${group!.id}/collections`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entries: entries.map(e => ({
          ...e, collected_date: todayISO(),
          month_id: currentMonth?.id ?? null,
        })),
      }),
    });
    await load();
  }

  /* ── boli ── */
  async function recordBoli(winner_member_id: number, bid_amount: number) {
    if (!currentMonth) return;
    await fetch(`/api/cameti/months/${currentMonth.id}/boli`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner_member_id, bid_amount, total_members: group!.total_members }),
    });
    // open next month
    const nextNum = (currentMonth.month_number ?? 0) + 1;
    const now = new Date();
    await fetch(`/api/cameti/groups/${group!.id}/months`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month_number: nextNum, year: now.getFullYear(), month: now.getMonth() + 1 }),
    });
    await load();
  }

  /* ── ensure current month exists ── */
  async function ensureMonth() {
    if (!currentMonth) {
      const now = new Date();
      await fetch(`/api/cameti/groups/${group!.id}/months`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month_number: 1, year: now.getFullYear(), month: now.getMonth() + 1 }),
      });
      await load();
    }
  }

  return (
    <Layout>
      <style>{CSS}</style>
      {showAddMember && <AddMemberModal onClose={() => setShowAddMember(false)} onAdd={addMember} />}
      {showCollect && (
        <CollectModal
          groupId={group.id}
          members={group.members}
          effectiveDaily={effectiveDaily}
          currentMonthId={currentMonth?.id ?? null}
          onClose={() => setShowCollect(false)}
          onDone={async () => { await load(); setShowCollect(false); }}
        />
      )}
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
        <ConfirmDialog msg={`Delete ${delMember.name}?`}
          sub="All their collections will also be deleted."
          onConfirm={() => doDeleteMember(delMember.id)} onCancel={() => setDelMember(null)} />
      )}
      {delCollection !== null && (
        <ConfirmDialog msg="Delete this collection?" sub="This cannot be undone."
          onConfirm={() => doDeleteCollection(delCollection)} onCancel={() => setDelCollection(null)} />
      )}

      <div className="flex-1 flex flex-col" style={{ background: "#f4f6fb" }}>

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden pb-24 pt-7 px-4"
          style={{ background: `linear-gradient(145deg,${NAVY} 0%,#1e3a8a 60%,#1e40af 100%)` }}>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden
            style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative max-w-3xl mx-auto">
            {/* Nav */}
            <div className="flex items-center justify-between mb-7">
              <button onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <FaArrowLeft className="text-xs" /> Back
              </button>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${GOLD}bb` }}>Daily Cameti</p>
                <h1 className="text-lg font-black text-white">{group.name}</h1>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Members", val: group.members.length, icon: FaUsers, c: "rgba(255,255,255,0.12)" },
                { label: "Today Collected", val: fmt(todayCollected), icon: FaMoneyBillWave, c: "rgba(34,197,94,0.2)" },
                { label: "Daily Amt", val: fmt(effectiveDaily), icon: FaRupeeSign, c: "rgba(212,160,23,0.2)" },
                { label: "Pending", val: `${group.members.length - membersPaidToday.size}`, icon: FaUserCheck, c: "rgba(239,68,68,0.2)" },
              ].map(({ label, val, icon: Icon, c }) => (
                <div key={label} className="rounded-2xl p-3 text-center" style={{ background: c, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Icon className="text-white/50 text-sm mx-auto mb-1" />
                  <p className="text-white font-black text-base leading-none">{val}</p>
                  <p className="text-white/50 text-[9px] font-bold uppercase mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-4 -mt-12 max-w-3xl mx-auto w-full">

          {/* CTA Buttons */}
          <div className="flex gap-3 mb-5">
            <button onClick={async () => { await ensureMonth(); setShowCollect(true); }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg,${NAVY},#1e40af)` }}>
              <FaPlus /> Add Collection
            </button>
            <button onClick={() => setShowBoli(true)}
              className="flex items-center gap-2 py-3.5 px-5 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg,${GOLD},#b8860b)` }}>
              <FaGavel /> Boli
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {[
              { key: "aaj", label: "🗓 Today" },
              { key: "members", label: "👥 Members" },
              { key: "months", label: "📅 Months" },
              { key: "boli", label: "🏆 Auction History" },
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

          {/* ── Tab: Today ── */}
          {activeTab === "aaj" && (
            <div className="space-y-3 pb-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                  {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
                </p>
                <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                  {fmt(todayCollected)} / {fmt(totalExpected)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, totalExpected > 0 ? (todayCollected / totalExpected) * 100 : 0)}%`,
                    background: `linear-gradient(90deg,${GREEN},#22c55e)`,
                  }} />
              </div>

              {/* Member status grid */}
              {group.members.map((m, idx) => {
                const paid = membersPaidToday.has(m.id);
                const col = todayCollections.find(c => c.member_id === m.id);
                const waMsg = encodeURIComponent(`Hi ${m.name} Ji 🙏\nApna Enterprise - Daily Cameti Reminder\nToday's payment of ₹${effectiveDaily} is pending.\nPlease pay at the earliest. 🙏\nApna Enterprise, Firozepur`);
                const waHref = `https://wa.me/91${m.phone.replace(/\D/g,'')}?text=${waMsg}`;
                return (
                  <div key={m.id}
                    className="ct-up bg-white rounded-2xl flex items-center gap-3 px-4 py-3.5 shadow-sm"
                    style={{
                      border: `1.5px solid ${paid ? "#bbf7d0" : "#fee2e2"}`,
                      animationDelay: `${idx * 30}ms`,
                    }}>
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: paid ? GREEN : RED }} />
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0"
                      style={{ background: paid ? "#dcfce7" : "#fee2e2", color: paid ? GREEN : RED }}>
                      {initials(m.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm text-slate-800 truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <FaPhone className="text-[8px]" />{m.phone}
                      </p>
                    </div>
                    {paid && col ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-black text-green-600">+{fmt(col.amount)}</p>
                          <span className="text-[9px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">Paid ✓</span>
                        </div>
                        <button onClick={() => setDelCollection(col.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-xl text-slate-200 hover:text-red-400 hover:bg-red-50 transition-all">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-1 rounded-full">Pending</span>
                        {m.phone && (
                          <a href={waHref} target="_blank" rel="noreferrer"
                            className="w-7 h-7 flex items-center justify-center rounded-xl text-white transition-all active:scale-90"
                            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
                            title="Send WhatsApp Reminder">
                            <FaWhatsapp className="text-sm" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {group.members.length === 0 && <EmptyState icon={FaUsers} title="No members yet" sub="Add members from the Members tab" />}
            </div>
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
                {summary.map((m, idx) => (
                  <div key={m.id}
                    className="ct-up bg-white rounded-3xl flex items-center gap-3 overflow-hidden shadow-sm"
                    style={{ border: `1.5px solid ${m.has_taken ? "#fef9c3" : "#f1f5f9"}`, animationDelay: `${idx*30}ms` }}>
                    <div className="w-1.5 self-stretch flex-shrink-0"
                      style={{ background: m.has_taken ? GOLD : "#e2e8f0" }} />
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 my-3"
                      style={{ background: m.has_taken ? "#fef9c3" : "#EEF2FF", color: m.has_taken ? "#92400e" : NAVY }}>
                      {initials(m.name)}
                    </div>
                    <div className="flex-1 min-w-0 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-sm text-slate-800 truncate">{m.name}</p>
                        {m.has_taken && (
                          <span className="text-[9px] font-extrabold bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex-shrink-0">
                            🏆 Won
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <FaPhone className="text-[8px]" />{m.phone}
                      </p>
                    </div>
                    <div className="text-right pr-2 flex-shrink-0">
                      <p className="text-sm font-black text-green-600">{fmt(m.total_paid ?? 0)}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{m.days_paid ?? 0} din</p>
                    </div>
                    <button onClick={() => setDelMember(m)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-200 hover:text-red-400 hover:bg-red-50 transition-all mr-3 flex-shrink-0">
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}
                {summary.length === 0 && <EmptyState icon={FaUsers} title="No members yet" sub="Use the button above to add members" />}
              </div>
            </div>
          )}

          {/* ── Tab: Months ── */}
          {activeTab === "months" && (
            <div className="pb-10 space-y-3">
              {group.months.length === 0 && (
                <EmptyState icon={FaCalendarAlt} title="No months yet" sub="Start by adding a collection" />
              )}
              {[...group.months].reverse().map((mn, idx) => (
                <div key={mn.id}
                  className="ct-up bg-white rounded-3xl p-5 shadow-sm"
                  style={{ border: `1.5px solid ${mn.status === "open" ? "#bfdbfe" : "#f1f5f9"}`, animationDelay: `${idx*35}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black" style={{ color: NAVY }}>Month {mn.month_number}</span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${mn.status === "open" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                        {mn.status === "open" ? "🟢 Active" : "✅ Closed"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold">
                      {MONTH_NAMES[(mn.month - 1) % 12]} {mn.year}
                    </p>
                  </div>
                  {mn.status === "closed" && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
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
              ))}
            </div>
          )}

          {/* ── Tab: Boli History ── */}
          {activeTab === "boli" && (
            <div className="pb-10 space-y-3">
              {group.members.filter(m => m.has_taken).length === 0 && (
                <EmptyState icon={FaGavel} title="No auctions yet" sub="Use the 'Boli' button to record one" />
              )}
              {group.months.filter(m => m.status === "closed").map((mn, idx) => (
                <div key={mn.id}
                  className="ct-up bg-white rounded-3xl p-5 shadow-sm"
                  style={{ border: "1.5px solid #fef9c3", animationDelay: `${idx*35}ms` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Month {mn.month_number}</p>
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

/* ── Add Member Modal ── */
function AddMemberModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: string, p: string) => Promise<void> }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setErr("Name and phone are required"); return; }
    setSaving(true); setErr("");
    try { await onAdd(name, phone); onClose(); }
    catch { setErr("Something went wrong. Please try again."); } finally { setSaving(false); }
  }
  return (
    <Modal title="Add Member" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <InputField icon={FaUsers} placeholder="Member's name" value={name} onChange={setName} />
        <InputField icon={FaPhone} placeholder="Phone number" value={phone} onChange={setPhone} type="tel" />
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Add Member" loadingLabel="Adding..." />
      </form>
    </Modal>
  );
}

/* ── Collect Modal ── */
function CollectModal({ groupId, members, effectiveDaily, currentMonthId, onClose, onDone }: {
  groupId: number; members: Member[]; effectiveDaily: number; currentMonthId: number | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState(todayISO());
  const [paidSet, setPaidSet] = useState<Set<number>>(new Set());
  const [fetching, setFetching] = useState(false);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  // Fetch who has paid on the selected date
  useEffect(() => {
    let cancelled = false;
    async function fetchPaid() {
      setFetching(true);
      try {
        const r = await fetch(`/api/cameti/groups/${groupId}/collections?date=${date}`);
        const cols: Collection[] = await r.json();
        if (!cancelled) {
          const paid = new Set(cols.map((c: Collection) => c.member_id));
          setPaidSet(paid);
          const unpaidMembers = members.filter(m => !paid.has(m.id));
          const init: Record<number, string> = {};
          unpaidMembers.forEach(m => { init[m.id] = String(effectiveDaily); });
          setAmounts(init);
          setSelected(new Set(unpaidMembers.map(m => m.id)));
        }
      } catch { /* silent */ } finally { if (!cancelled) setFetching(false); }
    }
    fetchPaid();
    return () => { cancelled = true; };
  }, [date, groupId, members, effectiveDaily]);

  const unpaid = members.filter(m => !paidSet.has(m.id));
  const total = [...selected].reduce((s, id) => s + (Number(amounts[id]) || 0), 0);

  async function submit() {
    const entries = [...selected].map(id => ({ member_id: id, amount: Number(amounts[id]) || effectiveDaily, collected_date: date, month_id: currentMonthId ?? null }));
    if (!entries.length) { onDone(); return; }
    setSaving(true);
    try {
      await fetch(`/api/cameti/groups/${groupId}/collections`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      onDone();
    } finally { setSaving(false); }
  }

  const dateLabel = date === todayISO() ? "Today" : new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Modal title="Add Collection" subtitle={`Daily: ${fmt(effectiveDaily)} per member`} onClose={onClose} wide>
      {/* Date picker */}
      <div className="mb-4">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Select Date</label>
        <div className="flex items-center gap-2 border-2 border-slate-100 rounded-2xl px-3 py-2.5 bg-white">
          <FaCalendarAlt className="text-slate-300 text-sm flex-shrink-0" />
          <input type="date" value={date} max={todayISO()}
            onChange={e => setDate(e.target.value)}
            className="flex-1 text-sm font-bold outline-none text-slate-700 bg-transparent" />
          {date !== todayISO() && (
            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">Past Date</span>
          )}
        </div>
      </div>

      {fetching ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
        </div>
      ) : unpaid.length === 0 ? (
        <div className="text-center py-8">
          <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
          <p className="font-extrabold text-slate-700">All paid for {dateLabel}!</p>
          <p className="text-slate-400 text-sm mt-1">All members have paid for this date.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
            {unpaid.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl border-2 transition-all"
                style={{ borderColor: selected.has(m.id) ? "#bfdbfe" : "#f1f5f9", background: selected.has(m.id) ? "#eff6ff" : "white" }}>
                <input type="checkbox" checked={selected.has(m.id)}
                  onChange={e => {
                    const s = new Set(selected);
                    e.target.checked ? s.add(m.id) : s.delete(m.id);
                    setSelected(s);
                  }}
                  className="w-4 h-4 rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-slate-800 truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400">{m.phone}</p>
                </div>
                <div className="flex items-center gap-1 border-2 border-slate-100 rounded-xl px-2 py-1.5 bg-white">
                  <FaRupeeSign className="text-slate-300 text-xs" />
                  <input type="number" value={amounts[m.id] ?? effectiveDaily}
                    onChange={e => setAmounts(p => ({ ...p, [m.id]: e.target.value }))}
                    className="w-16 text-sm font-bold outline-none text-slate-700" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 mb-3 border border-slate-100">
            <p className="text-sm font-bold text-slate-500">{selected.size} member — Total</p>
            <p className="text-base font-black" style={{ color: NAVY }}>{fmt(total)}</p>
          </div>
          <PrimaryBtn loading={saving} label={`✓ Collect ${fmt(total)}`} loadingLabel="Saving..." type="button" onClick={submit} />
        </>
      )}
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
    if (!winnerId) { setErr("Please select a winner"); return; }
    if (bid <= 0) { setErr("Enter the auction amount"); return; }
    setSaving(true); setErr("");
    try { await onConfirm(winnerId, bid); onClose(); }
    catch { setErr("Something went wrong."); } finally { setSaving(false); }
  }

  return (
    <Modal title="🏆 Record Auction" subtitle="This month's auction" onClose={onClose} wide>
      <div className="flex flex-col gap-4">
        {/* Winner select */}
        <div>
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Select Winner</p>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {eligible.map(m => (
              <button key={m.id} type="button"
                onClick={() => setWinnerId(m.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 text-left transition-all"
                style={winnerId === m.id
                  ? { borderColor: GOLD, background: "#fef9c3" }
                  : { borderColor: "#f1f5f9", background: "white" }}>
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
            <p className="text-sm text-slate-400 font-medium text-center py-3">All members have already won!</p>
          )}
        </div>

        {/* Bid amount */}
        <InputField icon={FaRupeeSign} placeholder="Boli Amount (e.g. 8000)" value={bidAmount} onChange={setBidAmount} type="number" />

        {/* Preview */}
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
        <PrimaryBtn loading={saving} label="✓ Confirm Auction" loadingLabel="Saving..."
          type="button" onClick={submit}
          color={`linear-gradient(135deg,${GOLD},#b8860b)`} />
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
              <div className="flex items-center gap-2">
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl transition-all active:scale-95 text-white"
                  style={{ background: `linear-gradient(135deg,${GOLD},#b8860b)` }}>
                  <FaPlus /> New Group
                </button>
              </div>
            </div>

            {/* Summary boxes */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Groups", val: groups.length, c: "rgba(255,255,255,0.1)" },
                { label: "Total Members", val: groups.reduce((s, g) => s + g.total_members, 0), c: "rgba(34,197,94,0.18)" },
                { label: "Daily/Group", val: groups.length ? fmt(groups[0].daily_amount) : "₹300", c: `rgba(212,160,23,0.18)` },
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
            <EmptyState icon={FaUsers} title="No cameti groups yet" sub="Create your first group using 'New Group'" />
          ) : (
            <div className="space-y-3">
              {groups.map((g, idx) => (
                <button key={g.id} onClick={() => onSelect(g.id)}
                  className="ct-up w-full bg-white rounded-3xl p-5 text-left shadow-sm hover:shadow-lg transition-all active:scale-[0.98]"
                  style={{ border: "1.5px solid #f1f5f9", animationDelay: `${idx*40}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl"
                        style={{ background: "#EEF2FF", color: NAVY }}>
                        {initials(g.name)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-800">{g.name}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          Started {fmtDate(g.started_on)} · {g.total_members} Members
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-black" style={{ color: NAVY }}>{fmt(g.daily_amount)}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Daily/Member</p>
                    </div>
                  </div>
                </button>
              ))}
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
    if (!name.trim()) { setErr("Please enter a group name"); return; }
    setSaving(true); setErr("");
    try { await onCreate(name, Number(daily) || 300, startDate); onClose(); }
    catch { setErr("Something went wrong."); } finally { setSaving(false); }
  }

  return (
    <Modal title="New Cameti Group" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <InputField icon={FaEdit} placeholder="Group name (e.g. Apna Cameti 2025)" value={name} onChange={setName} />
        <InputField icon={FaRupeeSign} placeholder="Daily amount per member (default: 300)" value={daily} onChange={setDaily} type="number" />
        <InputField icon={FaCalendarAlt} value={startDate} onChange={setStartDate} type="date" />
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Create Group" loadingLabel="Creating..." />
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
