import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import {
  FaBook, FaPlus, FaTrash, FaWhatsapp, FaArrowLeft,
  FaUser, FaPhone, FaRupeeSign, FaTimes,
  FaMoneyBillWave, FaHandHoldingUsd,
  FaCalendarAlt, FaStickyNote, FaChevronRight,
  FaExclamationTriangle, FaSearch, FaLock,
  FaUsers, FaCheckCircle, FaChartLine, FaFilter,
} from "react-icons/fa";

/* ── Tokens ─────────────────────────────────────────────────── */
const NAVY   = "#071B4A";
const GOLD   = "#D4A017";
const CORRECT_PIN = "1103";
const PHONE  = "8437566186";

/* ── Animations ─────────────────────────────────────────────── */
const CSS = `
@keyframes kh-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
@keyframes kh-pop{0%{transform:scale(0.92);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes kh-up{0%{transform:translateY(18px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes kh-fade{0%{opacity:0}100%{opacity:1}}
@keyframes kh-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.kh-shake{animation:kh-shake .45s ease}
.kh-pop{animation:kh-pop .28s cubic-bezier(.34,1.56,.64,1) both}
.kh-up{animation:kh-up .32s ease both}
.kh-fade{animation:kh-fade .25s ease both}
.kh-skeleton{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:400% 100%;animation:kh-shimmer 1.5s infinite linear}
`;

/* ── Helpers ─────────────────────────────────────────────────── */
const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN");
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const todayISO = () => new Date().toISOString().split("T")[0];
const initials = (name: string) => name.trim().charAt(0).toUpperCase();
const avatarBg = (bal: number) =>
  bal > 0 ? { bg: "#fee2e2", fg: "#dc2626" }
  : bal < 0 ? { bg: "#dcfce7", fg: "#16a34a" }
  : { bg: "#EEF2FF", fg: NAVY };

/* ── Types ───────────────────────────────────────────────────── */
interface Client {
  id: number; name: string; phone: string; note: string | null; createdAt: string;
  totalDebit: number; totalCredit: number; balance: number;
}
interface Transaction {
  id: number; clientId: number; amount: number;
  type: "debit" | "credit"; description: string | null; date: string; createdAt: string;
}

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
    const digits = val.replace(/\D/g, "").slice(0, 4);
    setPin(digits); setError(false);
    if (digits.length === 4) {
      setTimeout(() => {
        if (digits === CORRECT_PIN) { sessionStorage.setItem("khaata_auth", "1"); onUnlock(); }
        else { setError(true); setShake(true); setTimeout(() => { setShake(false); setPin(""); }, 520); }
      }, 140);
    }
  }

  return (
    <Layout>
      <style>{CSS}</style>
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-12 cursor-default"
        style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #102060 50%, #071535 100%)` }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-5" style={{ background: GOLD }} />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-5" style={{ background: GOLD }} />
        </div>

        <input ref={inputRef} type="password" inputMode="numeric" pattern="[0-9]*"
          maxLength={4} value={pin} onChange={e => handleInput(e.target.value)}
          autoFocus autoComplete="off" className="absolute opacity-0 pointer-events-none w-0 h-0"
          aria-label="PIN input" />

        {/* Card */}
        <div className="kh-pop relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.45)" }}>
          {/* Gold top bar */}
          <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${GOLD}, #f0c040, ${GOLD})` }} />

          <div className="px-10 pt-10 pb-10 flex flex-col items-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-5"
              style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1e40af 100%)` }}>
              <FaBook className="text-3xl text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: NAVY }}>Khaata Book</h1>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-8" style={{ color: GOLD }}>
              APNA ENTERPRISE
            </p>

            {/* PIN dots */}
            <div className={`flex gap-5 mb-4 ${shake ? "kh-shake" : ""}`}>
              {[0,1,2,3].map(i => (
                <div key={i} className="transition-all duration-200 rounded-full"
                  style={{
                    width: i < pin.length ? 18 : 16,
                    height: i < pin.length ? 18 : 16,
                    background: i < pin.length ? NAVY : "transparent",
                    border: `2.5px solid ${i < pin.length ? NAVY : "#cbd5e1"}`,
                    boxShadow: i < pin.length ? `0 0 12px ${NAVY}66` : "none",
                  }} />
              ))}
            </div>

            {/* Hint / Error */}
            <div className="h-7 flex items-center justify-center mb-6">
              {error
                ? <p className="kh-fade text-sm font-bold text-red-500 bg-red-50 px-4 py-1 rounded-full">
                    ❌ Wrong PIN, please try again
                  </p>
                : <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                    <span>⌨️</span> Type your 4-digit PIN using keyboard
                  </p>
              }
            </div>

            {/* Lock indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <FaLock className="text-[11px]" />
              <span>Private — For your eyes only</span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-8 text-white/30 text-xs font-semibold tracking-widest uppercase">
          Apna Enterprise · Firozepur
        </p>
      </div>
    </Layout>
  );
}

/* ══════════════════════════════════════════════════════════════
   WHATSAPP LINK
══════════════════════════════════════════════════════════════ */
function waLink(client: Client) {
  const num = client.phone.replace(/\D/g, "");
  const e164 = num.startsWith("91") || num.length === 12 ? num : "91" + num;
  const msg =
    `Hello ${client.name} 🙏\n\n` +
    `This is a reminder from *Apna Enterprise, Firozepur*.\n\n` +
    `Your outstanding payment of *${fmt(client.balance)}* is still pending.\n\n` +
    `Kindly clear the balance at your earliest convenience. 🙏\n\n` +
    `Thank you!\n*Apna Enterprise*\n📞 ${PHONE}`;
  return `https://wa.me/${e164}?text=${encodeURIComponent(msg)}`;
}

