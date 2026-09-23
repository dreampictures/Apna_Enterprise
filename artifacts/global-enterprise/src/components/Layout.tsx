import { Link, useLocation } from "wouter";
import {
  FaBuilding, FaBars, FaTimes, FaEnvelope, FaSearch, FaHeadset, FaArrowRight,
  FaMapMarkerAlt, FaPhoneAlt, FaClock, FaFacebookF, FaInstagram,
  FaYoutube, FaWhatsapp, FaHeart, FaArrowUp
} from "react-icons/fa";
import { useGetVisitorCount } from "@workspace/api-client-react";
import logoImg from "/logo.png";
import { useState } from "react";
import NewsTicker from "./NewsTicker";
import { useT } from "@/i18n";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";
const APP_VERSION = "1.0.9";

type SupportReply = {
  question: string;
  answer: string;
  href: string;
  action: string;
};

const supportReplies: SupportReply[] = [
  {
    question: "How do I apply for a service?",
    answer: "Open the Apply page, choose your service, and submit your details. Our team will contact you within 24 hours.",
    href: "/apply",
    action: "Start an application",
  },
  {
    question: "How can I track my application?",
    answer: "Use your application reference number on the Track page to check the latest status.",
    href: "/track",
    action: "Track an application",
  },
  {
    question: "What documents do I need?",
    answer: "Document requirements vary by service. Browse the Services page or contact our team for guidance.",
    href: "/services",
    action: "Browse services",
  },
  {
    question: "I need help with PDF tools",
    answer: "You can compress PDFs, compress images, convert images to PDF, and merge or edit PDF files directly in your browser.",
    href: "/pdf-compressor",
    action: "Open PDF tools",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [supportReply, setSupportReply] = useState<SupportReply | null>(null);
  const { t, lang, setLang } = useT();

  const isHome = location === "/";

  const navItems = [
    { href: "/", label: t.nav_home },
    { href: "/services", label: t.nav_services },
    { href: "/updates", label: t.nav_updates },
    { href: "/apply", label: t.nav_apply },
    { href: "/track", label: "Track" },
    { href: "/pdf-compressor", label: "PDF Compressor" },
    { href: "/contact", label: t.nav_contact },
  ];

  const searchItems = [
    { href: "/", label: t.nav_home, description: "Our services and latest highlights", keywords: "home apna enterprise" },
    { href: "/services", label: t.nav_services, description: "Travel, documents, forms, printing and more", keywords: "services travel document online forms printing finance insurance parcel" },
    { href: "/apply", label: t.nav_apply, description: "Submit a service application online", keywords: "apply application request service" },
    { href: "/updates", label: t.nav_updates, description: "Latest news and announcements", keywords: "updates news announcements" },
    { href: "/track", label: "Track", description: "Check your application status", keywords: "track status reference application" },
    { href: "/pdf-compressor", label: "PDF Compressor", description: "Compress, convert, merge and edit files", keywords: "pdf compress image convert merge edit tools" },
    { href: "/contact", label: t.nav_contact, description: "Get in touch with our support team", keywords: "contact support phone email location" },
  ];

  const filteredSearchItems = searchItems.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(query);
  });

  const openSearch = () => {
    setSearchOpen(true);
    setSupportOpen(false);
    setSupportReply(null);
    setMobileOpen(false);
  };

  const openSupport = () => {
    setSupportOpen(true);
    setSearchOpen(false);
    setSupportReply(null);
    setMobileOpen(false);
  };

  const goToSearchResult = (href: string) => {
    setSearchOpen(false);
    setSearchTerm("");
    setLocation(href);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      {/* ── Premium Navbar ── */}
      <header className="navbar-root home-navbar sticky top-0 z-50 border-b border-[#FFD700]/20">

        {/* Subtle inner gold shimmer across full width */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 2,
            left: 0,
            right: 0,
            height: "60px",
            background: "radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="flex items-center justify-between h-20">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-95"
              style={{ textDecoration: "none" }}
            >
              <div className="relative flex items-center justify-center flex-shrink-0">
                <div className="logo-aura" />
                <img
                  src={logoImg}
                  alt="Apna Enterprise"
                  className="relative z-10 object-contain"
                  style={{ height: "52px", width: "52px", filter: "drop-shadow(0 0 8px rgba(212,160,23,0.45))" }}
                />
              </div>

              <div className="flex flex-col leading-tight">
                <span
                  className="font-extrabold tracking-wide"
                  style={{
                    fontSize: "1.2rem",
                    color: "#FFFFFF",
                    letterSpacing: "0.03em",
                    textShadow: "0 1px 12px rgba(255,255,255,0.15)",
                  }}
                >
                  Apna Enterprise
                </span>
                <span
                  className={`font-semibold tracking-widest${isHome ? " uppercase" : ""}`}
                  style={{
                    fontSize: "0.6rem",
                    color: GOLD_LIGHT,
                    letterSpacing: "0.18em",
                    textShadow: "0 0 10px rgba(212,160,23,0.45)",
                  }}
                >
                  {isHome ? "Professional Services" : t.brand_tagline}
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden xl:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${location === item.href ? " nav-link-active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === "en" ? "pa" : "en")}
                title={lang === "en" ? "Switch to Punjabi" : "Switch to English"}
                className="flex items-center gap-1 text-xs font-bold rounded-lg px-2.5 py-1.5 transition-all duration-200 select-none ml-2"
                style={{
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.3)",
                  color: GOLD_LIGHT,
                  letterSpacing: "0.04em",
                }}
              >
                {lang === "en" ? "ਪੰਜਾਬੀ" : "EN"}
              </button>

              <div className="flex items-center gap-3 ml-1 border-l border-white/10 pl-3 h-8">
                <button
                  className="text-white/80 hover:text-[#F2C14E] transition"
                  aria-label="Search"
                  onClick={openSearch}
                >
                  <FaSearch className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={openSupport}
                  className="bg-[#FFD700] hover:bg-[#F2C14E] text-[#1a1200] font-bold flex items-center gap-2 rounded-md px-3 py-2 text-xs transition"
                >
                  <FaHeadset className="text-base" /> Online Support
                </button>
              </div>
            </nav>

            {/* ── Mobile right: lang toggle + hamburger ── */}
            <div className="xl:hidden flex items-center gap-2">
              <button
                onClick={openSearch}
                className="p-2 text-white/80 hover:text-[#F2C14E] transition"
                aria-label="Search"
              >
                <FaSearch className="text-base" />
              </button>
              <button
                onClick={() => setLang(lang === "en" ? "pa" : "en")}
                className="text-xs font-bold rounded-lg px-2 py-1.5 transition-all duration-200 select-none"
                style={{
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.25)",
                  color: GOLD_LIGHT,
                }}
              >
                {lang === "en" ? "ਪੰ" : "EN"}
              </button>
              <button
                className="relative p-2.5 rounded-xl transition-all duration-200"
                style={{
                  color: "rgba(255,255,255,0.85)",
                  background: "rgba(212,160,23,0.08)",
                  border: "1px solid rgba(212,160,23,0.2)",
                }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div
            className="xl:hidden"
            style={{
              background: "linear-gradient(180deg, #020A1A 0%, #071B4A 100%)",
              borderTop: "1px solid rgba(212,160,23,0.12)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.3) 30%, rgba(242,193,78,0.5) 50%, rgba(212,160,23,0.3) 70%, transparent)",
                marginBottom: "2px",
              }}
            />
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`mobile-nav-item${location === item.href ? " mobile-nav-item-active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={openSupport}
                className="mobile-nav-item flex items-center gap-2 mt-2 bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30 text-left w-full"
              >
                <FaHeadset /> Online Support
              </button>
            </nav>
          </div>
        )}

        {searchOpen && (
          <div className="navbar-popover navbar-search-popover" role="dialog" aria-label="Site search">
            <div className="navbar-popover-header">
              <div>
                <span className="navbar-popover-eyebrow">FIND YOUR WAY</span>
                <h2>Search Apna Enterprise</h2>
              </div>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <FaTimes />
              </button>
            </div>
            <div className="navbar-search-field">
              <FaSearch aria-hidden="true" />
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && filteredSearchItems[0]) {
                    goToSearchResult(filteredSearchItems[0].href);
                  }
                }}
                placeholder="Search services, pages or help..."
                aria-label="Search services, pages or help"
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search">
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="navbar-search-results">
              {filteredSearchItems.length > 0 ? filteredSearchItems.map((item) => (
                <button
                  type="button"
                  key={item.href}
                  className="navbar-search-result"
                  onClick={() => goToSearchResult(item.href)}
                >
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  <FaArrowRight aria-hidden="true" />
                </button>
              )) : (
                <p className="navbar-empty-state">No matching page found. Try “apply”, “track”, “PDF” or “support”.</p>
              )}
            </div>
          </div>
        )}

        {supportOpen && (
          <div className="navbar-popover navbar-support-popover" role="dialog" aria-label="Quick support">
            <div className="navbar-popover-header">
              <div>
                <span className="navbar-popover-eyebrow">QUICK SUPPORT</span>
                <h2>{supportReply ? "Here is the answer" : "How can we help?"}</h2>
              </div>
              <button type="button" onClick={() => setSupportOpen(false)} aria-label="Close support">
                <FaTimes />
              </button>
            </div>

            {supportReply ? (
              <div className="navbar-support-answer">
                <p>{supportReply.answer}</p>
                <div className="navbar-support-answer-actions">
                  <button type="button" onClick={() => setSupportReply(null)} className="navbar-support-back">
                    Back to quick replies
                  </button>
                  <button type="button" onClick={() => { setSupportOpen(false); setSupportReply(null); setLocation(supportReply.href); }} className="navbar-support-action">
                    {supportReply.action} <FaArrowRight />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="navbar-support-intro">Choose a question for an instant answer.</p>
                <div className="navbar-support-replies">
                  {supportReplies.map((reply) => (
                    <button type="button" key={reply.question} onClick={() => setSupportReply(reply)}>
                      <span>{reply.question}</span>
                      <FaArrowRight aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <button type="button" className="navbar-support-contact" onClick={() => { setSupportOpen(false); setLocation("/contact"); }}>
                  Need something else? Contact our team <FaArrowRight />
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <NewsTicker />

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* ── Shared reference-style footer ── */}
      <HomeFooter navItems={navItems} />
    </div>
  );
}

function VisitorCounter() {
  const { data } = useGetVisitorCount();
  const { t } = useT();
  return (
    <div
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
      style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}
    >
      <span className="uppercase tracking-wider font-semibold">{t.footer_visitors}</span>
      <span
        className="font-mono px-2 py-0.5 rounded"
        style={{ background: "rgba(212, 160, 23, 0.12)", color: GOLD_LIGHT }}
      >
        {data?.count ?? "..."}
      </span>
    </div>
  );
}

function HomeFooter({ navItems }: { navItems: Array<{ href: string; label: string }> }) {
  const { t } = useT();

  return (
    <footer className="bg-[#040C1E] text-slate-300 pt-16 pb-6 border-t border-[#FFD700]/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand & Desc */}
          <div className="col-span-1 lg:col-span-1">
             <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Apna Enterprise" className="h-12 w-12 object-contain" />
                <div className="leading-tight">
                  <div className="font-bold text-xl text-white tracking-wide">Apna Enterprise</div>
                  <div className="text-[10px] text-[#FFD700] tracking-widest uppercase mt-0.5">Professional Services</div>
                </div>
             </div>
             <p className="text-sm text-gray-400 mb-8 leading-relaxed">
               Your trusted partner for travel ticketing, government documents, online forms, printing, financial services, and international parcels in Firozpur, Punjab.
             </p>
             <div className="flex items-center gap-3">
               <span aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"><FaFacebookF /></span>
               <span aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"><FaInstagram /></span>
               <span aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"><FaYoutube /></span>
               <span aria-label="WhatsApp" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white"><FaWhatsapp /></span>
             </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="lg:pl-8">
            <h3 className="text-[#FFD700] font-bold mb-6 text-sm">Quick Links</h3>
            <ul className="space-y-3">
              {navItems.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition" style={{ textDecoration: 'none' }}>
                    <span className="text-[#FFD700] text-xs font-bold">&gt;</span> {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Contact */}
          <div>
            <h3 className="text-[#FFD700] font-bold mb-6 text-sm">Contact Information</h3>
            <ul className="space-y-5 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-[#FFD700] text-lg flex-shrink-0" />
                <span className="leading-relaxed">Apna Enterprise, Dharamkot Road<br/>Jogewala, Firozpur, Punjab - 142044</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-[#FFD700] text-lg flex-shrink-0" />
                 <a href="mailto:info@apnaenterprise.in" className="hover:text-white transition-colors">info@apnaenterprise.in</a>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-[#FFD700] text-lg flex-shrink-0" />
                 <a href="tel:+918437566186" className="hover:text-white transition-colors">+91 84375 66186</a>
              </li>
              <li className="flex items-start gap-3">
                <FaClock className="mt-1 text-[#FFD700] text-lg flex-shrink-0" />
                <span className="leading-relaxed">Mon - Sat: 9:00 AM - 7:00 PM<br/>Sundays & Public Holidays: Closed</span>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Map & Graphic */}
          <div className="flex flex-col items-start lg:items-end text-left lg:text-right">
             <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Proudly Serving</div>
             <div className="text-white font-bold mb-6 text-lg">Firozpur & Beyond</div>
             
              <div className="relative w-36 h-36 mb-6 overflow-hidden rounded-full border border-[#FFD700]/30 bg-[#071B4A] shadow-[0_0_22px_rgba(255,215,0,0.12)] shrink-0">
                <img
                  src="/punjab_logo.png"
                  alt="Punjab"
                  className="h-full w-full object-cover"
                />
             </div>
             
             <div className="font-cursive text-[26px] text-[#FFD700] -rotate-6 lg:mr-4 tracking-wide">
               Local Support<br/>Global Possibilities
             </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
           <div className="flex flex-wrap items-center gap-2">
             <span>© {new Date().getFullYear()} Apna Enterprise. {t.footer_rights}. | apnaenterprise.in</span>
             <span className="rounded border px-2 py-0.5 text-[10px] font-semibold border-[#F2C14E]/30 text-[#F2C14E]">App v{APP_VERSION}</span>
             <span>{t.footer_managed_by} <a href="https://thedreampictures.com" target="_blank" rel="noreferrer" className="text-[#F2C14E] hover:underline">DREAM PICTURES</a></span>
           </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
              <VisitorCounter />
              <span className="flex items-center">Made with <FaHeart className="text-red-500 mx-1" /> for a Simpler Tomorrow</span>
             <button 
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
               className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ml-4 hover:bg-[#FFD700] hover:text-black transition cursor-pointer"
               aria-label="Back to top"
             >
               <FaArrowUp />
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
}