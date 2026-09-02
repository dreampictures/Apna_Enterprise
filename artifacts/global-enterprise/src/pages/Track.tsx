import { useState } from "react";
import Seo from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch, FaCheckCircle, FaClock, FaTimesCircle, FaClipboardList, FaPhone, FaArrowRight, FaCheck, FaCreditCard } from "react-icons/fa";
import { Link } from "wouter";
import { useT } from "@/i18n";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

type TrackResult = {
  trackingNumber: string;
  service: string;
  status: string;
  createdAt: string;
  callbackRequested: boolean;
  pricingType?: string;
  pricingStatus?: string;
  applicationPrice?: number | null;
  paymentStatus?: string;
  paymentAmount?: number | null;
};

type PaymentInfo = {
  action: string;
  fields: Record<string, string>;
  amount: number;
  baseAmount: number;
  gatewayFee: number;
  gatewayFeeGst: number;
};

const STATUS_CONFIG: Record<string, { label: (t: any) => string; color: string; bg: string; border: string; icon: React.ElementType; step: number }> = {
  pending: {
    label: (t) => t.track_status_pending,
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fcd34d",
    icon: FaClock,
    step: 1,
  },
  review: {
    label: (t) => t.track_status_review,
    color: "#1d4ed8",
    bg: "#dbeafe",
    border: "#93c5fd",
    icon: FaSearch,
    step: 2,
  },
  applying: {
    label: (t) => t.track_status_applying,
    color: "#7c3aed",
    bg: "#ede9fe",
    border: "#c4b5fd",
    icon: FaClipboardList,
    step: 3,
  },
  applied: {
    label: (t) => t.track_status_applied,
    color: "#065f46",
    bg: "#d1fae5",
    border: "#6ee7b7",
    icon: FaArrowRight,
    step: 4,
  },
  rejected: {
    label: (t) => t.track_status_rejected,
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#fca5a5",
    icon: FaTimesCircle,
    step: 4,
  },
  completed: {
    label: (t) => t.track_status_completed,
    color: "#14532d",
    bg: "#dcfce7",
    border: "#86efac",
    icon: FaCheckCircle,
    step: 5,
  },
};

const STEPS = ["pending", "review", "applying", "applied", "completed"];

