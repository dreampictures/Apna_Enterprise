import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import Seo from "@/components/Seo";
import {
  FaArrowLeft, FaCalendarAlt, FaBuilding, FaUsers,
  FaGlobe, FaFileAlt, FaExternalLinkAlt, FaWhatsapp,
  FaFire, FaStar, FaChevronRight,
} from "react-icons/fa";

const NAVY = "#071B4A";
const GOLD = "#D4A017";

interface CellData { value: string; url?: string }
type TableCell = string | CellData;

interface LinkItem { label: string; url: string; tag?: string }
interface Section {
  id: string;
  type: "text" | "table" | "links";
  title: string;
  content?: string;
  columns?: string[];
  rows?: TableCell[][];
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

function getCellValue(cell: TableCell): string {
  if (typeof cell === "string") return cell;
  return cell.value;
}
function getCellUrl(cell: TableCell): string | undefined {
  if (typeof cell === "string") return undefined;
  return cell.url || undefined;
}

const HIGHLIGHT_GREEN = ["activated", "active", "available", "open", "yes", "released", "enabled"];
const HIGHLIGHT_RED = ["closed", "expired", "inactive", "no", "not available", "disabled"];
const HIGHLIGHT_AMBER = ["soon", "upcoming", "pending", "expected"];

function highlightValue(val: string) {
  const lower = val.trim().toLowerCase();
  if (HIGHLIGHT_GREEN.some((k) => lower === k || lower.startsWith(k + " "))) {
    return (
      <span
        className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full"
        style={{ background: "#dcfce7", color: "#15803d" }}
      >
        {val}
      </span>
    );
  }
  if (HIGHLIGHT_RED.some((k) => lower === k || lower.startsWith(k + " "))) {
    return (
      <span
        className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full"
        style={{ background: "#fee2e2", color: "#dc2626" }}
      >
        {val}
      </span>
    );
  }
  if (HIGHLIGHT_AMBER.some((k) => lower === k || lower.startsWith(k + " "))) {
    return (
      <span
        className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full"
        style={{ background: "#fef3c7", color: "#d97706" }}
      >
        {val}
      </span>
    );
  }
  return <>{val}</>;
}

const URL_REGEX = /https?:\/\/[^\s)"'>]+/g;

function linkify(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  URL_REGEX.lastIndex = 0;
  while ((m = URL_REGEX.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const url = m[0];
    parts.push(
      <a
        key={m.index}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="underline break-all hover:opacity-80"
        style={{ color: "#1d4ed8" }}
      >
        {url}
      </a>
    );
    last = m.index + url.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? <>{parts}</> : <>{text}</>;
}

function renderTextContent(content: string) {
  const lines = content.split("\n");
  const items: React.ReactNode[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();
      const isUrl = /^https?:\/\//.test(value);
      items.push(
        <li key={items.length} className="flex items-start gap-2">
          <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: NAVY }} />
          <span>
            <span className="font-bold text-slate-800">{label}:</span>{" "}
            <span className="text-slate-700">
              {isUrl ? linkify(value) : highlightValue(value)}
            </span>
          </span>
        </li>
      );
    } else {
      const stripped = line.replace(/^[-•*]\s*/, "");
      items.push(
        <li key={items.length} className="flex items-start gap-2">
          <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: NAVY }} />
          <span className="text-slate-700">{linkify(stripped)}</span>
        </li>
      );
    }
  }
  if (items.length === 0) return null;
  return <ul className="space-y-2.5 py-1">{items}</ul>;
}

