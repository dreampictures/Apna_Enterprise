import { useState, useEffect, useCallback } from "react";
import {
  FaBook, FaPlus, FaTrash, FaWhatsapp, FaArrowLeft,
  FaUser, FaPhone, FaRupeeSign, FaCheck, FaTimes,
  FaMoneyBillWave, FaHandHoldingUsd, FaEdit, FaExclamationTriangle,
  FaChevronRight, FaCalendarAlt, FaStickyNote,
} from "react-icons/fa";

const NAVY = "#071B4A";
const GOLD = "#D4A017";
const CORRECT_PIN = "1103";
const PHONE = "8437566186";

interface Client {
  id: number;
  name: string;
  phone: string;
  note: string | null;
  createdAt: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

interface Transaction {
  id: number;
  clientId: number;
  amount: number;
  type: "debit" | "credit";
  description: string | null;
  date: string;
  createdAt: string;
}

function fmtRupees(n: number) {
  return "₹" + Math.abs(n).toLocaleString("en-IN");
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ─── PIN Screen ──────────────────────────────────────────────────────────────
function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function press(k: string) {
    if (error) setError(false);
    if (k === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === CORRECT_PIN) {
          sessionStorage.setItem("khaata_auth", "1");
          onUnlock();
        } else {
          setError(true);
          setPin("");
        }
      }, 120);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0d2069 100%)` }}
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xs">
        <div className="flex justify-center mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a8f)` }}
          >
            <FaBook className="text-3xl text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-center mb-1" style={{ color: NAVY }}>
          Khaata Book
        </h1>
        <p className="text-xs text-slate-400 text-center mb-7 font-medium">
          Apna Enterprise — Private Ledger
        </p>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border-2 transition-all duration-150"
              style={{
                background: i < pin.length ? NAVY : "transparent",
                borderColor: i < pin.length ? NAVY : "#cbd5e1",
              }}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs font-bold text-red-500 mb-3">
            ❌ Wrong PIN. Try again.
          </p>
        )}
        {!error && <div className="mb-3 h-4" />}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {["1","2","3","4","5","6","7","8","9","","0","del"].map((k, idx) => (
            <button
              key={idx}
              onClick={() => k && press(k)}
              className={`h-14 rounded-2xl text-lg font-bold transition-all duration-100 active:scale-95 select-none ${
                !k ? "invisible" :
                k === "del" ? "bg-slate-100 text-slate-500 hover:bg-slate-200" :
                "hover:opacity-80 active:opacity-60"
              }`}
              style={k && k !== "del" ? { background: "#f1f5fb", color: NAVY } : {}}
            >
              {k === "del" ? "⌫" : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add Client Modal ─────────────────────────────────────────────────────────
function AddClientModal({ onClose, onAdded }: { onClose: () => void; onAdded: (c: Client) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setErr("Name aur phone zaroori hai"); return; }
    setSaving(true);
    setErr("");
    try {
      const r = await fetch("/api/khaata/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), note: note.trim() }),
      });
      if (!r.ok) throw new Error();
      const c: Client = await r.json();
      onAdded(c);
      onClose();
    } catch {
      setErr("Kuch problem aai. Dobara try karo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(7,27,74,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold" style={{ color: NAVY }}>Naya Client Jodo</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Naam *</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400">
              <FaUser className="text-slate-400 text-sm flex-shrink-0" />
              <input
                className="flex-1 text-sm outline-none bg-transparent font-medium"
                placeholder="Client ka naam"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Phone *</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400">
              <FaPhone className="text-slate-400 text-sm flex-shrink-0" />
              <input
                className="flex-1 text-sm outline-none bg-transparent font-medium"
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Note (Optional)</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400">
              <FaStickyNote className="text-slate-400 text-sm flex-shrink-0" />
              <input
                className="flex-1 text-sm outline-none bg-transparent font-medium"
                placeholder="Koi bhi note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-sm text-white mt-1 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a8f)` }}
          >
            {saving ? "Jod raha hai..." : "Client Jodo"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Add Transaction Modal ────────────────────────────────────────────────────
function AddTxnModal({
  client, onClose, onAdded,
}: { client: Client; onClose: () => void; onAdded: (t: Transaction) => void }) {
  const [type, setType] = useState<"debit" | "credit">("debit");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) { setErr("Sahi amount likho"); return; }
    setSaving(true); setErr("");
    try {
      const r = await fetch(`/api/khaata/clients/${client.id}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, type, description: desc.trim(), date }),
      });
      if (!r.ok) throw new Error();
      const t: Transaction = await r.json();
      onAdded(t);
      onClose();
    } catch {
      setErr("Kuch problem aai. Dobara try karo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(7,27,74,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: NAVY }}>Transaction Jodo</h2>
            <p className="text-xs text-slate-400 font-medium">{client.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <FaTimes />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setType("debit")}
            className="flex-1 py-2.5 text-xs font-bold transition-all"
            style={type === "debit" ? { background: "#fee2e2", color: "#b91c1c" } : { color: "#64748b" }}
          >
            🔴 Pending (Client Ka Baki)
          </button>
          <button
            type="button"
            onClick={() => setType("credit")}
            className="flex-1 py-2.5 text-xs font-bold transition-all"
            style={type === "credit" ? { background: "#dcfce7", color: "#15803d" } : { color: "#64748b" }}
          >
            🟢 Advance / Payment Mili
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Amount (₹) *</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400">
              <FaRupeeSign className="text-slate-400 text-sm flex-shrink-0" />
              <input
                className="flex-1 text-sm outline-none bg-transparent font-bold"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Date *</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-blue-400">
              <FaCalendarAlt className="text-slate-400 text-sm flex-shrink-0" />
              <input
                className="flex-1 text-sm outline-none bg-transparent font-medium"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Description (Optional)</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none font-medium focus:border-blue-400"
              placeholder="Jaise: Passport fee, Visa charges..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          {err && <p className="text-xs text-red-500 font-semibold">{err}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-bold text-sm text-white mt-1 disabled:opacity-60"
            style={{
              background: type === "debit"
                ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                : "linear-gradient(135deg, #22c55e, #15803d)",
            }}
          >
            {saving ? "Jod raha hai..." : "Transaction Jodo"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── WhatsApp Reminder ────────────────────────────────────────────────────────
function waLink(client: Client) {
  const num = client.phone.replace(/\D/g, "");
  const msg = `Sat Sri Akal ${client.name} Ji 🙏\n\nApna Enterprise, Firozepur ki taraf se aapko yaad dilana chahte hain.\n\nAapka *${fmtRupees(client.balance)}* payment pending hai.\n\nKripya jaldi se payment clear karein. 🙏\n\nDhanyawad!\n*Apna Enterprise*\n📞 ${PHONE}`;
  const phone = num.startsWith("91") || num.length === 12 ? num : "91" + num;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

// ─── Client Detail ────────────────────────────────────────────────────────────
function ClientDetail({
  client, onBack, onClientUpdated, onClientDeleted,
}: {
  client: Client;
  onBack: () => void;
  onClientUpdated: (c: Client) => void;
  onClientDeleted: (id: number) => void;
}) {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const [confirmDelClient, setConfirmDelClient] = useState(false);

  const loadTxns = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/khaata/clients/${client.id}/transactions`);
      setTxns(await r.json());
    } finally {
      setLoading(false);
    }
  }, [client.id]);

  useEffect(() => { loadTxns(); }, [loadTxns]);

  async function deleteTxn(id: number) {
    await fetch(`/api/khaata/transactions/${id}`, { method: "DELETE" });
    setTxns((prev) => prev.filter((t) => t.id !== id));
    setConfirmDel(null);
    // Refresh client balance
    const r = await fetch("/api/khaata/clients");
    const list: Client[] = await r.json();
    const updated = list.find((c) => c.id === client.id);
    if (updated) onClientUpdated(updated);
  }

  async function deleteClient() {
    await fetch(`/api/khaata/clients/${client.id}`, { method: "DELETE" });
    onClientDeleted(client.id);
  }

  function handleTxnAdded(t: Transaction) {
    setTxns((prev) => [t, ...prev]);
    // Refetch client for updated balance
    fetch("/api/khaata/clients")
      .then((r) => r.json())
      .then((list: Client[]) => {
        const updated = list.find((c) => c.id === client.id);
        if (updated) onClientUpdated(updated);
      });
  }

  const totalDebit = txns.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const totalCredit = txns.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const balance = totalDebit - totalCredit;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f4f7fc" }}>
      {showAddTxn && (
        <AddTxnModal client={client} onClose={() => setShowAddTxn(false)} onAdded={handleTxnAdded} />
      )}

      {/* Confirm delete txn */}
      {confirmDel !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl">
            <p className="font-bold text-slate-800 mb-1">Transaction delete karein?</p>
            <p className="text-sm text-slate-400 mb-5">Yeh action undo nahi hoga.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => deleteTxn(confirmDel)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete client */}
      {confirmDelClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-red-500" />
              <p className="font-bold text-red-600">Client delete karein?</p>
            </div>
            <p className="text-sm text-slate-500 mb-5"><strong>{client.name}</strong> aur unki saari transactions permanent delete ho jayengi.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelClient(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={deleteClient} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">Haan, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-white px-4 pt-6 pb-8" style={{ background: `linear-gradient(135deg, ${NAVY}, #0d2069)` }}>
        <div className="max-w-lg mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold mb-5 opacity-80 hover:opacity-100">
            <FaArrowLeft /> Wapas Jao
          </button>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold">{client.name}</h2>
                <p className="text-sm opacity-70">{client.phone}</p>
                {client.note && <p className="text-xs opacity-50 mt-0.5">{client.note}</p>}
              </div>
            </div>
            <button onClick={() => setConfirmDelClient(true)} className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ background: "rgba(239,68,68,0.2)" }}>
              <FaTrash className="text-red-300 text-sm" />
            </button>
          </div>

          {/* Balance summary */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-xs opacity-60 mb-1">Kul Baki</p>
              <p className="text-base font-extrabold" style={{ color: "#fca5a5" }}>{fmtRupees(totalDebit)}</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-xs opacity-60 mb-1">Advance/Mila</p>
              <p className="text-base font-extrabold" style={{ color: "#86efac" }}>{fmtRupees(totalCredit)}</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
              <p className="text-xs opacity-60 mb-1">Net Balance</p>
              <p className={`text-base font-extrabold ${balance > 0 ? "text-red-300" : balance < 0 ? "text-green-300" : "text-white"}`}>
                {balance === 0 ? "Clear" : (balance > 0 ? "−" : "+") + fmtRupees(balance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 -mt-4 max-w-lg mx-auto w-full">
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddTxn(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a8f)` }}
          >
            <FaPlus /> Transaction Jodo
          </button>
          {balance > 0 && (
            <a
              href={waLink(client)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
            >
              <FaWhatsapp className="text-base" /> Reminder
            </a>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="flex-1 px-4 pt-5 pb-8 max-w-lg mx-auto w-full">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Transactions</p>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid #e2e8f0" }} />
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl" style={{ border: "1px solid #e2e8f0" }}>
            <FaMoneyBillWave className="text-3xl text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">Koi transaction nahi</p>
            <p className="text-slate-400 text-xs mt-1">Upar button se pehli transaction jodo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {txns.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ border: `1.5px solid ${t.type === "debit" ? "#fecaca" : "#bbf7d0"}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.type === "debit" ? "#fee2e2" : "#dcfce7" }}
                >
                  {t.type === "debit"
                    ? <FaMoneyBillWave className="text-red-500" />
                    : <FaHandHoldingUsd className="text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-base font-extrabold ${t.type === "debit" ? "text-red-600" : "text-green-600"}`}>
                      {t.type === "debit" ? "−" : "+"}{fmtRupees(t.amount)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{fmtDate(t.date)}</span>
                  </div>
                  {t.description && (
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{t.description}</p>
                  )}
                  <p className="text-xs font-semibold mt-0.5" style={{ color: t.type === "debit" ? "#dc2626" : "#16a34a" }}>
                    {t.type === "debit" ? "Baki (Client Owe)" : "Advance / Mila"}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDel(t.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex-shrink-0"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Khaata Book ─────────────────────────────────────────────────────────
export default function KhaataBook() {
  const [authed, setAuthed] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("khaata_auth") === "1") setAuthed(true);
  }, []);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/khaata/clients");
      setClients(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authed) loadClients(); }, [authed, loadClients]);

  function handleClientUpdated(c: Client) {
    setClients((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    if (selected?.id === c.id) setSelected(c);
  }

  function handleClientDeleted(id: number) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
  }

  if (!authed) return <PinScreen onUnlock={() => setAuthed(true)} />;

  if (selected) {
    return (
      <ClientDetail
        client={selected}
        onBack={() => setSelected(null)}
        onClientUpdated={handleClientUpdated}
        onClientDeleted={handleClientDeleted}
      />
    );
  }

  // Summary stats
  const totalPending = clients.filter((c) => c.balance > 0).reduce((s, c) => s + c.balance, 0);
  const totalAdvance = clients.filter((c) => c.balance < 0).reduce((s, c) => s + Math.abs(c.balance), 0);
  const pendingCount = clients.filter((c) => c.balance > 0).length;

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f4f7fc" }}>
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onAdded={(c) => setClients((prev) => [c, ...prev])}
        />
      )}

      {/* Header */}
      <div className="text-white px-4 pt-6 pb-10" style={{ background: `linear-gradient(135deg, ${NAVY}, #0d2069)` }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <FaBook className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold">Khaata Book</h1>
                <p className="text-xs opacity-60">Apna Enterprise</p>
              </div>
            </div>
            <button
              onClick={() => { sessionStorage.removeItem("khaata_auth"); setAuthed(false); }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg opacity-60 hover:opacity-100"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              Lock 🔒
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <div className="flex items-center gap-2 mb-2">
                <FaMoneyBillWave className="text-red-300 text-sm" />
                <p className="text-xs font-bold text-red-200">Kul Pending</p>
              </div>
              <p className="text-2xl font-extrabold text-red-100">{fmtRupees(totalPending)}</p>
              <p className="text-xs text-red-300 mt-1">{pendingCount} client{pendingCount !== 1 ? "s" : ""}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <div className="flex items-center gap-2 mb-2">
                <FaHandHoldingUsd className="text-green-300 text-sm" />
                <p className="text-xs font-bold text-green-200">Kul Advance</p>
              </div>
              <p className="text-2xl font-extrabold text-green-100">{fmtRupees(totalAdvance)}</p>
              <p className="text-xs text-green-300 mt-1">{clients.filter((c) => c.balance < 0).length} client{clients.filter((c) => c.balance < 0).length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 px-4 -mt-5 pb-8 max-w-lg mx-auto w-full">
        {/* Search + Add */}
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 bg-white rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-blue-300 shadow-sm"
            placeholder="🔍 Client dhundho..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-sm text-white shadow-sm flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a8f)` }}
          >
            <FaPlus /> Naya
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" style={{ border: "1px solid #e2e8f0" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl" style={{ border: "1px solid #e2e8f0" }}>
            <FaUser className="text-3xl text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">
              {search ? "Koi client nahi mila" : "Koi client nahi hai"}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {!search && "Upar 'Naya' button se client jodo"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-3 text-left transition-all hover:shadow-md active:scale-98"
                style={{
                  border: c.balance > 0
                    ? "1.5px solid #fecaca"
                    : c.balance < 0
                    ? "1.5px solid #bbf7d0"
                    : "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(7,27,74,0.05)",
                }}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-extrabold flex-shrink-0"
                  style={{
                    background: c.balance > 0 ? "#fee2e2" : c.balance < 0 ? "#dcfce7" : "#f1f5fb",
                    color: c.balance > 0 ? "#dc2626" : c.balance < 0 ? "#16a34a" : NAVY,
                  }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-extrabold text-sm text-slate-800 truncate">{c.name}</p>
                    <span
                      className={`text-sm font-extrabold flex-shrink-0 ${
                        c.balance > 0 ? "text-red-600" :
                        c.balance < 0 ? "text-green-600" :
                        "text-slate-400"
                      }`}
                    >
                      {c.balance === 0 ? "✅ Clear" :
                       c.balance > 0 ? `−${fmtRupees(c.balance)}` :
                       `+${fmtRupees(c.balance)}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{c.phone}</p>
                  {c.balance !== 0 && (
                    <p className={`text-xs font-semibold mt-0.5 ${c.balance > 0 ? "text-red-500" : "text-green-600"}`}>
                      {c.balance > 0 ? "● Pending" : "● Advance hai"}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {c.balance > 0 && (
                    <a
                      href={waLink(c)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 flex items-center justify-center rounded-xl"
                      style={{ background: "#dcfce7", color: "#16a34a" }}
                      title="WhatsApp Reminder"
                    >
                      <FaWhatsapp />
                    </a>
                  )}
                  <FaChevronRight className="text-slate-300 text-xs" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
