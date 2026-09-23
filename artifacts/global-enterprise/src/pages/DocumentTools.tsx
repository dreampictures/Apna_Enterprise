import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileArchive,
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
  Settings,
  Info,
  Infinity as InfinityIcon,
  LayoutGrid,
  List,
  Plus,
  Target,
  File,
  Eye,
  Settings2,
  ArrowUp,
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
  buttonText = "Choose Files",
  icon: Icon = UploadCloud
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  hint: string;
  buttonText?: string;
  icon?: any;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const choose = (list: FileList | null) => {
    if (list) onFiles(Array.from(list));
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <div
      className={`pdf-tools-dropzone ${dragging ? 'dragging' : ''}`}
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
      <div className="mx-auto h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{label}</h3>
      <p className="mt-1 text-sm text-slate-500">or click to browse from your device</p>

      <div className="mt-6 mb-4 flex justify-center">
        <span className="pdf-tools-btn-gold">{buttonText}</span>
      </div>
      <p className="text-xs text-slate-400 mt-2">{hint}</p>
    </div>
  );
}

const StepBadge = ({ num, title, desc }: { num: number | string | React.ReactNode, title: string, desc?: string }) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="w-6 h-6 rounded-full bg-[#D4A017] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
      {num}
    </div>
    <div>
      <h3 className="font-bold text-slate-800 text-[15px]">{title}</h3>
      {desc && <p className="text-[13px] text-slate-500 mt-0.5">{desc}</p>}
    </div>
  </div>
);



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