function isDefaultColumnHeader(col: string, idx: number) {
  return col === `Column ${idx + 1}` || col.trim() === "";
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
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
                <div className="px-5 py-3" style={{ background: NAVY }}>
                  <h2 className="font-bold text-white text-sm uppercase tracking-wider">Important Information</h2>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {infoRows.map((row, i) => (
                      <tr key={row.label} style={{ borderBottom: i < infoRows.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                        <td className="py-3 px-5 font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap" style={{ width: "45%" }}>
                          <row.icon style={{ color: GOLD }} className="flex-shrink-0" />
                          {row.label}
                        </td>
                        <td className="py-3 px-5 text-slate-700" style={{ borderLeft: "1px solid #e2e8f0" }}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Dynamic Sections */}
            {item.sections.map((sec) => {
              // Auto-hide empty sections
              if (sec.type === "text" && (!sec.content || !sec.content.trim())) return null;
              if (sec.type === "table") {
                const hasContent = sec.rows && sec.rows.some((r) => r.some((c) => getCellValue(c).trim()));
                if (!hasContent) return null;
              }
              if (sec.type === "links") {
                const hasLinks = sec.links && sec.links.some((l) => l.label.trim() && l.url.trim());
                if (!hasLinks) return null;
              }

              return (
                <div key={sec.id} className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
                  {sec.title && (
                    <div className="px-5 py-3" style={{ background: NAVY }}>
                      <h2 className="font-bold text-white text-sm uppercase tracking-wider">{sec.title}</h2>
                    </div>
                  )}

                  {/* ── Text Section ── */}
                  {sec.type === "text" && sec.content && (() => {
                    const rendered = renderTextContent(sec.content);
                    return rendered ? (
                      <div className="px-5 py-5 text-sm leading-relaxed">
                        {rendered}
                      </div>
                    ) : null;
                  })()}

                  {/* ── Table Section ── */}
                  {sec.type === "table" && sec.columns && sec.rows && (() => {
                    const showHeader = sec.columns.some((col, i) => !isDefaultColumnHeader(col, i));
                    const visibleRows = sec.rows.filter((r) => r.some((c) => getCellValue(c).trim()));
                    if (visibleRows.length === 0) return null;
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                          {showHeader && (
                            <thead>
                              <tr style={{ background: "#f1f5f9" }}>
                                {sec.columns.map((col, i) => (
                                  <th
                                    key={i}
                                    className="py-3 px-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                                    style={{ border: "1px solid #e2e8f0" }}
                                  >
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {visibleRows.map((row, ri) => (
                              <tr
                                key={ri}
                                style={{ background: ri % 2 === 0 ? "#fff" : "#f8fafd" }}
                              >
                                {row.map((cell, ci) => {
                                  const val = getCellValue(cell);
                                  const url = getCellUrl(cell);
                                  if (!val.trim() && !url) {
                                    return (
                                      <td key={ci} className="py-3 px-4 text-slate-400 italic" style={{ border: "1px solid #e2e8f0" }}>
                                        —
                                      </td>
                                    );
                                  }
                                  return (
                                    <td
                                      key={ci}
                                      className={`py-3 px-4 ${ci === 0 ? "font-bold text-slate-800" : "text-slate-700"}`}
                                      style={{ border: "1px solid #e2e8f0" }}
                                    >
                                      {url ? (
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 text-xs font-bold rounded-full hover:opacity-80 transition-opacity"
                                          style={{ background: "#dbeafe", color: "#1d4ed8", padding: "4px 12px" }}
                                        >
                                          {val} <FaExternalLinkAlt className="text-xs opacity-70" />
                                        </a>
                                      ) : (
                                        ci === 0 ? val : highlightValue(val)
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {/* ── Links Section ── */}
                  {sec.type === "links" && sec.links && (() => {
                    const activeLinks = sec.links.filter((l) => l.label.trim() && l.url.trim());
                    if (activeLinks.length === 0) return null;
                    return (
                      <div className="px-5 py-6 flex flex-wrap justify-center gap-4">
                        {activeLinks.map((lnk, i) => {
                          const isApply = lnk.tag === "apply";
                          const isOfficial = lnk.tag === "official";
                          return (
                            <a
                              key={i}
                              href={lnk.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2.5 font-semibold text-sm rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                              style={
                                isApply
                                  ? {
                                      background: `linear-gradient(135deg, ${GOLD}, #b8860b)`,
                                      color: "#fff",
                                      padding: "12px 28px",
                                      boxShadow: "0 4px 14px rgba(212,160,23,0.35)",
                                      letterSpacing: "0.02em",
                                    }
                                  : isOfficial
                                  ? {
                                      background: `linear-gradient(135deg, ${NAVY}, #0d2069)`,
                                      color: "#fff",
                                      padding: "12px 28px",
                                      boxShadow: "0 4px 14px rgba(7,27,74,0.3)",
                                      letterSpacing: "0.02em",
                                    }
                                  : {
                                      background: "#fff",
                                      color: "#334155",
                                      border: "2px solid #e2e8f0",
                                      padding: "10px 24px",
                                      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                                      letterSpacing: "0.01em",
                                    }
                              }
                            >
                              <FaExternalLinkAlt className="text-xs opacity-80" />
                              {lnk.label}
                            </a>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:w-64 space-y-4 lg:sticky lg:top-36 self-start">
            <div className="bg-white rounded-2xl p-5 space-y-3 shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Actions</h3>

              {item.applyUrl && !item.isExpired && (
                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between w-full rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD}, #b8860b)`,
                    padding: "12px 16px",
                    boxShadow: "0 4px 14px rgba(212,160,23,0.35)",
                  }}
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
                  className="flex items-center justify-between w-full rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${NAVY}, #0d2069)`,
                    padding: "12px 16px",
                    boxShadow: "0 4px 14px rgba(7,27,74,0.3)",
                  }}
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
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold text-sm border-2 border-slate-200 text-slate-700 hover:border-slate-400 transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <span className="flex items-center gap-2"><FaGlobe /> Official Website</span>
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              )}
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
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
