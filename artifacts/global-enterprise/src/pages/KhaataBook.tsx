import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import {
  FaBook, FaPlus, FaTrash, FaWhatsapp, FaArrowLeft,
  FaUser, FaPhone, FaRupeeSign, FaTimes,
  FaMoneyBillWave, FaHandHoldingUsd,
  FaCalendarAlt, FaStickyNote, FaChevronRight,
  FaExclamationTriangle, FaCheckCircle, FaSearch,
  FaLock,
} from "react-icons/fa";

/* ── Design tokens ─────────────────────────────────────────── */
const NAVY = "#071B4A";
const CORRECT_PIN = "1103";
const PHONE = "8437566186";

/* ── Animation styles ──────────────────────────────────────── */
const GLOBAL_CSS = `
@keyframes kh-shake {
  0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)}
}
@keyframes kh-pop {
  0%{transform:scale(0.92);opacity:0} 100%{transform:scale(1);opacity:1}
}
@keyframes kh-slide-up {
  0%{transform:translateY(16px);opacity:0} 100%{transform:translateY(0);opacity:1}
}
@keyframes kh-fadein {
  0%{opacity:0} 100%{opacity:1}
}
@keyframes kh-pulse-dot {
  0%,100%{transform:scale(1)} 50%{transform:scale(1.35)}
}
.kh-shake { animation: kh-shake 0.45s ease; }
.kh-pop { animation: kh-pop 0.25s cubic-bezier(.34,1.56,.64,1) both; }
.kh-slide-up { animation: kh-slide-up 0.3s ease both; }
.kh-fadein { animation: kh-fadein 0.3s ease both; }
`;