export default function Track() {
  const { t } = useT();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const tn = input.trim().toUpperCase();
    if (!tn) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);
    setError("");
    setPaymentInfo(null);
    setPaymentError("");

    try {
      const res = await fetch(`/api/applications/track/${encodeURIComponent(tn)}`);
      if (res.status === 404) {
        setNotFound(true);
      } else if (!res.ok) {
        setError("Something went wrong. Please try again.");
      } else {
        const data = await res.json();
        setResult(data);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function startPayment() {
    if (!result || paymentLoading) return;
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const response = await fetch(`/api/applications/track/${encodeURIComponent(result.trackingNumber)}/payment`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? t.track_payment_error);
      setPaymentInfo(data);
    } catch (paymentStartError) {
      setPaymentError(paymentStartError instanceof Error ? paymentStartError.message : t.track_payment_error);
    } finally {
      setPaymentLoading(false);
    }
  }

  function submitPayU(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paymentSubmitting) return;
    setPaymentSubmitting(true);
    event.currentTarget.submit();
  }

  const cfg = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG.pending) : null;
  const currentStep = cfg?.step ?? 1;
  const isRejected = result?.status === "rejected";
  const isDynamic = result?.pricingType === "dynamic";
  const paymentStatus = result?.paymentStatus ?? "not_required";
  const canPay = isDynamic && result?.pricingStatus === "price_assigned" && paymentStatus !== "paid";

  return (
    <div className="flex flex-col min-h-full">
      <Seo
        title="Track Your Application — Apna Enterprise"
        description="Track your service application status at Apna Enterprise Firozepur using your tracking number."
        path="/track"
      />
      {/* Header */}
      <section className="hero-navy text-white py-16">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <p className="font-semibold uppercase tracking-widest text-xs mb-3" style={{ color: GOLD_LIGHT }}>
            Application Status
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t.track_title}</h1>
          <div className="gold-line w-20 mx-auto mb-5" />
          <p className="max-w-xl mx-auto text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            {t.track_subtitle}
          </p>
        </div>
      </section>

      <section className="flex-1 py-16" style={{ background: "#f8fafd" }}>
        <div className="container mx-auto px-4 max-w-xl">
          {/* Search Box */}
          <form onSubmit={handleTrack} className="mb-8">
            <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #e8edf5", boxShadow: "0 8px 40px rgba(7,27,74,0.08)" }}>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tracking Number</label>
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.track_placeholder}
                  className="h-12 rounded-xl font-mono text-base flex-1"
                  style={{ color: "#071B4A", background: "rgba(7,27,74,0.03)", borderColor: "#d1d9e8" }}
                  autoCapitalize="characters"
                  maxLength={20}
                />
                <Button
                  type="submit"
                  className="btn-gold h-12 px-6 rounded-xl font-bold gap-2"
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {t.track_btn}
                    </span>
                  ) : (
                    <>
                      <FaSearch className="text-sm" />
                      {t.track_btn}
                    </>
                  )}
                </Button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </form>

          {/* Not Found */}
          {notFound && (
            <div className="bg-white rounded-2xl p-8 text-center" style={{ border: "1px solid #fee2e2", boxShadow: "0 4px 20px rgba(220,38,38,0.08)" }}>
              <FaTimesCircle className="text-5xl text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t.track_not_found}</h3>
              <p className="text-slate-500 text-sm mb-6">{t.track_not_found_sub}</p>
              <Link href="/apply">
                <Button variant="outline" className="rounded-xl h-10 px-6 font-semibold" style={{ borderColor: "#d1d9e8", color: "#071B4A" }}>
                  Submit a New Application
                </Button>
              </Link>
            </div>
          )}

          {/* Result */}
          {result && cfg && (
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e8edf5", boxShadow: "0 8px 40px rgba(7,27,74,0.10)" }}>
              {/* Status banner */}
              <div className="px-6 py-5 flex items-center gap-4" style={{ background: cfg.bg, borderBottom: `2px solid ${cfg.border}` }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "white", border: `2px solid ${cfg.border}` }}
                >
                  <cfg.icon className="text-xl" style={{ color: cfg.color }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: cfg.color }}>
                    {t.track_status_label}
                  </p>
                  <p className="text-lg font-extrabold" style={{ color: cfg.color }}>
                    {cfg.label(t)}
                  </p>
                </div>
              </div>

              {/* Progress Bar (not shown for rejected) */}
              {!isRejected && (
                <div className="px-6 pt-6 pb-2">
                  <div className="flex items-center gap-1">
                    {STEPS.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isActive = stepNum === currentStep;
                      const isPast = stepNum < currentStep;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                            style={{
                              background: isPast || isActive ? GOLD : "#e2e8f0",
                              color: isPast || isActive ? "white" : "#94a3b8",
                            }}
                          >
                            {isPast ? <FaCheck className="text-xs" /> : stepNum}
                          </div>
                          {idx < STEPS.length - 1 && (
                            <div
                              className="flex-1 h-1 mx-1 rounded-full transition-all"
                              style={{ background: isPast ? GOLD : "#e2e8f0" }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1 px-0.5">
                    {["Submitted", "Review", "In Process", "Applied", "Done"].map((label) => (
                      <span key={label} className="text-xs text-slate-400 font-medium" style={{ flex: 1, textAlign: "center" }}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tracking No</span>
                  <span className="font-mono font-bold text-slate-800 text-sm tracking-widest">{result.trackingNumber}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.track_service_label}</span>
                  <span className="font-semibold text-slate-800 text-sm text-right max-w-xs">{result.service}</span>
                </div>
                <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.track_date_label}</span>
                  <span className="text-slate-700 text-sm">
                    {new Date(result.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Callback</span>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={
                      result.callbackRequested
                        ? { background: "#d1fae5", color: "#065f46" }
                        : { background: "#f1f5f9", color: "#64748b" }
                    }
                  >
                    {result.callbackRequested ? t.track_callback_yes : t.track_callback_no}
                  </span>
                </div>
                {isDynamic && (
                  <>
                    <div className="flex items-start justify-between gap-4 py-3 border-t border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.track_price_label}</span>
                      <span className={`text-sm font-semibold text-right ${result.pricingStatus === "price_assigned" ? "text-slate-800" : "text-amber-700"}`}>
                        {result.pricingStatus === "price_assigned" && result.applicationPrice != null
                          ? `₹${Number(result.applicationPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                          : t.track_price_waiting}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.track_payment_label}</span>
                      <span className={`text-sm font-semibold text-right ${paymentStatus === "paid" ? "text-green-700" : paymentStatus === "failed" ? "text-red-700" : "text-slate-700"}`}>
                        {paymentStatus === "paid" ? t.track_payment_paid : paymentStatus === "failed" ? t.track_payment_failed : paymentStatus === "initiated" ? t.track_payment_initiated : t.track_payment_not_started}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {canPay && !paymentInfo && (
                <div className="mx-6 mb-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                  <p className="text-sm text-slate-600 mb-3">{t.track_payment_desc}</p>
                  <Button type="button" onClick={startPayment} disabled={paymentLoading} className="btn-gold w-full h-11 rounded-xl font-bold gap-2">
                    <FaCreditCard />
                    {paymentLoading ? t.payment_opening : t.track_pay_now}
                  </Button>
                  {paymentError && <p className="mt-2 text-xs text-red-600">{paymentError}</p>}
                </div>
              )}

              {paymentInfo && (
                <div className="mx-6 mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex justify-between text-sm text-slate-600"><span>{t.track_price_label}</span><strong>₹{paymentInfo.baseAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
                  <div className="flex justify-between text-sm text-slate-600 mt-2"><span>Gateway fee + GST</span><span>₹{(paymentInfo.gatewayFee + paymentInfo.gatewayFeeGst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between items-center border-t border-blue-100 mt-3 pt-3"><span className="font-semibold text-slate-700">{t.pay_online_total}</span><strong className="text-lg text-primary">₹{paymentInfo.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
                  <form action={paymentInfo.action} method="POST" onSubmit={submitPayU} className="mt-4">
                    {Object.entries(paymentInfo.fields).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
                    <Button type="submit" disabled={paymentSubmitting} className="btn-gold w-full h-11 rounded-xl font-bold gap-2">
                      <FaCreditCard /> {paymentSubmitting ? t.payment_opening : t.track_pay_now}
                    </Button>
                  </form>
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4" style={{ background: "#f8fafd", borderTop: "1px solid #e8edf5" }}>
                <p className="text-xs text-slate-500 text-center">
                  Questions? Email us at{" "}
                  <a href="mailto:info@apnaenterprise.in" className="underline font-semibold" style={{ color: GOLD }}>
                    info@apnaenterprise.in
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* No search yet */}
          {!result && !notFound && !loading && !input && (
            <div className="text-center py-8 text-slate-400">
              <FaClipboardList className="text-5xl mx-auto mb-3 text-slate-200" />
              <p className="text-sm">Enter your tracking number above to check status</p>
              <div className="mt-4">
                <Link href="/apply" className="text-sm font-semibold underline" style={{ color: GOLD }}>
                  Haven't applied yet? Apply here →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
