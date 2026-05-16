import { Link, useLocation } from "wouter";
import { FaBuilding, FaWhatsapp, FaBars, FaTimes, FaEnvelope, FaPhone } from "react-icons/fa";
import { useGetVisitorCount } from "@workspace/api-client-react";
import logoImg from "/logo.png";
import { useState } from "react";
import NewsTicker from "./NewsTicker";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/updates", label: "Updates" },
    { href: "/apply", label: "Apply Now" },
    { href: "/contact", label: "Contact Us" },
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
              {/* Logo with golden aura */}
              <div className="relative flex items-center justify-center flex-shrink-0">
                <div className="logo-aura" />
                <img
                  src={logoImg}
                  alt="Apna Enterprise"
                  className="relative z-10 object-contain"
                  style={{ height: "52px", width: "52px", filter: "drop-shadow(0 0 8px rgba(212,160,23,0.45))" }}
                />
              </div>

              {/* Brand name */}
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
                  PROFESSIONAL SERVICES
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-9">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${location === item.href ? " nav-link-active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* ── Mobile Hamburger ── */}
            <button
              className="md:hidden relative p-2.5 rounded-xl transition-all duration-200"
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
            {/* Gold top accent inside dropdown */}
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
              <a
                href="https://wa.me/918437566186?text=Hello%20Apna%20Enterprise"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold"
                style={{
                  background: "rgba(37,211,102,0.12)",
                  border: "1px solid rgba(37,211,102,0.25)",
                  color: "#4ade80",
                  textDecoration: "none",
                }}
                onClick={() => setMobileOpen(false)}
              >
                <FaWhatsapp className="text-sm" />
                Chat on WhatsApp
              </a>
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
        {/* Gold top separator */}
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
                    YOUR TRUSTED SERVICE PARTNER
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Your trusted partner for travel ticketing, government documents, online forms, printing,
                financial services, and international parcels in Firozepur, Punjab.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3
                className="font-bold mb-5 uppercase tracking-widest text-xs pb-3"
                style={{ color: GOLD_LIGHT, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                Quick Links
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
                Contact Information
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
                  <FaPhone className="flex-shrink-0" style={{ color: GOLD }} />
                  <a href="tel:+918437566186" className="text-slate-400 hover:text-white transition-colors">
                    +91 84375 66186
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <FaWhatsapp className="text-lg flex-shrink-0 text-[#25D366]" />
                  <span className="text-slate-400">+91 84375 66186</span>
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
              <span>&copy; {new Date().getFullYear()} Apna Enterprise. All rights reserved. | apnaenterprise.in</span>
              <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
              <span>
                Managed by{" "}
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

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/918437566186?text=Hello%20Apna%20Enterprise%2C%20I%20want%20to%20enquire"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 text-white p-4 rounded-full z-50 flex items-center justify-center transform hover:scale-110 transition-all duration-200"
        style={{
          background: "#25D366",
          boxShadow: "0 4px 20px rgba(37, 211, 102, 0.45)",
        }}
        aria-label="Contact on WhatsApp"
      >
        <FaWhatsapp className="text-3xl" />
      </a>
    </div>
  );
}

function VisitorCounter() {
  const { data } = useGetVisitorCount();
  return (
    <div
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
      style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}
    >
      <span className="uppercase tracking-wider font-semibold">Visitors:</span>
      <span
        className="font-mono px-2 py-0.5 rounded"
        style={{ background: "rgba(212, 160, 23, 0.12)", color: GOLD_LIGHT }}
      >
        {data?.count ?? "..."}
      </span>
    </div>
  );
}
