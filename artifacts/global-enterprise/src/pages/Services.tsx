import { useState, useMemo } from "react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import {
  FaPlane, FaTrain, FaIdCard, FaFingerprint, FaAddressCard, FaPassport,
  FaCar, FaIdBadge, FaFileAlt, FaUserFriends, FaHome, FaMoneyBill,
  FaStore, FaBuilding, FaBriefcase, FaGraduationCap, FaSchool,
  FaTrophy, FaAward, FaClipboardList, FaPrint, FaLaptopCode,
  FaUniversity, FaCreditCard, FaBoxOpen, FaShippingFast,
  FaGlobe, FaSearch, FaTimes, FaArrowRight, FaShieldAlt,
  FaHeadset, FaUsers, FaCheckCircle, FaClock, FaBox,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { SERVICE_CATEGORIES } from "@/lib/services";
import { FaWalking, FaClock } from "react-icons/fa";
import { useT } from "@/i18n";

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
  insurance: FaShieldAlt,
  parcel: FaShippingFast,
};

const CATEGORY_GRADIENT: Record<string, string> = {
  travel:    "linear-gradient(135deg, #1e40af, #3b82f6)",
  documents: "linear-gradient(135deg, #065f46, #10b981)",
  forms:     "linear-gradient(135deg, #5b21b6, #8b5cf6)",
  digital:   "linear-gradient(135deg, #92400e, #f59e0b)",
  financial: "linear-gradient(135deg, #9f1239, #f43f5e)",
  insurance: "linear-gradient(135deg, #3730a3, #6366f1)",
  parcel:    "linear-gradient(135deg, #164e63, #06b6d4)",
};

const CATEGORY_ICON_LIGHT: Record<string, string> = {
  travel:    "bg-blue-50 text-blue-600",
  documents: "bg-emerald-50 text-emerald-600",
  forms:     "bg-violet-50 text-violet-600",
  digital:   "bg-amber-50 text-amber-600",
  financial: "bg-rose-50 text-rose-600",
  insurance: "bg-indigo-50 text-indigo-600",
  parcel:    "bg-cyan-50 text-cyan-600",
};

const CATEGORY_COPY: Record<string, string> = {
  travel: "Book flights, trains and buses with ease.",
  documents: "Apply and manage important documents quickly.",
  forms: "Fill and submit online forms with expert guidance.",
  digital: "High quality printing, scanning and digital work.",
  financial: "Secure and easy financial services for your needs.",
  insurance: "Get protected with reliable insurance solutions.",
  parcel: "Send your parcels across India and internationally.",
};

const CATEGORY_SHORT_NAMES: Record<string, string[]> = {
  travel: ["Air Ticket", "Train Ticket", "Bus Ticket"],
  documents: ["PAN Card", "Aadhaar Update", "Voter Card"],
  forms: ["Job Forms", "College Admission", "School Admission"],
  digital: ["Document Scanning", "Printing", "Website Design"],
  financial: ["AEPS Payment", "Online Payments"],
  insurance: ["Life Insurance", "Bike Insurance"],
  parcel: ["International Parcel Booking"],
};

