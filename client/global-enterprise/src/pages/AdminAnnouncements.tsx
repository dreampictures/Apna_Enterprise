import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSave, FaEye, FaEyeSlash,
  FaFire, FaStar, FaArrowUp, FaArrowDown, FaTable, FaAlignLeft, FaLink,
} from "react-icons/fa";

const GOLD = "#D4A017";
const CATEGORIES = ["Government Job", "Admit Card", "Result", "Govt Scheme", "Govt Notice", "Announcement", "Offer / Update"];

type SectionType = "text" | "table" | "links";
interface LinkItem { label: string; url: string; tag: string }
interface Section {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  columns: string[];
  rows: string[][];
  links: LinkItem[];
}
interface Ann {
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
  isPublished: boolean;
  isUrgent: boolean;
  isFeatured: boolean;
  isExpired: boolean;
  sections: Section[];
  createdAt: string;
}

function uid() { return Math.random().toString(36).slice(2); }
function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}
function dateVal(d?: string) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}
function emptyForm(): Omit<Ann, "id" | "isExpired" | "createdAt"> {
  return {
    title: "", slug: "", shortDesc: "", category: "Government Job", department: "",
    publishDate: new Date().toISOString().slice(0, 10),
    startDate: "", lastDate: "", vacancyCount: undefined,
    officialWebsite: "", officialNotificationUrl: "", applyUrl: "",
    isPublished: false, isUrgent: false, isFeatured: false, sections: [],
  };
}

