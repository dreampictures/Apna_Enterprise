import { useState, useEffect } from "react";
import { FaTimes, FaWhatsapp, FaCheckCircle } from "react-icons/fa";
import { useLocation } from "wouter";

const STORAGE_KEY = "ae_lead_dismissed";

export default function LeadPopup() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [location] = useLocation();

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), page: location }),
      });
      if (!res.ok) throw new Error("Failed");
      setSuccess(true);
      localStorage.setItem(STORAGE_KEY, "1");
      setTimeout(() => setVisible(false), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(1,6,15,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "#071B4A",
          border: "1px solid rgba(212,160,23,0.35)",
          boxShadow: "0 0 40px rgba(212,160,23,0.15), 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Gold top accent */}
        <div style={{ height: "3px", background: "linear-gradient(90deg,#D4A017,#F2C14E,#D4A017)" }} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: "#F2C14E" }}
              >
                Free Callback
              </p>
              <h3 className="text-white font-bold text-lg leading-tight">
                Need help with any service?
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Leave your number — we'll call you back shortly.
              </p>
            </div>
            <button
              onClick={dismiss}
              className="text-slate-500 hover:text-white transition-colors mt-1 ml-3 flex-shrink-0"
              aria-label="Close"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {success ? (
            <div className="flex flex-col items-center py-6 gap-3 text-center">
              <FaCheckCircle className="text-5xl" style={{ color: "#F2C14E" }} />
              <p className="text-white font-semibold text-lg">Thank you!</p>
              <p className="text-slate-400 text-sm">
                We've received your details and will contact you on WhatsApp soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajinder Singh"
                  className="glass-input w-full"
                  maxLength={80}
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98765 43210"
                  className="glass-input w-full"
                  maxLength={15}
                  disabled={submitting}
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="text-base" />
                {submitting ? "Sending..." : "Request Callback"}
              </button>

              <p className="text-center text-xs text-slate-600">
                We respect your privacy. No spam, ever.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
