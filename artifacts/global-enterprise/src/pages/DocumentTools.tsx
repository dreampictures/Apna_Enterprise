import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileImage,
  FilePlus2,
  FileText,
  GripVertical,
  ImagePlus,
  Layers3,
  LockKeyhole,
  Merge,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";
const NAVY = "#071B4A";
const SOFT_BG = "#f8fafd";
const MAX_FILE_BYTES = 50 * 1024 * 1024;

type ToolTab = "pdf-compress" | "image-compress" | "images-pdf" | "pdf-edit";
type ImageItem = { id: string; file: File; preview: string; output?: Blob; outputName?: string };
type PdfItem = { id: string; file: File; pages: number };
type EditorPage = {
  id: string;
  source: "pdf" | "image";
  file: File;
  pageIndex: number;
  preview: string;
  name: string;
};

function bytesLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function idFor(file: File, suffix = "") {
  return `${file.name}-${file.size}-${file.lastModified}-${suffix}-${Math.random().toString(36).slice(2)}`;
}

function isImage(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name);
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function useFilePreview(file: File) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

function DropZone({
  accept,
  multiple,
  onFiles,
  label,
  hint,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const choose = (list: FileList | null) => {
    if (list) onFiles(Array.from(list));
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <div
      className="cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-colors hover:border-[#D4A017]"
      style={{ borderColor: dragging ? GOLD : "#cdd8e8", background: dragging ? "#fffaf0" : "#fbfcfe" }}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files); }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
    >
      <input ref={inputRef} className="hidden" type="file" accept={accept} multiple={multiple} onChange={(event) => choose(event.target.files)} />
      <UploadCloud className="mx-auto h-10 w-10" style={{ color: GOLD }} />
      <h3 className="mt-4 font-bold" style={{ color: NAVY }}>{label}</h3>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
      <span className="mt-4 inline-flex rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-600">Browse files</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, detail }: { icon: typeof FileText; title: string; detail: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-xl p-2" style={{ background: "rgba(212,160,23,.13)" }}><Icon className="h-5 w-5" style={{ color: GOLD }} /></div>
      <div><h2 className="text-xl font-extrabold" style={{ color: NAVY }}>{title}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p></div>
    </div>
  );
}

async function canvasBlob(file: File, quality: number, maxWidth: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser image canvas is not available.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === "image/png" && quality >= 99 ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image compression failed.")), type, quality));
}

async function imageBytesForPdf(file: File) {
  if (file.type === "image/png") return { bytes: await file.arrayBuffer(), type: "png" as const };
  const blob = await canvasBlob(file, 0.96, 3000);
  return { bytes: await blob.arrayBuffer(), type: "jpg" as const };
}

async function compressToTarget(file: File, targetBytes: number, maxWidth: number) {
  let quality = 0.96;
  let blob = await canvasBlob(file, quality, maxWidth);
  for (let attempt = 0; attempt < 7 && blob.size > targetBytes && quality > 0.45; attempt += 1) {
    quality -= 0.08;
    blob = await canvasBlob(file, quality, maxWidth);
  }
  return blob;
}