export default function AdminAnnouncements({ token }: { token: string | null }) {
  const [view, setView] = useState<"list" | "form">("list");
  const [items, setItems] = useState<Ann[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const loadList = useCallback(() => {
    setLoading(true);
    fetch("/api/announcements?limit=50&offset=0")
      .then((r) => r.json())
      .then((d) => { setItems(d.announcements || []); setTotal(d.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  function openCreate() {
    setForm(emptyForm());
    setEditId(null);
    setError("");
    setView("form");
  }
  function openEdit(a: Ann) {
    setForm({
      title: a.title, slug: a.slug, shortDesc: a.shortDesc || "",
      category: a.category, department: a.department || "",
      publishDate: dateVal(a.publishDate), startDate: dateVal(a.startDate), lastDate: dateVal(a.lastDate),
      vacancyCount: a.vacancyCount, officialWebsite: a.officialWebsite || "",
      officialNotificationUrl: a.officialNotificationUrl || "", applyUrl: a.applyUrl || "",
      isPublished: a.isPublished, isUrgent: a.isUrgent, isFeatured: a.isFeatured,
      sections: a.sections || [],
    });
    setEditId(a.id);
    setError("");
    setView("form");
  }

  function setF<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
    if (k === "title" && !editId) setForm((p) => ({ ...p, title: v as string, slug: slugify(v as string) }));
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true); setError("");
    const body = {
      ...form,
      vacancyCount: form.vacancyCount ? Number(form.vacancyCount) : null,
      publishDate: form.publishDate || null,
      startDate: form.startDate || null,
      lastDate: form.lastDate || null,
      officialWebsite: form.officialWebsite || null,
      officialNotificationUrl: form.officialNotificationUrl || null,
      applyUrl: form.applyUrl || null,
    };
    const url = editId ? `/api/announcements/${editId}` : "/api/announcements";
    const method = editId ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save."); return; }
      setView("list");
      loadList();
    } catch { setError("Network error. Try again."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE", headers: authHeaders });
    loadList();
  }

  async function togglePublish(a: Ann) {
    await fetch(`/api/announcements/${a.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ ...a, isPublished: !a.isPublished, sections: a.sections }),
    });
    loadList();
  }

  // Section helpers
  function addSection(type: SectionType) {
    const s: Section = { id: uid(), type, title: "", content: "", columns: ["Column 1", "Column 2"], rows: [["", ""]], links: [{ label: "", url: "", tag: "default" }] };
    setForm((p) => ({ ...p, sections: [...p.sections, s] }));
  }
  function updateSection(id: string, patch: Partial<Section>) {
    setForm((p) => ({ ...p, sections: p.sections.map((s) => s.id === id ? { ...s, ...patch } : s) }));
  }
  function removeSection(id: string) {
    setForm((p) => ({ ...p, sections: p.sections.filter((s) => s.id !== id) }));
  }
  function moveSection(id: string, dir: -1 | 1) {
    setForm((p) => {
      const arr = [...p.sections];
      const idx = arr.findIndex((s) => s.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return p;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return { ...p, sections: arr };
    });
  }
  function addTableCol(secId: string) {
    setForm((p) => ({
      ...p, sections: p.sections.map((s) => {
        if (s.id !== secId) return s;
        return { ...s, columns: [...s.columns, `Column ${s.columns.length + 1}`], rows: s.rows.map((r) => [...r, ""]) };
      }),
    }));
  }
  function addTableRow(secId: string) {
    setForm((p) => ({
      ...p, sections: p.sections.map((s) => {
        if (s.id !== secId) return s;
        return { ...s, rows: [...s.rows, s.columns.map(() => "")] };
      }),
    }));
  }
  function removeTableRow(secId: string, ri: number) {
    setForm((p) => ({
      ...p, sections: p.sections.map((s) => {
        if (s.id !== secId) return s;
        return { ...s, rows: s.rows.filter((_, i) => i !== ri) };
      }),
    }));
  }
  function addLink(secId: string) {
    setForm((p) => ({
      ...p, sections: p.sections.map((s) => {
        if (s.id !== secId) return s;
        return { ...s, links: [...s.links, { label: "", url: "", tag: "default" }] };
      }),
    }));
  }
  function removeLink(secId: string, li: number) {
    setForm((p) => ({
      ...p, sections: p.sections.map((s) => {
        if (s.id !== secId) return s;
        return { ...s, links: s.links.filter((_, i) => i !== li) };
      }),
    }));
  }

  const inputCls = "h-10 rounded-lg text-sm border-slate-200";
  const labelCls = "text-xs font-semibold text-slate-600 mb-1 block";

  if (view === "list") {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Announcements ({total})</h2>
          <Button onClick={openCreate} className="gap-2 text-sm" style={{ background: GOLD, color: "#fff" }}>
            <FaPlus /> New Post
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
        ) : !items.length ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📢</p>
            <p className="font-semibold text-slate-600">No announcements yet.</p>
            <p className="text-sm mt-1">Click "New Post" to create your first announcement.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Last Date</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 max-w-xs truncate">{a.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">/updates/{a.slug}</div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{a.category}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-slate-500 text-xs">
                        {a.lastDate ? new Date(a.lastDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        {a.isExpired && <span className="ml-1 text-red-500">(Closed)</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${a.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                            {a.isPublished ? "Live" : "Draft"}
                          </span>
                          {a.isUrgent && <FaFire className="text-red-500 text-xs" />}
                          {a.isFeatured && <FaStar className="text-amber-500 text-xs" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => togglePublish(a)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title={a.isPublished ? "Unpublish" : "Publish"}
                          >
                            {a.isPublished ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          <button
                            onClick={() => openEdit(a)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Form View ───
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView("list")} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <FaArrowLeft />
        </button>
        <h2 className="text-lg font-bold text-slate-900">{editId ? "Edit Announcement" : "New Announcement"}</h2>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Title *</label>
              <Input className={inputCls} value={form.title} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. Punjab Police Recruitment 2025" />
            </div>
            <div>
              <label className={labelCls}>URL Slug</label>
              <Input className={inputCls} value={form.slug} onChange={(e) => setF("slug", e.target.value)} placeholder="auto-generated" />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select
                className="w-full h-10 rounded-lg text-sm border border-slate-200 px-3"
                value={form.category}
                onChange={(e) => setF("category", e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Department / Organization</label>
              <Input className={inputCls} value={form.department} onChange={(e) => setF("department", e.target.value)} placeholder="e.g. Punjab Police" />
            </div>
            <div>
              <label className={labelCls}>Total Vacancies</label>
              <Input className={inputCls} type="number" value={form.vacancyCount ?? ""} onChange={(e) => setF("vacancyCount", e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 500" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Short Description</label>
              <textarea
                className="w-full rounded-lg text-sm border border-slate-200 px-3 py-2.5 resize-none"
                rows={3}
                value={form.shortDesc}
                onChange={(e) => setF("shortDesc", e.target.value)}
                placeholder="Brief summary shown on the listing card..."
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">Important Dates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Publish Date</label>
              <Input className={inputCls} type="date" value={form.publishDate} onChange={(e) => setF("publishDate", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Application Start Date</label>
              <Input className={inputCls} type="date" value={form.startDate} onChange={(e) => setF("startDate", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Last Date to Apply</label>
              <Input className={inputCls} type="date" value={form.lastDate} onChange={(e) => setF("lastDate", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">Official Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Official Website URL</label>
              <Input className={inputCls} value={form.officialWebsite} onChange={(e) => setF("officialWebsite", e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className={labelCls}>Official Notification URL</label>
              <Input className={inputCls} value={form.officialNotificationUrl} onChange={(e) => setF("officialNotificationUrl", e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Apply Online URL</label>
              <Input className={inputCls} value={form.applyUrl} onChange={(e) => setF("applyUrl", e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5 pb-3 border-b border-slate-100">Settings</h3>
          <div className="flex flex-wrap gap-6">
            {([
              { key: "isPublished", label: "Published (Live)", icon: FaEye },
              { key: "isUrgent", label: "Urgent", icon: FaFire },
              { key: "isFeatured", label: "Featured", icon: FaStar },
            ] as const).map(({ key, label, icon: Icon }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => setF(key, e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Icon className="text-slate-400" /> {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Section Builder */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Content Sections</h3>
            <div className="flex gap-2">
              {([
                { type: "text" as SectionType, icon: FaAlignLeft, label: "Text" },
                { type: "table" as SectionType, icon: FaTable, label: "Table" },
                { type: "links" as SectionType, icon: FaLink, label: "Links" },
              ]).map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => addSection(type)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 transition-colors"
                >
                  <Icon className="text-xs" /> + {label}
                </button>
              ))}
            </div>
          </div>

          {form.sections.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-6">No sections yet. Add a Text, Table, or Links section above.</p>
          )}

          <div className="space-y-4">
            {form.sections.map((sec, secIdx) => (
              <div key={sec.id} className="border border-slate-200 rounded-xl overflow-hidden">
                {/* Section Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                    {sec.type === "text" ? "📝 Text" : sec.type === "table" ? "📊 Table" : "🔗 Links"}
                  </span>
                  <Input
                    className="flex-1 h-8 text-sm border-slate-200"
                    value={sec.title}
                    onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                    placeholder="Section title..."
                  />
                  <button onClick={() => moveSection(sec.id, -1)} disabled={secIdx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><FaArrowUp className="text-xs" /></button>
                  <button onClick={() => moveSection(sec.id, 1)} disabled={secIdx === form.sections.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><FaArrowDown className="text-xs" /></button>
                  <button onClick={() => removeSection(sec.id)} className="p-1 text-red-400 hover:text-red-600"><FaTrash className="text-xs" /></button>
                </div>

                <div className="p-4">
                  {/* Text Section */}
                  {sec.type === "text" && (
                    <textarea
                      className="w-full rounded-lg text-sm border border-slate-200 px-3 py-2 resize-none"
                      rows={5}
                      value={sec.content}
                      onChange={(e) => updateSection(sec.id, { content: e.target.value })}
                      placeholder="Enter content here..."
                    />
                  )}

                  {/* Table Section */}
                  {sec.type === "table" && (
                    <div className="space-y-3">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-slate-50">
                              {sec.columns.map((col, ci) => (
                                <th key={ci} className="border-b border-slate-200 p-2">
                                  <Input
                                    className="h-7 text-xs"
                                    value={col}
                                    onChange={(e) => {
                                      const cols = [...sec.columns]; cols[ci] = e.target.value;
                                      updateSection(sec.id, { columns: cols });
                                    }}
                                  />
                                </th>
                              ))}
                              <th className="border-b border-slate-200 p-1 w-8"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {sec.rows.map((row, ri) => (
                              <tr key={ri} className="border-b border-slate-100">
                                {row.map((cell, ci) => (
                                  <td key={ci} className="p-1">
                                    <Input
                                      className="h-7 text-xs"
                                      value={cell}
                                      onChange={(e) => {
                                        const rows = sec.rows.map((r, rIdx) => rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? e.target.value : c) : r);
                                        updateSection(sec.id, { rows });
                                      }}
                                    />
                                  </td>
                                ))}
                                <td className="p-1">
                                  <button onClick={() => removeTableRow(sec.id, ri)} className="p-1 text-red-400 hover:text-red-600">
                                    <FaTrash className="text-xs" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => addTableRow(sec.id)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 transition-colors">
                          + Add Row
                        </button>
                        <button onClick={() => addTableCol(sec.id)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 transition-colors">
                          + Add Column
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Links Section */}
                  {sec.type === "links" && (
                    <div className="space-y-2">
                      {sec.links.map((lnk, li) => (
                        <div key={li} className="flex gap-2 items-center">
                          <Input
                            className="h-9 text-sm flex-1"
                            value={lnk.label}
                            onChange={(e) => {
                              const links = sec.links.map((l, i) => i === li ? { ...l, label: e.target.value } : l);
                              updateSection(sec.id, { links });
                            }}
                            placeholder="Button label"
                          />
                          <Input
                            className="h-9 text-sm flex-[2]"
                            value={lnk.url}
                            onChange={(e) => {
                              const links = sec.links.map((l, i) => i === li ? { ...l, url: e.target.value } : l);
                              updateSection(sec.id, { links });
                            }}
                            placeholder="https://..."
                          />
                          <select
                            className="h-9 text-xs border border-slate-200 rounded-lg px-2"
                            value={lnk.tag}
                            onChange={(e) => {
                              const links = sec.links.map((l, i) => i === li ? { ...l, tag: e.target.value } : l);
                              updateSection(sec.id, { links });
                            }}
                          >
                            <option value="default">Default</option>
                            <option value="apply">Apply (Gold)</option>
                            <option value="official">Official (Navy)</option>
                          </select>
                          <button onClick={() => removeLink(sec.id, li)} className="p-1.5 text-red-400 hover:text-red-600">
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addLink(sec.id)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-400 transition-colors">
                        + Add Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        {error && <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
        <div className="flex gap-3 pb-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 px-8"
            style={{ background: GOLD, color: "#fff" }}
          >
            <FaSave /> {saving ? "Saving..." : editId ? "Save Changes" : "Publish Post"}
          </Button>
          <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
