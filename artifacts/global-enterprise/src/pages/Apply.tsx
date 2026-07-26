import { useEffect, useState, useMemo } from "react";
import Seo from "@/components/Seo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearch, Link } from "wouter";
import { useCreateApplication } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaCheckCircle, FaEnvelope, FaFileAlt, FaPhone, FaCopy, FaCheck, FaSearch } from "react-icons/fa";
import { SERVICE_CATEGORIES, ALL_SERVICE_IDS } from "@/lib/services";
import { useT } from "@/i18n";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

type FormValues = {
  name: string;
  phone: string;
  service: (typeof ALL_SERVICE_IDS)[number];
  message?: string;
  callbackRequested?: boolean;
};

const isValidService = (s: string | null): s is (typeof ALL_SERVICE_IDS)[number] =>
  !!s && (ALL_SERVICE_IDS as readonly string[]).includes(s);

export default function Apply() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preSelectedService = params.get("service");
  const { t } = useT();

  const [submitted, setSubmitted] = useState(false);
  const [submittedService, setSubmittedService] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const createApplication = useCreateApplication();

  const formSchema = useMemo(() =>
    z.object({
      name: z.string().min(2, t.apply_val_name).max(100),
      phone: z.string().min(10, t.apply_val_phone).max(15),
      service: z.enum(ALL_SERVICE_IDS, { required_error: t.apply_val_service }),
      message: z.string().max(1000).optional(),
      callbackRequested: z.boolean().optional(),
    }),
    [t]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      service: isValidService(preSelectedService) ? preSelectedService : undefined,
      message: "",
      callbackRequested: false,
    },
  });

  useEffect(() => {
    if (isValidService(preSelectedService)) {
      form.setValue("service", preSelectedService);
    }
  }, [preSelectedService, form]);

  async function onSubmit(values: FormValues) {
    createApplication.mutate(
      {
        data: {
          name: values.name,
          phone: values.phone,
          service: values.service,
          message: values.message || undefined,
          callbackRequested: values.callbackRequested,
        },
      },
      {
        onSuccess: (data: any) => {
          setSubmittedService(values.service);
          setTrackingNumber(data?.trackingNumber ?? "");
          setSubmitted(true);
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
              {t.apply_success_desc(submittedService)}
            </p>

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
        <div className="container mx-auto px-4 max-w-xl">
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
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">{t.apply_service}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                      {t.apply_error}
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
