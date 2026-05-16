import { Link } from "wouter";
import {
  FaPlane, FaIdCard, FaClipboardList, FaPrint,
  FaUniversity, FaShippingFast,
  FaArrowRight, FaCheckCircle, FaUsers, FaClock, FaHeadset, FaStar,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/lib/services";
import Seo from "@/components/Seo";
import AnalogClock from "@/components/AnalogClock";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  travel: FaPlane,
  documents: FaIdCard,
  forms: FaClipboardList,
  digital: FaPrint,
  financial: FaUniversity,
  parcel: FaShippingFast,
};

const CATEGORY_GRADIENT: Record<string, string> = {
  travel:    "linear-gradient(135deg, #1e40af, #3b82f6)",
  documents: "linear-gradient(135deg, #065f46, #10b981)",
  forms:     "linear-gradient(135deg, #5b21b6, #8b5cf6)",
  digital:   "linear-gradient(135deg, #92400e, #f59e0b)",
  financial: "linear-gradient(135deg, #9f1239, #f43f5e)",
  parcel:    "linear-gradient(135deg, #164e63, #06b6d4)",
};

const CATEGORY_TAG: Record<string, string> = {
  travel:    "bg-blue-100 text-blue-700",
  documents: "bg-emerald-100 text-emerald-700",
  forms:     "bg-violet-100 text-violet-700",
  digital:   "bg-amber-100 text-amber-700",
  financial: "bg-rose-100 text-rose-700",
  parcel:    "bg-cyan-100 text-cyan-700",
};