function ImageCompressor({ onDirty }: { onDirty: (dirty: boolean) => void }) {
  const { lang } = useT();
  const c = COPY[lang];
  const inputRef = useRef<HTMLInputElement>(null);
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

  const readyItems = items.filter((item) => item.output);
  const saveZip = async () => {
    if (readyItems.length < 1) return;
    try {
      const zip = new JSZip();
      readyItems.forEach((item) => {
        if (item.output) {
          zip.file(item.outputName || `${item.file.name.replace(/\.[^.]+$/, "")}-compressed.jpg`, item.output);
        }
      });
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      download(blob, "compressed-images.zip");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image ZIP could not be created.");
    }
  };

  const remove = (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    setItems(current => current.filter(item => item.id !== id));
    onDirty(items.length > 1);
  };

  const clear = () => {
    items.forEach((item) => URL.revokeObjectURL(item.preview));
    setItems([]);
    onDirty(false);
  };

  return (
    <div className="pdf-tools-card">
      <div className="relative">
        <StepBadge num={1} title="Upload Images" desc="Select one or more images to compress. Maximum file size: 50 MB each." />
        <div className="absolute top-0 right-0 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hidden md:flex items-center gap-1.5 z-10">
          <Info className="w-3.5 h-3.5 text-blue-500" /> Supports: JPG, PNG, WebP, GIF | Max size: 50 MB each
        </div>
      </div>
      <DropZone accept="image/*" multiple onFiles={add} label={c.dropImages} hint="" buttonText={c.browse} icon={UploadCloud} />

      {items.length > 0 && (
        <>
          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="flex justify-between items-center mb-4">
              <StepBadge num={2} title="Compression Settings" desc="Set your target size using the slider or enter the exact size (optional)." />
              <Button variant="ghost" size="sm" onClick={() => setTargetKb(500)} className="text-slate-500 h-8 text-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-center bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="w-full lg:w-48">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-2"><Target className="w-3.5 h-3.5 text-blue-500" /> {c.target} (optional)</span>
                <div className="flex gap-2">
                  <input type="number" min="10" max="10240" step="1" value={targetKb} onChange={(e) => setTargetKb(Math.min(10240, Math.max(10, Number(e.target.value) || 10)))} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white font-medium" />
                  <select className="border border-slate-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none font-medium w-16">
                    <option value="KB">KB</option>
                  </select>
                </div>
              </div>

              <div className="text-[10px] font-extrabold text-slate-400 w-6 h-6 flex items-center justify-center shrink-0 bg-white rounded-full border border-slate-200 shadow-sm">OR</div>

              <div className="flex-1 w-full">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-2"><Settings2 className="w-3.5 h-3.5 text-green-500" /> Compression Level</span>
                <input type="range" min="10" max="10240" step="10" value={targetKb} onChange={(e) => setTargetKb(Number(e.target.value))} className="pdf-tools-slider-track !mt-0 !mb-2" />
                <div className="pdf-tools-slider-labels">
                  <span className="text-left font-semibold">Larger Size<br/><span className="text-[9px] opacity-70 font-normal">Best Quality</span></span>
                  <span className="text-center font-semibold text-blue-600">Balanced<br/><span className="text-[9px] opacity-70 font-normal">(Recommended)</span></span>
                  <span className="text-center font-semibold">Smaller Size<br/><span className="text-[9px] opacity-70 font-normal">Good Quality</span></span>
                  <span className="text-right font-semibold">Smallest Size<br/><span className="text-[9px] opacity-70 font-normal">Lowest Quality</span></span>
                </div>
              </div>

              <div className="w-full lg:w-48 bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <div className="text-[10px] font-bold text-green-700 flex items-center justify-center gap-1 mb-1"><FileArchive className="w-3 h-3" /> Estimated Output Size</div>
                <div className="text-lg font-extrabold text-green-600">~ {targetKb} KB</div>
                <div className="text-[9px] text-green-600/70 mt-0.5">(per image, approx.)</div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="flex justify-between items-center mb-4">
              <StepBadge num={3} title={`Selected Images (${items.length})`} />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={clear} className="text-slate-500 hover:text-red-600 h-8 text-xs font-semibold bg-slate-50">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {c.clear}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs font-semibold bg-blue-50/50 border border-blue-100">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add More Images
                </Button>
                <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if(e.target.files) add(Array.from(e.target.files)); e.target.value = ""; }} />
              </div>
            </div>

            <div className="space-y-2 mb-8 max-h-[300px] overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.id} className="pdf-tools-file-row group">
                  <img src={item.preview} className="w-12 h-12 object-cover rounded bg-slate-100 border border-slate-200" alt="" />
                  <div className="pdf-tools-file-name flex flex-col justify-center gap-0.5">
                    <span className="font-bold text-[13px]">{item.file.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{bytesLabel(item.file.size)}</span>
                  </div>

                  {item.output ? (
                    <>
                      <div className="hidden sm:block text-right w-16 opacity-40"><ArrowRight className="w-4 h-4 inline-block" /></div>
                      <div className="w-20 text-right text-[13px] font-bold text-green-600">{bytesLabel(item.output.size)}</div>
                      <div className="w-16 text-center text-[10px] text-green-700 font-bold bg-green-100 px-2 py-1 rounded">
                        {Math.round((item.output.size - item.file.size) / item.file.size * 100)}%
                      </div>
                    </>
                  ) : (
                    <div className="flex-1"></div>
                  )}

                  <div className="w-24 hidden sm:flex justify-end pr-4">
                    <span className="pdf-tools-file-status bg-green-50 px-2 py-1 rounded"><Check className="w-3 h-3" /> Ready</span>
                  </div>

                  <div className="pdf-tools-file-actions">
                    <button onClick={() => window.open(item.preview, '_blank')} className="pdf-tools-action-btn">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(item.id)} className="pdf-tools-action-btn danger">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {message && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#D4A017] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5">4</div>
                <div>
                  <h3 className="font-bold text-slate-800 text-[15px]">Compress & Download</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">Click the button below to start compression. You can download all images in a ZIP file.</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                {readyItems.length > 0 && (
                  <Button onClick={saveZip} className="bg-slate-800 hover:bg-slate-900 text-white border-none py-2.5 px-6 h-auto text-sm rounded-lg font-bold flex-1 sm:flex-none">
                    <FileArchive className="w-4 h-4 mr-2" /> Download ZIP
                  </Button>
                )}
                <button disabled={working} onClick={process} className="pdf-tools-btn-gold py-2.5 px-6 text-sm rounded-lg shadow-md flex-1 sm:flex-none justify-center">
                  {working ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                  {working ? c.compressing : c.compressImages + " →"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ImagesToPdf({ onDirty }: { onDirty: (dirty: boolean) => void }) {
  const { lang } = useT();
  const c = COPY[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [working, setWorking] = useState(false);

  const add = (files: File[]) => {
    const next = files.filter(isImage).filter((file) => file.size <= MAX_FILE_BYTES).map((file) => ({ id: idFor(file), file, preview: URL.createObjectURL(file) }));
    if (next.length) onDirty(true);
    setItems((current) => [...current, ...next]);
  };
  const remove = (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    setItems((current) => current.filter((entry) => entry.id !== id));
    onDirty(items.length > 1);
  };
  const clear = () => {
    items.forEach((item) => URL.revokeObjectURL(item.preview));
    setItems([]);
    onDirty(false);
  };
  const move = (index: number, direction: number) => setItems((current) => {
    const next = [...current];
    const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });

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

  return (
    <div className="pdf-tools-card">
      <div className="relative mb-6">
        <StepBadge num={1} title="Upload Images" desc="Select one or more images to convert into PDF. You can upload multiple images at once." />
        <div className="absolute top-0 right-0 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hidden md:flex items-center gap-1.5">
          <ImagePlus className="w-3.5 h-3.5 text-blue-500" /> Supports: JPG, PNG, WebP, GIF | No file limit
        </div>
      </div>

      <DropZone accept="image/*" multiple onFiles={add} label={c.dropImages} hint="" buttonText={c.browse} icon={UploadCloud} />

      {items.length > 0 && (
        <div className="mt-10 border-t border-slate-100 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <StepBadge num={2} title="Arrange Images" desc="Drag the arrows to reorder images. The PDF will be created in this exact order." />
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="ghost" size="sm" onClick={clear} className="flex-1 sm:flex-none text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs font-bold bg-red-50/50">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {c.clear}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="flex-1 sm:flex-none text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs font-bold border border-blue-100 bg-blue-50/50">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add More Images
              </Button>
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if(e.target.files) add(Array.from(e.target.files)); e.target.value = ""; }} />
            </div>
          </div>

          <div className="space-y-2 mb-8 max-h-[400px] overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div key={item.id} className="pdf-tools-file-row">
                <GripVertical className="w-4 h-4 text-slate-300 cursor-grab hidden sm:block" />
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">{index + 1}</div>
                <img src={item.preview} className="w-12 h-12 object-cover rounded border border-slate-200" alt="" />
                <div className="pdf-tools-file-name flex flex-col justify-center gap-0.5 ml-2">
                  <span className="font-bold text-[13px]">{item.file.name}</span>
                  <span className="text-[11px] text-slate-500 font-medium">{bytesLabel(item.file.size)}</span>
                </div>

                <div className="flex-1"></div>

                <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                  <button disabled={index === 0} onClick={() => move(index, -1)} className="w-8 h-8 rounded flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button disabled={index === items.length - 1} onClick={() => move(index, 1)} className="w-8 h-8 rounded flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <button onClick={() => remove(item.id)} className="w-8 h-8 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-8">
            <StepBadge num={3} title="PDF Settings (Optional)" desc="Customize your PDF as per your need." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-[11px] font-bold text-slate-700 block mb-2">Page Size</label>
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <select className="flex-1 text-sm bg-transparent outline-none font-medium">
                    <option>Based on each image</option>
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-[11px] font-bold text-slate-700 block mb-2">Image Fit</label>
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                  <LayoutGrid className="w-4 h-4 text-slate-400" />
                  <select className="flex-1 text-sm bg-transparent outline-none font-medium">
                    <option>Preserve original ratio</option>
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-[11px] font-bold text-slate-700 block mb-2">Page Orientation</label>
                <div className="flex gap-2">
                  <div className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-2">
                    <File className="w-3.5 h-3.5" /> Automatic
                  </div>
                </div>
              </div>
            </div>

            <button disabled={working} onClick={createPdf} className="pdf-tools-btn-gold w-full justify-center py-4 text-[15px] rounded-xl shadow-lg">
              {working ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              {working ? c.creating : c.createPdf + " →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
  const [view, setView] = useState<"grid" | "list">("grid");
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addPdfs = async (files: File[]) => {
    setWorking(true); setMessage("");
    try {
      const additions: EditorPage[] = [];
      for (const file of files.filter(isPdf)) {
        const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        for (let page = 1; page <= pdf.numPages; page += 1) additions.push({ id: idFor(file, `${page}`), source: "pdf", file, pageIndex: page - 1, preview: await pagePreview(file, page), name: file.name });
        await pdf.destroy();
      }
      if (additions.length) onDirty(true);
      setPages((current) => [...current, ...additions]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF could not be opened."); }
    setWorking(false);
  };
  const addImages = (files: File[]) => {
    const additions = files.filter(isImage).filter((file) => file.size <= MAX_FILE_BYTES).map((file) => ({ id: idFor(file), source: "image" as const, file, pageIndex: 0, preview: URL.createObjectURL(file), name: file.name }));
    if (additions.length) onDirty(true);
    setPages((current) => [...current, ...additions]);
  };
  const removePage = (id: string) => {
    const page = pages.find((entry) => entry.id === id);
    if (page?.source === "image") URL.revokeObjectURL(page.preview);
    setPages((current) => current.filter((entry) => entry.id !== id));
    onDirty(pages.length > 1);
  };
  const clear = () => {
    pages.filter((page) => page.source === "image").forEach((page) => URL.revokeObjectURL(page.preview));
    setPages([]);
    onDirty(false);
  };
  const move = (index: number, target: number) => setPages((current) => { if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });

  const createPdf = async () => {
    setWorking(true); setMessage("");
    try {
      const out = await PDFDocument.create();
      for (const page of pages) {
        if (page.source === "pdf") {
          const source = await PDFDocument.load(await page.file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
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
      const baseName = pages[0]?.file.name.replace(/\.[^.]+$/, "") || "edited";
      download(pdfBlob(await out.save()), `${baseName}-merged.pdf`);
      pages.filter((page) => page.source === "image").forEach((page) => URL.revokeObjectURL(page.preview));
      setPages([]);
      onDirty(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF could not be created."); }
    setWorking(false);
  };

  return (
    <div className="pdf-tools-card">
      <div className="relative mb-6">
        <StepBadge num={<Merge className="w-3.5 h-3.5" />} title="Merge & Edit PDF Pages" desc="Upload PDFs, add images, delete pages and arrange them in the correct order." />
        <div className="absolute top-0 right-0 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hidden md:flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" /> Supports: PDF, JPG, PNG, WebP, GIF | No file limit
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-8 text-center flex flex-col items-center justify-center transition-colors hover:border-blue-400">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-[15px]">Add PDF Files</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Upload one or more PDFs</p>
          <button onClick={() => pdfInputRef.current?.click()} className="pdf-tools-btn-gold text-sm py-2 px-4"><FileText className="w-4 h-4 mr-1"/> Choose PDF Files</button>
          <input ref={pdfInputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={(e) => { if(e.target.files) addPdfs(Array.from(e.target.files)); e.target.value=""; }} />
        </div>
        <div className="border-2 border-dashed border-yellow-200 bg-yellow-50/30 rounded-xl p-8 text-center flex flex-col items-center justify-center transition-colors hover:border-yellow-400">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mb-3">
            <ImagePlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-[15px]">Add Image Pages</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Images can be added anywhere in the order</p>
          <button onClick={() => imageInputRef.current?.click()} className="pdf-tools-btn-gold text-sm py-2 px-4 bg-yellow-100 text-yellow-900 border border-yellow-300 shadow-none hover:bg-yellow-200"><ImagePlus className="w-4 h-4 mr-1"/> Choose Images</button>
          <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if(e.target.files) addImages(Array.from(e.target.files)); e.target.value=""; }} />
        </div>
      </div>

      {working && pages.length === 0 && <p className="mt-6 flex justify-center items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 py-3 rounded-lg border border-blue-100"><RefreshCw className="w-4 h-4 animate-spin" /> Processing PDFs...</p>}
      {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}

      {pages.length > 0 && (
        <div className="mt-10 border-t border-slate-100 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 text-yellow-800 p-1.5 rounded-lg border border-yellow-200">
                <FilePlus2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px]">{pages.length} {c.selected}</h3>
                <p className="text-[11px] text-slate-500 hidden sm:block">Drag to reorder pages. Use the delete icon to remove pages.</p>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="ghost" size="sm" onClick={clear} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 text-xs font-bold bg-red-50/50 flex-1 md:flex-none">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {c.clear}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => pdfInputRef.current?.click()} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-9 text-xs font-bold border border-blue-100 flex-1 md:flex-none">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add More Files
              </Button>
              <div className="hidden sm:flex bg-slate-100 rounded-lg p-1 border border-slate-200 ml-2">
                <button onClick={()=>setView('grid')} className={`p-1.5 rounded flex items-center justify-center ${view==='grid' ? 'bg-white shadow-sm text-yellow-600 font-bold border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}><LayoutGrid className="w-4 h-4 mr-1"/> <span className="text-[10px] uppercase tracking-wider">Grid View</span></button>
                <button onClick={()=>setView('list')} className={`p-1.5 rounded flex items-center justify-center ${view==='list' ? 'bg-white shadow-sm text-yellow-600 font-bold border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}><List className="w-4 h-4 mr-1"/> <span className="text-[10px] uppercase tracking-wider">List View</span></button>
              </div>
            </div>
          </div>

          <div className={view === 'grid' ? "pdf-tools-grid-view" : "space-y-2 max-h-[500px] overflow-y-auto pr-1"}>
            {pages.map((page, index) => (
              view === 'grid' ? (
                <div key={page.id} className="pdf-tools-grid-item group">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold border border-blue-200 shadow-sm z-10">{index + 1}</div>
                    <img src={page.preview} alt="" className="pdf-tools-grid-item-img shadow-sm border border-slate-200" />
                  </div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-700 truncate mr-2" title={page.name}>{page.name}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded whitespace-nowrap">Page {page.source === 'pdf' ? page.pageIndex + 1 : 1}</span>
                  </div>
                  <div className="pdf-tools-grid-item-actions bg-slate-50 -mx-2 -mb-2 px-2 py-1.5 rounded-b-lg">
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab hidden sm:block" />
                    <div className="flex gap-1">
                      <button disabled={index === 0} onClick={() => move(index, index - 1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30"><ArrowLeft className="w-3 h-3" /></button>
                      <button disabled={index === pages.length - 1} onClick={() => move(index, index + 1)} className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30"><ArrowRight className="w-3 h-3" /></button>
                      <button onClick={() => removePage(page.id)} className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 ml-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={page.id} className="pdf-tools-file-row">
                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab hidden sm:block" />
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">{index + 1}</div>
                  <img src={page.preview} className="w-10 h-10 object-cover rounded border border-slate-200 bg-slate-50" alt="" />
                  <div className="pdf-tools-file-name ml-2">
                    <span className="font-bold text-[13px]">{page.name}</span>
                    <span className="text-[10px] text-slate-500 ml-2 bg-slate-100 px-1.5 py-0.5 rounded">Page {page.source === 'pdf' ? page.pageIndex + 1 : 1}</span>
                  </div>
                  <div className="flex-1"></div>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button disabled={index === 0} onClick={() => move(index, index - 1)} className="w-8 h-8 rounded flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                    <button disabled={index === pages.length - 1} onClick={() => move(index, index + 1)} className="w-8 h-8 rounded flex items-center justify-center text-blue-600 hover:bg-white hover:shadow-sm disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removePage(page.id)} className="w-8 h-8 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              )
            ))}
          </div>

          <div className="border-t border-slate-100 pt-8 mt-8">
            <StepBadge num={<Settings className="w-3.5 h-3.5" />} title="PDF Settings (Optional)" desc="Customize your merged PDF as per your need." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-2">Page Size</label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <select className="flex-1 text-[13px] bg-transparent outline-none font-medium">
                    <option>Preserve source page sizes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-2">Page Orientation</label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                  <File className="w-4 h-4 text-slate-400" />
                  <select className="flex-1 text-[13px] bg-transparent outline-none font-medium">
                    <option>Preserve source orientation</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-2">Image Fit</label>
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                  <LayoutGrid className="w-4 h-4 text-slate-400" />
                  <select className="flex-1 text-[13px] bg-transparent outline-none font-medium">
                    <option>Preserve original ratio</option>
                  </select>
                </div>
              </div>
            </div>

            <button disabled={working} onClick={createPdf} className="pdf-tools-btn-gold w-full justify-center py-4 text-[15px] rounded-xl shadow-lg">
              {working ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
              {working ? c.creating : c.createMerged} <Download className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
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

  return (
    <div className="pdf-tools-card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="pdf-tools-section-title"><FileText className="w-5 h-5" /> {c.pdfTitle}</h2>
          <p className="pdf-tools-section-subtitle">{c.pdfDetail}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 shrink-0">
          <Settings2 className="w-3.5 h-3.5" /> Max file size: 50 MB each <Info className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <DropZone accept=".pdf,application/pdf" multiple onFiles={add} label={c.dropPdfs} hint={c.pdfHint} buttonText={c.browse} />

      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 ml-2 text-sm">
              <FileText className="w-4 h-4 text-blue-500" /> Selected Files ({files.length})
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setFiles([]); onDirty(false); }} className="text-slate-500 hover:text-red-600 h-8 text-xs font-semibold">
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {c.clear}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 text-xs font-semibold border border-blue-100 bg-blue-50/50">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add More Files
              </Button>
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden" onChange={(e) => { if(e.target.files) add(Array.from(e.target.files)); e.target.value = ""; }} />
            </div>
          </div>

          <div className="space-y-2 mb-8 max-h-[300px] overflow-y-auto pr-1">
            {files.map(file => (
              <div key={idFor(file)} className="pdf-tools-file-row">
                <div className="pdf-tools-file-icon pdf">
                  <FileText className="w-5 h-5" />
                  <span className="text-[9px] font-bold absolute mt-3">PDF</span>
                </div>
                <div className="pdf-tools-file-name">{file.name}</div>
                <div className="pdf-tools-file-size w-24 text-right">{bytesLabel(file.size)}</div>
                <div className="w-24 flex justify-center">
                  <span className="pdf-tools-file-status"><Check className="w-3.5 h-3.5" /> Ready</span>
                </div>
                <div className="pdf-tools-file-actions">
                  <button onClick={() => { setFiles(current => current.filter(e => e !== file)); onDirty(files.length > 1); }} className="pdf-tools-action-btn danger">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pdf-tools-settings-panel">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><Settings className="w-4 h-4 text-blue-500" /> Compression Settings</h4>
                <p className="text-xs text-slate-500 mt-1">Adjust the compression level using the slider or enter a specific target size.</p>
              </div>
              <div className="bg-blue-50 text-blue-700 text-[11px] px-3 py-2 rounded-lg flex items-center gap-2 max-w-xs leading-tight">
                <Info className="w-4 h-4 shrink-0" />
                {c.targetHint}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-center bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700">Compression Level <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] ml-1">Recommended</span></span>
                  <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">~ {targetKb >= 1024 ? `${(targetKb / 1024).toFixed(1)} MB` : `${targetKb} KB`}</span>
                </div>
                <input type="range" min="10" max="10240" step="10" value={targetKb} onChange={(e) => setTargetKb(Number(e.target.value))} className="pdf-tools-slider-track" />
                <div className="pdf-tools-slider-labels">
                  <span className="text-left font-semibold">Low<br/><span className="text-[9px] opacity-70 font-normal">(Larger Size)</span></span>
                  <span className="text-center font-semibold">Balanced<br/><span className="text-[9px] opacity-70 font-normal">(Recommended)</span></span>
                  <span className="text-center font-semibold">High<br/><span className="text-[9px] opacity-70 font-normal">(Smaller Size)</span></span>
                  <span className="text-right font-semibold">Maximum<br/><span className="text-[9px] opacity-70 font-normal">(Smallest Size)</span></span>
                </div>
              </div>

              <div className="text-[10px] font-extrabold text-slate-400 bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 shadow-sm shrink-0">OR</div>

              <div className="w-full lg:w-64">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2"><Target className="w-3.5 h-3.5 text-slate-400" /> {c.target} (Optional)</span>
                <div className="flex gap-2">
                  <input type="number" min="10" max="10240" step="1" value={targetKb} onChange={(e) => setTargetKb(Math.min(10240, Math.max(10, Number(e.target.value) || 10)))} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" />
                  <select className="border border-slate-300 rounded-lg px-2 py-2 text-sm bg-slate-50 focus:outline-none font-medium">
                    <option value="KB">KB</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-tight">Enter your desired file size. The tool will try to compress as close to this size as possible.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-[13px] text-slate-600 font-medium">
              <div className="flex items-center gap-1.5 font-bold"><Settings2 className="w-4 h-4 text-slate-400" /> Output Settings</div>
              <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" /> Keep original PDF quality (recommended)</label>
              <label className="flex items-center gap-1.5 cursor-pointer opacity-60"><input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" /> Remove metadata (smaller size)</label>
            </div>
            <button disabled={working} onClick={process} className="pdf-tools-btn-gold py-3 px-6 text-sm">
              {working ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {working ? c.compressing : c.pdfCompress + " →"}
            </button>
          </div>
        </div>
      )}
      {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
    </div>
  );
}

export default function DocumentTools() {
  const { lang } = useT();
  const c = COPY[lang];
  const [tab, setTab] = useState<ToolTab>("pdf-compress");
  const [dirtyTools, setDirtyTools] = useState<Record<ToolTab, boolean>>({ "pdf-compress": false, "image-compress": false, "images-pdf": false, "pdf-edit": false });

  const switchTool = (next: ToolTab) => {
    if (next === tab) return;
    if (dirtyTools[tab] && !window.confirm(c.switchWarning)) return;
    setTab(next);
  };

  const tabs: { id: ToolTab; label: string; icon: any }[] = [
    { id: "pdf-compress", label: c.pdfCompress, icon: FileText },
    { id: "image-compress", label: c.imageCompress, icon: FileImage },
    { id: "images-pdf", label: c.imagesPdf, icon: ImagePlus },
    { id: "pdf-edit", label: c.pdfEdit, icon: Layers3 },
  ];

  // Dynamic Hero Content
  const heroContent = {
    "pdf-compress": {
      eyebrow: "PDF COMPRESSOR",
      title: "Reduce <span>PDF Size</span> Easily",
      desc: "Upload your PDF files, set your desired size or compression level, and download high-quality compressed files.",
      image: "/assets/pdf-tools/hero-pdf-compress.png",
      badges: [
        { icon: ShieldCheck, title: "100% Private", desc: "Files never leave your browser" },
        { icon: Zap, title: "Super Fast", desc: "Compress in seconds" },
        { icon: Check, title: "High Quality", desc: "Best size vs quality balance" },
        { icon: InfinityIcon, title: "Free to Use", desc: "Free for everyone" }
      ]
    },
    "image-compress": {
      eyebrow: "IMAGE COMPRESSOR",
      title: "Compress <span>Images</span> Easily",
      desc: "Reduce image file size while maintaining the best possible quality.",
      image: "/assets/pdf-tools/hero-image-compress.png",
      badges: [
        { icon: FilePlus2, title: "Supports", desc: "JPG, PNG, WebP, GIF", isGold: true },
        { icon: ShieldCheck, title: "100% Private", desc: "Files never leave your browser" },
        { icon: Zap, title: "Super Fast", desc: "Compress in seconds" },
        { icon: Check, title: "High Quality", desc: "Best size vs quality balance" }
      ]
    },
    "images-pdf": {
      eyebrow: "IMAGES TO PDF",
      title: "Convert <span>Images</span> to PDF",
      desc: "Upload images, arrange them in the correct order, and create a single PDF file.",
      image: "/assets/pdf-tools/hero-images-to-pdf.png",
      badges: [
        { icon: FilePlus2, title: "Supports", desc: "JPG, PNG, WebP, GIF", isGold: true },
        { icon: ShieldCheck, title: "100% Private", desc: "Files never leave your browser" },
        { icon: Zap, title: "Fast Processing", desc: "Create PDF in seconds" },
        { icon: Check, title: "High Quality", desc: "Maintains original quality" }
      ]
    },
    "pdf-edit": {
      eyebrow: "MERGE & EDIT PDF",
      title: "Combine, Edit & <span>Organize PDFs</span>",
      desc: "Merge PDFs, add images, delete pages and rearrange them easily.",
      image: "/assets/pdf-tools/hero-merge-edit.png",
      badges: [
        { icon: FilePlus2, title: "Add PDF Files", desc: "Multiple PDFs at once", isGold: true },
        { icon: ImagePlus, title: "Add Image Pages", desc: "JPG, PNG, WebP, GIF", isGold: true },
        { icon: GripVertical, title: "Reorder Pages", desc: "Drag & drop easily", isGold: true },
        { icon: Trash2, title: "Delete Pages", desc: "Remove unwanted pages", isGold: true },
        { icon: ShieldCheck, title: "100% Private", desc: "Files never leave your browser", isGold: true }
      ]
    }
  };

  const currentHero = heroContent[tab];

  // Dynamic Trust Cards (Bottom)
  const trustCards = {
    "pdf-compress": [
      { icon: LockKeyhole, title: "Private & Secure", desc: "No upload or sign-in required", color: "blue" },
      { icon: Zap, title: "Fast Processing", desc: "Get compressed files in seconds", color: "red" },
      { icon: Settings, title: "Flexible Control", desc: "Use slider or set exact size", color: "blue" },
      { icon: Check, title: "Easy to Use", desc: "Download when ready", color: "yellow" }
    ],
    "image-compress": [
      { icon: LockKeyhole, title: "Private & Secure", desc: "No upload or sign-in required", color: "blue" },
      { icon: Zap, title: "Fast Processing", desc: "Get compressed images in seconds", color: "red" },
      { icon: ShieldCheck, title: "High Quality Output", desc: "Maintains the best possible quality", color: "green" },
      { icon: InfinityIcon, title: "Free to Use", desc: "No registration required", color: "blue" }
    ],
    "images-pdf": [
      { icon: LockKeyhole, title: "Private & Secure", desc: "No upload or sign-in required", color: "blue" },
      { icon: Zap, title: "Fast Processing", desc: "Convert images to PDF in seconds", color: "red" },
      { icon: ShieldCheck, title: "High Quality Output", desc: "Maintains original image quality", color: "green" },
      { icon: InfinityIcon, title: "Free to Use", desc: "No registration required", color: "blue" }
    ],
    "pdf-edit": [
      { icon: LockKeyhole, title: "Private & Secure", desc: "No upload or sign-in required", color: "blue" },
      { icon: Zap, title: "Flexible", desc: "Add PDFs or images anytime", color: "yellow" },
      { icon: Check, title: "Easy to Use", desc: "Drag, arrange and merge", color: "green" },
      { icon: Check, title: "High Quality Output", desc: "Maintains original quality", color: "blue" }
    ]
  };

  return (
    <div className="pdf-tools-page min-h-screen">
      <Seo title={`${c.hero} — Apna Enterprise`} description={c.heroDesc} path="/pdf-compressor" />

      {/* Hero Section */}
      <section className="pdf-tools-hero">
        <img
          src={currentHero.image}
          alt=""
          aria-hidden="true"
          className="pdf-tools-hero-background"
        />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="pdf-tools-hero-content">
            <div className="pdf-tools-hero-copy">
              <div className="pdf-tools-hero-eyebrow">{currentHero.eyebrow}</div>
              <h1 className="pdf-tools-hero-title" dangerouslySetInnerHTML={{ __html: currentHero.title }} />
              <p className="pdf-tools-hero-desc">{currentHero.desc}</p>
              <div className="pdf-tools-hero-badges">
                {currentHero.badges.map((b, i) => (
                  <div key={i} className="pdf-tools-hero-badge">
                    <div className={`pdf-tools-hero-badge-icon ${b.isGold ? 'gold-bg' : ''}`}>
                      <b.icon className="w-4 h-4" />
                    </div>
                    <div className="pdf-tools-hero-badge-text">
                      <span className="pdf-tools-hero-badge-title">{b.title}</span>
                      <span className="pdf-tools-hero-badge-desc">{b.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="pdf-tools-tabs">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="pdf-tools-tabs-inner">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => switchTool(id)} className={`pdf-tools-tab ${tab === id ? 'active' : ''}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pdf-tools-content">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          {tab === "pdf-compress" && <PdfCompression onDirty={(dirty) => setDirtyTools((current) => ({ ...current, "pdf-compress": dirty }))} />}
          {tab === "image-compress" && <ImageCompressor onDirty={(dirty) => setDirtyTools((current) => ({ ...current, "image-compress": dirty }))} />}
          {tab === "images-pdf" && <ImagesToPdf onDirty={(dirty) => setDirtyTools((current) => ({ ...current, "images-pdf": dirty }))} />}
          {tab === "pdf-edit" && <PdfEditor onDirty={(dirty) => setDirtyTools((current) => ({ ...current, "pdf-edit": dirty }))} />}

          {/* Bottom Trust Cards */}
          <div className="pdf-tools-trust-cards">
            {trustCards[tab].map((card, i) => (
              <div key={i} className="pdf-tools-trust-card">
                <div className={`pdf-tools-trust-icon ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="pdf-tools-trust-title">{card.title}</h4>
                  <p className="pdf-tools-trust-desc">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}