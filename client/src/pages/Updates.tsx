import { useEffect, useState } from "react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import {
  FaBriefcase, FaFileAlt, FaCheckCircle, FaHandHoldingUsd,
  FaBullhorn, FaStar, FaWhatsapp, FaExternalLinkAlt, FaChevronRight,
  FaCalendarAlt, FaBuilding, FaUsers, FaFire,
} from "react-icons/fa";

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";

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

const CAT_COLOR: Record<string, string> = {
  "Government Job": "bg-blue-100 text-blue-700",
  "Admit Card": "bg-purple-100 text-purple-700",
  "Result": "bg-green-100 text-green-700",
  "Govt Scheme": "bg-amber-100 text-amber-700",
  "Govt Notice": "bg-red-100 text-red-700",
  "Announcement": "bg-indigo-100 text-indigo-700",
  "Offer / Update": "bg-rose-100 text-rose-700",
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

      {/* Header */}
      <section className="hero-navy text-white py-14">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="font-semibold uppercase tracking-widest text-xs mb-3" style={{ color: GOLD_LIGHT }}>
            Stay Informed
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Updates & Announcements</h1>
          <div className="gold-line w-20 mx-auto mb-4" />
          <p className="max-w-xl mx-auto text-lg" style={{ color: "rgba(255,255,255,0.72)" }}>
            Latest government jobs, admit cards, results, schemes, and notices.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 no-scrollbar">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                  activeCategory === id
                    ? "text-white border-transparent"
                    : "text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
                style={activeCategory === id ? { background: "#071B4A", borderColor: "#071B4A" } : {}}
              >
                <Icon className="text-xs" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="flex-1 py-10" style={{ background: "#f8fafd" }}>
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-slate-100">
                  <div className="h-4 bg-slate-200 rounded mb-3 w-1/3" />
                  <div className="h-6 bg-slate-200 rounded mb-2" />
                  <div className="h-4 bg-slate-100 rounded mb-1 w-4/5" />
                  <div className="h-4 bg-slate-100 rounded w-3/5" />
                </div>
              ))}
            </div>
          ) : !items.length ? (
            <div className="text-center py-20">
              <FaBullhorn className="text-5xl text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-semibold text-lg">No announcements yet</p>
              <p className="text-slate-400 text-sm mt-1">Check back soon for updates.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500">
                  Showing <strong className="text-slate-700">{items.length}</strong> of <strong className="text-slate-700">{total}</strong> updates
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                  const catColor = CAT_COLOR[item.category] ?? "bg-slate-100 text-slate-600";
                  const waText = encodeURIComponent(`${item.title} — Check details at apnaenterprise.in/updates/${item.slug}`);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                      style={{
                        borderColor: item.isUrgent ? "#ef4444" : "#e8edf5",
                        borderWidth: item.isUrgent ? "2px" : "1px",
                        boxShadow: "0 2px 12px rgba(7,27,74,0.06)",
                      }}
                    >
                      {/* Card Top */}
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${catColor}`}>
                              {item.category}
                            </span>
                            {item.isUrgent && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                                <FaFire className="text-xs" /> URGENT
                              </span>
                            )}
                            {item.isFeatured && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                <FaStar className="text-xs" /> Featured
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                              item.isExpired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.isExpired ? "Closed" : "Active"}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
                          {item.title}
                        </h3>

                        {item.shortDesc && (
                          <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">{item.shortDesc}</p>
                        )}

                        <div className="space-y-1.5 text-xs text-slate-500">
                          {item.department && (
                            <div className="flex items-center gap-2">
                              <FaBuilding className="flex-shrink-0" style={{ color: GOLD }} />
                              <span className="font-medium">{item.department}</span>
                            </div>
                          )}
                          {item.vacancyCount && (
                            <div className="flex items-center gap-2">
                              <FaUsers className="flex-shrink-0" style={{ color: GOLD }} />
                              <span><strong>{item.vacancyCount}</strong> Vacancies</span>
                            </div>
                          )}
                          {item.lastDate && (
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="flex-shrink-0 text-red-400" />
                              <span>Last Date: <strong className={item.isExpired ? "text-red-500" : "text-slate-700"}>{fmtDate(item.lastDate)}</strong></span>
                            </div>
                          )}
                          {item.startDate && (
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="flex-shrink-0 text-green-400" />
                              <span>Start Date: <strong>{fmtDate(item.startDate)}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="px-5 pb-5 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                        <Link
                          href={`/updates/${item.slug}`}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg transition-colors text-white"
                          style={{ background: "#071B4A", minWidth: "90px" }}
                        >
                          Know More <FaChevronRight className="text-xs" />
                        </Link>

                        {item.applyUrl && !item.isExpired && (
                          <a
                            href={item.applyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                            style={{ background: GOLD, color: "#fff", minWidth: "70px" }}
                          >
                            Apply <FaExternalLinkAlt className="text-xs" />
                          </a>
                        )}

                        <a
                          href={`https://wa.me/?text=${waText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
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
                <div className="flex justify-center gap-3 mt-10">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 disabled:opacity-40 hover:border-slate-400 transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-slate-500 font-medium">
                    Page {page + 1} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    disabled={(page + 1) * limit >= total}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-5 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 disabled:opacity-40 hover:border-slate-400 transition-colors"
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
