import { useEffect, useState } from "react";
import Seo from "@/components/Seo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearch } from "wouter";
import { useCreateApplication } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaCheckCircle, FaWhatsapp, FaFileAlt } from "react-icons/fa";
import { SERVICE_CATEGORIES, ALL_SERVICE_IDS } from "@/lib/services";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
  service: z.enum(ALL_SERVICE_IDS, { required_error: "Please select a service" }),
  message: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Apply() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preSelectedService = params.get("service");

  const [submitted, setSubmitted] = useState(false);
  const [submittedService, setSubmittedService] = useState("");
  const createApplication = useCreateApplication();

  const isValidService = (s: string | null): s is (typeof ALL_SERVICE_IDS)[number] =>
    !!s && (ALL_SERVICE_IDS as readonly string[]).includes(s);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      service: isValidService(preSelectedService) ? preSelectedService : undefined,
      message: "",
    },
  });

  useEffect(() => {
    if (isValidService(preSelectedService)) {
      form.setValue("service", preSelectedService);
    }
  }, [preSelectedService, form]);

  async function onSubmit(values: FormValues) {
    createApplication.mutate(
      { data: { name: values.name, phone: values.phone, service: values.service, message: values.message || undefined } },
      {
        onSuccess: () => {
          setSubmittedService(values.service);
          setSubmitted(true);
          form.reset();
        },
      }
    );
  }

  const waLink = `https://wa.me/918437566186?text=${encodeURIComponent(`Hello Apna Enterprise, I have submitted a request for ${submittedService}. Please assist me.`)}`;

  if (submitted) {
    return (
      <div className="flex flex-col min-h-full">
        <section className="hero-navy text-white py-16">
          <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl font-extrabold mb-4">Application Submitted</h1>
            <div className="gold-line w-20 mx-auto" />
          </div>
        </section>
        <section className="flex-1 flex items-center justify-center py-20 px-4" style={{ background: "#f8fafd" }}>
          <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center" style={{ border: "1px solid #e8edf5", boxShadow: "0 8px 40px rgba(7,27,74,0.1)" }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(34,197,94,0.1)" }}
            >
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Thank You!</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Your application for <strong className="text-slate-900">{submittedService}</strong> has been received.
              Our team will contact you shortly.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#20bd5a] transition-colors"
                style={{ boxShadow: "0 4px 14px rgba(37,211,102,0.3)" }}
              >
                <FaWhatsapp className="text-xl" />
                Follow up on WhatsApp
              </a>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="w-full h-11 rounded-xl font-semibold"
                style={{ borderColor: "#d1d9e8", color: "#071B4A" }}
              >
                Submit Another Application
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
      />
      {/* ── Header ── */}
      <section className="hero-navy text-white py-16">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <p className="font-semibold uppercase tracking-widest text-xs mb-3" style={{ color: GOLD_LIGHT }}>
            Apply Online
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Apply for a Service</h1>
          <div className="gold-line w-20 mx-auto mb-5" />
          <p className="max-w-xl mx-auto text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            Fill in your details below and our team will reach out within 24 hours.
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
                <h2 className="text-white font-bold text-lg">Service Application</h2>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>All fields marked are required</p>
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
                        <FormLabel className="text-sm font-semibold text-slate-700">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            className="h-11 rounded-xl glass-input"
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
                        <FormLabel className="text-sm font-semibold text-slate-700">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+91 98765 43210"
                            className="h-11 rounded-xl glass-input"
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
                        <FormLabel className="text-sm font-semibold text-slate-700">Service Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl glass-input">
                              <SelectValue placeholder="Select a service" />
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
                        <FormLabel className="text-sm font-semibold text-slate-700">Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional details or special requirements..."
                            className="resize-none rounded-xl glass-input"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="btn-gold w-full h-12 text-base rounded-xl mt-2"
                    disabled={createApplication.isPending}
                  >
                    {createApplication.isPending ? "Submitting..." : "Submit Application"}
                  </Button>

                  {createApplication.isError && (
                    <p className="text-destructive text-sm text-center">
                      Something went wrong. Please try again.
                    </p>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
