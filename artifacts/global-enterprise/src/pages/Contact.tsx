import { FaMapMarkerAlt, FaClock, FaEnvelope } from "react-icons/fa";
import Seo from "@/components/Seo";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

export default function Contact() {
  return (
    <div className="flex flex-col min-h-full">
      <Seo
        title="Contact Us — Reach Apna Enterprise in Firozepur"
        description="Get in touch with Apna Enterprise, Firozepur. Email us or fill the application form. We're here to help with all your service needs."
        keywords="contact Apna Enterprise, Firozepur service centre address, email Apna Enterprise"
        path="/contact"
      />
      {/* ── Header ── */}
      <section className="hero-navy text-white py-16">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <p className="font-semibold uppercase tracking-widest text-xs mb-3" style={{ color: GOLD_LIGHT }}>
            Reach Out
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact Us</h1>
          <div className="gold-line w-20 mx-auto mb-5" />
          <p className="max-w-xl mx-auto text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            Reach us anytime — we are here to assist you Monday through Saturday.
          </p>
        </div>
      </section>

      <section className="flex-1 py-16" style={{ background: "#f8fafd" }}>
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* ── Contact Details ── */}
            <div className="space-y-5">
              {/* Info Card */}
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e8edf5", boxShadow: "0 4px 24px rgba(7,27,74,0.08)" }}>
                {/* Card Header */}
                <div className="px-8 py-5" style={{ background: "linear-gradient(135deg, #071B4A, #0d2069)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <h2 className="text-xl font-bold text-white">Get in Touch</h2>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>We'd love to hear from you.</p>
                </div>

                <div className="p-8 space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(7,27,74,0.07)" }}
                    >
                      <FaEnvelope style={{ color: GOLD, fontSize: "1.1rem" }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                      <a
                        href="mailto:info@apnaenterprise.in"
                        className="font-semibold text-slate-800 hover:underline transition-colors"
                      >
                        info@apnaenterprise.in
                      </a>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(7,27,74,0.07)" }}
                    >
                      <FaMapMarkerAlt style={{ color: GOLD, fontSize: "1.1rem" }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        Apna Enterprise,<br />
                        Dharamkot Road Jogewala,<br />
                        Firozepur, Punjab – 142044
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(7,27,74,0.07)" }}
                    >
                      <FaClock style={{ color: GOLD, fontSize: "1.1rem" }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Business Hours</p>
                      <p className="text-slate-800 font-semibold">Mon – Sat: 9:00 AM – 7:00 PM</p>
                      <p className="text-slate-500 text-sm">Sundays &amp; Public Holidays: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Map + Quick Contact ── */}
            <div className="flex flex-col gap-6">
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: "1px solid #e8edf5", boxShadow: "0 4px 24px rgba(7,27,74,0.08)" }}
              >
                <iframe
                  title="Apna Enterprise Location"
                  src="https://maps.google.com/maps?q=31.105486,75.0642315&z=17&output=embed"
                  width="100%"
                  height="320"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">Dharamkot Road Jogewala, Firozepur</p>
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=31.105486,75.0642315"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
                    style={{ background: "#071B4A" }}
                  >
                    <FaMapMarkerAlt className="text-xs" style={{ color: GOLD }} />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Quick assistance card */}
              <div
                className="rounded-2xl p-7 text-white"
                style={{ background: "linear-gradient(135deg, #071B4A, #0d2069)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="gold-line w-12 mb-4" />
                <h3 className="font-bold text-xl mb-2">Need Assistance?</h3>
                <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Email us or submit an application form and our team will get back to you within 24 hours.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="mailto:info@apnaenterprise.in"
                    className="inline-flex items-center gap-2 font-semibold py-3 px-7 rounded-xl text-sm transition-all btn-gold"
                  >
                    <FaEnvelope className="text-base" />
                    Email Us
                  </a>
                  <a
                    href="/apply"
                    className="inline-flex items-center justify-center gap-2 font-semibold py-3 px-7 rounded-xl text-sm transition-all"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    Apply for a Service
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
