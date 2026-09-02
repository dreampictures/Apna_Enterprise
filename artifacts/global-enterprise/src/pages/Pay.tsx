import { useState } from "react";
import { useRoute } from "wouter";
import {
  useGetPaymentRequest,
  getGetPaymentRequestQueryKey,
  useInitiatePaymentRequestPayment,
} from "@workspace/api-client-react";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { FaCheckCircle, FaCreditCard, FaExclamationCircle } from "react-icons/fa";
import { useT } from "@/i18n";

type PaymentInfo = {
  action: string;
  fields: Record<string, string>;
  amount: number;
  baseAmount: number;
  gatewayFee: number;
  gatewayFeeGst: number;
};

function currency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Pay() {
  const [, params] = useRoute("/pay/:token");
  const token = params?.token ?? "";
  const { t } = useT();
  const request = useGetPaymentRequest(token, { query: { queryKey: getGetPaymentRequestQueryKey(token), enabled: Boolean(token) } });
  const initiate = useInitiatePaymentRequestPayment();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(
    new URLSearchParams(window.location.search).get("payment") === "failed",
  );
  const paymentSucceeded = new URLSearchParams(window.location.search).get("payment") === "success";

  function startPayment() {
    if (!token || initiate.isPending || !request.data) return;
    setPaymentFailed(false);
    initiate.mutate(
      { token },
      {
        onSuccess: (data) => {
          if (data.action && data.fields) setPaymentInfo(data as PaymentInfo);
          else setPaymentFailed(true);
        },
        onError: () => setPaymentFailed(true),
      },
    );
  }

  function submitPayU(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paymentSubmitting) return;
    setPaymentSubmitting(true);
    event.currentTarget.submit();
  }

  const total = request.data
    ? request.data.amount * (1 + 0.02 * 1.18)
    : 0;

  return (
    <div className="flex min-h-full flex-col">
      <Seo title={`${t.pay_title} — Apna Enterprise`} description={t.pay_subtitle} noindex path={`/pay/${token}`} />
      <section className="hero-navy py-16 text-white">
        <div className="container relative z-10 mx-auto px-4 text-center lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-300">{t.pay_title}</p>
          <h1 className="mb-4 text-4xl font-extrabold md:text-5xl">{t.pay_title}</h1>
          <div className="gold-line mx-auto w-20" />
        </div>
      </section>

      <section className="flex-1 bg-[#f8fafd] px-4 py-16">
        <div className="mx-auto max-w-lg">
          {request.isLoading ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-slate-500">{t.apply_receipt_loading}</p>
            </div>
          ) : request.isError || !request.data ? (
            <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
              <FaExclamationCircle className="mx-auto mb-4 text-4xl text-red-400" />
              <h2 className="text-xl font-bold text-slate-900">{t.pay_not_found}</h2>
              <p className="mt-2 text-sm text-slate-500">{t.pay_error}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_8px_40px_rgba(7,27,74,0.1)]">
              {paymentSucceeded || request.data.paymentStatus === "paid" ? (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center text-green-700">
                  <FaCheckCircle className="mx-auto mb-2 text-3xl" />
                  <p className="font-bold">{t.pay_paid}</p>
                </div>
              ) : paymentFailed ? (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
                  <FaExclamationCircle className="mx-auto mb-2 text-2xl" />
                  <p className="text-sm font-semibold">{t.pay_failed}</p>
                </div>
              ) : null}

              <p className="mb-6 text-center leading-relaxed text-slate-600">{t.pay_subtitle}</p>
              <dl className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
                <div className="flex justify-between gap-4 text-sm text-slate-600">
                  <dt>{t.pay_client}</dt><dd className="font-semibold text-slate-900">{request.data.name}</dd>
                </div>
                <div className="flex justify-between gap-4 text-sm text-slate-600">
                  <dt>{t.pay_service}</dt><dd className="text-right font-semibold text-slate-900">{request.data.service}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-amber-200 pt-3 text-sm text-slate-600">
                  <dt>{t.pay_amount}</dt><dd>{currency(request.data.amount)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-sm text-slate-600">
                  <dt>{t.apply_payment_gateway_fee} + GST</dt><dd>{currency(total - request.data.amount)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-amber-200 pt-3 text-base font-bold text-slate-900">
                  <dt>{t.pay_online_total}</dt><dd className="text-primary">{currency(total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-5 text-slate-500">{t.pay_gateway_note}</p>

              {!paymentSucceeded && request.data.paymentStatus !== "paid" && !paymentInfo && (
                <Button type="button" onClick={startPayment} disabled={initiate.isPending} className="btn-gold mt-6 h-12 w-full rounded-xl text-base font-bold">
                  <FaCreditCard className="mr-2" />
                  {initiate.isPending ? t.payment_opening : t.pay_button}
                </Button>
              )}
              {paymentInfo && (
                <form action={paymentInfo.action} method="POST" onSubmit={submitPayU} className="mt-6">
                  {Object.entries(paymentInfo.fields).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                  ))}
                  <Button type="submit" disabled={paymentSubmitting} className="btn-gold h-12 w-full rounded-xl text-base font-bold">
                    <FaCreditCard className="mr-2" />
                    {paymentSubmitting ? t.payment_opening : t.pay_button}
                  </Button>
                </form>
              )}
              <p className="mt-4 text-center text-xs text-slate-500">{t.pay_secure_note}</p>
              <p className="mt-2 break-all text-center font-mono text-[11px] text-slate-400">{token}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}