function ImageQueue({ items, onRemove, onDownload }: { items: ImageItem[]; onRemove: (id: string) => void; onDownload: (item: ImageItem) => void }) {
  return <div className="mt-5 space-y-2">{items.map((item) => {
    const preview = item.preview;
    return <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-white p-3" style={{ borderColor: "#e5ebf4" }}>
      <img src={preview} alt="" className="h-14 w-14 rounded-lg object-cover" />
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700">{item.file.name}</p><p className="text-xs text-slate-500">{bytesLabel(item.file.size)} {item.output ? `→ ${bytesLabel(item.output.size)}` : ""}</p></div>
      {item.output && <Button onClick={() => onDownload(item)} className="btn-gold h-9 rounded-lg px-3 text-xs"><Download className="mr-1.5 h-3.5 w-3.5" />Save</Button>}
      <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.file.name}`}><X className="h-4 w-4" /></button>
    </div>;
  })}</div>;
}

function ImageCompressor() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [targetKb, setTargetKb] = useState(500);
  const [maxWidth, setMaxWidth] = useState(2400);
  const [working, setWorking] = useState(false);
  const add = (files: File[]) => setItems((current) => [...current, ...files.filter(isImage).filter((file) => file.size <= MAX_FILE_BYTES).map((file) => ({ id: idFor(file), file, preview: URL.createObjectURL(file) }))]);
  const process = async () => {
    setWorking(true);
    for (const item of items) {
      const output = await compressToTarget(item.file, targetKb * 1024, maxWidth);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, output, outputName: `${item.file.name.replace(/\.[^.]+$/, "")}-compressed.jpg` } : entry));
    }
    setWorking(false);
  };
  const clear = () => { items.forEach((item) => URL.revokeObjectURL(item.preview)); setItems([]); };
  return <ToolCard>
    <SectionTitle icon={FileImage} title="Image Compressor" detail="ਇੱਕ ਜਾਂ ਕਈ images ਦਾ size ਆਪਣੇ target ਮੁਤਾਬਕ ਘਟਾਓ। Files device ਤੋਂ ਬਾਹਰ ਨਹੀਂ ਜਾਂਦੀਆਂ।" />
    <DropZone accept="image/*" multiple onFiles={add} label="Images ਇੱਥੇ drop ਕਰੋ" hint="JPG, PNG, WEBP, GIF — one by one ਜਾਂ multiple" />
    <div className="mt-5 grid gap-4 rounded-xl border p-4 sm:grid-cols-2" style={{ borderColor: "#e5ebf4", background: "#fbfcfe" }}>
      <label className="text-sm font-bold text-slate-700">Target size (KB)
        <div className="mt-2 flex items-center gap-2"><input type="number" min="20" max="10000" value={targetKb} onChange={(e) => setTargetKb(Math.max(20, Number(e.target.value)))} className="w-full rounded-lg border px-3 py-2" /><span className="text-xs text-slate-400">KB each</span></div>
      </label>
      <label className="text-sm font-bold text-slate-700">Maximum width (px)
        <input type="number" min="320" max="8000" value={maxWidth} onChange={(e) => setMaxWidth(Math.max(320, Number(e.target.value)))} className="mt-2 w-full rounded-lg border px-3 py-2" />
      </label>
    </div>
    {items.length > 0 && <ImageQueue items={items} onRemove={(id) => setItems((current) => current.filter((item) => item.id !== id))} onDownload={(item) => item.output && download(item.output, item.outputName || "compressed-image.jpg")} />}
    <div className="mt-5 flex flex-wrap justify-end gap-2">
      {items.length > 0 && <Button variant="ghost" onClick={clear} className="text-xs"><Trash2 className="mr-1.5 h-4 w-4" />Clear</Button>}
      {items.length > 0 && <Button disabled={working} onClick={process} className="btn-gold rounded-xl">{working ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}{working ? "Compressing…" : "Compress images"}</Button>}
    </div>
    <Note>100% original quality ਅਤੇ smaller size ਇਕੱਠੇ ਹਰ image ਲਈ mathematically possible ਨਹੀਂ ਹੁੰਦੇ। Tool ਪਹਿਲਾਂ high quality ਰੱਖਦਾ ਹੈ ਅਤੇ ਸਿਰਫ਼ target ਨਾ ਆਏ ਤਾਂ quality ਘਟਾਉਂਦਾ ਹੈ।</Note>
  </ToolCard>;
}

function ImagesToPdf() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [working, setWorking] = useState(false);
  const add = (files: File[]) => setItems((current) => [...current, ...files.filter(isImage).map((file) => ({ id: idFor(file), file, preview: URL.createObjectURL(file) }))]);
  const move = (index: number, direction: number) => setItems((current) => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const createPdf = async () => {
    setWorking(true);
    const pdf = await PDFDocument.create();
    for (const item of items) {
      const source = await imageBytesForPdf(item.file);
      const image = source.type === "png" ? await pdf.embedPng(source.bytes) : await pdf.embedJpg(source.bytes);
      const scale = Math.min(1, 595 / image.width);
      const page = pdf.addPage([image.width * scale, image.height * scale]);
      page.drawImage(image, { x: 0, y: 0, width: image.width * scale, height: image.height * scale });
    }
    download(new Blob([await pdf.save()], { type: "application/pdf" }), "images-to-pdf.pdf");
    setWorking(false);
  };
  return <ToolCard><SectionTitle icon={ImagePlus} title="Images to PDF" detail="Images ਨੂੰ ਇਕ PDF ਵਿੱਚ ਬਣਾਓ ਅਤੇ pages ਦਾ order ਆਪਣੀ ਮਰਜ਼ੀ ਨਾਲ set ਕਰੋ।" />
    <DropZone accept="image/*" multiple onFiles={add} label="Images ਇੱਥੇ drop ਕਰੋ" hint="ਹਰ image ਇੱਕ PDF page ਬਣੇਗੀ" />
    <div className="mt-5 space-y-2">{items.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-white p-3" style={{ borderColor: "#e5ebf4" }}><GripVertical className="h-4 w-4 text-slate-300" /><img src={item.preview} alt="" className="h-14 w-14 rounded-lg object-cover" /><p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{index + 1}. {item.file.name}</p><button disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-1 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button><button disabled={index === items.length - 1} onClick={() => move(index, 1)} className="rounded p-1 disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button><button onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="rounded p-1 text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button></div>)}</div>
    {items.length > 0 && <div className="mt-5 flex justify-end"><Button disabled={working} onClick={createPdf} className="btn-gold rounded-xl">{working ? "Creating…" : "Create & download PDF"}<Download className="ml-2 h-4 w-4" /></Button></div>}
  </ToolCard>;
}

async function pagePreview(file: File, pageNumber: number) {
  const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 0.25 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width; canvas.height = viewport.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not render PDF page.");
  await page.render({ canvasContext: context, viewport }).promise;
  const result = canvas.toDataURL("image/jpeg", 0.78);
  await pdf.destroy();
  return result;
}

function PdfEditor() {
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const addPdfs = async (files: File[]) => {
    setWorking(true); setMessage("");
    try {
      const additions: EditorPage[] = [];
      for (const file of files.filter(isPdf)) {
        const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        for (let page = 1; page <= pdf.numPages; page += 1) additions.push({ id: idFor(file, `${page}`), source: "pdf", file, pageIndex: page - 1, preview: await pagePreview(file, page), name: `${file.name} — page ${page}` });
        await pdf.destroy();
      }
      setPages((current) => [...current, ...additions]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF could not be opened."); }
    setWorking(false);
  };
  const addImages = (files: File[]) => setPages((current) => [...current, ...files.filter(isImage).map((file) => ({ id: idFor(file), source: "image", file, pageIndex: 0, preview: URL.createObjectURL(file), name: file.name }))]);
  const move = (index: number, target: number) => setPages((current) => { if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const createPdf = async () => {
    setWorking(true); setMessage("");
    try {
      const out = await PDFDocument.create();
      for (const page of pages) {
        if (page.source === "pdf") {
          const source = await PDFDocument.load(await page.file.arrayBuffer());
          const [copied] = await out.copyPages(source, [page.pageIndex]);
          out.addPage(copied);
        } else {
          const source = await imageBytesForPdf(page.file);
          const image = source.type === "png" ? await out.embedPng(source.bytes) : await out.embedJpg(source.bytes);
          const scale = Math.min(1, 595 / image.width);
          const outputPage = out.addPage([image.width * scale, image.height * scale]);
          outputPage.drawImage(image, { x: 0, y: 0, width: image.width * scale, height: image.height * scale });
        }
      }
      download(new Blob([await out.save()], { type: "application/pdf" }), "edited-merged-document.pdf");
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF could not be created."); }
    setWorking(false);
  };
  return <ToolCard><SectionTitle icon={Merge} title="Merge & Edit PDF Pages" detail="Multiple PDFs merge ਕਰੋ, pages delete ਕਰੋ ਅਤੇ PDFs/images ਨੂੰ slide ਕਰਕੇ ਕਿਸੇ ਵੀ position ਤੇ add ਕਰੋ।" />
    <div className="grid gap-3 sm:grid-cols-2"><DropZone accept=".pdf,application/pdf" multiple onFiles={addPdfs} label="PDF pages add ਕਰੋ" hint="ਇੱਕ ਜਾਂ ਕਈ PDFs upload ਕਰੋ" /><DropZone accept="image/*" multiple onFiles={addImages} label="Image pages add ਕਰੋ" hint="Images PDF ਦੇ ਕਿਸੇ ਵੀ point ਤੇ add ਹੋਣਗੀਆਂ" /></div>
    {working && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500"><RefreshCw className="h-4 w-4 animate-spin" />Processing locally…</p>}
    {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
    {pages.length > 0 && <><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{pages.map((page, index) => <div key={page.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const from = Number(event.dataTransfer.getData("text/plain")); move(from, index); }} className="group relative rounded-xl border bg-white p-2 shadow-sm" style={{ borderColor: "#e5ebf4" }}><img src={page.preview} alt="" className="h-36 w-full rounded-lg bg-slate-50 object-contain" /><p className="mt-2 truncate text-xs font-bold text-slate-600">{index + 1}. {page.name}</p><div className="mt-2 flex items-center justify-between"><GripVertical className="h-4 w-4 cursor-grab text-slate-300" /><div className="flex gap-1"><button onClick={() => move(index, index - 1)} disabled={index === 0} className="rounded bg-slate-50 p-1 disabled:opacity-30"><ArrowLeft className="h-3 w-3" /></button><button onClick={() => move(index, index + 1)} disabled={index === pages.length - 1} className="rounded bg-slate-50 p-1 disabled:opacity-30"><ArrowRight className="h-3 w-3" /></button><button onClick={() => setPages((current) => current.filter((entry) => entry.id !== page.id))} className="rounded bg-red-50 p-1 text-red-500"><Trash2 className="h-3 w-3" /></button></div></div></div>)}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-500">{pages.length} page{pages.length === 1 ? "" : "s"} selected</p><Button disabled={working} onClick={createPdf} className="btn-gold rounded-xl">Create merged PDF <Download className="ml-2 h-4 w-4" /></Button></div></>}
    <Note>Page card ਨੂੰ mouse ਨਾਲ drag ਕਰਕੇ 1-2-3 ਕਿਸੇ ਵੀ order ਵਿੱਚ ਰੱਖੋ। Trash ਨਾਲ delete ਕਰੋ। PDFs ਅਤੇ images ਦੋਵੇਂ mix ਕਰ ਸਕਦੇ ਹੋ।</Note>
  </ToolCard>;
}

function PdfCompression() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [targetMb, setTargetMb] = useState(1.9);
  const [working, setWorking] = useState(false);
  const add = (list: File[]) => setFiles((current) => [...current, ...list.filter(isPdf).filter((file) => file.size <= MAX_FILE_BYTES)]);
  const process = async () => {
    setWorking(true);
    for (const file of files) {
      const source = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const out = await PDFDocument.create();
      for (let number = 1; number <= source.numPages; number += 1) {
        const page = await source.getPage(number);
        const viewport = page.getViewport({ scale: 1.25 });
        const canvas = document.createElement("canvas"); canvas.width = viewport.width; canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not render PDF.");
        await page.render({ canvasContext: context, viewport }).promise;
        const image = await out.embedJpg(canvas.toDataURL("image/jpeg", 0.82));
        const outputPage = out.addPage([viewport.width, viewport.height]);
        outputPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
      }
      const blob = new Blob([await out.save()], { type: "application/pdf" });
      download(blob, `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`);
      await source.destroy();
    }
    setWorking(false);
  };
  return <ToolCard><SectionTitle icon={FileText} title="PDF Compressor" detail="ਇੱਕ ਜਾਂ ਕਈ PDF files ਨੂੰ locally compress ਕਰਕੇ download ਕਰੋ।" />
    <DropZone accept=".pdf,application/pdf" multiple onFiles={add} label="PDFs ਇੱਥੇ drop ਕਰੋ" hint="PDF files up to 50 MB each" />
    <input ref={inputRef} type="hidden" />
    <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "#e5ebf4", background: "#fbfcfe" }}><label className="flex items-center justify-between text-sm font-bold text-slate-700">Target size <span className="rounded-lg px-3 py-1" style={{ background: "rgba(212,160,23,.13)", color: NAVY }}>{targetMb.toFixed(1)} MB</span></label><input type="range" min="0.5" max="10" step="0.1" value={targetMb} onChange={(e) => setTargetMb(Number(e.target.value))} className="mt-3 w-full accent-[#D4A017]" /><p className="mt-1 text-xs text-slate-400">High-quality visual compression. Text selection may not remain in the output.</p></div>
    {files.length > 0 && <div className="mt-5 space-y-2">{files.map((file) => <div key={idFor(file)} className="flex items-center gap-3 rounded-xl border bg-white p-3" style={{ borderColor: "#e5ebf4" }}><FileText className="h-5 w-5" style={{ color: GOLD }} /><span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{file.name}</span><span className="text-xs text-slate-500">{bytesLabel(file.size)}</span><button onClick={() => setFiles((current) => current.filter((entry) => entry !== file))} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button></div>)}</div>}
    {files.length > 0 && <div className="mt-5 flex justify-end"><Button disabled={working} onClick={process} className="btn-gold rounded-xl">{working ? "Compressing…" : "Compress PDFs"}<Download className="ml-2 h-4 w-4" /></Button></div>}
  </ToolCard>;
}

function ToolCard({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-7" style={{ borderColor: "#e5ebf4" }}>{children}</div>; }
function Note({ children }: { children: React.ReactNode }) { return <div className="mt-6 flex gap-2 rounded-xl border p-4 text-xs leading-5 text-slate-500" style={{ borderColor: "#e5ebf4", background: "#fbfcfe" }}><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />{children}</div>; }

export default function DocumentTools() {
  const [tab, setTab] = useState<ToolTab>("pdf-compress");
  const tabs: { id: ToolTab; label: string; icon: typeof FileText }[] = [
    { id: "pdf-compress", label: "PDF Compress", icon: FileText },
    { id: "image-compress", label: "Image Compress", icon: FileImage },
    { id: "images-pdf", label: "Images → PDF", icon: ImagePlus },
    { id: "pdf-edit", label: "Merge / Edit PDF", icon: Layers3 },
  ];
  return <div className="min-h-screen" style={{ background: SOFT_BG }}>
    <Seo title="PDF & Image Tools — Apna Enterprise" description="Compress images and PDFs, convert images to PDF, merge PDF files and edit PDF pages privately in your browser." path="/pdf-compressor" />
    <section className="border-b py-12" style={{ background: "linear-gradient(135deg,#071B4A 0%,#102c68 100%)" }}><div className="container mx-auto px-4 lg:px-8"><div className="max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ borderColor: "rgba(242,193,78,.4)", color: GOLD_LIGHT }}><LockKeyhole className="h-3.5 w-3.5" /> 100% private & local</div><h1 className="text-3xl font-extrabold text-white md:text-5xl">PDF & Image Tools</h1><p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/80 md:text-lg">Compress, convert, merge ਅਤੇ edit ਕਰੋ—ਤੁਹਾਡੀਆਂ files ਇਸ browser ਤੋਂ ਬਾਹਰ ਨਹੀਂ ਜਾਂਦੀਆਂ।</p></div></div></section>
    <div className="container mx-auto px-4 py-8 lg:px-8"><div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border bg-white p-2 sm:grid-cols-4" style={{ borderColor: "#e5ebf4" }}>{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className="flex min-h-16 items-center justify-center gap-2 rounded-xl px-2 text-center text-xs font-bold transition-colors sm:text-sm" style={{ background: tab === id ? "rgba(212,160,23,.14)" : "transparent", color: tab === id ? NAVY : "#64748b" }}><Icon className="h-4 w-4" style={{ color: tab === id ? GOLD : "currentColor" }} />{label}</button>)}</div>{tab === "pdf-compress" && <PdfCompression />}{tab === "image-compress" && <ImageCompressor />}{tab === "images-pdf" && <ImagesToPdf />}{tab === "pdf-edit" && <PdfEditor />}<div className="mt-6 grid gap-3 sm:grid-cols-3"><Trust icon={LockKeyhole} title="Private" text="No upload or sign-in" /><Trust icon={Zap} title="Flexible" text="Choose your target size" /><Trust icon={Check} title="Easy" text="Download when ready" /></div></div>
  </div>;
}

function Trust({ icon: Icon, title, text }: { icon: typeof LockKeyhole; title: string; text: string }) { return <div className="flex items-center gap-3 rounded-xl border bg-white p-4" style={{ borderColor: "#e5ebf4" }}><Icon className="h-5 w-5" style={{ color: GOLD }} /><div><p className="text-sm font-bold" style={{ color: NAVY }}>{title}</p><p className="text-xs text-slate-500">{text}</p></div></div>; }