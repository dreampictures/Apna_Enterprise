import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FaArrowLeft, FaFileExcel, FaUpload, FaDownload, FaEye, FaCheck,
  FaTimes, FaSpinner, FaHistory, FaSearch, FaPrint, FaFileExport,
  FaCopy, FaExclamationTriangle,
} from "react-icons/fa";

const GOLD = "#D4A017";
const NAVY = "#0A1628";
const CATEGORIES = ["Government Job", "Admit Card", "Result", "Govt Scheme", "Govt Notice", "Announcement", "Offer / Update"];

type ImportMode = "create" | "append" | "replace";
interface ParsedData {
  columns: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
  fileName: string;
  fileHash: string;
  duplicate: { id: number; fileName: string; importedAt: string } | null;
}
interface Post { id: number; title: string; slug: string; category: string; isPublished: boolean }
interface ImportLog {
  id: number; file_name: string; row_count: number; column_count: number;
  import_mode: string; status: string; admin_user: string; imported_at: string;
}

function downloadSample() {
  // Generate a sample CSV for download
  const csv = "Sr No,Name,Mobile\n1,Harpreet Singh,9876543210\n2,Manpreet Kaur,9988776655\n3,Gurpreet Singh,9871234567";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample-import.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminExcelImport({
  token,
  onBack,
  onOpenPost,
}: {
  token: string | null;
  onBack: () => void;
  onOpenPost: (id: number) => void;
}) {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [parseError, setParseError] = useState("");
  const [parsing, setParsing] = useState(false);

  const [importMode, setImportMode] = useState<ImportMode>("create");
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postSearch, setPostSearch] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Announcement");
  const [sectionTitle, setSectionTitle] = useState("Imported Data");

  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [doneId, setDoneId] = useState<number | null>(null);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [pendingImport, setPendingImport] = useState(false);

  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Load existing posts for append/replace
  useEffect(() => {
    if (importMode !== "create") {
      setPostsLoading(true);
      fetch("/api/admin/excel-import/posts", { headers: authHeaders })
        .then((r) => r.json())
        .then(setPosts)
        .catch(() => {})
        .finally(() => setPostsLoading(false));
    }
  }, [importMode]);

  async function parseFile(file: File) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      setParseError("Only .xlsx, .xls, or .csv files are supported.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setParseError("File is too large. Maximum 20 MB.");
      return;
    }
    setParsing(true);
    setParseError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/excel-import/parse", {
        method: "POST",
        headers: authHeaders,
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) { setParseError(data.error || "Failed to parse file."); return; }
      setParsed(data);
      setTitle(file.name.replace(/\.(xlsx?|csv)$/i, ""));
      setPage(1);
      setTableSearch("");
      setStep("preview");
    } catch {
      setParseError("Network error. Try again.");
    } finally {
      setParsing(false);
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, []);

  async function doImport(forceOverride = false) {
    if (!parsed) return;
    if (parsed.duplicate && !forceOverride) {
      setShowDuplicate(true);
      setPendingImport(true);
      return;
    }
    if ((importMode === "append" || importMode === "replace") && !selectedPostId) {
      setImportError("Please select a post.");
      return;
    }

    setImporting(true);
    setImportError("");
    setStep("importing");

    const body = {
      columns: parsed.columns,
      rows: parsed.rows,
      fileName: parsed.fileName,
      fileHash: parsed.fileHash,
      title,
      category,
      sectionTitle,
    };

    let url = "/api/admin/excel-import/create";
    if (importMode === "append") url = `/api/admin/excel-import/append/${selectedPostId}`;
    if (importMode === "replace") url = `/api/admin/excel-import/replace/${selectedPostId}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setImportError(data.error || "Import failed."); setStep("preview"); return; }
      setDoneId(data.id);
      setStep("done");
    } catch {
      setImportError("Network error. Try again.");
      setStep("preview");
    } finally {
      setImporting(false);
    }
  }

  async function loadLogs() {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/excel-import/logs", { headers: authHeaders });
      const data = await res.json();
      setLogs(data);
    } catch {} finally { setLogsLoading(false); }
  }

  // ── Filtered + paginated table rows ─────────────────────────────────────
  const filteredRows = parsed
    ? parsed.rows.filter((row) =>
        tableSearch === "" || row.some((cell) => cell.toLowerCase().includes(tableSearch.toLowerCase()))
      )
    : [];
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Print ────────────────────────────────────────────────────────────────
  function printTable() {
    if (!parsed) return;
    const html = `<html><head><title>Import Preview</title>
    <style>body{font-family:sans-serif;font-size:12px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:6px 10px}th{background:#0A1628;color:#fff}tr:nth-child(even){background:#f9f9f9}</style>
    </head><body><h2>${title}</h2><table><thead><tr>${parsed.columns.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${parsed.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
    const win = window.open("", "_blank");
    win?.document.write(html);
    win?.document.close();
    win?.print();
  }

  function exportCSV() {
    if (!parsed) return;
    const lines = [parsed.columns.join(","), ...parsed.rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyTable() {
    if (!parsed) return;
    const text = [parsed.columns.join("\t"), ...parsed.rows.map((r) => r.join("\t"))].join("\n");
    navigator.clipboard.writeText(text).then(() => {}).catch(() => {});
  }

  const filteredPosts = posts.filter((p) =>
    postSearch === "" || p.title.toLowerCase().includes(postSearch.toLowerCase())
  );

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
          <FaArrowLeft />
        </button>
        <div>
          <h1 className="text-xl font-black" style={{ color: NAVY }}>Import Excel</h1>
          <p className="text-xs text-slate-400 font-medium">ਕੋਈ ਵੀ Excel/CSV → Draft Post</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => { setShowLogs(true); loadLogs(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            <FaHistory className="text-xs" /> Import History
          </button>
        </div>
      </div>

      {/* ── STEP: Upload ───────────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Drag & Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              dragging ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-yellow-400 hover:bg-yellow-50/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }}
            />
            {parsing ? (
              <div className="flex flex-col items-center gap-3">
                <FaSpinner className="text-4xl text-yellow-500 animate-spin" />
                <p className="font-semibold text-slate-600">Parsing file…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <FaFileExcel className="text-5xl text-green-600" />
                <div>
                  <p className="text-lg font-bold text-slate-700">Drop your Excel or CSV here</p>
                  <p className="text-sm text-slate-400 mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-slate-400 border border-slate-200 rounded-full px-4 py-1">
                  .xlsx &nbsp;•&nbsp; .xls &nbsp;•&nbsp; .csv &nbsp;•&nbsp; Max 20 MB
                </p>
              </div>
            )}
          </div>

          {parseError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
              <FaExclamationTriangle /> {parseError}
            </div>
          )}

          {/* Sample download */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-700">Sample Excel ਡਾਊਨਲੋਡ ਕਰੋ</p>
              <p className="text-xs text-slate-400 mt-0.5">Format ਸਮਝਣ ਲਈ sample file ਦੇਖੋ</p>
            </div>
            <button
              onClick={downloadSample}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            >
              <FaDownload className="text-green-600" /> Download Sample
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: Preview ─────────────────────────────────────────────── */}
      {step === "preview" && parsed && (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
            <FaFileExcel className="text-2xl text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 truncate">{parsed.fileName}</p>
              <p className="text-xs text-slate-500">{parsed.rowCount} rows • {parsed.columnCount} columns detected</p>
            </div>
            <button
              onClick={() => { setParsed(null); setStep("upload"); setParseError(""); }}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
            >
              <FaTimes />
            </button>
          </div>

          {/* Duplicate warning */}
          {parsed.duplicate && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-amber-800 text-sm">ਇਹ Excel ਪਹਿਲਾਂ import ਹੋਈ ਲੱਗਦੀ ਹੈ</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  File: <span className="font-mono">{parsed.duplicate.fileName}</span> •{" "}
                  {new Date(parsed.duplicate.importedAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          )}

          {/* Import Mode */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-sm font-bold text-slate-700 mb-3">Import Mode ਚੁਣੋ</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { value: "create", label: "New Post ਬਣਾਓ", desc: "ਨਵਾਂ Draft Post ਆਪਣੇ ਆਪ ਬਣੇਗਾ" },
                { value: "append", label: "Existing ਵਿੱਚ ਜੋੜੋ", desc: "ਮੌਜੂਦਾ post ਦੀ table ਵਿੱਚ rows ਜੋੜੋ" },
                { value: "replace", label: "Table Replace ਕਰੋ", desc: "ਸਿਰਫ਼ table ਬਦਲੋ, ਬਾਕੀ ਸਭ ਰੱਖੋ" },
              ] as { value: ImportMode; label: string; desc: string }[]).map((m) => (
                <button
                  key={m.value}
                  onClick={() => { setImportMode(m.value); setSelectedPostId(null); }}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    importMode === m.value
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className="font-bold text-sm text-slate-800">{m.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Post settings — create mode */}
          {importMode === "create" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <p className="text-sm font-bold text-slate-700">Post Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Title</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title…"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Category</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Table Section Title</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="e.g. Voter List, Result Data…"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Post selector — append/replace mode */}
          {(importMode === "append" || importMode === "replace") && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <p className="text-sm font-bold text-slate-700">Post ਚੁਣੋ</p>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400"
                  placeholder="Post search ਕਰੋ…"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                />
              </div>
              {postsLoading ? (
                <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-slate-400" /></div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredPosts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPostId(p.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                        selectedPostId === p.id
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                      <p className="text-xs text-slate-400">{p.category} • {p.isPublished ? "Published" : "Draft"}</p>
                    </button>
                  ))}
                  {filteredPosts.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">ਕੋਈ post ਨਹੀਂ ਮਿਲੀ</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Table Preview */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FaEye className="text-slate-400 text-xs" />
                <p className="text-sm font-bold text-slate-700">Data Preview</p>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {filteredRows.length} rows
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={printTable} title="Print" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><FaPrint className="text-xs" /></button>
                <button onClick={exportCSV} title="Export CSV" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><FaFileExport className="text-xs" /></button>
                <button onClick={copyTable} title="Copy" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><FaCopy className="text-xs" /></button>
              </div>
            </div>

            <div className="px-4 py-2 border-b border-slate-100">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-yellow-400"
                  placeholder="Table ਵਿੱਚ search ਕਰੋ…"
                  value={tableSearch}
                  onChange={(e) => { setTableSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: NAVY }}>
                    <th className="text-left px-3 py-2.5 text-white font-bold opacity-60 w-10">#</th>
                    {parsed.columns.map((col) => (
                      <th key={col} className="text-left px-3 py-2.5 text-white font-bold whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"} style={{ transition: "background 0.15s" }}>
                      <td className="px-3 py-2 text-slate-400 font-mono">
                        {(page - 1) * PAGE_SIZE + ri + 1}
                      </td>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-slate-700 whitespace-nowrap">{cell || <span className="text-slate-300">—</span>}</td>
                      ))}
                    </tr>
                  ))}
                  {visibleRows.length === 0 && (
                    <tr><td colSpan={parsed.columns.length + 1} className="text-center py-8 text-slate-400">ਕੋਈ data ਨਹੀਂ ਮਿਲਿਆ</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages} ({filteredRows.length} rows)
                </p>
                <div className="flex items-center gap-1">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-2 py-1 rounded text-xs border border-slate-200 disabled:opacity-40 hover:bg-slate-100">‹</button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-2 py-1 rounded text-xs border border-slate-200 disabled:opacity-40 hover:bg-slate-100">›</button>
                </div>
              </div>
            )}
          </div>

          {importError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              <FaExclamationTriangle /> {importError}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pb-8">
            <Button
              onClick={() => doImport(false)}
              disabled={importing || ((importMode !== "create") && !selectedPostId)}
              className="gap-2 px-8"
              style={{ background: GOLD, color: "#fff" }}
            >
              <FaUpload /> Import ਕਰੋ
            </Button>
            <Button variant="outline" onClick={() => { setParsed(null); setStep("upload"); }}>
              ਰੱਦ ਕਰੋ
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP: Importing ────────────────────────────────────────────── */}
      {step === "importing" && (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-yellow-400 animate-spin" />
            <FaFileExcel className="absolute inset-0 m-auto text-green-600 text-xl" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 text-lg">Import ਹੋ ਰਿਹਾ ਹੈ…</p>
            <p className="text-sm text-slate-400 mt-1">Draft post ਬਣਾਈ ਜਾ ਰਹੀ ਹੈ</p>
          </div>
          {/* Progress bar */}
          <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* ── STEP: Done ─────────────────────────────────────────────────── */}
      {step === "done" && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <FaCheck className="text-4xl text-green-600" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-800">Import ਹੋ ਗਿਆ! ✅</p>
            <p className="text-slate-500 mt-2 text-sm">
              {parsed?.rowCount} rows • {parsed?.columnCount} columns → Draft Post ਬਣੀ
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => doneId && onOpenPost(doneId)}
              style={{ background: GOLD, color: "#fff" }}
              className="gap-2"
            >
              Post Editor ਖੋਲ੍ਹੋ
            </Button>
            <Button variant="outline" onClick={() => { setParsed(null); setStep("upload"); setDoneId(null); }}>
              ਹੋਰ Import ਕਰੋ
            </Button>
            <Button variant="outline" onClick={onBack}>Back</Button>
          </div>
        </div>
      )}

      {/* ── Duplicate Warning Modal ──────────────────────────────────────── */}
      {showDuplicate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <FaExclamationTriangle className="text-amber-500" />
              </div>
              <p className="font-bold text-slate-800">ਦੁਹਰਾਈ Excel ਮਿਲੀ</p>
            </div>
            <p className="text-sm text-slate-600">
              ਇਹ Excel ਪਹਿਲਾਂ import ਕੀਤੀ ਜਾ ਚੁੱਕੀ ਹੈ।
              ਕੀ ਫਿਰ ਵੀ import ਕਰਨਾ ਹੈ?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => { setShowDuplicate(false); setPendingImport(false); doImport(true); }}
                className="flex-1 gap-2"
                style={{ background: GOLD, color: "#fff" }}
              >
                ਫਿਰ ਵੀ Import ਕਰੋ
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setShowDuplicate(false); setPendingImport(false); }}>
                ਰੱਦ ਕਰੋ
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import History Modal ─────────────────────────────────────────── */}
      {showLogs && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-800 text-lg flex items-center gap-2"><FaHistory /> Import History</p>
              <button onClick={() => setShowLogs(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><FaTimes /></button>
            </div>
            {logsLoading ? (
              <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-slate-400 text-2xl" /></div>
            ) : logs.length === 0 ? (
              <p className="text-center text-slate-400 py-8">ਕੋਈ import history ਨਹੀਂ</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <FaFileExcel className="text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{log.file_name}</p>
                      <p className="text-xs text-slate-400">
                        {log.row_count} rows • {log.column_count} cols •{" "}
                        <span className="capitalize">{log.import_mode}</span> •{" "}
                        {new Date(log.imported_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      log.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {log.status === "success" ? "✓" : "✗"} {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