/* ══════════════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════════════ */
function Modal({ title, subtitle, onClose, children }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(7,27,74,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="kh-pop bg-white rounded-t-[28px] sm:rounded-[24px] shadow-2xl w-full sm:max-w-md">
        <div className="h-1 rounded-t-[24px]" style={{ background: `linear-gradient(90deg, ${GOLD}, #f0c040, ${GOLD})` }} />
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold" style={{ color: NAVY }}>{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all">
            <FaTimes className="text-sm" />
          </button>
        </div>
        <div className="px-6 py-5 pb-7">{children}</div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, placeholder, value, onChange, type = "text" }: {
  icon: React.ElementType; placeholder?: string; value: string;
  onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-2 border-slate-100 rounded-2xl px-4 py-3 focus-within:border-blue-400 focus-within:bg-blue-50/30 transition-all bg-slate-50 group">
      <Icon className="text-slate-300 group-focus-within:text-blue-400 text-sm flex-shrink-0 transition-colors" />
      <input className="flex-1 text-sm outline-none bg-transparent font-semibold text-slate-700 placeholder-slate-300"
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} type={type} />
    </div>
  );
}

function PrimaryBtn({ loading, label, loadingLabel, color }: {
  loading: boolean; label: string; loadingLabel: string; color?: string;
}) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white mt-1 disabled:opacity-60 transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
      style={{ background: color ?? `linear-gradient(135deg, ${NAVY}, #1e40af)` }}>
      {loading ? loadingLabel : label}
    </button>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-red-600 font-bold bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
      <FaExclamationTriangle className="flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/* ── Add Client Modal ── */
function AddClientModal({ onClose, onAdded }: { onClose: () => void; onAdded: (c: Client) => void }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setErr("Name and phone are required"); return; }
    setSaving(true); setErr("");
    try {
      const r = await fetch("/api/khaata/clients", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), note: note.trim() }),
      });
      if (!r.ok) throw new Error();
      onAdded(await r.json()); onClose();
    } catch { setErr("Something went wrong. Please try again."); }
    finally { setSaving(false); }
  }

  return (
    <Modal title="Add New Client" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <InputField icon={FaUser} placeholder="Client's full name" value={name} onChange={setName} />
        <InputField icon={FaPhone} placeholder="Mobile number" value={phone} onChange={setPhone} type="tel" />
        <InputField icon={FaStickyNote} placeholder="Note (optional)" value={note} onChange={setNote} />
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Add Client" loadingLabel="Adding..." />
      </form>
    </Modal>
  );
}

