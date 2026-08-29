import { Link, useLocation } from "wouter";
import { FaBuilding, FaBars, FaTimes, FaEnvelope } from "react-icons/fa";
import { useGetVisitorCount } from "@workspace/api-client-react";
import logoImg from "/logo.png";
import { useState } from "react";
import NewsTicker from "./NewsTicker";
import { useT } from "@/i18n";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";
const APP_VERSION = "1.0.2";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, setLang } = useT();

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
      <header className="navbar-root sticky top-0 z-50">

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
                  className="font-semibold tracking-widest"
                  style={{
                    fontSize: "0.6rem",
                    color: GOLD_LIGHT,
                    letterSpacing: "0.18em",
                    textShadow: "0 0 10px rgba(212,160,23,0.45)",
                  }}
                >
                  {t.brand_tagline}
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-7">
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
                className="flex items-center gap-1 text-xs font-bold rounded-lg px-2.5 py-1.5 transition-all duration-200 select-none"
                style={{
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.3)",
                  color: GOLD_LIGHT,
                  letterSpacing: "0.04em",
                }}
              >
                {lang === "en" ? "ਪੰਜਾਬੀ" : "EN"}
              </button>
            </nav>

            {/* ── Mobile right: lang toggle + hamburger ── */}
            <div className="md:hidden flex items-center gap-2">
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
            className="md:hidden"
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
            </nav>
            <div className="px-4 pb-4">
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.25)",
                  color: "#F2C14E",
                  textDecoration: "none",
                }}
                onClick={() => setMobileOpen(false)}
              >
                <FaEnvelope className="text-sm" />
                {t.nav_contact}
              </Link>
            </div>
          </div>
        )}
      </header>

      <NewsTicker />

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* ── Premium Footer ── */}
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
