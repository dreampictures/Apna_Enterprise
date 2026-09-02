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
import { useT } from "@/i18n";

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

const COPY = {
  en: {
    private: "100% private & local", hero: "PDF & Image Tools",
    heroDesc: "Compress, convert, merge and edit — your files never leave this browser.",
    pdfCompress: "PDF Compress", imageCompress: "Image Compress", imagesPdf: "Images → PDF", pdfEdit: "Merge / Edit PDF",
    pdfTitle: "PDF Compressor", pdfDetail: "Compress one or many PDF files locally and download them.",
    imageTitle: "Image Compressor", imageDetail: "Compress one or many images to your target size. Files stay on your device.",
    imagesPdfTitle: "Images to PDF", imagesPdfDetail: "Create one PDF from images and arrange the page order.",
    editorTitle: "Merge & Edit PDF Pages", editorDetail: "Merge PDFs, delete pages, and add PDFs or images anywhere in the document.",
    dropImages: "Drop images here", dropPdfs: "Drop PDFs here", browse: "Browse files",
    imageHint: "JPG, PNG, WEBP, GIF — one or many", pdfHint: "One or many PDF files, up to 50 MB each",
    target: "Target size", each: "each", compressImages: "Compress images", compressing: "Compressing…",
    createPdf: "Create & download PDF", creating: "Creating…", addPdf: "Add PDF pages", addImage: "Add image pages",
    pdfUploadHint: "Upload one or many PDFs", imagePageHint: "Images can be added anywhere in the order",
    createMerged: "Create merged PDF", processing: "Processing locally…", selected: "pages selected",
    localNote: "Drag a page card to arrange 1-2-3 in any order. Use the trash icon to delete. PDFs and images can be mixed.",
    imageNote: "The tool keeps the original dimensions and starts with high quality. It only reduces quality or dimensions as much as needed to reach your target size.",
    privateLabel: "Private", privateText: "No upload or sign-in", flexible: "Flexible", flexibleText: "Choose your target size",
    easy: "Easy", easyText: "Download when ready", clear: "Clear", noFiles: "Choose at least one file first.",
    targetHint: "Quality is preserved as much as possible. Very small targets may require some visual compression.",
     switchWarning: "Switching tools will discard the files currently selected in this tool. Continue?",
     targetExact: "The target is a best effort; exact output size cannot always be guaranteed.",
     opening: "Opening secure payment…",
  },
  pa: {
    private: "100% ਨਿੱਜੀ ਅਤੇ ਲੋਕਲ", hero: "PDF ਅਤੇ ਤਸਵੀਰਾਂ ਦੇ ਸੰਦ",
    heroDesc: "ਸੰਕੁਚਿਤ, ਤਬਦੀਲ, ਜੋੜ ਅਤੇ ਸੋਧ ਕਰੋ—ਤੁਹਾਡੀਆਂ ਫਾਈਲਾਂ ਇਸ ਬਰਾਊਜ਼ਰ ਤੋਂ ਬਾਹਰ ਨਹੀਂ ਜਾਂਦੀਆਂ।",
    pdfCompress: "PDF ਸੰਕੁਚਿਤ", imageCompress: "ਤਸਵੀਰ ਸੰਕੁਚਿਤ", imagesPdf: "ਤਸਵੀਰਾਂ → PDF", pdfEdit: "PDF ਜੋੜੋ / ਸੋਧੋ",
    pdfTitle: "PDF ਸੰਕੁਚਕ", pdfDetail: "ਇੱਕ ਜਾਂ ਕਈ PDF ਫਾਈਲਾਂ ਨੂੰ ਇੱਥੇ ਹੀ ਸੰਕੁਚਿਤ ਕਰਕੇ ਡਾਊਨਲੋਡ ਕਰੋ।",
    imageTitle: "ਤਸਵੀਰ ਸੰਕੁਚਕ", imageDetail: "ਇੱਕ ਜਾਂ ਕਈ ਤਸਵੀਰਾਂ ਦਾ ਆਕਾਰ ਆਪਣੇ ਨਿਸ਼ਾਨੇ ਮੁਤਾਬਕ ਘਟਾਓ। ਫਾਈਲਾਂ ਡਿਵਾਈਸ ਤੋਂ ਬਾਹਰ ਨਹੀਂ ਜਾਂਦੀਆਂ।",
    imagesPdfTitle: "ਤਸਵੀਰਾਂ ਤੋਂ PDF", imagesPdfDetail: "ਤਸਵੀਰਾਂ ਦੀ ਇੱਕ PDF ਬਣਾਓ ਅਤੇ ਪੰਨਿਆਂ ਦੀ ਤਰਤੀਬ ਆਪਣੀ ਮਰਜ਼ੀ ਨਾਲ ਰੱਖੋ।",
    editorTitle: "PDF ਪੰਨੇ ਜੋੜੋ ਅਤੇ ਸੋਧੋ", editorDetail: "ਕਈ PDFs ਜੋੜੋ, ਪੰਨੇ ਮਿਟਾਓ ਅਤੇ PDFs/ਤਸਵੀਰਾਂ ਕਿਸੇ ਵੀ ਥਾਂ ਸ਼ਾਮਲ ਕਰੋ।",
    dropImages: "ਤਸਵੀਰਾਂ ਇੱਥੇ ਸੁੱਟੋ", dropPdfs: "PDFs ਇੱਥੇ ਸੁੱਟੋ", browse: "ਫਾਈਲਾਂ ਚੁਣੋ",
    imageHint: "JPG, PNG, WEBP, GIF — ਇੱਕ ਜਾਂ ਕਈ", pdfHint: "ਇੱਕ ਜਾਂ ਕਈ PDF ਫਾਈਲਾਂ, ਹਰ ਇੱਕ 50 MB ਤੱਕ",
    target: "ਨਿਸ਼ਾਨਾ ਆਕਾਰ", each: "ਹਰ ਇੱਕ", compressImages: "ਤਸਵੀਰਾਂ ਸੰਕੁਚਿਤ ਕਰੋ", compressing: "ਸੰਕੁਚਿਤ ਹੋ ਰਿਹਾ ਹੈ…",
    createPdf: "PDF ਬਣਾਓ ਅਤੇ ਡਾਊਨਲੋਡ ਕਰੋ", creating: "ਬਣ ਰਿਹਾ ਹੈ…", addPdf: "PDF ਪੰਨੇ ਸ਼ਾਮਲ ਕਰੋ", addImage: "ਤਸਵੀਰ ਪੰਨੇ ਸ਼ਾਮਲ ਕਰੋ",
    pdfUploadHint: "ਇੱਕ ਜਾਂ ਕਈ PDFs ਚੁਣੋ", imagePageHint: "ਤਸਵੀਰਾਂ ਨੂੰ ਤਰਤੀਬ ਵਿੱਚ ਕਿਸੇ ਵੀ ਥਾਂ ਸ਼ਾਮਲ ਕਰ ਸਕਦੇ ਹੋ",
    createMerged: "ਜੋੜੀ ਹੋਈ PDF ਬਣਾਓ", processing: "ਇੱਥੇ ਹੀ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ…", selected: "ਪੰਨੇ ਚੁਣੇ",
    localNote: "ਪੰਨੇ ਨੂੰ ਖਿੱਚ ਕੇ 1-2-3 ਕਿਸੇ ਵੀ ਤਰਤੀਬ ਵਿੱਚ ਰੱਖੋ। ਕੂੜੇਦਾਨ ਨਾਲ ਮਿਟਾਓ। PDFs ਅਤੇ ਤਸਵੀਰਾਂ ਇਕੱਠੀਆਂ ਵਰਤ ਸਕਦੇ ਹੋ।",
    imageNote: "ਸੰਦ ਪਹਿਲਾਂ ਅਸਲ ਮਾਪ ਅਤੇ ਵਧੀਆ ਗੁਣਵੱਤਾ ਰੱਖਦਾ ਹੈ। ਨਿਸ਼ਾਨੇ ਆਕਾਰ ਲਈ ਜਿੰਨਾ ਲੋੜੀਂਦਾ ਹੋਵੇ, ਸਿਰਫ਼ ਉਨਾ ਹੀ ਗੁਣਵੱਤਾ ਜਾਂ ਮਾਪ ਘਟਾਇਆ ਜਾਂਦਾ ਹੈ।",
    privateLabel: "ਨਿੱਜੀ", privateText: "ਕੋਈ upload ਜਾਂ sign-in ਨਹੀਂ", flexible: "ਲਚਕੀਲਾ", flexibleText: "ਨਿਸ਼ਾਨਾ ਆਕਾਰ ਚੁਣੋ",
    easy: "ਸੌਖਾ", easyText: "ਤਿਆਰ ਹੋਣ ਤੇ ਡਾਊਨਲੋਡ ਕਰੋ", clear: "ਸਾਫ਼ ਕਰੋ", noFiles: "ਪਹਿਲਾਂ ਘੱਟੋ-ਘੱਟ ਇੱਕ ਫਾਈਲ ਚੁਣੋ।",
    targetHint: "ਗੁਣਵੱਤਾ ਨੂੰ ਜਿੰਨਾ ਹੋ ਸਕੇ ਬਚਾਇਆ ਜਾਂਦਾ ਹੈ। ਬਹੁਤ ਛੋਟੇ ਨਿਸ਼ਾਨੇ ਆਕਾਰ ਲਈ ਕੁਝ visual compression ਲੋੜੀਂਦੀ ਹੋ ਸਕਦੀ ਹੈ।",
     switchWarning: "ਸੰਦ ਬਦਲਣ ਨਾਲ ਇਸ ਸੰਦ ਵਿੱਚ ਚੁਣੀਆਂ ਫਾਈਲਾਂ ਮਿਟ ਜਾਣਗੀਆਂ। ਕੀ ਜਾਰੀ ਰੱਖਣਾ ਹੈ?",
     targetExact: "ਇਹ ਨਿਸ਼ਾਨਾ best effort ਹੈ; ਆਉਟਪੁੱਟ ਦਾ ਬਿਲਕੁਲ ਸਹੀ ਆਕਾਰ ਹਮੇਸ਼ਾ ਯਕੀਨੀ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ।",
     opening: "ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਖੁੱਲ੍ਹ ਰਿਹਾ ਹੈ…",
  },
} as const;

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

