import { useEffect, useState } from "react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import {
  FaBriefcase, FaFileAlt, FaCheckCircle, FaHandHoldingUsd,
  FaBullhorn, FaStar, FaWhatsapp, FaExternalLinkAlt, FaArrowRight,
  FaCalendarAlt, FaBuilding, FaUsers, FaFire, FaClock,
} from "react-icons/fa";

const NAVY = "#071B4A";
const GOLD = "#D4A017";

const CATEGORIES = [
  { id: "All", label: "All Updates", icon: FaBullhorn },
  { id: "Government Job", label: "Govt Jobs", icon: FaBriefcase },
  { id: "Admit Card", label: "Admit Card", icon: FaFileAlt },
  { id: "Result", label: "Result", icon: FaCheckCircle },
  { id: "Govt Scheme", label: "Schemes", icon: FaHandHoldingUsd },
  { id: "Govt Notice", label: "Notices", icon: FaFileAlt },
  { id: "Announcement", label: "Announcements", icon: FaBullhorn },
  { id: "Offer / Update", label: "Offers", icon: FaStar },
];

const CAT_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  "Government Job":  { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  "Admit Card":      { bg: "#f5f3ff", text: "#7c3aed", dot: "#8b5cf6" },
  "Result":          { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
  "Govt Scheme":     { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b" },
  "Govt Notice":     { bg: "#fff1f2", text: "#be123c", dot: "#f43f5e" },
  "Announcement":    { bg: "#eef2ff", text: "#4338ca", dot: "#6366f1" },
  "Offer / Update":  { bg: "#fff0f0", text: "#e11d48", dot: "#f43f5e" },
};

interface Announcement {
  id: number;
  title: string;
  slug: string;
  shortDesc?: string;
  category: string;
  department?: string;
  publishDate?: string;
  startDate?: string;
  lastDate?: string;
  vacancyCount?: number;
  applyUrl?: string;
  officialWebsite?: string;
  officialNotificationUrl?: string;
  isUrgent: boolean;
  isFeatured: boolean;
  isExpired: boolean;
}

function fmtDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse" style={{ border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(7,27,74,0.05)" }}>
      <div className="h-1 bg-slate-200" />
      <div className="p-5">
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-20 bg-slate-200 rounded-full" />
          <div className="h-5 w-14 bg-slate-200 rounded-full" />
        </div>
        <div className="h-5 bg-slate-200 rounded mb-2 w-full" />
        <div className="h-5 bg-slate-200 rounded mb-4 w-4/5" />
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-100 rounded w-3/5" />
          <div className="h-3.5 bg-slate-100 rounded w-2/5" />
        </div>
      </div>
      <div className="px-4 pb-4 pt-3 border-t border-slate-50 flex gap-2">
        <div className="flex-1 h-9 bg-slate-200 rounded-xl" />
        <div className="h-9 w-9 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function Updates() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    setPage(0);
  }, [activeCategory]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit), published: "1" });
    if (activeCategory !== "All") params.set("category", activeCategory);
    fetch(`/api/announcements?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.announcements || []);
        setTotal(data.total || 0);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCategory, page]);

  return (
    <div className="flex flex-col min-h-full">
      <Seo
        title="Updates & Announcements — Govt Jobs, Results, Schemes"
        description="Latest government job notifications, admit cards, results, schemes and announcements. Stay updated with Apna Enterprise."
        keywords="government jobs Firozepur, admit card, result, govt scheme Punjab, announcements"
        path="/updates"
      />

      {/* Hero */}
      <section className="hero-navy text-white py-14">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="font-bold uppercase tracking-widest text-xs mb-3" style={{ color: GOLD, letterSpacing: "0.18em" }}>
            Stay Informed
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Updates & Announcements</h1>
          <div className="w-16 h-1 rounded-full mx-auto mb-5" style={{ background: GOLD }} />
          <p className="max-w-xl mx-auto text-base md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Latest government jobs, admit cards, results, schemes, and notices — all in one place.
          </p>
        </div>
      </section>

      {/* Category Filter Bar */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-slate-100" style={{ boxShadow: "0 2px 8px rgba(7,27,74,0.06)" }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-1.5 overflow-x-auto py-3 no-scrollbar">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const active = activeCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0"
                  style={
                    active
                      ? { background: NAVY, color: "#fff", boxShadow: "0 4px 12px rgba(7,27,74,0.25)" }
                      : { background: "#f8fafd", color: "#475569", border: "1.5px solid #e2e8f0" }
                  }
                >
                  <Icon className="text-xs" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="flex-1 py-10" style={{ background: "#f4f7fc" }}>
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : !items.length ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "#e8edf5" }}>
                <FaBullhorn className="text-2xl" style={{ color: NAVY }} />
              </div>
              <p className="text-slate-700 font-bold text-lg mb-1">No announcements found</p>
              <p className="text-slate-400 text-sm">Check back soon for updates.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {total} update{total !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                  const cat = CAT_COLOR[item.category] ?? { bg: "#f8fafd", text: "#475569", dot: "#94a3b8" };
                  const waText = encodeURIComponent(`${item.title} — Check details at apnaenterprise.in/updates/${item.slug}`);
                  const isActive = !item.isExpired;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1"
                      style={{
                        border: item.isUrgent ? "2px solid #ef4444" : "1px solid #e2e8f0",
                        boxShadow: item.isUrgent
                          ? "0 4px 20px rgba(239,68,68,0.12)"
                          : "0 2px 12px rgba(7,27,74,0.06)",
                      }}
                    >
                      {/* Colored top accent bar */}
                      <div
                        className="h-1 w-full flex-shrink-0"
                        style={{ background: item.isUrgent ? "#ef4444" : cat.dot }}
                      />

                      {/* Card Body */}
                      <div className="p-5 flex-1">
                        {/* Tags */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span
                              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ background: cat.bg, color: cat.text }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.dot }} />
                              {item.category}
                            </span>
                            {item.isUrgent && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                                <FaFire className="text-xs" /> URGENT
                              </span>
                            )}
                            {item.isFeatured && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                                <FaStar className="text-xs" /> Featured
                              </span>
                            )}
                          </div>
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap"
                            style={
                              isActive
                                ? { background: "#dcfce7", color: "#15803d" }
                                : { background: "#fee2e2", color: "#b91c1c" }
                            }
                          >
                            {isActive ? "● Active" : "○ Closed"}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-extrabold text-slate-900 mb-2 leading-snug line-clamp-2" style={{ letterSpacing: "-0.01em" }}>
                          {item.title}
                        </h3>

                        {item.shortDesc && (
                          <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{item.shortDesc}</p>
                        )}

                        {/* Meta */}
                        <div className="space-y-1.5 text-xs text-slate-500">
                          {item.department && (
                            <div className="flex items-center gap-2">
                              <FaBuilding className="flex-shrink-0 opacity-60" style={{ color: NAVY }} />
                              <span className="font-medium truncate">{item.department}</span>
                            </div>
                          )}
                          {item.vacancyCount ? (
                            <div className="flex items-center gap-2">
                              <FaUsers className="flex-shrink-0" style={{ color: GOLD }} />
                              <span><strong className="text-slate-700">{item.vacancyCount.toLocaleString()}</strong> Vacancies</span>
                            </div>
                          ) : null}
                          {item.lastDate && (
                            <div className="flex items-center gap-2">
                              <FaClock className={`flex-shrink-0 ${item.isExpired ? "text-red-400" : "text-green-500"}`} />
                              <span>
                                Last Date:{" "}
                                <strong className={item.isExpired ? "text-red-500" : "text-slate-700"}>
                                  {fmtDate(item.lastDate)}
                                </strong>
                                {item.isExpired && <span className="ml-1 text-red-400">(Expired)</span>}
                              </span>
                            </div>
                          )}
                          {item.startDate && !item.lastDate && (
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="flex-shrink-0 text-green-500" />
                              <span>Start: <strong className="text-slate-700">{fmtDate(item.startDate)}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-4 pb-4 pt-3 border-t border-slate-50 flex gap-2 items-center">
                        <Link
                          href={`/updates/${item.slug}`}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                          style={{
                            background: `linear-gradient(135deg, ${NAVY}, #0d2069)`,
                            color: "#fff",
                            boxShadow: "0 3px 10px rgba(7,27,74,0.25)",
                            letterSpacing: "0.01em",
                          }}
                        >
                          Know More <FaArrowRight className="text-xs" />
                        </Link>

                        {item.applyUrl && isActive && (
                          <a
                            href={item.applyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                            style={{
                              background: `linear-gradient(135deg, ${GOLD}, #b8860b)`,
                              color: "#fff",
                              boxShadow: "0 3px 10px rgba(212,160,23,0.3)",
                              letterSpacing: "0.01em",
                            }}
                          >
                            Apply <FaExternalLinkAlt className="text-xs" />
                          </a>
                        )}

                        <a
                          href={`https://wa.me/?text=${waText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-90"
                          style={{ background: "#dcfce7", color: "#16a34a" }}
                          title="Share on WhatsApp"
                        >
                          <FaWhatsapp className="text-base" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {total > limit && (
                <div className="flex justify-center items-center gap-3 mt-12">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold border-2 disabled:opacity-40 transition-all duration-200 hover:border-slate-400"
                    style={{ borderColor: "#e2e8f0", color: "#475569", background: "#fff" }}
                  >
                    ← Previous
                  </button>
                  <span className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: NAVY }}>
                    {page + 1} / {Math.ceil(total / limit)}
                  </span>
                  <button
                    disabled={(page + 1) * limit >= total}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold border-2 disabled:opacity-40 transition-all duration-200 hover:border-slate-400"
                    style={{ borderColor: "#e2e8f0", color: "#475569", background: "#fff" }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
