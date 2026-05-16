import { useState, useMemo } from "react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import {
  FaPlane, FaTrain, FaIdCard, FaFingerprint, FaAddressCard, FaPassport,
  FaCar, FaIdBadge, FaFileAlt, FaUserFriends, FaHome, FaMoneyBill,
  FaStore, FaBuilding, FaBriefcase, FaGraduationCap, FaSchool,
  FaTrophy, FaAward, FaClipboardList, FaPrint, FaLaptopCode,
  FaUniversity, FaCreditCard, FaBoxOpen, FaShippingFast,
  FaGlobe, FaSearch, FaTimes, FaArrowRight,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/lib/services";
import { FaWalking, FaClock } from "react-icons/fa";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

const WALKIN_SERVICES = new Set([
  "AEPS (Aadhaar Enabled Payment System)",
  "Online Payments",
]);

const COMING_SOON_SERVICES = new Set([
  "GST Registration",
]);

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "Air Ticket Booking": FaPlane,
  "Train Ticket Booking": FaTrain,
  "PAN Card Apply": FaIdCard,
  "Aadhaar Card Services": FaFingerprint,
  "Voter Card Apply": FaAddressCard,
  "Passport Apply": FaPassport,
  "Learning License": FaCar,
  "Driving License": FaCar,
  "UDID Certificate Apply": FaIdBadge,
  "E-Shram Card": FaUserFriends,
  "Schedule Caste Certificate": FaFileAlt,
  "Punjab Resident Certificate": FaHome,
  "Income Certificate": FaMoneyBill,
  "UDYAM Certificate (MSME)": FaStore,
  "GST Registration": FaBuilding,
  "Job Application Forms (Govt Naukri)": FaBriefcase,
  "College Admission Forms": FaGraduationCap,
  "School Admission Forms": FaSchool,
  "Competitive Exam Forms": FaTrophy,
  "Scholarship Forms": FaAward,
  "General Online Form Filling": FaClipboardList,
  "Document Scanning": FaFileAlt,
  "Printing Services": FaPrint,
  "Website Design Services": FaLaptopCode,
  "AEPS (Aadhaar Enabled Payment System)": FaUniversity,
  "Online Payments": FaCreditCard,
  "International Parcel Booking": FaBoxOpen,
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  travel: FaGlobe,
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

const CATEGORY_ICON_LIGHT: Record<string, string> = {
  travel:    "bg-blue-50 text-blue-600",
  documents: "bg-emerald-50 text-emerald-600",
  forms:     "bg-violet-50 text-violet-600",
  digital:   "bg-amber-50 text-amber-600",
  financial: "bg-rose-50 text-rose-600",
  parcel:    "bg-cyan-50 text-cyan-600",
};

export default function Services() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return SERVICE_CATEGORIES.map((cat) => ({
      ...cat,
      services: cat.services.filter(
        (s) =>
          (!q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) &&
          (!activeCategory || cat.id === activeCategory)
      ),
    })).filter((cat) => cat.services.length > 0);
  }, [search, activeCategory]);

  return (
    <div className="flex flex-col min-h-full">
      <Seo
        title="Our Services — Travel, Documents, Finance & More"
        description="Browse 50+ services at Apna Enterprise Firozepur — air & train tickets, PAN card, Aadhaar, passport, voter ID, printing, financial services, international parcels and more."
        keywords="services Firozepur, air ticket booking, train ticket, PAN card, Aadhaar update, passport apply, printing services, money transfer, international parcel Firozepur"
        path="/services"
      />
      {/* ── Page Header ── */}
      <section className="hero-navy text-white py-16">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <p className="font-semibold uppercase tracking-widest text-xs mb-3" style={{ color: GOLD_LIGHT }}>
            All Services
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Our Services</h1>
          <div className="gold-line w-20 mx-auto mb-5" />
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            Travel, government documents, online forms, printing, finance, and more — all under one roof.
          </p>
        </div>
      </section>

      {/* ── Search + Category Filter ── */}
      <div
        className="border-b sticky top-[80px] z-20"
        style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(8px)", borderColor: "#e8edf5", boxShadow: "0 2px 12px rgba(7,27,74,0.06)" }}
      >
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl focus:outline-none transition-all"
                style={{
                  border: "1.5px solid #d1d9e8",
                  background: "#f8fafd",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = GOLD;
                  e.target.style.boxShadow = "0 0 0 3px rgba(212,160,23,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d9e8";
                  e.target.style.boxShadow = "none";
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
                style={
                  activeCategory === null
                    ? { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#1a1200", borderColor: "transparent", boxShadow: "0 2px 10px rgba(212,160,23,0.3)" }
                    : { background: "white", color: "#64748b", borderColor: "#d1d9e8" }
                }
              >
                All
              </button>
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200"
                  style={
                    activeCategory === cat.id
                      ? { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#1a1200", borderColor: "transparent", boxShadow: "0 2px 10px rgba(212,160,23,0.3)" }
                      : { background: "white", color: "#64748b", borderColor: "#d1d9e8" }
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Services List ── */}
      <section className="py-12 flex-1" style={{ background: "#f8fafd" }}>
        <div className="container mx-auto px-4 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <FaSearch className="text-4xl mx-auto mb-4 text-slate-300" />
              <p className="font-semibold text-lg">No services found</p>
              <p className="text-sm mt-1">Try a different search term or clear the filter.</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory(null); }}
                className="mt-4 text-sm font-semibold hover:underline"
                style={{ color: GOLD }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-14">
              {filtered.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.id] ?? FaFileAlt;
                const catGradient = CATEGORY_GRADIENT[cat.id] ?? "linear-gradient(135deg, #071B4A, #1a3a8a)";
                const lightClass = CATEGORY_ICON_LIGHT[cat.id] ?? "bg-primary/10 text-primary";
                return (
                  <div key={cat.id}>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0"
                        style={{ background: catGradient, boxShadow: "0 3px 12px rgba(0,0,0,0.15)" }}
                      >
                        <CatIcon />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{cat.name}</h2>
                        <span className="text-xs text-slate-400 font-medium">
                          {cat.services.length} service{cat.services.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Service Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {cat.services.map((service) => {
                        const Icon = SERVICE_ICONS[service.id] ?? FaFileAlt;
                        return (
                          <div key={service.id} className="card-premium p-5 flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${lightClass}`}>
                                <Icon />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">
                                  {service.name}
                                </h3>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                  {service.description}
                                </p>
                              </div>
                            </div>
                            <div className="pt-1">
                              {COMING_SOON_SERVICES.has(service.id) ? (
                                <div
                                  className="w-full h-9 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold"
                                  style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.25)", color: GOLD }}
                                >
                                  <FaClock className="text-sm" />
                                  Coming Soon
                                </div>
                              ) : WALKIN_SERVICES.has(service.id) ? (
                                <div className="w-full h-9 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold">
                                  <FaWalking className="text-sm" />
                                  Walk-in / Visit Us
                                </div>
                              ) : (
                                <Button asChild size="sm" className="btn-gold w-full h-9 rounded-xl text-xs group">
                                  <Link href={`/apply?service=${encodeURIComponent(service.id)}`}>
                                    Apply Now
                                    <FaArrowRight className="ml-2 group-hover:translate-x-0.5 transition-transform" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