function pdfBlob(bytes: Uint8Array) {
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
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
  const { lang } = useT();
  const c = COPY[lang];
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
      <span className="mt-4 inline-flex rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-600">{c.browse}</span>
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

async function compressToTarget(file: File, targetBytes: number) {
  const bitmap = await createImageBitmap(file);
  const originalWidth = bitmap.width;
  bitmap.close();
  let quality = 0.96;
  let maxWidth = originalWidth;
  let blob = await canvasBlob(file, quality, maxWidth);
  for (let attempt = 0; attempt < 8 && blob.size > targetBytes; attempt += 1) {
    if (quality > 0.58) quality -= 0.06;
    else maxWidth = Math.max(320, Math.round(maxWidth * 0.82));
    blob = await canvasBlob(file, quality, maxWidth);
  }
  return blob;
}

function ImageQueue({ items, onRemove, onDownload }: { items: ImageItem[]; onRemove: (id: string) => void; onDownload: (item: ImageItem) => void }) {
  const { lang } = useT();
  const c = COPY[lang];
  return <div className="mt-5 space-y-2">{items.map((item) => {
    const preview = item.preview;
    return <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-white p-3" style={{ borderColor: "#e5ebf4" }}>
      <img src={preview} alt="" className="h-14 w-14 rounded-lg object-cover" />
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700">{item.file.name}</p><p className="text-xs text-slate-500">{bytesLabel(item.file.size)} {item.output ? `→ ${bytesLabel(item.output.size)}` : ""}</p></div>
      {item.output && <Button onClick={() => onDownload(item)} className="btn-gold h-9 rounded-lg px-3 text-xs"><Download className="mr-1.5 h-3.5 w-3.5" />{c.browse === "Browse files" ? "Save" : "ਸੇਵ ਕਰੋ"}</Button>}
      <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.file.name}`}><X className="h-4 w-4" /></button>
    </div>;
  })}</div>;
}

function ImageCompressor({ onDirty }: { onDirty: (dirty: boolean) => void }) {
  const { lang } = useT();
  const c = COPY[lang];
  const [items, setItems] = useState<ImageItem[]>([]);
  const [targetKb, setTargetKb] = useState(500);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const add = (files: File[]) => {
    const next = files.filter(isImage).filter((file) => file.size <= MAX_FILE_BYTES).map((file) => ({ id: idFor(file), file, preview: URL.createObjectURL(file) }));
    if (next.length) onDirty(true);
    setItems((current) => [...current, ...next]);
  };
  const process = async () => {
    setWorking(true);
    setMessage("");
    try {
      for (const item of items) {
        const output = await compressToTarget(item.file, targetKb * 1024);
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, output, outputName: `${item.file.name.replace(/\.[^.]+$/, "")}-compressed.jpg` } : entry));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image compression failed.");
    } finally {
      setWorking(false);
    }
  };
  const save = (item: ImageItem) => {
    if (!item.output) return;
    try {
      download(item.output, item.outputName || "compressed-image.jpg");
      URL.revokeObjectURL(item.preview);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      onDirty(items.length > 1);
    } catch {
      // Keep the item available if the browser rejects the download.
    }
  };
  const clear = () => { items.forEach((item) => URL.revokeObjectURL(item.preview)); setItems([]); onDirty(false); };
  return <ToolCard>
    <SectionTitle icon={FileImage} title={c.imageTitle} detail={c.imageDetail} />
    <DropZone accept="image/*" multiple onFiles={add} label={c.dropImages} hint={c.imageHint} />
    <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "#e5ebf4", background: "#fbfcfe" }}>
      <label className="text-sm font-bold text-slate-700">{c.target} (KB)
        <div className="mt-2 flex items-center gap-2"><input type="number" min="20" max="10000" value={targetKb} onChange={(e) => setTargetKb(Math.max(20, Number(e.target.value)))} className="w-full rounded-lg border px-3 py-2" /><span className="text-xs text-slate-400">{c.each}</span></div>
      </label>
    </div>
    {items.length > 0 && <ImageQueue items={items} onRemove={(id) => { setItems((current) => current.filter((item) => item.id !== id)); onDirty(items.length > 1); }} onDownload={save} />}
    {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
    <div className="mt-5 flex flex-wrap justify-end gap-2">
      {items.length > 0 && <Button variant="ghost" onClick={clear} className="text-xs"><Trash2 className="mr-1.5 h-4 w-4" />{c.clear}</Button>}
      {items.length > 0 && <Button disabled={working} onClick={process} className="btn-gold rounded-xl">{working ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}{working ? c.compressing : c.compressImages}</Button>}
    </div>
    <Note>{c.imageNote}</Note>
  </ToolCard>;
}

function ImagesToPdf({ onDirty }: { onDirty: (dirty: boolean) => void }) {
  const { lang } = useT();
  const c = COPY[lang];
  const [items, setItems] = useState<ImageItem[]>([]);
  const [working, setWorking] = useState(false);
  const add = (files: File[]) => {
    const next = files.filter(isImage).map((file) => ({ id: idFor(file), file, preview: URL.createObjectURL(file) }));
    if (next.length) onDirty(true);
    setItems((current) => [...current, ...next]);
  };
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
     download(pdfBlob(await pdf.save()), `${items[0]?.file.name.replace(/\.[^.]+$/, "") || "images"}-to-pdf.pdf`);
     items.forEach((item) => URL.revokeObjectURL(item.preview));
     setItems([]);
     onDirty(false);
    setWorking(false);
  };
  return <ToolCard><SectionTitle icon={ImagePlus} title={c.imagesPdfTitle} detail={c.imagesPdfDetail} />
    <DropZone accept="image/*" multiple onFiles={add} label={c.dropImages} hint={c.imageHint} />
    <div className="mt-5 space-y-2">{items.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-white p-3" style={{ borderColor: "#e5ebf4" }}><GripVertical className="h-4 w-4 text-slate-300" /><img src={item.preview} alt="" className="h-14 w-14 rounded-lg object-cover" /><p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{index + 1}. {item.file.name}</p><button disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-1 disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button><button disabled={index === items.length - 1} onClick={() => move(index, 1)} className="rounded p-1 disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button><button onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="rounded p-1 text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button></div>)}</div>
    {items.length > 0 && <div className="mt-5 flex justify-end"><Button disabled={working} onClick={createPdf} className="btn-gold rounded-xl">{working ? c.creating : c.createPdf}<Download className="ml-2 h-4 w-4" /></Button></div>}
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

async function compressPdfToTarget(file: File, targetBytes: number) {
  let quality = 0.82;
  let scale = 1.25;
  let output = new Blob();
  for (let attempt = 0; attempt < 9; attempt += 1) {
    const source = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const out = await PDFDocument.create();
    for (let number = 1; number <= source.numPages; number += 1) {
      const page = await source.getPage(number);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not render PDF.");
      await page.render({ canvasContext: context, viewport }).promise;
      const image = await out.embedJpg(canvas.toDataURL("image/jpeg", quality));
      const outputPage = out.addPage([viewport.width, viewport.height]);
      outputPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    }
    output = pdfBlob(await out.save());
    await source.destroy();
    if (output.size <= targetBytes || targetBytes >= file.size) break;
    if (quality > 0.38) quality = Math.max(0.38, quality - 0.08);
    else scale = Math.max(0.45, scale * 0.8);
  }
  return output;
}

function PdfEditor({ onDirty }: { onDirty: (dirty: boolean) => void }) {
  const { lang } = useT();
  const c = COPY[lang];
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
      if (additions.length) onDirty(true);
      setPages((current) => [...current, ...additions]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF could not be opened."); }
    setWorking(false);
  };
  const addImages = (files: File[]) => {
    const additions = files.filter(isImage).map((file) => ({ id: idFor(file), source: "image" as const, file, pageIndex: 0, preview: URL.createObjectURL(file), name: file.name }));
    if (additions.length) onDirty(true);
    setPages((current) => [...current, ...additions]);
  };
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
       download(pdfBlob(await out.save()), `${pages[0]?.file.name.replace(/\.[^.]+$/, "") || "edited"}-merged.pdf`);
       pages.filter((page) => page.source === "image").forEach((page) => URL.revokeObjectURL(page.preview));
       setPages([]);
       onDirty(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF could not be created."); }
    setWorking(false);
  };
  return <ToolCard><SectionTitle icon={Merge} title={c.editorTitle} detail={c.editorDetail} />
    <div className="grid gap-3 sm:grid-cols-2"><DropZone accept=".pdf,application/pdf" multiple onFiles={addPdfs} label={c.addPdf} hint={c.pdfUploadHint} /><DropZone accept="image/*" multiple onFiles={addImages} label={c.addImage} hint={c.imagePageHint} /></div>
    {working && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-500"><RefreshCw className="h-4 w-4 animate-spin" />{c.processing}</p>}
    {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
    {pages.length > 0 && <><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{pages.map((page, index) => <div key={page.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const from = Number(event.dataTransfer.getData("text/plain")); move(from, index); }} className="group relative rounded-xl border bg-white p-2 shadow-sm" style={{ borderColor: "#e5ebf4" }}><img src={page.preview} alt="" className="h-36 w-full rounded-lg bg-slate-50 object-contain" /><p className="mt-2 truncate text-xs font-bold text-slate-600">{index + 1}. {page.name}</p><div className="mt-2 flex items-center justify-between"><GripVertical className="h-4 w-4 cursor-grab text-slate-300" /><div className="flex gap-1"><button onClick={() => move(index, index - 1)} disabled={index === 0} className="rounded bg-slate-50 p-1 disabled:opacity-30"><ArrowLeft className="h-3 w-3" /></button><button onClick={() => move(index, index + 1)} disabled={index === pages.length - 1} className="rounded bg-slate-50 p-1 disabled:opacity-30"><ArrowRight className="h-3 w-3" /></button><button onClick={() => setPages((current) => current.filter((entry) => entry.id !== page.id))} className="rounded bg-red-50 p-1 text-red-500"><Trash2 className="h-3 w-3" /></button></div></div></div>)}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-500">{pages.length} {c.selected}</p><Button disabled={working} onClick={createPdf} className="btn-gold rounded-xl">{c.createMerged} <Download className="ml-2 h-4 w-4" /></Button></div></>}
    <Note>{c.localNote}</Note>
  </ToolCard>;
}

function PdfCompression({ onDirty }: { onDirty: (dirty: boolean) => void }) {
  const { lang } = useT();
  const c = COPY[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [targetKb, setTargetKb] = useState(1900);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const add = (list: File[]) => {
    const next = list.filter(isPdf).filter((file) => file.size <= MAX_FILE_BYTES);
    if (next.length) onDirty(true);
    setFiles((current) => [...current, ...next]);
  };
  const process = async () => {
    setWorking(true);
    setMessage("");
    try {
      for (const file of files) {
        const blob = await compressPdfToTarget(file, targetKb * 1024);
        download(blob, `${file.name.replace(/\.pdf$/i, "")}-compressed.pdf`);
      }
      setFiles([]);
      onDirty(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "PDF compression failed.");
    } finally {
      setWorking(false);
    }
  };
  return <ToolCard><SectionTitle icon={FileText} title={c.pdfTitle} detail={c.pdfDetail} />
    <DropZone accept=".pdf,application/pdf" multiple onFiles={add} label={c.dropPdfs} hint={c.pdfHint} />
    <input ref={inputRef} type="hidden" />
    <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "#e5ebf4", background: "#fbfcfe" }}>
      <label className="flex items-center justify-between text-sm font-bold text-slate-700">{c.target} <span className="rounded-lg px-3 py-1" style={{ background: "rgba(212,160,23,.13)", color: NAVY }}>{targetKb >= 1024 ? `${(targetKb / 1024).toFixed(2)} MB` : `${targetKb} KB`}</span></label>
      <input type="range" min="10" max="10240" step="10" value={targetKb} onChange={(e) => setTargetKb(Number(e.target.value))} className="mt-3 w-full accent-[#D4A017]" />
      <div className="mt-2 flex items-center gap-2"><input type="number" min="10" max="10240" step="1" value={targetKb} onChange={(e) => setTargetKb(Math.min(10240, Math.max(10, Number(e.target.value) || 10)))} className="w-28 rounded-lg border px-3 py-2 text-sm" /><span className="text-xs text-slate-500">KB</span></div>
      <p className="mt-2 text-xs text-slate-400">{c.targetHint} {c.targetExact}</p>
    </div>
    {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
     {files.length > 0 && <div className="mt-5 space-y-2">{files.map((file) => <div key={idFor(file)} className="flex items-center gap-3 rounded-xl border bg-white p-3" style={{ borderColor: "#e5ebf4" }}><FileText className="h-5 w-5" style={{ color: GOLD }} /><span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{file.name}</span><span className="text-xs text-slate-500">{bytesLabel(file.size)}</span><button onClick={() => { setFiles((current) => current.filter((entry) => entry !== file)); onDirty(files.length > 1); }} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button></div>)}</div>}
    {files.length > 0 && <div className="mt-5 flex justify-end"><Button disabled={working} onClick={process} className="btn-gold rounded-xl">{working ? c.compressing : c.pdfCompress}<Download className="ml-2 h-4 w-4" /></Button></div>}
  </ToolCard>;
}

function ToolCard({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-7" style={{ borderColor: "#e5ebf4" }}>{children}</div>; }
function Note({ children }: { children: React.ReactNode }) { return <div className="mt-6 flex gap-2 rounded-xl border p-4 text-xs leading-5 text-slate-500" style={{ borderColor: "#e5ebf4", background: "#fbfcfe" }}><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />{children}</div>; }

export default function DocumentTools() {
  const { lang } = useT();
  const c = COPY[lang];
  const [tab, setTab] = useState<ToolTab>("pdf-compress");
  const [dirtyTools, setDirtyTools] = useState<Record<ToolTab, boolean>>({ "pdf-compress": false, "image-compress": false, "images-pdf": false, "pdf-edit": false });
  const tabs: { id: ToolTab; label: string; icon: typeof FileText }[] = [
    { id: "pdf-compress", label: c.pdfCompress, icon: FileText },
    { id: "image-compress", label: c.imageCompress, icon: FileImage },
    { id: "images-pdf", label: c.imagesPdf, icon: ImagePlus },
    { id: "pdf-edit", label: c.pdfEdit, icon: Layers3 },
  ];
   const switchTool = (next: ToolTab) => {
     if (next === tab) return;
     if (dirtyTools[tab] && !window.confirm(c.switchWarning)) return;
     setTab(next);
   };
   return <div className="min-h-screen" style={{ background: SOFT_BG }}>
    <Seo title={`${c.hero} — Apna Enterprise`} description={c.heroDesc} path="/pdf-compressor" />
    <section className="border-b py-12" style={{ background: "linear-gradient(135deg,#071B4A 0%,#102c68 100%)" }}><div className="container mx-auto px-4 lg:px-8"><div className="max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ borderColor: "rgba(242,193,78,.4)", color: GOLD_LIGHT }}><LockKeyhole className="h-3.5 w-3.5" /> {c.private}</div><h1 className="text-3xl font-extrabold text-white md:text-5xl">{c.hero}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/80 md:text-lg">{c.heroDesc}</p></div></div></section>
     <div className="container mx-auto px-4 py-8 lg:px-8"><div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border bg-white p-2 sm:grid-cols-4" style={{ borderColor: "#e5ebf4" }}>{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => switchTool(id)} className="flex min-h-16 items-center justify-center gap-2 rounded-xl px-2 text-center text-xs font-bold transition-colors sm:text-sm" style={{ background: tab === id ? "rgba(212,160,23,.14)" : "transparent", color: tab === id ? NAVY : "#64748b" }}><Icon className="h-4 w-4" style={{ color: tab === id ? GOLD : "currentColor" }} />{label}</button>)}</div>{tab === "pdf-compress" && <PdfCompression onDirty={(dirty) => setDirtyTools((current) => ({ ...current, "pdf-compress": dirty }))} />}{tab === "image-compress" && <ImageCompressor onDirty={(dirty) => setDirtyTools((current) => ({ ...current, "image-compress": dirty }))} />}{tab === "images-pdf" && <ImagesToPdf onDirty={(dirty) => setDirtyTools((current) => ({ ...current, "images-pdf": dirty }))} />}{tab === "pdf-edit" && <PdfEditor onDirty={(dirty) => setDirtyTools((current) => ({ ...current, "pdf-edit": dirty }))} />}<div className="mt-6 grid gap-3 sm:grid-cols-3"><Trust icon={LockKeyhole} title={c.privateLabel} text={c.privateText} /><Trust icon={Zap} title={c.flexible} text={c.flexibleText} /><Trust icon={Check} title={c.easy} text={c.easyText} /></div></div>
  </div>;
}

function Trust({ icon: Icon, title, text }: { icon: typeof LockKeyhole; title: string; text: string }) { return <div className="flex items-center gap-3 rounded-xl border bg-white p-4" style={{ borderColor: "#e5ebf4" }}><Icon className="h-5 w-5" style={{ color: GOLD }} /><div><p className="text-sm font-bold" style={{ color: NAVY }}>{title}</p><p className="text-xs text-slate-500">{text}</p></div></div>; }