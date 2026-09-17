import { Link, useLocation } from "wouter";
import {
  FaBuilding, FaBars, FaTimes, FaEnvelope, FaSearch, FaHeadset,
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

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      {/* ── Premium Navbar ── */}
      <header className={`navbar-root sticky top-0 z-50${isHome ? " home-navbar border-b border-[#FFD700]/20" : ""}`}>

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
            <nav className={isHome ? "hidden xl:flex items-center gap-4" : "hidden md:flex items-center gap-7"}>
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
                className={`flex items-center gap-1 text-xs font-bold rounded-lg px-2.5 py-1.5 transition-all duration-200 select-none${isHome ? " ml-2" : ""}`}
                style={{
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.3)",
                  color: GOLD_LIGHT,
                  letterSpacing: "0.04em",
                }}
              >
                {lang === "en" ? "ਪੰਜਾਬੀ" : "EN"}
              </button>

              {/* Home specific header controls */}
              {isHome && (
                <div className="flex items-center gap-3 ml-1 border-l border-white/10 pl-3 h-8">
                  <button className="text-white/80 hover:text-[#F2C14E] transition" aria-label="Search">
                    <FaSearch className="text-lg" />
                  </button>
                  <Link href="/contact" className="bg-[#FFD700] hover:bg-[#F2C14E] text-[#1a1200] font-bold flex items-center gap-2 rounded-md px-3 py-2 text-xs transition" style={{ textDecoration: 'none' }}>
                    <FaHeadset className="text-base" /> Online Support
                  </Link>
                </div>
              )}
            </nav>

            {/* ── Mobile right: lang toggle + hamburger ── */}
            <div className={`${isHome ? "xl:hidden" : "md:hidden"} flex items-center gap-2`}>
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
            className={isHome ? "xl:hidden" : "md:hidden"}
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
              {isHome && (
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="mobile-nav-item flex items-center gap-2 mt-2 bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30"
                >
                  <FaHeadset /> Online Support
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <NewsTicker />

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* ── Premium Footer ── */}
      {isHome ? (
        <HomeFooter navItems={navItems} />
      ) : (
        <footer style={{ background: "#050D24" }} className="text-slate-300">
          <div className="gold-divider" />
          <div className="container mx-auto px-4 lg:px-8 pt-12 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <img src={logoImg} alt="Apna Enterprise" className="h-12 w-12 object-contain" />
                  <div>
                    <span className="font-bold text-lg text-white block tracking-wide">Apna Enterprise</span>
                    <span className="text-xs tracking-widest font-medium" style={{ color: GOLD }}>
                      {t.footer_tagline}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  {t.footer_desc}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3
                  className="font-bold mb-5 uppercase tracking-widest text-xs pb-3"
                  style={{ color: GOLD_LIGHT, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {t.footer_quick_links}
                </h3>
                <ul className="space-y-3">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2.5 group"
                      >
                        <span
                          className="rounded-full flex-shrink-0 transition-all duration-200 group-hover:w-3"
                          style={{ width: "5px", height: "5px", background: GOLD, display: "inline-block" }}
                        />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3
                  className="font-bold mb-5 uppercase tracking-widest text-xs pb-3"
                  style={{ color: GOLD_LIGHT, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {t.footer_contact_info}
                </h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <FaBuilding className="mt-1 flex-shrink-0" style={{ color: GOLD }} />
                    <span className="text-slate-400 leading-relaxed">
                      Apna Enterprise, Dharamkot Road Jogewala,<br />
                      Firozepur, Punjab – 142044
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaEnvelope className="flex-shrink-0" style={{ color: GOLD }} />
                    <a href="mailto:info@apnaenterprise.in" className="text-slate-400 hover:text-white transition-colors">
                      info@apnaenterprise.in
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs text-slate-500">
                <span>&copy; {new Date().getFullYear()} Apna Enterprise. {t.footer_rights}. | apnaenterprise.in</span>
                <span className="ml-2 rounded border px-2 py-0.5 text-[10px] font-semibold" style={{ borderColor: "rgba(242,193,78,.3)", color: GOLD_LIGHT }}>App v{APP_VERSION}</span>
                <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
                <span>
                  {t.footer_managed_by}{" "}
                  <a
                    href="https://thedreampictures.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold transition-colors hover:underline"
                    style={{ color: "#F2C14E" }}
                  >
                    DREAM PICTURES
                  </a>
                </span>
              </div>
              <VisitorCounter />
            </div>
          </div>
        </footer>
      )}
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
             
             <div className="relative w-36 h-36 mb-6 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shrink-0">
               {/* Minimalist India Map SVG approximation for the design */}
               <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#253965]" fill="currentColor">
                 <path d="M48.5,5.2c-2.4,2.7-3.2,6.5-2.8,10.1c0.3,2.6-0.5,5.5-2.2,7.3c-2,2.2-5.4,3.1-8.1,1.9c-2.1-1-4.7-1-6.6,0.5 c-2.4,1.8-3.4,5.2-2.3,8.1c0.9,2.2-0.1,5.1-2.1,6.5c-2.4,1.6-6,1.4-8.3-0.5c-1.5-1.3-3.8-1.5-5.6-0.3C8,40.7,6.8,44,7.8,47 c0.9,2.6,0.3,5.6-1.5,7.6c-2.2,2.4-5.9,3.2-8.8,1.7v28.8c0,0,13.9,7,21.7,4.8c7.8-2.2,16.5-1.3,22.6,4.3 c5.2,4.8,11.3,6.1,17.4,2.6c5.2-3,11.7-1.3,15.7,3.9c1.7,2.2,5.2,2.6,7.8,0.9c2.6-1.7,5.6-3.5,9.1-4.8c4.3-1.7,8.2-1.3,10.8,0.9 V35.3c-2.6-3.9-7-5.2-11.3-3.5c-3,1.3-6.5,0.4-8.7-2.2c-2.6-2.6-7-3-10.4-0.9c-2.6,1.7-6.1,1.3-8.3-0.9 c-2.2-2.2-5.6-2.6-8.3-0.9c-2.6,1.7-6.1,0.9-8.3-1.7c-2.2-2.6-2.6-6.5-0.9-9.1c1.7-2.6,0.9-6.1-1.7-8.3C40.6,6.1,43.2,2.6,48.5,5.2 z"/>
               </svg>
               <FaMapMarkerAlt className="absolute text-[#FFD700] text-2xl drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" style={{ top: '40%', left: '45%' }} />
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