/* ── Add Transaction Modal ── */
function AddTxnModal({ client, onClose, onAdded }: {
  client: Client; onClose: () => void; onAdded: (t: Transaction) => void;
}) {
  const [type, setType] = useState<"debit" | "credit">("debit");
  const [amount, setAmount] = useState(""); const [desc, setDesc] = useState(""); const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number(amount) || Number(amount) <= 0) { setErr("Please enter a valid amount"); return; }
    setSaving(true); setErr("");
    try {
      const r = await fetch(`/api/khaata/clients/${client.id}/transactions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), type, description: desc.trim(), date }),
      });
      if (!r.ok) throw new Error();
      onAdded(await r.json()); onClose();
    } catch { setErr("Something went wrong. Please try again."); }
    finally { setSaving(false); }
  }

  return (
    <Modal title="Add Transaction" subtitle={client.name} onClose={onClose}>
      <div className="grid grid-cols-2 rounded-2xl overflow-hidden border-2 border-slate-100 mb-4">
        {(["debit", "credit"] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)}
            className="py-3.5 text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5"
            style={type === t
              ? t === "debit"
                ? { background: "linear-gradient(135deg,#fee2e2,#fecaca)", color: "#b91c1c" }
                : { background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", color: "#15803d" }
              : { background: "#f8fafc", color: "#94a3b8" }}>
            {t === "debit" ? "🔴 Balance Due" : "🟢 Advance / Received"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <InputField icon={FaRupeeSign} placeholder="Amount (e.g. 500)" value={amount} onChange={setAmount} type="number" />
        <InputField icon={FaCalendarAlt} value={date} onChange={setDate} type="date" />
        <InputField icon={FaStickyNote} placeholder="Description (optional)" value={desc} onChange={setDesc} />
        {err && <ErrMsg>{err}</ErrMsg>}
        <PrimaryBtn loading={saving} label="✓ Save Transaction" loadingLabel="Saving..."
          color={type === "debit" ? "linear-gradient(135deg,#ef4444,#b91c1c)" : "linear-gradient(135deg,#22c55e,#15803d)"} />
      </form>
    </Modal>
  );
}

/* ── Confirm Dialog ── */
function ConfirmDialog({ msg, sub, onConfirm, onCancel }: {
  msg: string; sub: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
      <div className="kh-pop bg-white rounded-3xl p-7 max-w-xs w-full shadow-2xl">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50">
          <FaExclamationTriangle className="text-red-500 text-xl" />
        </div>
        <p className="font-extrabold text-slate-800 text-center text-base mb-1">{msg}</p>
        <p className="text-sm text-slate-400 text-center mb-6">{sub}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            No
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CLIENT DETAIL PAGE
══════════════════════════════════════════════════════════════ */
function ClientDetail({ client, onBack, onClientUpdated, onClientDeleted }: {
  client: Client; onBack: () => void;
  onClientUpdated: (c: Client) => void; onClientDeleted: (id: number) => void;
}) {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [delTxn, setDelTxn] = useState<number | null>(null);
  const [delClient, setDelClient] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/khaata/clients/${client.id}/transactions`);
    setTxns(await r.json()); setLoading(false);
  }, [client.id]);

  useEffect(() => { load(); }, [load]);

  async function deleteTxn(id: number) {
    await fetch(`/api/khaata/transactions/${id}`, { method: "DELETE" });
    setTxns(p => p.filter(t => t.id !== id)); setDelTxn(null);
    fetch("/api/khaata/clients").then(r => r.json()).then((list: Client[]) => {
      const u = list.find(c => c.id === client.id); if (u) onClientUpdated(u);
    });
  }

  async function deleteClient() {
    await fetch(`/api/khaata/clients/${client.id}`, { method: "DELETE" });
    onClientDeleted(client.id);
  }

  const totalD = txns.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const totalC = txns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const bal = totalD - totalC;
  const av = avatarBg(bal);

  return (
    <Layout>
      <style>{CSS}</style>
      <div className="flex-1 flex flex-col" style={{ background: "#f4f6fb" }}>
        {showAddTxn && (
          <AddTxnModal client={client} onClose={() => setShowAddTxn(false)}
            onAdded={t => {
              setTxns(p => [t, ...p]);
              fetch("/api/khaata/clients").then(r => r.json()).then((list: Client[]) => {
                const u = list.find(c => c.id === client.id); if (u) onClientUpdated(u);
              });
            }} />
        )}
        {delTxn !== null && (
          <ConfirmDialog msg="Delete this transaction?" sub="This cannot be undone."
            onConfirm={() => deleteTxn(delTxn)} onCancel={() => setDelTxn(null)} />
        )}
        {delClient && (
          <ConfirmDialog
            msg="Delete this client?"
            sub={`${client.name} and all their transactions will be permanently deleted.`}
            onConfirm={deleteClient} onCancel={() => setDelClient(false)} />
        )}

        {/* ── Hero Header ── */}
        <div className="relative text-white pb-24 pt-6 px-4 overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #1e3a8a 60%, #1e40af 100%)` }}>
          {/* subtle pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="relative max-w-2xl mx-auto">
            {/* Nav row */}
            <div className="flex items-center justify-between mb-8">
              <button onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <FaArrowLeft className="text-xs" /> Go Back
              </button>
              <button onClick={() => setDelClient(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ background: "rgba(239,68,68,0.18)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>
                <FaTrash className="text-[10px]" /> Delete
              </button>
            </div>

            {/* Client info */}
            <div className="flex items-center gap-5 mb-2">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", border: "2px solid rgba(255,255,255,0.25)" }}>
                {initials(client.name)}
              </div>
              <div>
                <h2 className="text-2xl font-black leading-tight">{client.name}</h2>
                <p className="text-sm opacity-60 flex items-center gap-1.5 mt-1 font-medium">
                  <FaPhone className="text-[10px]" /> {client.phone}
                </p>
                {client.note && (
                  <p className="text-xs opacity-40 mt-0.5 italic">{client.note}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Balance Summary Cards ── */}
        <div className="px-4 -mt-14 max-w-2xl mx-auto w-full">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Due", val: fmt(totalD), sub: "Debit", bg: "#fff1f2", border: "#fecdd3", text: "#be123c" },
              { label: "Total Received", val: fmt(totalC), sub: "Credit", bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
              {
                label: "Net Balance",
                val: bal === 0 ? "Clear ✅" : fmt(bal),
                sub: bal > 0 ? "Outstanding" : bal < 0 ? "Advance" : "Settled",
                bg: bal > 0 ? "#fff1f2" : bal < 0 ? "#f0fdf4" : "#f8fafc",
                border: bal > 0 ? "#fecdd3" : bal < 0 ? "#bbf7d0" : "#e2e8f0",
                text: bal > 0 ? "#be123c" : bal < 0 ? "#15803d" : "#64748b",
              },
            ].map(({ label, val, sub, bg, border, text }) => (
              <div key={label} className="kh-pop rounded-2xl p-3.5 text-center shadow-lg"
                style={{ background: bg, border: `1.5px solid ${border}` }}>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-extrabold leading-tight" style={{ color: text }}>{val}</p>
                <p className="text-[9px] font-bold mt-0.5 opacity-60" style={{ color: text }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={() => setShowAddTxn(true)}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1e40af)` }}>
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <FaPlus className="text-xs" />
              </div>
              Add Entry
            </button>
            {bal > 0 && (
              <a href={waLink(client)} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 py-4 px-5 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
                <FaWhatsapp className="text-base" /> Reminder
              </a>
            )}
          </div>

          {/* Transactions list */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
              Transactions ({txns.length})
            </p>
            {txns.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-100">
                Newest first
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 kh-skeleton rounded-2xl" />)}
            </div>
          ) : txns.length === 0 ? (
            <EmptyState icon={FaMoneyBillWave} title="No transactions yet" sub="Use the button above to add the first entry" />
          ) : (
            <div className="space-y-2.5 pb-10">
              {txns.map((t, idx) => {
                const isDebit = t.type === "debit";
                return (
                  <div key={t.id}
                    className="kh-up bg-white rounded-2xl overflow-hidden shadow-sm flex items-stretch"
                    style={{
                      border: `1.5px solid ${isDebit ? "#fecdd3" : "#bbf7d0"}`,
                      animationDelay: `${idx * 40}ms`,
                    }}>
                    {/* left accent bar */}
                    <div className="w-1 flex-shrink-0" style={{ background: isDebit ? "#ef4444" : "#22c55e" }} />
                    <div className="flex items-center gap-3 flex-1 px-4 py-3.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isDebit ? "#fee2e2" : "#dcfce7" }}>
                        {isDebit
                          ? <FaMoneyBillWave className="text-red-500 text-sm" />
                          : <FaHandHoldingUsd className="text-green-600 text-sm" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-base font-black ${isDebit ? "text-red-600" : "text-green-600"}`}>
                            {isDebit ? "−" : "+"}{fmt(t.amount)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                            {fmtDate(t.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isDebit ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                            {isDebit ? "Due" : "Received"}
                          </span>
                          {t.description && (
                            <span className="text-xs text-slate-400 truncate font-medium">{t.description}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setDelTxn(t.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all ml-1">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ── Shared Empty State ── */
function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="kh-fade text-center py-16 bg-white rounded-3xl" style={{ border: "1.5px dashed #e2e8f0" }}>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "#EEF2FF" }}>
        <Icon className="text-2xl" style={{ color: NAVY, opacity: 0.2 }} />
      </div>
      <p className="text-slate-700 font-extrabold text-base">{title}</p>
      <p className="text-slate-400 text-sm mt-1.5 font-medium">{sub}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════════ */
type FilterTab = "all" | "baki" | "advance" | "clear";

export default function KhaataBook() {
  const [authed, setAuthed] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<"name" | "balance_desc" | "balance_asc" | "newest">("newest");

  useEffect(() => { if (sessionStorage.getItem("khaata_auth") === "1") setAuthed(true); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/khaata/clients"); setClients(await r.json()); }
    catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  function update(c: Client) {
    setClients(p => p.map(x => x.id === c.id ? c : x));
    if (selected?.id === c.id) setSelected(c);
  }
  function remove(id: number) { setClients(p => p.filter(c => c.id !== id)); setSelected(null); }

  if (!authed) return <PinScreen onUnlock={() => setAuthed(true)} />;
  if (selected) return <ClientDetail client={selected} onBack={() => setSelected(null)} onClientUpdated={update} onClientDeleted={remove} />;

  /* ── Stats ── */
  const pending  = clients.filter(c => c.balance > 0);
  const advance  = clients.filter(c => c.balance < 0);
  const cleared  = clients.filter(c => c.balance === 0);
  const totalPending = pending.reduce((s, c) => s + c.balance, 0);
  const totalAdvance = advance.reduce((s, c) => s + Math.abs(c.balance), 0);

  /* ── Filtered + Sorted ── */
  const byTab = tab === "baki" ? pending : tab === "advance" ? advance : tab === "clear" ? cleared : clients;
  const filtered = byTab
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    .slice()
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "balance_desc") return Math.abs(b.balance) - Math.abs(a.balance);
      if (sortBy === "balance_asc") return Math.abs(a.balance) - Math.abs(b.balance);
      return b.id - a.id;
    });

  const TABS: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: "all",     label: "All",     count: clients.length, color: NAVY },
    { key: "baki",    label: "Pending", count: pending.length, color: "#dc2626" },
    { key: "advance", label: "Advance", count: advance.length, color: "#16a34a" },
    { key: "clear",   label: "Settled", count: cleared.length, color: "#0284c7" },
  ];

  return (
    <Layout>
      <style>{CSS}</style>
      {showAdd && (
        <AddClientModal
          onClose={() => setShowAdd(false)}
          onAdded={c => setClients(p => [{ ...c, totalDebit: 0, totalCredit: 0, balance: 0 }, ...p])} />
      )}

      <div className="flex-1 flex flex-col" style={{ background: "#f4f6fb" }}>

        {/* ══ HERO HEADER ══ */}
        <div className="relative overflow-hidden pb-28 pt-7 px-4"
          style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #102060 55%, #0a1a50 100%)` }}>
          {/* dot grid decoration */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          {/* gold glow top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-24 opacity-10 pointer-events-none" aria-hidden
            style={{ background: `radial-gradient(ellipse at 50% 0%, ${GOLD} 0%, transparent 70%)` }} />

          <div className="relative max-w-3xl mx-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${GOLD}33, ${GOLD}11)`, border: `1px solid ${GOLD}44` }}>
                  <FaBook className="text-lg" style={{ color: GOLD }} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white leading-none">Khaata Book</h1>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: `${GOLD}bb`, letterSpacing: "0.15em" }}>
                    APNA ENTERPRISE
                  </p>
                </div>
              </div>
              <button
                onClick={() => { sessionStorage.removeItem("khaata_auth"); setAuthed(false); }}
                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
                <FaLock className="text-[10px]" /> Lock
              </button>
            </div>

            {/* ── STAT CARDS GRID ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Pending */}
              <div className="rounded-3xl p-5 relative overflow-hidden"
                style={{ background: "rgba(239,68,68,0.14)", border: "1px solid rgba(239,68,68,0.22)" }}>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10"
                  style={{ background: "#ef4444" }} />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.25)" }}>
                    <FaMoneyBillWave className="text-red-300 text-xs" />
                  </div>
                  <p className="text-[10px] font-extrabold text-red-200 uppercase tracking-wider">Total Pending</p>
                </div>
                <p className="text-3xl font-black text-red-100 leading-none mb-1.5">{fmt(totalPending)}</p>
                <p className="text-xs text-red-300 font-semibold">
                  {pending.length} client{pending.length !== 1 ? "s" : ""} outstanding
                </p>
              </div>

              {/* Total Advance */}
              <div className="rounded-3xl p-5 relative overflow-hidden"
                style={{ background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.22)" }}>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10"
                  style={{ background: "#22c55e" }} />
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.25)" }}>
                    <FaHandHoldingUsd className="text-green-300 text-xs" />
                  </div>
                  <p className="text-[10px] font-extrabold text-green-200 uppercase tracking-wider">Total Advance</p>
                </div>
                <p className="text-3xl font-black text-green-100 leading-none mb-1.5">{fmt(totalAdvance)}</p>
                <p className="text-xs text-green-300 font-semibold">
                  {advance.length} client{advance.length !== 1 ? "s" : ""} paid in advance
                </p>
              </div>

              {/* Total Clients */}
              <div className="rounded-3xl p-4 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.1)" }}>
                  <FaUsers className="text-white/60 text-sm" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Total Clients</p>
                  <p className="text-xl font-black text-white leading-tight">{clients.length}</p>
                </div>
              </div>

              {/* Clear clients */}
              <div className="rounded-3xl p-4 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)" }}>
                  <FaCheckCircle className="text-green-400 text-sm" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Clear / Settled</p>
                  <p className="text-xl font-black text-white leading-tight">{cleared.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══ */}
        <div className="px-4 -mt-14 max-w-3xl mx-auto w-full">

          {/* Add New Client — prominent full-width button */}
          <button onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-extrabold text-sm text-white mb-3 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #1e40af)`, boxShadow: "0 8px 24px rgba(7,27,74,0.3)" }}>
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <FaPlus className="text-xs" />
            </div>
            Add New Client
          </button>

          {/* Search + Sort row */}
          <div className="flex gap-2.5 mb-4">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-4 shadow-lg border border-white"
              style={{ boxShadow: "0 8px 32px rgba(7,27,74,0.1)" }}>
              <FaSearch className="text-slate-300 text-sm flex-shrink-0" />
              <input
                className="flex-1 py-3.5 text-sm font-semibold outline-none bg-transparent placeholder-slate-300 text-slate-700"
                placeholder="Search by name or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white rounded-2xl px-3 text-xs font-bold text-slate-600 outline-none border border-slate-100 shadow-lg flex-shrink-0 cursor-pointer"
              style={{ boxShadow: "0 8px 32px rgba(7,27,74,0.08)" }}>
              <option value="newest">Newest</option>
              <option value="name">A → Z</option>
              <option value="balance_desc">Highest Balance</option>
              <option value="balance_asc">Lowest Balance</option>
            </select>
          </div>

          {/* Filter Tabs */}
          {clients.length > 0 && (
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-extrabold text-xs flex-shrink-0 transition-all active:scale-95"
                  style={tab === t.key
                    ? { background: t.color, color: "white", boxShadow: `0 4px 14px ${t.color}55` }
                    : { background: "white", color: "#94a3b8", border: "1.5px solid #f1f5f9" }}>
                  <FaFilter className="text-[9px]" />
                  {t.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                    style={tab === t.key
                      ? { background: "rgba(255,255,255,0.25)", color: "white" }
                      : { background: "#f1f5f9", color: "#64748b" }}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Client List */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-[76px] kh-skeleton rounded-3xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FaUser}
              title={search ? "No client found" : tab !== "all" ? "No clients in this category" : "No clients yet"}
              sub={search ? "Check the name or phone number" : "Use 'New Client' button to add one"} />
          ) : (
            <div className="space-y-2.5 pb-10">
              {filtered.map((c, idx) => {
                const av2 = avatarBg(c.balance);
                return (
                  <button key={c.id} onClick={() => setSelected(c)}
                    className="kh-up w-full bg-white rounded-3xl flex items-center gap-4 text-left transition-all hover:shadow-lg active:scale-[0.98] overflow-hidden"
                    style={{
                      border: c.balance > 0 ? "1.5px solid #fecdd3"
                        : c.balance < 0 ? "1.5px solid #bbf7d0"
                        : "1.5px solid #f1f5f9",
                      boxShadow: "0 2px 12px rgba(7,27,74,0.06)",
                      animationDelay: `${idx * 35}ms`,
                    }}>

                    {/* Left color strip */}
                    <div className="w-1.5 self-stretch flex-shrink-0 rounded-l-3xl"
                      style={{ background: c.balance > 0 ? "#ef4444" : c.balance < 0 ? "#22c55e" : "#e2e8f0" }} />

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 my-4"
                      style={{ background: av2.bg, color: av2.fg }}>
                      {initials(c.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 py-4 pr-1">
                      <p className="font-extrabold text-sm text-slate-800 truncate leading-tight">{c.name}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                        <FaPhone className="text-[9px]" /> {c.phone}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full mt-1.5
                        ${c.balance > 0 ? "bg-red-50 text-red-500" : c.balance < 0 ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"}`}>
                        {c.balance > 0 ? "● Outstanding" : c.balance < 0 ? "● Advance" : "✔ Settled"}
                      </span>
                    </div>

                    {/* Balance + actions */}
                    <div className="flex items-center gap-2 pr-4 flex-shrink-0">
                      <div className="text-right">
                        <p className={`text-base font-black leading-tight ${c.balance > 0 ? "text-red-600" : c.balance < 0 ? "text-green-600" : "text-slate-300"}`}>
                          {c.balance === 0 ? "—" : c.balance > 0 ? `−${fmt(c.balance)}` : `+${fmt(Math.abs(c.balance))}`}
                        </p>
                      </div>
                      {c.balance > 0 && (
                        <a href={waLink(c)} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="w-9 h-9 flex items-center justify-center rounded-2xl flex-shrink-0 transition-all hover:scale-110"
                          style={{ background: "#dcfce7", color: "#16a34a" }}
                          title="WhatsApp Reminder">
                          <FaWhatsapp className="text-sm" />
                        </a>
                      )}
                      <FaChevronRight className="text-slate-200 text-xs" />
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