/* ── Helpers ───────────────────────────────────────────────── */
function fmt(n: number) {
  return "₹" + Math.abs(n).toLocaleString("en-IN");
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function todayISO() { return new Date().toISOString().split("T")[0]; }
function initials(name: string) { return name.trim().charAt(0).toUpperCase(); }

/* ── Types ─────────────────────────────────────────────────── */
interface Client {
  id: number; name: string; phone: string; note: string | null; createdAt: string;
  totalDebit: number; totalCredit: number; balance: number;
}
interface Transaction {
  id: number; clientId: number; amount: number;
  type: "debit" | "credit"; description: string | null; date: string; createdAt: string;
}

/* ── PIN Screen ────────────────────────────────────────────── */
function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  function handleInput(val: string) {
    if (shake) return;
    const digits = val.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
    setError(false);
    if (digits.length === 4) {
      setTimeout(() => {
        if (digits === CORRECT_PIN) {
          sessionStorage.setItem("khaata_auth", "1");
          onUnlock();
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => { setShake(false); setPin(""); }, 500);
        }
      }, 130);
    }
  }

  return (
    <Layout>
      <style>{GLOBAL_CSS}</style>
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-16"
        style={{ background: `linear-gradient(160deg, #071B4A 0%, #0f2d7a 55%, #0a2258 100%)` }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Hidden keyboard input */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={e => handleInput(e.target.value)}
          autoFocus
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          aria-label="PIN input"
        />

        {/* Card */}
        <div className="kh-pop bg-white rounded-3xl shadow-2xl w-full max-w-[320px] overflow-hidden">
          {/* Top stripe */}
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#D4A017,#f0c040,#D4A017)" }} />

          <div className="px-8 pt-8 pb-8">
            {/* Icon */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a8f 100%)` }}>
                <FaBook className="text-2xl text-white" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: NAVY }}>Khaata Book</h1>
              <p className="text-xs text-slate-400 font-semibold mt-0.5 uppercase tracking-widest">Apna Enterprise</p>
            </div>

            {/* Dots */}
            <div className={`flex justify-center gap-4 mb-3 ${shake ? "kh-shake" : ""}`}>
              {[0,1,2,3].map(i => (
                <div key={i}
                  className="w-4 h-4 rounded-full border-2 transition-all duration-200"
                  style={{
                    background: i < pin.length ? NAVY : "transparent",
                    borderColor: i < pin.length ? NAVY : "#cbd5e1",
                    transform: i < pin.length ? "scale(1.25)" : "scale(1)",
                    boxShadow: i < pin.length ? `0 0 8px ${NAVY}55` : "none",
                  }}
                />
              ))}
            </div>

            {/* Error text */}
            <div className="h-6 flex items-center justify-center mb-5">
              {error
                ? <p className="text-xs font-bold text-red-500 kh-fadein">❌ Galat PIN — dobara try karo</p>
                : <p className="text-xs text-slate-400 font-medium">⌨️ Keyboard se PIN type karo</p>
              }
            </div>

            <p className="text-center text-xs text-slate-300 font-medium">
              <FaLock className="inline mr-1 text-[10px]" />Private — Sirf aapke liye
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value, sub, color, icon: Icon }:
  { label: string; value: string; sub: string; color: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1.5"
      style={{ background: color, border: `1px solid ${color}33` }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="text-sm opacity-80" />
        <span className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-extrabold leading-tight">{value}</p>
      <p className="text-xs font-semibold opacity-70">{sub}</p>
    </div>
  );
}

/* ── Add Client Modal ──────────────────────────────────────── */
function AddClientModal({ onClose, onAdded }: { onClose: () => void; onAdded: (c: Client) => void }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setErr("Naam aur phone zaroori hai"); return; }
    setSaving(true); setErr("");
    try {
      const r = await fetch("/api/khaata/clients", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), note: note.trim() }),
      });
      if (!r.ok) throw new Error();
      onAdded(await r.json());
      onClose();
    } catch { setErr("Kuch gadbad hui. Dobara try karo."); }
    finally { setSaving(false); }
  }

  return (
    <Modal title="Naya Client Jodo" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field icon={FaUser} placeholder="Client ka naam" value={name} onChange={setName} />
        <Field icon={FaPhone} placeholder="Mobile number" value={phone} onChange={setPhone} type="tel" />
        <Field icon={FaStickyNote} placeholder="Note (optional)" value={note} onChange={setNote} />
        {err && <ErrMsg>{err}</ErrMsg>}
        <SubmitBtn loading={saving} label="Client Jodo" loadingLabel="Jod raha hai..." />
      </form>
    </Modal>
  );
}

/* ── Add Transaction Modal ─────────────────────────────────── */
function AddTxnModal({ client, onClose, onAdded }:
  { client: Client; onClose: () => void; onAdded: (t: Transaction) => void }) {
  const [type, setType] = useState<"debit" | "credit">("debit");
  const [amount, setAmount] = useState(""); const [desc, setDesc] = useState(""); const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false); const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!Number(amount) || Number(amount) <= 0) { setErr("Sahi amount likho"); return; }
    setSaving(true); setErr("");
    try {
      const r = await fetch(`/api/khaata/clients/${client.id}/transactions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), type, description: desc.trim(), date }),
      });
      if (!r.ok) throw new Error();
      onAdded(await r.json());
      onClose();
    } catch { setErr("Kuch gadbad hui. Dobara try karo."); }
    finally { setSaving(false); }
  }

  return (
    <Modal title="Transaction Jodo" subtitle={client.name} onClose={onClose}>
      {/* Type Toggle */}
      <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-slate-200 mb-4">
        {(["debit","credit"] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)}
            className="py-3 text-xs font-bold transition-all duration-200"
            style={type === t
              ? t === "debit" ? { background:"#fee2e2", color:"#b91c1c" } : { background:"#dcfce7", color:"#15803d" }
              : { color:"#94a3b8" }}>
            {t === "debit" ? "🔴 Baki (Client Owe)" : "🟢 Advance / Mila"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field icon={FaRupeeSign} placeholder="Amount (jaise: 500)" value={amount} onChange={setAmount} type="number" />
        <Field icon={FaCalendarAlt} value={date} onChange={setDate} type="date" />
        <Field icon={FaStickyNote} placeholder="Kaam ka naam (optional)" value={desc} onChange={setDesc} />
        {err && <ErrMsg>{err}</ErrMsg>}
        <SubmitBtn loading={saving} label="Transaction Jodo" loadingLabel="Jod raha hai..."
          color={type === "debit" ? "linear-gradient(135deg,#ef4444,#b91c1c)" : "linear-gradient(135deg,#22c55e,#15803d)"} />
      </form>
    </Modal>
  );
}

