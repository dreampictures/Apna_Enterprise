import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import Seo from "@/components/Seo";
import {
  FaArrowLeft, FaCalendarAlt, FaBuilding, FaUsers,
  FaGlobe, FaFileAlt, FaExternalLinkAlt, FaWhatsapp,
  FaFire, FaStar, FaChevronRight,
} from "react-icons/fa";

const GOLD = "#D4A017";

interface LinkItem { label: string; url: string; tag?: string }
interface Section {
  id: string;
  type: "text" | "table" | "links";
  title: string;
  content?: string;
  columns?: string[];
  rows?: string[][];
  links?: LinkItem[];
}
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
  officialWebsite?: string;
  officialNotificationUrl?: string;
  applyUrl?: string;
  isUrgent: boolean;
  isFeatured: boolean;
  isExpired: boolean;
  sections: Section[];
}

function fmtDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function UpdateDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/announcements/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setItem(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
        <p className="text-5xl mb-4">📄</p>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Announcement Not Found</h2>
        <p className="text-slate-500 mb-6">This post may have been removed or the link is incorrect.</p>
        <Link href="/updates" className="btn-gold px-6 py-2.5 rounded-xl font-semibold text-sm">
          Back to Updates
        </Link>
      </div>
    );
  }

  const waText = encodeURIComponent(`${item.title} — Read more at apnaenterprise.in/updates/${item.slug}`);
  const infoRows = [
    item.department && { label: "Department / Organization", value: item.department, icon: FaBuilding },
    item.vacancyCount && { label: "Total Vacancies", value: item.vacancyCount, icon: FaUsers },
    item.startDate && { label: "Application Start Date", value: fmtDate(item.startDate), icon: FaCalendarAlt },
    item.lastDate && { label: "Last Date to Apply", value: fmtDate(item.lastDate), icon: FaCalendarAlt },
  ].filter(Boolean) as { label: string; value: string | number; icon: any }[];

  return (
    <div className="flex flex-col min-h-full" style={{ background: "#f8fafd" }}>
      <Seo
        title={`${item.title} — Apna Enterprise`}
        description={item.shortDesc || `${item.category} — ${item.title}`}
        path={`/updates/${item.slug}`}
      />

      {/* Header */}
      <section className="hero-navy text-white py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Link
            href="/updates"
            className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:text-yellow-300"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            <FaArrowLeft className="text-xs" /> Back to Updates
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white">
              {item.category}
            </span>
            {item.isUrgent && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500 text-white flex items-center gap-1">
                <FaFire /> URGENT
              </span>
            )}
            {item.isFeatured && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-white flex items-center gap-1">
                <FaStar /> Featured
              </span>
            )}
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.isExpired ? "bg-red-600 text-white" : "bg-green-500 text-white"}`}>
              {item.isExpired ? "Closed" : "Active"}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold leading-snug mb-4">{item.title}</h1>
          {item.shortDesc && (
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              {item.shortDesc}
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 lg:px-8 max-w-4xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Quick Info */}
            {infoRows.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100" style={{ background: "#f8fafd" }}>
                  <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Important Information</h2>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-50">
                    {infoRows.map((row) => (
                      <tr key={row.label}>
                        <td className="py-3 px-5 text-slate-500 font-medium flex items-center gap-2 whitespace-nowrap">
                          <row.icon style={{ color: GOLD }} className="flex-shrink-0" />
                          {row.label}
                        </td>
                        <td className="py-3 px-5 font-semibold text-slate-800">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Dynamic Sections */}
            {item.sections.map((sec) => (
              <div key={sec.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {sec.title && (
                  <div
                    className="px-5 py-3 border-b border-slate-100 flex items-center gap-2"
                    style={{ background: "linear-gradient(135deg, #071B4A, #0d2069)" }}
                  >
                    <h2 className="font-bold text-white text-sm uppercase tracking-wider">{sec.title}</h2>
                  </div>
                )}

                {sec.type === "text" && sec.content && (
                  <div className="px-5 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {sec.content}
                  </div>
                )}

                {sec.type === "table" && sec.columns && sec.rows && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#f8fafd" }}>
                          {sec.columns.map((col, i) => (
                            <th key={i} className="py-3 px-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {sec.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-slate-50">
                            {row.map((cell, ci) => (
                              <td key={ci} className="py-3 px-4 text-slate-700">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {sec.type === "links" && sec.links && (
                  <div className="p-4 flex flex-wrap gap-3">
                    {sec.links.map((lnk, i) => (
                      <a
                        key={i}
                        href={lnk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        style={
                          lnk.tag === "apply"
                            ? { background: GOLD, color: "#fff" }
                            : lnk.tag === "official"
                            ? { background: "#071B4A", color: "#fff" }
                            : { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0" }
                        }
                      >
                        <FaExternalLinkAlt className="text-xs" />
                        {lnk.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:w-64 space-y-4 lg:sticky lg:top-36 self-start">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Actions</h3>

              {item.applyUrl && !item.isExpired && (
                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                  style={{ background: GOLD }}
                >
                  Apply Online <FaChevronRight />
                </a>
              )}
              {item.isExpired && (
                <div className="w-full px-4 py-3 rounded-xl font-semibold text-sm text-center bg-red-50 text-red-500 border border-red-100">
                  Applications Closed
                </div>
              )}
              {item.officialNotificationUrl && (
                <a
                  href={item.officialNotificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
                  style={{ background: "#071B4A", color: "#fff" }}
                >
                  <span className="flex items-center gap-2"><FaFileAlt /> Official Notice</span>
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              )}
              {item.officialWebsite && (
                <a
                  href={item.officialWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 hover:border-slate-400 transition-colors"
                >
                  <span className="flex items-center gap-2"><FaGlobe /> Official Website</span>
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              )}
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: "#25D366" }}
              >
                <FaWhatsapp /> Share on WhatsApp
              </a>
              <Link
                href="/updates"
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm text-slate-500 border border-slate-200 hover:border-slate-400 transition-colors font-medium"
              >
                ← Back to Updates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