export default function Services() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { t } = useT();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const categories = q
      ? SERVICE_CATEGORIES
      : activeCategory
        ? SERVICE_CATEGORIES.filter((cat) => cat.id === activeCategory)
        : SERVICE_CATEGORIES;

    return categories.map((cat) => ({
      ...cat,
      services: cat.services.filter(
        (s) =>
          !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.services.length > 0);
  }, [search, activeCategory]);

  const totalServices = SERVICE_CATEGORIES.reduce((total, category) => total + category.services.length, 0);

  return (
    <div className="services-page flex flex-col min-h-full">
      <Seo
        title="Our Services — Travel, Documents, Finance & More"
        description="Browse 50+ services at Apna Enterprise Firozepur — air & train tickets, PAN card, Aadhaar, passport, voter ID, printing, financial services, international parcels and more."
        keywords="services Firozepur, air ticket booking, train ticket, PAN card, Aadhaar update, passport apply, printing services, money transfer, international parcel Firozepur"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://apnaenterprise.in/" },
            { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://apnaenterprise.in/services" }
          ]
        }}
        path="/services"
      />
      {/* ── Services Hero ── */}
      <section className="services-page__hero text-white">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="services-page__hero-grid">
            <div className="max-w-xl">
              <p className="services-page__eyebrow">{t.services_all_label}</p>
              <h1 className="services-page__title">
                All Your Essential Services
                <span>in One Place</span>
              </h1>
              <p className="services-page__hero-copy">{t.services_desc}</p>
            </div>

            <div className="services-page__hero-visual" aria-hidden="true">
              <div className="services-page__hero-script">Simple<br />Reliable<br />Hassle-Free</div>
              <div className="services-page__hero-icons">
                {[
                  { label: "Documents", icon: FaFileAlt, tone: "blue" },
                  { label: "Travel", icon: FaPlane, tone: "sky" },
                  { label: "Finance", icon: FaCreditCard, tone: "green" },
                  { label: "Printing", icon: FaPrint, tone: "purple" },
                  { label: "International", icon: FaGlobe, tone: "violet" },
                ].map(({ label, icon: Icon, tone }) => (
                  <div key={label} className={`services-page__hero-icon services-page__hero-icon--${tone}`}>
                    <Icon />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search + Category Filter ── */}
      <div className="services-page__filter-wrap">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="services-page__filter-bar">
            {/* Search */}
            <div className="services-page__search">
              <FaSearch />
              <input
                type="text"
                placeholder={`${t.services_search_placeholder} (e.g. PAN Card, Air Ticket, Printing...)`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search all services"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="services-page__chips">
              <button
                onClick={() => setActiveCategory(null)}
                className={`services-page__chip${activeCategory === null ? " is-active" : ""}`}
              >
                {t.services_all_chip}
              </button>
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`services-page__chip${activeCategory === cat.id ? " is-active" : ""}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Overview ── */}
      <section className="services-page__content">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="services-page__category-grid">
            {SERVICE_CATEGORIES.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat.id] ?? FaFileAlt;
              const catGradient = CATEGORY_GRADIENT[cat.id] ?? "linear-gradient(135deg, #071B4A, #1a3a8a)";
              const lightClass = CATEGORY_ICON_LIGHT[cat.id] ?? "bg-primary/10 text-primary";
              return (
                <article key={cat.id} className="services-page__category-card">
                  <div className="services-page__category-art" style={{ background: catGradient }} aria-hidden="true">
                    <CatIcon />
                  </div>
                  <div className="services-page__category-copy">
                    <div className="services-page__category-heading">
                      <div className={`services-page__category-icon ${lightClass}`}><CatIcon /></div>
                      <div>
                        <h2>{cat.name}</h2>
                        <p>{t.services_available(cat.services.length)}</p>
                      </div>
                    </div>
                    <p className="services-page__category-description">{CATEGORY_COPY[cat.id]}</p>
                    <div className="services-page__category-tags">
                      {(CATEGORY_SHORT_NAMES[cat.id] ?? cat.services.slice(0, 3).map((service) => service.name)).map((name) => (
                        <span key={name}>{name}</span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="services-page__view-link"
                      onClick={() => {
                        setSearch("");
                        setActiveCategory(cat.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      View Services <FaArrowRight />
                    </button>
                  </div>
                </article>
              );
            })}

            <article className="services-page__category-card services-page__category-card--help">
              <div className="services-page__help-icon"><FaHeadset /></div>
              <div className="services-page__category-copy">
                <div className="services-page__category-heading">
                  <div>
                    <h2>Need Help?</h2>
                    <p>Not sure which service you need?</p>
                  </div>
                </div>
                <p className="services-page__category-description">Our team is here to guide you to the right service.</p>
                <Link href="/contact" className="services-page__help-button">
                  Contact Us <FaArrowRight />
                </Link>
              </div>
            </article>
          </div>

          {/* ── Complete Services List ── */}
          <div className="services-page__all-heading">
            <div>
              <p className="services-page__eyebrow services-page__eyebrow--light">COMPLETE DIRECTORY</p>
              <h2>All Services</h2>
              <p>{totalServices} services available across every category.</p>
            </div>
            <span>{search ? `${filtered.reduce((total, cat) => total + cat.services.length, 0)} matching` : "Browse all"}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="services-page__empty">
              <FaSearch />
              <p>{t.services_not_found}</p>
              <span>{t.services_not_found_sub}</span>
              <button onClick={() => { setSearch(""); setActiveCategory(null); }}>
                {t.services_clear}
              </button>
            </div>
          ) : (
            <div className="services-page__service-sections">
              {filtered.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.id] ?? FaFileAlt;
                const catGradient = CATEGORY_GRADIENT[cat.id] ?? "linear-gradient(135deg, #071B4A, #1a3a8a)";
                const lightClass = CATEGORY_ICON_LIGHT[cat.id] ?? "bg-primary/10 text-primary";
                return (
                  <div key={cat.id} className="services-page__service-section">
                    {/* Category Header */}
                    <div className="services-page__service-section-heading">
                      <div
                        className="services-page__service-section-icon"
                        style={{ background: catGradient, boxShadow: "0 3px 12px rgba(0,0,0,0.15)" }}
                      >
                        <CatIcon />
                      </div>
                      <div>
                        <h3>{cat.name}</h3>
                        <span>
                          {t.services_available(cat.services.length)}
                        </span>
                      </div>
                    </div>

                    {/* Service Cards Grid */}
                    <div className="services-page__service-grid">
                      {cat.services.map((service) => {
                        const Icon = SERVICE_ICONS[service.id] ?? FaFileAlt;
                        return (
                          <div key={service.id} className="services-page__service-card">
                            <div className="services-page__service-card-main">
                              <div className={`services-page__service-icon ${lightClass}`}>
                                <Icon />
                              </div>
                              <div className="min-w-0">
                                <h4>
                                  {service.name}
                                </h4>
                                <p>
                                  {service.description}
                                </p>
                              </div>
                            </div>
                            <div className="services-page__service-action">
                              {COMING_SOON_SERVICES.has(service.id) ? (
                                <div className="services-page__status services-page__status--gold">
                                  <FaClock />
                                  {t.services_coming_soon}
                                </div>
                              ) : WALKIN_SERVICES.has(service.id) ? (
                                <div className="services-page__status">
                                  <FaWalking />
                                  {t.services_walkin}
                                </div>
                              ) : (
                                <Button asChild size="sm" className="btn-gold services-page__apply-button group">
                                  <Link href={`/apply?service=${encodeURIComponent(service.id)}`}>
                                    {t.services_apply}
                                    <FaArrowRight className="group-hover:translate-x-0.5 transition-transform" />
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

      <section className="services-page__stats" aria-label="Service highlights">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="services-page__stats-grid">
            {[
              { value: "10,000+", label: "Happy Customers", icon: FaUsers },
              { value: `${totalServices}+`, label: "Services Available", icon: FaBox },
              { value: "5+ Years", label: "Trusted Since", icon: FaCheckCircle },
              { value: "Quick & Easy", label: "Online Process", icon: FaClock },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="services-page__stat">
                <Icon />
                <div><strong>{value}</strong><span>{label}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