/* ── Confirm Dialog ────────────────────────────────────────── */
function ConfirmDialog({ msg, sub, onConfirm, onCancel }:
  { msg: string; sub: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="kh-pop bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <FaExclamationTriangle className="text-amber-500" />
          <p className="font-extrabold text-slate-800">{msg}</p>
        </div>
        <p className="text-sm text-slate-400 mb-5 ml-6">{sub}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Nahi
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#ef4444,#b91c1c)" }}>
            Haan, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── WhatsApp link ─────────────────────────────────────────── */
function waLink(client: Client) {
  const num = client.phone.replace(/\D/g, "");
  const e164 = num.startsWith("91") || num.length === 12 ? num : "91" + num;
  const msg =
    `Sat Sri Akal ${client.name} Ji 🙏\n\n` +
    `Yeh Apna Enterprise, Firozepur ki taraf se yaad dilaana hai.\n\n` +
    `Aapka *${fmt(client.balance)}* payment abhi bhi pending hai.\n\n` +
    `Kripya jaldi se payment clear karein. 🙏\n\n` +
    `Shukriya!\n*Apna Enterprise*\n📞 ${PHONE}`;
  return `https://wa.me/${e164}?text=${encodeURIComponent(msg)}`;
}

/* ── Client Detail ─────────────────────────────────────────── */
function ClientDetail({ client, onBack, onClientUpdated, onClientDeleted }:
  { client: Client; onBack: () => void; onClientUpdated: (c: Client) => void; onClientDeleted: (id: number) => void }) {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [delTxn, setDelTxn] = useState<number | null>(null);
  const [delClient, setDelClient] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/khaata/clients/${client.id}/transactions`);
    setTxns(await r.json());
    setLoading(false);
  }, [client.id]);

  useEffect(() => { load(); }, [load]);

  async function deleteTxn(id: number) {
    await fetch(`/api/khaata/transactions/${id}`, { method: "DELETE" });
    setTxns(p => p.filter(t => t.id !== id));
    setDelTxn(null);
    fetch("/api/khaata/clients").then(r => r.json()).then((list: Client[]) => {
      const u = list.find(c => c.id === client.id);
      if (u) onClientUpdated(u);
    });
  }

  async function deleteClient() {
    await fetch(`/api/khaata/clients/${client.id}`, { method: "DELETE" });
    onClientDeleted(client.id);
  }

  const totalD = txns.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const totalC = txns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const bal = totalD - totalC;

  return (
    <Layout>
      <style>{GLOBAL_CSS}</style>
      <div className="flex-1 flex flex-col" style={{ background: "#f0f4fb" }}>
        {showAddTxn && <AddTxnModal client={client} onClose={() => setShowAddTxn(false)}
          onAdded={t => {
            setTxns(p => [t, ...p]);
            fetch("/api/khaata/clients").then(r => r.json()).then((list: Client[]) => {
              const u = list.find(c => c.id === client.id); if (u) onClientUpdated(u);
            });
          }} />}
        {delTxn !== null && <ConfirmDialog msg="Transaction delete karein?" sub="Yeh undo nahi ho sakta."
          onConfirm={() => deleteTxn(delTxn)} onCancel={() => setDelTxn(null)} />}
        {delClient && <ConfirmDialog msg="Client delete karein?" sub={`${client.name} aur unki saari entries hamesha ke liye delete ho jayengi.`}
          onConfirm={deleteClient} onCancel={() => setDelClient(false)} />}

        {/* ── Header ── */}
        <div className="text-white px-4 pt-5 pb-16"
          style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0f2d7a 100%)` }}>
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button onClick={onBack}
                className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                <FaArrowLeft /> Wapas
              </button>
              <button onClick={() => setDelClient(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
                style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5" }}>
                <FaTrash className="text-[10px]" /> Client Delete
              </button>
            </div>

            {/* Client info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}>
                {initials(client.name)}
              </div>
              <div>
                <h2 className="text-xl font-extrabold">{client.name}</h2>
                <p className="text-sm opacity-60 font-medium flex items-center gap-1.5 mt-0.5">
                  <FaPhone className="text-[10px]" /> {client.phone}
                </p>
                {client.note && <p className="text-xs opacity-40 mt-0.5">{client.note}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Balance Cards ── */}
        <div className="px-4 -mt-10 max-w-lg mx-auto w-full">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Kul Baki", value: fmt(totalD), color: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
              { label: "Mila / Advance", value: fmt(totalC), color: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
              { label: "Net Balance", value: bal === 0 ? "Clear ✅" : fmt(bal), color: bal > 0 ? "#fef2f2" : bal < 0 ? "#f0fdf4" : "#f8fafc", text: bal > 0 ? "#b91c1c" : bal < 0 ? "#15803d" : "#64748b", border: bal > 0 ? "#fecaca" : bal < 0 ? "#bbf7d0" : "#e2e8f0" },
            ].map(({ label, value, color, text, border }) => (
              <div key={label} className="rounded-2xl p-3 text-center shadow-sm"
                style={{ background: color, border: `1.5px solid ${border}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-extrabold leading-tight" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setShowAddTxn(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white shadow-md transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a8f)` }}>
              <FaPlus /> Transaction Jodo
            </button>
            {bal > 0 && (
              <a href={waLink(client)} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white shadow-md transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
                <FaWhatsapp className="text-base" /> Reminder
              </a>
            )}
          </div>
        </div>

        {/* ── Transactions ── */}
        <div className="flex-1 px-4 pb-10 max-w-lg mx-auto w-full">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            Saari Transactions ({txns.length})
          </p>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-[68px] bg-white rounded-2xl animate-pulse" style={{ border:"1px solid #e2e8f0" }} />)}
            </div>
          ) : txns.length === 0 ? (
            <EmptyState icon={FaMoneyBillWave} title="Koi transaction nahi hai" sub="Upar button se pehli entry jodo" />
          ) : (
            <div className="space-y-2.5">
              {txns.map(t => (
                <div key={t.id}
                  className="kh-slide-up bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm"
                  style={{ border: `1.5px solid ${t.type === "debit" ? "#fecaca" : "#bbf7d0"}` }}>
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: t.type === "debit" ? "#fee2e2" : "#dcfce7" }}>
                    {t.type === "debit"
                      ? <FaMoneyBillWave className="text-red-500" />
                      : <FaHandHoldingUsd className="text-green-600" />}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-base font-extrabold ${t.type === "debit" ? "text-red-600" : "text-green-600"}`}>
                        {t.type === "debit" ? "−" : "+"}{fmt(t.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{fmtDate(t.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${t.type === "debit" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                        {t.type === "debit" ? "Baki" : "Mila"}
                      </span>
                      {t.description && <span className="text-xs text-slate-400 truncate">{t.description}</span>}
                    </div>
                  </div>
                  {/* Delete */}
                  <button onClick={() => setDelTxn(t.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ── Main Dashboard ────────────────────────────────────────── */
export default function KhaataBook() {
  const [authed, setAuthed] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("khaata_auth") === "1") setAuthed(true);
  }, []);

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

  /* stats */
  const pending = clients.filter(c => c.balance > 0);
  const advance = clients.filter(c => c.balance < 0);
  const cleared = clients.filter(c => c.balance === 0);
  const totalPending = pending.reduce((s, c) => s + c.balance, 0);
  const totalAdvance = advance.reduce((s, c) => s + Math.abs(c.balance), 0);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <Layout>
      <style>{GLOBAL_CSS}</style>
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onAdded={c => setClients(p => [{ ...c, totalDebit: 0, totalCredit: 0, balance: 0 }, ...p])} />}

      <div className="flex-1 flex flex-col" style={{ background: "#f0f4fb" }}>

        {/* ── Header ── */}
        <div className="text-white px-4 pt-5 pb-16"
          style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #0f2d7a 100%)` }}>
          <div className="max-w-lg mx-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}>
                  <FaBook className="text-sm text-white" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold leading-tight">Khaata Book</h1>
                  <p className="text-[10px] opacity-50 font-semibold">Apna Enterprise</p>
                </div>
              </div>
              <button onClick={() => { sessionStorage.removeItem("khaata_auth"); setAuthed(false); }}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <FaLock className="text-[10px]" /> Lock
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <FaMoneyBillWave className="text-red-300 text-xs" />
                  <p className="text-[10px] font-extrabold text-red-200 uppercase tracking-wider">Kul Pending</p>
                </div>
                <p className="text-2xl font-extrabold text-red-100 leading-tight">{fmt(totalPending)}</p>
                <p className="text-xs text-red-300 mt-1 font-semibold">{pending.length} client{pending.length !== 1 ? "s" : ""} baki hain</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.25)" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <FaHandHoldingUsd className="text-green-300 text-xs" />
                  <p className="text-[10px] font-extrabold text-green-200 uppercase tracking-wider">Kul Advance</p>
                </div>
                <p className="text-2xl font-extrabold text-green-100 leading-tight">{fmt(totalAdvance)}</p>
                <p className="text-xs text-green-300 mt-1 font-semibold">{advance.length} client{advance.length !== 1 ? "s" : ""} ka advance</p>
              </div>
            </div>

            {/* Mini status bar */}
            {clients.length > 0 && (
              <div className="flex items-center gap-3 mt-3 px-1">
                <MiniStat label="Total" value={clients.length} color="text-white" />
                <div className="w-px h-3 bg-white opacity-20" />
                <MiniStat label="Baki" value={pending.length} color="text-red-300" />
                <div className="w-px h-3 bg-white opacity-20" />
                <MiniStat label="Advance" value={advance.length} color="text-green-300" />
                <div className="w-px h-3 bg-white opacity-20" />
                <MiniStat label="Clear" value={cleared.length} color="text-blue-200" />
              </div>
            )}
          </div>
        </div>

        {/* ── Search + Add ── */}
        <div className="px-4 -mt-5 max-w-lg mx-auto w-full">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2.5 bg-white rounded-2xl border border-slate-200 px-3.5 shadow-sm"
              style={{ boxShadow: "0 2px 12px rgba(7,27,74,0.07)" }}>
              <FaSearch className="text-slate-300 text-sm flex-shrink-0" />
              <input
                className="flex-1 py-3 text-sm font-medium outline-none bg-transparent placeholder-slate-300"
                placeholder="Naam ya number se dhundho..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-slate-300 hover:text-slate-500">
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 rounded-2xl font-bold text-sm text-white shadow-sm flex-shrink-0 transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a8f)`, boxShadow: "0 4px 12px rgba(7,27,74,0.25)" }}>
              <FaPlus /> Naya
            </button>
          </div>

          {/* ── Client List ── */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid #e2e8f0" }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FaUser}
              title={search ? "Koi nahi mila" : "Abhi koi client nahi hai"}
              sub={search ? "Naam ya number check karo" : "'Naya' button se pehla client jodo"}
            />
          ) : (
            <div className="space-y-2.5 pb-8">
              {filtered.map(c => (
                <button key={c.id} onClick={() => setSelected(c)}
                  className="kh-slide-up w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-3 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                  style={{
                    border: c.balance > 0 ? "1.5px solid #fecaca"
                      : c.balance < 0 ? "1.5px solid #bbf7d0"
                      : "1px solid #e2e8f0",
                  }}>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold flex-shrink-0"
                    style={{
                      background: c.balance > 0 ? "#fee2e2" : c.balance < 0 ? "#dcfce7" : "#EEF2FF",
                      color: c.balance > 0 ? "#dc2626" : c.balance < 0 ? "#16a34a" : NAVY,
                    }}>
                    {initials(c.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-slate-800 truncate leading-tight">{c.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{c.phone}</p>
                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md mt-1
                      ${c.balance > 0 ? "bg-red-50 text-red-500" : c.balance < 0 ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"}`}>
                      {c.balance > 0 ? "● Pending" : c.balance < 0 ? "● Advance" : "✔ Clear"}
                    </span>
                  </div>

                  {/* Balance + Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className={`text-base font-extrabold leading-tight ${c.balance > 0 ? "text-red-600" : c.balance < 0 ? "text-green-600" : "text-slate-300"}`}>
                        {c.balance === 0 ? "—" : c.balance > 0 ? `−${fmt(c.balance)}` : `+${fmt(c.balance)}`}
                      </p>
                    </div>
                    {c.balance > 0 && (
                      <a href={waLink(c)} target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 transition-all hover:scale-110"
                        style={{ background: "#dcfce7", color: "#16a34a" }}
                        title="WhatsApp Reminder">
                        <FaWhatsapp />
                      </a>
                    )}
                    <FaChevronRight className="text-slate-200 text-xs" />
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

/* ── Reusable small components ─────────────────────────────── */
function Modal({ title, subtitle, onClose, children }:
  { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      style={{ background: "rgba(7,27,74,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="kh-pop bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-sm">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold" style={{ color: "#071B4A" }}>{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
            <FaTimes className="text-xs" />
          </button>
        </div>
        <div className="px-6 py-4 pb-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, type = "text" }:
  { icon: React.ElementType; placeholder?: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-slate-50">
      <Icon className="text-slate-400 text-sm flex-shrink-0" />
      <input className="flex-1 text-sm outline-none bg-transparent font-medium text-slate-800 placeholder-slate-300"
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} type={type} />
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel, color }:
  { loading: boolean; label: string; loadingLabel: string; color?: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3 rounded-xl font-bold text-sm text-white mt-2 disabled:opacity-60 transition-opacity hover:opacity-90 active:scale-95"
      style={{ background: color ?? `linear-gradient(135deg, #071B4A, #1a3a8f)` }}>
      {loading ? loadingLabel : label}
    </button>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-500 font-semibold bg-red-50 px-3 py-2 rounded-lg">{children}</p>;
}

function EmptyState({ icon: Icon, title, sub }:
  { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="text-center py-14 bg-white rounded-2xl kh-fadein" style={{ border: "1px solid #e2e8f0" }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF2FF" }}>
        <Icon className="text-2xl" style={{ color: "#071B4A", opacity: 0.3 }} />
      </div>
      <p className="text-slate-600 font-bold text-sm">{title}</p>
      <p className="text-slate-400 text-xs mt-1.5 font-medium">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className={`text-sm font-extrabold ${color}`}>{value}</p>
      <p className="text-[10px] opacity-50 font-semibold">{label}</p>
    </div>
  );
}