export default function Home() {
  const totalServices = SERVICE_CATEGORIES.reduce((acc, c) => acc + c.services.length, 0);

  return (
    <div className="flex flex-col min-h-full">
      <Seo
        title="Professional Services in Firozepur, Punjab"
        description="Apna Enterprise — Firozepur's trusted multi-service centre for travel ticketing, PAN card, Aadhaar, passport, government forms, printing, finance & international parcels."
        keywords="Apna Enterprise, Firozepur services, PAN card apply, Aadhaar services, passport apply, train ticket booking, air ticket booking, government forms, printing Firozepur, financial services Punjab"
        path="/"
      />

      {/* ── HERO ── */}
      <section className="hero-navy text-white py-24 lg:py-36">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-4xl">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-8"
            style={{
              background: "rgba(212, 160, 23, 0.12)",
              border: "1px solid rgba(212, 160, 23, 0.35)",
              color: GOLD_LIGHT,
            }}
          >
            <FaStar className="text-xs" />
            Firozepur's Trusted Multi-Service Centre
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight text-white">
            Professional Services<br />
            <span style={{ color: GOLD_LIGHT }}>for Everyday Needs</span>
          </h1>

          <div className="gold-line w-24 mx-auto mb-6" />

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
            Your trusted local partner for travel ticketing, government documents, online forms,
            printing, finance, and international parcels. We make complex procedures simple.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="btn-gold w-full sm:w-auto px-10 h-14 text-base rounded-xl">
              <Link href="/services">Explore Services</Link>
            </Button>
            <Button
              asChild size="lg"
              className="w-full sm:w-auto px-10 h-14 text-base rounded-xl font-semibold bg-transparent text-white hover:bg-white/10 transition-all duration-200"
              style={{ border: "1.5px solid rgba(255,255,255,0.35)" }}
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>

          <div className="mt-14 mb-2 flex justify-center">
            <AnalogClock />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mt-10 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { value: "10,000+", label: "Happy Customers" },
              { value: `${totalServices}+`, label: "Services Available" },
              { value: "5+ Years", label: "Trusted Since" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: GOLD_LIGHT }}>{value}</div>
                <div className="text-xs text-white/60 uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT US ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-semibold uppercase tracking-widest text-sm mb-3" style={{ color: GOLD }}>
                About Us
              </p>
              <div className="gold-line w-12 mb-6" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                Your Trusted Partner for Every Service Need
              </h2>
              <p className="text-slate-600 leading-relaxed mb-5">
                Apna Enterprise is a trusted multi-service centre in Firozepur, Punjab, dedicated to making
                essential government and travel services accessible to everyone. We started with a simple belief
                — no one should struggle with paperwork, long queues, or confusing processes.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                From booking air and train tickets to processing PAN cards, Aadhaar updates, Voter IDs,
                passports, GST registration, and international parcels, we handle it all with speed,
                accuracy, and a personal touch.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "100% transparent pricing — no hidden charges",
                  "Fast processing with real-time updates",
                  "Experienced team with deep local knowledge",
                  "Serving thousands of happy customers",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-slate-700">
                    <FaCheckCircle className="mt-1 shrink-0" style={{ color: GOLD }} />
                    <span className="font-medium">{point}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="btn-gold px-8 h-12 rounded-xl">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { icon: FaUsers, value: "10,000+", label: "Happy Customers", gradient: "linear-gradient(135deg, #071B4A, #1a3a8a)" },
                { icon: FaClock, value: "5+ Years", label: "In Business", gradient: "linear-gradient(135deg, #065f46, #10b981)" },
                { icon: FaCheckCircle, value: "98%", label: "Success Rate", gradient: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})` },
                { icon: FaHeadset, value: "6 Days", label: "Expert Support", gradient: "linear-gradient(135deg, #5b21b6, #8b5cf6)" },
              ].map(({ icon: Icon, value, label, gradient }) => (
                <div
                  key={label}
                  className="rounded-2xl p-8 flex flex-col items-center text-center text-white"
                  style={{ background: gradient, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                >
                  <Icon className="text-3xl mb-3 opacity-90" />
                  <span className="text-3xl font-extrabold mb-1">{value}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR SERVICES ── */}
      <section className="py-20" style={{ background: "#f8fafd" }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <p className="font-semibold uppercase tracking-widest text-sm mb-2" style={{ color: GOLD }}>
              What We Offer
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Our Services</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              We offer {totalServices}+ services across 6 categories to meet all your needs.
            </p>
            <div className="gold-line w-24 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? FaIdCard;
              const gradient = CATEGORY_GRADIENT[cat.id] ?? "linear-gradient(135deg, #071B4A, #1a3a8a)";
              const tagClass = CATEGORY_TAG[cat.id] ?? "bg-slate-100 text-slate-700";
              return (
                <div key={cat.id} className="card-premium p-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white text-2xl"
                    style={{ background: gradient, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                  >
                    <Icon />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{cat.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {cat.services.length} service{cat.services.length !== 1 ? "s" : ""} available
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {cat.services.slice(0, 3).map((s) => (
                      <span key={s.id} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${tagClass}`}>
                        {s.name}
                      </span>
                    ))}
                    {cat.services.length > 3 && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-500">
                        +{cat.services.length - 3} more
                      </span>
                    )}
                  </div>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-all duration-200 hover:gap-3"
                    style={{ color: GOLD }}
                  >
                    View All <FaArrowRight className="text-xs" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Button asChild size="lg" className="btn-gold px-12 h-14 text-base rounded-xl">
              <Link href="/apply">Apply for Any Service</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="hero-navy text-white py-20">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-3xl">
          <p className="font-semibold uppercase tracking-widest text-sm mb-3" style={{ color: GOLD_LIGHT }}>
            Ready to Get Started?
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-5">
            Let Us Handle the Paperwork
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.75)" }}>
            Walk in or apply online — our team will guide you through every step.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="btn-gold w-full sm:w-auto px-10 h-14 text-base rounded-xl">
              <Link href="/apply">Apply Now</Link>
            </Button>
            <Button
              asChild size="lg"
              className="w-full sm:w-auto px-10 h-14 text-base rounded-xl font-semibold bg-transparent text-white hover:bg-white/10 transition-all"
              style={{ border: "1.5px solid rgba(255,255,255,0.3)" }}
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
