import { useEffect, useState, useMemo } from "react";
import Seo from "@/components/Seo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearch, Link } from "wouter";
import { useCreateApplication, type CreateApplicationBody } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { FaCheckCircle, FaEnvelope, FaFileAlt, FaPhone, FaCopy, FaCheck, FaSearch, FaCreditCard, FaDownload } from "react-icons/fa";
import { SERVICE_CATEGORIES, ALL_SERVICE_IDS } from "@/lib/services";
import { getServiceFormConfig, type ServiceField } from "@/lib/service-application-fields";
import { useT } from "@/i18n";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

type FormValues = {
  name: string;
  phone: string;
  email: string;
  service: CreateApplicationBody["service"];
  details: Record<string, unknown>;
  message?: string;
  callbackRequested?: boolean;
};

type PaymentInfo = {
  required: boolean;
  action: string;
  fields: Record<string, string>;
  amount: number;
  baseAmount: number;
  gatewayFee: number;
  gatewayFeeGst: number;
};

type ReceiptData = {
  trackingNumber: string;
  name: string;
  phone: string;
  email?: string | null;
  service: string;
  paymentAmount: number;
  paymentTxnId: string;
  paidAt: string;
  createdAt: string;
};

const isValidService = (s: string | null): s is FormValues["service"] =>
  !!s && (ALL_SERVICE_IDS as readonly string[]).includes(s);

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function Apply() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preSelectedService = params.get("service");
  const { t } = useT();

  const [submitted, setSubmitted] = useState(params.get("payment") === "success");
  const [submittedService, setSubmittedService] = useState("your application");
  const [trackingNumber, setTrackingNumber] = useState(params.get("tracking") ?? "");
  const [pricingWaiting, setPricingWaiting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(params.get("payment") === "failed");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptDownloading, setReceiptDownloading] = useState(false);
  const createApplication = useCreateApplication();
  const paymentSucceeded = params.get("payment") === "success";

  const formSchema = useMemo(() =>
    z.object({
      name: z.string().min(2, t.apply_val_name).max(100),
      phone: z.string().min(10, t.apply_val_phone).max(15),
      email: z
        .string()
        .trim()
        .email(t.apply_val_email)
        .optional()
        .or(z.literal("")),
      service: z.enum(ALL_SERVICE_IDS, { required_error: t.apply_val_service }),
      details: z.record(z.unknown()).default({}),
      message: z.string().max(1000).optional(),
      callbackRequested: z.boolean().optional(),
    }).superRefine((values, ctx) => {
      const config = getServiceFormConfig(values.service);
      for (const field of config.fields) {
        if (field.visibleWhen && !field.visibleWhen(values.details)) continue;
        const value = values.details?.[field.id];
        const empty = Array.isArray(value) ? value.length === 0 : value === undefined || value === null || String(value).trim() === "";
        if (field.required && empty) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["details", field.id],
            message: `${field.label} is required`,
          });
        }
      }

      if (values.service === "Air Ticket Booking" && values.details?.tripType === "round-trip" && !values.details?.returnDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["details", "returnDate"],
          message: "Return date is required for a round trip",
        });
      }

      if (values.service === "Insurance Services") {
        const insuranceType = String(values.details?.insuranceType ?? "");
        const isVehicleInsurance = insuranceType.startsWith("Car Insurance") || insuranceType.startsWith("Bike Insurance");
        if (isVehicleInsurance && !String(values.details?.rcNumber ?? "").trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["details", "rcNumber"],
            message: "RC Number is required for car or bike insurance",
          });
        }
      }
    }),
    [t]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: isValidService(preSelectedService) ? preSelectedService : undefined,
      details: {},
      message: "",
      callbackRequested: false,
    },
  });

  useEffect(() => {
    if (isValidService(preSelectedService)) {
      form.setValue("service", preSelectedService);
    }
  }, [preSelectedService, form]);

  useEffect(() => {
    if (!paymentSucceeded || !trackingNumber) {
      setReceipt(null);
      setReceiptLoading(false);
      return;
    }

    let cancelled = false;
    setReceiptLoading(true);
    fetch(`/api/applications/receipt/${encodeURIComponent(trackingNumber)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Receipt is not ready");
        return response.json() as Promise<ReceiptData>;
      })
      .then((data) => {
        if (!cancelled) {
          setReceipt(data);
          setSubmittedService(data.service);
        }
      })
      .catch(() => {
        if (!cancelled) setReceipt(null);
      })
      .finally(() => {
        if (!cancelled) setReceiptLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [paymentSucceeded, trackingNumber]);

  async function onSubmit(values: FormValues) {
    createApplication.mutate(
      {
        data: {
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
          service: values.service,
           details: JSON.stringify(values.details ?? {}),
          message: values.message || undefined,
          callbackRequested: values.callbackRequested,
        },
      },
      {
        onSuccess: (data: any) => {
          setSubmittedService(values.service);
          setTrackingNumber(data?.trackingNumber ?? "");
          if (data?.payment?.required) {
            setPaymentInfo(data.payment);
          } else {
             setPricingWaiting(data?.pricingStatus === "waiting_for_price");
            setSubmitted(true);
          }
          form.reset();
        },
      }
    );
  }

  function handleCopy() {
    navigator.clipboard.writeText(trackingNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function submitPayU(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paymentSubmitting) return;
    setPaymentSubmitting(true);
    event.currentTarget.submit();
  }

  async function downloadReceipt() {
    if (!receipt) return;
    setReceiptDownloading(true);
    try {
      const pdf = await PDFDocument.create();
      const page = pdf.addPage([595, 842]);
      const regular = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const navy = rgb(7 / 255, 27 / 255, 74 / 255);
      const gold = rgb(212 / 255, 160 / 255, 23 / 255);
      const slate = rgb(71 / 255, 85 / 255, 105 / 255);
      let y = 770;

      page.drawText("APNA ENTERPRISE", { x: 52, y, size: 22, font: bold, color: navy });
      y -= 28;
      page.drawText("Payment Receipt", { x: 52, y, size: 13, font: regular, color: gold });
      page.drawLine({ start: { x: 52, y: y - 18 }, end: { x: 543, y: y - 18 }, thickness: 1.5, color: gold });
      y -= 68;

      const drawRow = (label: string, value: string) => {
        page.drawText(label, { x: 52, y, size: 10, font: regular, color: slate });
        page.drawText(value, { x: 220, y, size: 10, font: bold, color: navy });
        y -= 30;
      };

      drawRow("Customer Name", receipt.name);
      drawRow("Phone", receipt.phone);
      if (receipt.email) drawRow("Email", receipt.email);
      drawRow("Service", receipt.service);
      drawRow("Tracking Number", receipt.trackingNumber);
      drawRow("Payment Reference", receipt.paymentTxnId);
      drawRow("Paid On", new Date(receipt.paidAt).toLocaleString("en-IN"));
      y -= 8;
      page.drawLine({ start: { x: 52, y }, end: { x: 543, y }, thickness: 1, color: rgb(226 / 255, 232 / 255, 240 / 255) });
      y -= 34;
      page.drawText("Amount Paid", { x: 52, y, size: 13, font: bold, color: navy });
      page.drawText(`INR ${receipt.paymentAmount.toFixed(2)}`, { x: 410, y, size: 15, font: bold, color: gold });
      y -= 58;
      page.drawText("Thank you for choosing Apna Enterprise.", { x: 52, y, size: 10, font: regular, color: slate });
      page.drawText("This is a computer-generated receipt.", { x: 52, y: y - 18, size: 9, font: regular, color: slate });

      const bytes = await pdf.save();
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `apna-enterprise-receipt-${receipt.trackingNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setReceiptDownloading(false);
    }
  }

  if (paymentInfo) {
    return (
      <div className="flex flex-col min-h-full">
        <section className="hero-navy text-white py-16">
          <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl font-extrabold mb-4">{t.apply_payment_title}</h1>
            <div className="gold-line w-20 mx-auto" />
          </div>
        </section>
        <section className="flex-1 flex items-center justify-center py-20 px-4" style={{ background: "#f8fafd" }}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center" style={{ border: "1px solid #e8edf5", boxShadow: "0 8px 40px rgba(7,27,74,0.1)" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(212,160,23,0.12)" }}>
              <FaCreditCard className="text-3xl" style={{ color: GOLD }} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">{t.apply_payment_heading}</h2>
            <p className="text-slate-600 mb-5 leading-relaxed">{t.apply_payment_desc}</p>
            <div className="rounded-xl p-4 mb-5 text-left" style={{ background: "rgba(212,160,23,0.08)", border: "1.5px solid rgba(212,160,23,0.3)" }}>
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>{t.apply_payment_service}</span><strong className="text-slate-900">{submittedService}</strong>
              </div>
              <div className="flex justify-between text-sm text-slate-600 pt-3">
                <span>{t.apply_payment_base_amount}</span>
                <span>{formatCurrency(paymentInfo.baseAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 pt-2">
                <span>{t.apply_payment_gateway_fee}</span>
                <span>{formatCurrency(paymentInfo.gatewayFee)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 pt-2 pb-3">
                <span>{t.apply_payment_gateway_gst}</span>
                <span>{formatCurrency(paymentInfo.gatewayFeeGst)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-amber-200">
                <span className="font-semibold text-slate-700">{t.apply_payment_amount}</span>
                <strong className="text-xl" style={{ color: GOLD }}>{formatCurrency(paymentInfo.amount)}</strong>
              </div>
            </div>
            <form action={paymentInfo.action} method="POST" onSubmit={submitPayU}>
              {Object.entries(paymentInfo.fields).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
                 <button type="submit" disabled={paymentSubmitting} className="btn-gold w-full h-12 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 disabled:opacity-60">
                 <FaCreditCard /> {paymentSubmitting ? t.payment_opening : t.apply_pay_now}
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4">{t.apply_payment_secure}</p>
            <p className="font-mono text-xs text-slate-400 mt-2">{trackingNumber}</p>
          </div>
        </section>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-full">
        <section className="hero-navy text-white py-16">
          <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl font-extrabold mb-4">{t.apply_submitted_title}</h1>
            <div className="gold-line w-20 mx-auto" />
          </div>
        </section>
        <section className="flex-1 flex items-center justify-center py-20 px-4" style={{ background: "#f8fafd" }}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center" style={{ border: "1px solid #e8edf5", boxShadow: "0 8px 40px rgba(7,27,74,0.1)" }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(34,197,94,0.1)" }}
            >
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">{t.apply_thank_you}</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
               {pricingWaiting ? t.apply_price_waiting_desc : t.apply_success_desc(submittedService)}
            </p>

             <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 mb-6 text-left">
               <p className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3">{t.apply_success_next_steps}</p>
               <ul className="space-y-2 text-sm text-slate-600">
                 <li className="flex gap-2"><span className="font-bold text-blue-700">1.</span><span>{t.apply_success_step_track}</span></li>
                 <li className="flex gap-2"><span className="font-bold text-blue-700">2.</span><span>{t.apply_success_step_price}</span></li>
                 <li className="flex gap-2"><span className="font-bold text-blue-700">3.</span><span>{t.apply_success_step_pay}</span></li>
               </ul>
             </div>

            {paymentSucceeded && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-6 text-left">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <FaCheckCircle />
                  <span>{t.apply_payment_success}</span>
                </div>
                {receiptLoading ? (
                  <p className="text-xs text-green-700/80 mt-2">{t.apply_receipt_loading}</p>
                ) : receipt ? (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-slate-700">
                      <span>{t.apply_receipt_amount}</span>
                      <strong>{formatCurrency(receipt.paymentAmount)}</strong>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 break-all">
                      {t.apply_receipt_reference}: {receipt.paymentTxnId}
                    </p>
                    <Button
                      type="button"
                      onClick={downloadReceipt}
                      disabled={receiptDownloading}
                      className="btn-gold w-full h-11 rounded-xl mt-4 gap-2"
                    >
                      <FaDownload />
                      {receiptDownloading ? t.apply_receipt_downloading : t.apply_receipt_download}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-green-700/80 mt-2">{t.apply_receipt_unavailable}</p>
                )}
              </div>
            )}

            {/* Tracking Number Box */}
            {trackingNumber && (
              <div
                className="rounded-xl p-4 mb-6 text-left"
                style={{ background: "rgba(212,160,23,0.08)", border: "1.5px solid rgba(212,160,23,0.3)" }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: GOLD }}>
                  {t.apply_tracking_label}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-bold text-slate-900 flex-1 tracking-widest">
                    {trackingNumber}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: copied ? "#dcfce7" : "rgba(212,160,23,0.15)", color: copied ? "#15803d" : GOLD }}
                  >
                    {copied ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
                    {copied ? t.apply_tracking_copied : t.apply_tracking_copy}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t.apply_tracking_note}{" "}
                  <Link href="/track" className="underline font-semibold" style={{ color: GOLD }}>
                    Track Application
                  </Link>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <a
                href="mailto:info@apnaenterprise.in"
                className="flex items-center justify-center gap-3 text-white font-semibold py-3 px-6 rounded-xl transition-colors btn-gold"
              >
                <FaEnvelope className="text-lg" />
                {t.apply_email_followup}
              </a>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full h-11 rounded-xl font-semibold"
                style={{ borderColor: "#d1d9e8", color: "#071B4A" }}
              >
                {t.apply_another}
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Seo
        title="Apply for a Service — Quick & Easy Application"
        description="Apply online for any service at Apna Enterprise Firozepur. Fill in your details, choose your service, and we'll get back to you on WhatsApp promptly."
        keywords="apply service Firozepur, online application Apna Enterprise, service request Punjab, PAN card apply online, Aadhaar apply Firozepur"
        path="/apply"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://apnaenterprise.in/" },
            { "@type": "ListItem", "position": 2, "name": "Apply Now", "item": "https://apnaenterprise.in/apply" }
          ]
        }}
      />
      {/* ── Header ── */}
      <section className="hero-navy text-white py-16">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <p className="font-semibold uppercase tracking-widest text-xs mb-3" style={{ color: GOLD_LIGHT }}>
            {t.apply_online_label}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t.apply_title}</h1>
          <div className="gold-line w-20 mx-auto mb-5" />
          <p className="max-w-xl mx-auto text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            {t.apply_subtitle}
          </p>
        </div>
      </section>

      <section className="flex-1 py-16" style={{ background: "#f8fafd" }}>
         <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl" style={{ border: "1px solid #e8edf5", boxShadow: "0 8px 40px rgba(7,27,74,0.08)" }}>
            {/* Form Header */}
            <div
              className="px-8 py-5 rounded-t-2xl flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #071B4A, #0d2069)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(212,160,23,0.15)" }}
              >
                <FaFileAlt style={{ color: GOLD_LIGHT }} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{t.apply_form_title}</h2>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{t.apply_form_subtitle}</p>
              </div>
            </div>

            <div className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {paymentFailed && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {t.apply_payment_failed}
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">{t.apply_name}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.apply_name_placeholder}
                            className="h-11 rounded-xl"
                            style={{ color: "#071B4A", background: "rgba(7,27,74,0.03)", borderColor: "#d1d9e8" }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">{t.apply_phone}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.apply_phone_placeholder}
                            className="h-11 rounded-xl"
                            style={{ color: "#071B4A", background: "rgba(7,27,74,0.03)", borderColor: "#d1d9e8" }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">{t.apply_email}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t.apply_email_placeholder}
                            className="h-11 rounded-xl"
                            style={{ color: "#071B4A", background: "rgba(7,27,74,0.03)", borderColor: "#d1d9e8" }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">{t.apply_service}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("details", {}, { shouldValidate: true });
                          }}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl" style={{ color: "#071B4A", background: "rgba(7,27,74,0.03)", borderColor: "#d1d9e8" }}>
                              <SelectValue placeholder={t.apply_service_placeholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-72">
                            {SERVICE_CATEGORIES.map((cat) => (
                              <div key={cat.id}>
                                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 sticky top-0">
                                  {cat.name}
                                </div>
                                {cat.services.map((s) => (
                                  <SelectItem key={s.id} value={s.id} className="pl-5">
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Service-specific details */}
                  {form.watch("service") && (
                    <ServiceDetailsFields
                      service={form.watch("service")}
                      form={form}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">{t.apply_message}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.apply_message_placeholder}
                            className="resize-none rounded-xl"
                            style={{ color: "#071B4A", background: "rgba(7,27,74,0.03)", borderColor: "#d1d9e8" }}
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Callback Checkbox */}
                  <FormField
                    control={form.control}
                    name="callbackRequested"
                    render={({ field }) => (
                      <FormItem>
                        <label
                          className="flex items-start gap-3 cursor-pointer rounded-xl p-4 transition-colors"
                          style={{ background: field.value ? "rgba(212,160,23,0.07)" : "rgba(7,27,74,0.03)", border: `1.5px solid ${field.value ? "rgba(212,160,23,0.4)" : "#d1d9e8"}` }}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={field.value ?? false}
                              onChange={field.onChange}
                              className="sr-only"
                            />
                            <div
                              className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                              style={{
                                background: field.value ? GOLD : "white",
                                borderColor: field.value ? GOLD : "#d1d9e8",
                              }}
                            >
                              {field.value && <FaCheck className="text-white text-xs" />}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                              <FaPhone className="text-xs" style={{ color: GOLD }} />
                              {t.apply_callback_label}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.apply_callback_desc}</p>
                          </div>
                        </label>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="btn-gold w-full h-12 text-base rounded-xl mt-2"
                    disabled={createApplication.isPending}
                  >
                    {createApplication.isPending ? t.apply_submitting : t.apply_submit}
                  </Button>

                  {createApplication.isError && (
                    <p className="text-destructive text-sm text-center">
                      {paymentFailed ? t.apply_payment_failed : t.apply_error}
                    </p>
                  )}
                </form>
              </Form>
            </div>
          </div>

          {/* Track link below form */}
          <div className="mt-5 text-center">
            <Link
              href="/track"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: GOLD }}
            >
              <FaSearch className="text-xs" />
              Already applied? Track your application
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceDetailsFields({
  service,
  form,
}: {
  service: FormValues["service"];
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  const { lang } = useT();
  const config = getServiceFormConfig(service);
  const details = form.watch("details") ?? {};
  const detailErrors = form.formState.errors.details as Record<string, { message?: string }> | undefined;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-5">
      <div>
        <p className="text-sm font-bold text-slate-800">Details for this service</p>
         <p className="text-xs text-slate-600 mt-1 leading-relaxed">{lang === "pa" ? (config.introPa ?? config.intro) : config.intro}</p>
      </div>

      {config.documents && (
        <div className="rounded-xl bg-white border border-amber-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Keep these documents ready</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {config.documents.map((document) => (
              <li key={document} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                {document}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {config.fields.filter((field) => !field.visibleWhen || field.visibleWhen(details)).map((field) => {
          const error = detailErrors?.[field.id]?.message;
          return (
            <div key={field.id} className={field.kind === "textarea" || field.kind === "documents" ? "sm:col-span-2" : ""}>
              {field.kind === "documents" ? (
                <DocumentChecklist
                  field={field}
                  selected={Array.isArray(details[field.id]) ? details[field.id] as string[] : []}
                  onChange={(next) => form.setValue(`details.${field.id}` as any, next, { shouldDirty: true, shouldValidate: true })}
                />
              ) : (
                <>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                    {lang === "pa" ? (field.paLabel ?? field.label) : field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.kind === "select" ? (
                    <Select
                      value={String(details[field.id] ?? "")}
                      onValueChange={(value) => form.setValue(`details.${field.id}` as any, value, { shouldDirty: true, shouldValidate: true })}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-white border-slate-300">
                        <SelectValue placeholder={lang === "pa" ? (field.paPlaceholder ?? field.paLabel ?? field.label) : (field.placeholder ?? `Select ${field.label.toLowerCase()}`)} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.kind === "textarea" ? (
                    <Textarea
                      rows={3}
                      placeholder={lang === "pa" ? (field.paPlaceholder ?? field.placeholder) : field.placeholder}
                      className="resize-none rounded-xl bg-white border-slate-300"
                      {...form.register(`details.${field.id}` as any)}
                    />
                  ) : (
                    <Input
                      type={field.kind === "date" ? "date" : field.kind === "number" ? "number" : "text"}
                      placeholder={lang === "pa" ? (field.paPlaceholder ?? field.placeholder) : field.placeholder}
                      min={field.kind === "number" ? 1 : undefined}
                      className="h-11 rounded-xl bg-white border-slate-300"
                      {...form.register(`details.${field.id}` as any)}
                    />
                  )}
                  {field.help && <p className="text-[11px] text-slate-500 mt-1">{field.help}</p>}
                </>
              )}
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DocumentChecklist({
  field,
  selected,
  onChange,
}: {
  field: ServiceField;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {field.options?.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer text-xs transition-colors ${
                checked ? "border-amber-400 bg-white text-slate-800" : "border-slate-200 bg-white/70 text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(checked ? selected.filter((value) => value !== option.value) : [...selected, option.value])}
                className="accent-amber-600 h-4 w-4"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
