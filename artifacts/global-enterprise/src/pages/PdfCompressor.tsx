import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import JSZip from "jszip";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileArchive,
  FileCheck2,
  FileText,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const GOLD = "#D4A017";
const GOLD_LIGHT = "#F2C14E";
const NAVY = "#071B4A";
const SOFT_BG = "#f8fafd";
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MIN_TARGET_MB = 0.5;
const MAX_TARGET_MB = 10;
const DEFAULT_TARGET_MB = 1.9;

type ItemStatus = "queued" | "processing" | "ready" | "warning" | "error";

type PdfItem = {
  id: string;
  name: string;
  sourceFile: File | null;
  originalSize: number;
  pageCount: number | null;
  status: ItemStatus;
  progress: number;
  outputBlob: Blob | null;
  outputSize: number | null;
  warning: string | null;
  error: string | null;
  downloaded: boolean;
};

type ProcessResult = {
  blob: Blob;
  warning: string | null;
};

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function createId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function percentageSaved(original: number, output: number | null) {
  if (!output || !original) return null;
  return Math.max(0, Math.round((1 - output / original) * 100));
}

function stripPdfMetadata(pdf: PDFDocument) {
  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setCreator("");
  pdf.setProducer("");
}

function pdfBytesToBlob(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: "application/pdf" });
}

async function makeLosslessPdf(file: File) {
  const bytes = await file.arrayBuffer();
  const input = await PDFDocument.load(bytes, { updateMetadata: false });
  const pageCount = input.getPageCount();
  stripPdfMetadata(input);
  const output = await input.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
  return { pageCount, bytes: output };
}

async function renderCompressedPdf(
  file: File,
  scale: number,
  quality: number,
  onProgress: (progress: number) => void,
) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await getDocument({ data: bytes }).promise;
  const output = await PDFDocument.create();

  try {
    for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
      const page = await source.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new Error("Your browser could not create a PDF rendering surface.");
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;

      const imageData = canvas.toDataURL("image/jpeg", quality);
      const image = await output.embedJpg(imageData);
      const outputPage = output.addPage([viewport.width, viewport.height]);
      outputPage.drawImage(image, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });

      canvas.width = 1;
      canvas.height = 1;
      page.cleanup();
      onProgress(Math.round((pageNumber / source.numPages) * 88) + 6);
    }

    stripPdfMetadata(output);
    return await output.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
  } finally {
    await source.destroy();
  }
}

async function compressPdf(
  file: File,
  targetBytes: number,
  onProgress: (progress: number) => void,
): Promise<{ result: ProcessResult; pageCount: number }> {
  const lossless = await makeLosslessPdf(file);
  onProgress(35);

  if (lossless.bytes.byteLength <= targetBytes || file.size <= targetBytes) {
    return {
      pageCount: lossless.pageCount,
      result: {
        blob: pdfBytesToBlob(lossless.bytes),
        warning: null,
      },
    };
  }

  const fallbackPasses = [
    { scale: 1.45, quality: 0.88 },
    { scale: 1.25, quality: 0.82 },
    { scale: 1.1, quality: 0.76 },
  ];
  for (const pass of fallbackPasses) {
    const bytes = await renderCompressedPdf(file, pass.scale, pass.quality, onProgress);
    if (bytes.byteLength <= targetBytes) {
      return {
        pageCount: lossless.pageCount,
        result: {
          blob: pdfBytesToBlob(bytes),
          warning:
            "A high-quality visual fallback was used to reach your target. Text selection and some interactive PDF features may not be preserved.",
        },
      };
    }
  }

  return {
    pageCount: lossless.pageCount,
    result: {
      blob: pdfBytesToBlob(lossless.bytes),
      warning:
        "The safest browser result could not reach the selected target without a stronger quality reduction, so it was kept instead.",
    },
  };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function PdfCompressor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PdfItem[]>([]);
  const [targetMb, setTargetMb] = useState(DEFAULT_TARGET_MB);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");

  const targetBytes = Math.round(targetMb * 1024 * 1024);
  const validItems = items.filter((item) => item.status !== "error" && item.sourceFile);
  const readyItems = items.filter((item) => item.outputBlob && !item.downloaded);
  const hasFiles = items.length > 0;
  const canProcess = validItems.length > 0 && !isProcessing;
  const allReady = hasFiles && items.every((item) => item.status === "ready" || item.status === "warning");

  const updateItem = useCallback((id: string, patch: Partial<PdfItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const nextFiles = Array.from(fileList);
    if (!nextFiles.length) return;

    const nextItems = nextFiles.map<PdfItem>((file) => {
      const valid = isPdf(file);
      const tooLarge = file.size > MAX_FILE_BYTES;
      return {
        id: createId(file),
        name: file.name,
        sourceFile: valid && !tooLarge ? file : null,
        originalSize: file.size,
        pageCount: null,
        status: valid && !tooLarge ? "queued" : "error",
        progress: 0,
        outputBlob: null,
        outputSize: null,
        warning: null,
        error: !valid
          ? "This file is not a PDF. Choose a document ending in .pdf."
          : tooLarge
            ? "This PDF is larger than the 50 MB browser limit."
            : null,
        downloaded: false,
      };
    });

    setItems((current) => [...current, ...nextItems]);
    setSessionMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setSessionMessage("");
  }, []);

  const clearSession = useCallback(() => {
    setItems([]);
    setSessionMessage("");
    setIsProcessing(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const processAll = useCallback(async () => {
    if (!canProcess) return;
    setIsProcessing(true);
    setSessionMessage("");

    const queue = items.filter((item) => item.sourceFile && item.status !== "processing");
    for (const item of queue) {
      if (!item.sourceFile) continue;
      updateItem(item.id, {
        status: "processing",
        progress: 4,
        error: null,
        warning: null,
        downloaded: false,
      });

      try {
        const { result, pageCount } = await compressPdf(item.sourceFile, targetBytes, (progress) => {
          updateItem(item.id, { progress });
        });
        updateItem(item.id, {
          status: result.warning ? "warning" : "ready",
          progress: 100,
          pageCount,
          outputBlob: result.blob,
          outputSize: result.blob.size,
          warning: result.warning,
          error: null,
        });
      } catch (error) {
        updateItem(item.id, {
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "This PDF could not be processed in the browser.",
          outputBlob: null,
          outputSize: null,
        });
      }
    }

    setIsProcessing(false);
  }, [canProcess, items, targetBytes, updateItem]);

  const handleDownload = useCallback((item: PdfItem) => {
    if (!item.outputBlob) return;
    downloadBlob(item.outputBlob, item.name);
    updateItem(item.id, {
      sourceFile: null,
      outputBlob: null,
      downloaded: true,
    });
    setSessionMessage(`${item.name} was downloaded. Temporary PDF data was cleared from this page.`);
  }, [updateItem]);

  const handleZipDownload = useCallback(async () => {
    if (!readyItems.length) return;
    const zip = new JSZip();
    readyItems.forEach((item) => {
      if (item.outputBlob) zip.file(item.name, item.outputBlob);
    });
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    downloadBlob(blob, "compressed-pdfs.zip");
    setItems((current) =>
      current.map((item) =>
        item.outputBlob
          ? { ...item, sourceFile: null, outputBlob: null, downloaded: true }
          : item,
      ),
    );
    setSessionMessage("compressed-pdfs.zip was downloaded. Temporary PDF data was cleared from this page.");
  }, [readyItems]);

  useEffect(() => {
    return () => {
      if (inputRef.current) inputRef.current.value = "";
    };
  }, []);

  const summary = useMemo(() => {
    if (!hasFiles) return "Add one or more PDFs to begin.";
    if (isProcessing) return "Processing your PDFs locally in this browser…";
    if (allReady) return "Your compressed files are ready to download.";
    return `${items.length} file${items.length === 1 ? "" : "s"} in this session`;
  }, [allReady, hasFiles, isProcessing, items.length]);

  return (
    <div className="flex min-h-full flex-col">
      <Seo
        title="PDF Compressor"
        description="Compress PDF files locally in your browser with Apna Enterprise. Your documents are never uploaded or stored."
        keywords="PDF compressor, compress PDF online, private PDF compressor, reduce PDF size"
        path="/pdf-compressor"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Apna Enterprise PDF Compressor",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          description: "A private browser-based PDF compressor.",
          url: "https://apnaenterprise.in/pdf-compressor",
        }}
      />

      <section className="hero-navy relative overflow-hidden py-14 text-white md:py-20">
        <div className="pointer-events-none absolute right-[-8rem] top-[-7rem] h-72 w-72 rounded-full border border-[#D4A017]/20" />
        <div className="pointer-events-none absolute right-[-3rem] top-[-2rem] h-52 w-52 rounded-full border border-[#F2C14E]/10" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD_LIGHT }}>
              <span className="h-px w-8" style={{ background: GOLD }} />
              Private document utility
            </div>
            <div className="grid items-end gap-9 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
                  Smaller PDFs.
                  <span className="block" style={{ color: GOLD_LIGHT }}>Nothing leaves your device.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                  Reduce PDF size in your browser before you send, store, or submit it. Your documents stay on your device.
                </p>
              </div>
              <div className="hidden justify-end lg:flex">
                <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Local by design</span>
                    <ShieldCheck className="h-5 w-5" style={{ color: GOLD_LIGHT }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(212,160,23,0.15)" }}>
                      <LockKeyhole className="h-5 w-5" style={{ color: GOLD_LIGHT }} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">On-device processing</p>
                      <p className="mt-0.5 text-xs text-slate-400">No upload. No account.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 py-10 md:py-16" style={{ background: SOFT_BG }}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <div className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #e5ebf4", boxShadow: "0 12px 44px rgba(7,27,74,0.09)" }}>
                <div className="flex items-center justify-between border-b px-5 py-4 md:px-7" style={{ borderColor: "#edf1f7" }}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: GOLD }}>PDF workspace</p>
                    <h2 className="mt-1 text-xl font-extrabold" style={{ color: NAVY }}>Choose your files</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="h-2 w-2 rounded-full" style={{ background: "#55a875" }} />
                    Runs locally
                  </div>
                </div>

                <div className="p-5 md:p-7">
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    multiple
                    onChange={(event) => event.target.files && addFiles(event.target.files)}
                    className="hidden"
                  />
                  <div
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDragging(false);
                      addFiles(event.dataTransfer.files);
                    }}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
                    }}
                    className={`group cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-colors md:p-10 ${isDragging ? "border-[#D4A017] bg-[#fffaf0]" : "hover:border-[#D4A017]"}`}
                    style={{ borderColor: isDragging ? GOLD : "#cdd8e8", background: isDragging ? "#fffaf0" : "linear-gradient(145deg, #fbfcfe 0%, #f6f8fc 100%)" }}
                    role="button"
                    tabIndex={0}
                    aria-label="Choose one or more PDF files"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:-translate-y-1" style={{ background: "rgba(212,160,23,0.12)" }}>
                      <UploadCloud className="h-8 w-8" style={{ color: GOLD }} />
                    </div>
                    <h3 className="mt-5 text-lg font-bold" style={{ color: NAVY }}>
                      {isDragging ? "Drop PDFs here" : "Drop one or more PDFs here"}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">or browse from this device</p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-xs font-semibold text-slate-600" style={{ borderColor: "#dbe3ef" }}>
                      <FileText className="h-4 w-4" style={{ color: GOLD }} />
                      PDF files up to 50 MB each
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border p-4 md:p-5" style={{ borderColor: "#e5ebf4", background: "#fbfcfe" }}>
                    <div className="flex items-center justify-between gap-4">
                      <label htmlFor="target-size" className="text-sm font-bold" style={{ color: NAVY }}>Target size</label>
                      <span className="rounded-lg px-3 py-1.5 text-sm font-extrabold" style={{ color: NAVY, background: "rgba(212,160,23,0.14)" }}>
                        {targetMb.toFixed(1)} MB
                      </span>
                    </div>
                    <input
                      id="target-size"
                      type="range"
                      min={MIN_TARGET_MB}
                      max={MAX_TARGET_MB}
                      step={0.1}
                      value={targetMb}
                      onChange={(event) => setTargetMb(Number(event.target.value))}
                      className="mt-4 w-full accent-[#D4A017]"
                      aria-describedby="target-size-help"
                    />
                    <div id="target-size-help" className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400">
                      <span>{MIN_TARGET_MB.toFixed(1)} MB</span>
                      <span>Smaller target may reduce visual quality</span>
                      <span>{MAX_TARGET_MB} MB</span>
                    </div>
                  </div>

                  <div className="mt-5" aria-live="polite">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold" style={{ color: NAVY }}>{summary}</p>
                      {hasFiles && (
                        <Button type="button" variant="ghost" onClick={clearSession} className="h-8 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:text-slate-800">
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear session
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <QueueItem key={item.id} item={item} onRemove={() => removeItem(item.id)} onDownload={() => handleDownload(item)} />
                      ))}
                    </div>
                  </div>

                  {sessionMessage && (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "#b7e4c7", background: "#effaf3" }} role="status">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                      <p className="text-xs leading-5 text-green-800">{sessionMessage}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7" style={{ borderColor: "#edf1f7", background: "#fbfcfe" }}>
                  <p className="flex items-center gap-2 text-xs leading-5 text-slate-500">
                    <LockKeyhole className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                    Your PDF files are processed locally in your browser and are never uploaded or stored.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {readyItems.length > 1 && (
                      <Button type="button" onClick={handleZipDownload} className="h-10 rounded-xl px-4 text-xs font-bold text-white" style={{ background: NAVY }}>
                        <FileArchive className="mr-2 h-3.5 w-3.5" /> Download ZIP
                      </Button>
                    )}
                    {canProcess && (
                      <Button type="button" onClick={processAll} className="btn-gold h-10 rounded-xl px-5 text-xs font-bold">
                        {isProcessing ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                        {isProcessing ? "Compressing locally" : allReady ? "Compress again" : "Compress PDFs"}
                        {!isProcessing && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <TrustPoint icon={<LockKeyhole />} title="Private" detail="No server upload" />
                <TrustPoint icon={<Zap />} title="Flexible" detail="0.5–10 MB target" />
                <TrustPoint icon={<FileCheck2 />} title="Original names" detail="Always preserved" />
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "#e5ebf4", boxShadow: "0 7px 24px rgba(7,27,74,0.05)" }}>
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" style={{ color: GOLD }} />
                  <h2 className="font-bold" style={{ color: NAVY }}>Your privacy matters</h2>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Original file names are preserved. Your PDF files are not renamed.
                </p>
                <div className="mt-5 space-y-3 border-t pt-4" style={{ borderColor: "#edf1f7" }}>
                  {["Files stay on your device", "No sign-in or account", "Clear the session at any time"].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "#328957" }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <details className="group rounded-2xl border bg-white" style={{ borderColor: "#e5ebf4" }}>
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold" style={{ color: NAVY }}>
                  How it works
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "#edf1f7" }}>
                  <ol className="space-y-4">
                    {["Choose one or more PDFs.", "Set the target size.", "Save the smaller files locally."].map((item, index) => (
                      <li key={item} className="flex gap-3 text-xs leading-5 text-slate-600">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "rgba(212,160,23,0.13)", color: GOLD }}>
                          {index + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              </details>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function QueueItem({ item, onRemove, onDownload }: { item: PdfItem; onRemove: () => void; onDownload: () => void }) {
  const isWorking = item.status === "processing";
  const isError = item.status === "error";
  const isWarning = item.status === "warning";
  const isReady = item.status === "ready" || isWarning;
  const saved = percentageSaved(item.originalSize, item.outputSize);
  const tone = isError
    ? { background: "#fff6f6", border: "#f1b6b6", icon: "#b42318" }
    : isWarning
      ? { background: "#fffaf0", border: "#f2cf78", icon: "#a16207" }
      : isReady
        ? { background: "#effaf3", border: "#b7e4c7", icon: "#15803d" }
        : { background: "#f6f8fc", border: "#d9e1ef", icon: NAVY };

  return (
    <div className="rounded-xl border p-4" style={{ background: tone.background, borderColor: tone.border }}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white" style={{ border: `1px solid ${tone.border}` }}>
          {isError ? <X className="h-5 w-5" style={{ color: tone.icon }} /> : isReady ? <CheckCircle2 className="h-5 w-5" style={{ color: tone.icon }} /> : <FileText className="h-5 w-5" style={{ color: tone.icon }} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold" style={{ color: NAVY }}>{item.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatBytes(item.originalSize)} · {item.pageCount ? `${item.pageCount} page${item.pageCount === 1 ? "" : "s"}` : "Pages will be read locally"}
          </p>
        </div>
        <button type="button" onClick={onRemove} aria-label={`Remove ${item.name}`} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-700">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {isError && (
        <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-red-800" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{item.error}</span>
        </div>
      )}

      {!isError && (
        <>
          <div className="mt-4 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>{isWorking ? "Processing locally" : isReady ? "Ready to save" : "Waiting to compress"}</span>
            <span>{isReady ? `${formatBytes(item.outputSize)}${saved !== null ? ` · ${saved}% smaller` : ""}` : `${item.progress}%`}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80" aria-hidden>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${isReady ? 100 : Math.max(4, item.progress)}%`, background: isReady ? "#3d9a5d" : GOLD }} />
          </div>
          {item.warning && (
            <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-900" role="status">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{item.warning}</span>
            </div>
          )}
          {isReady && item.outputBlob && (
            <Button type="button" onClick={onDownload} className="mt-4 h-9 rounded-lg px-3 text-xs font-bold text-white" style={{ background: "#176b3a" }}>
              <Download className="mr-2 h-3.5 w-3.5" /> Download {item.name}
            </Button>
          )}
          {item.downloaded && (
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-green-800" role="status">
              <Check className="h-3.5 w-3.5" /> Downloaded and cleared from this page
            </p>
          )}
        </>
      )}
    </div>
  );
}

function TrustPoint({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3" style={{ borderColor: "#e5ebf4" }}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(212,160,23,0.11)", color: GOLD }}>
        {icon}
      </span>
      <span>
        <span className="block text-xs font-bold" style={{ color: NAVY }}>{title}</span>
        <span className="mt-0.5 block text-[11px] text-slate-500">{detail}</span>
      </span>
    </div>
  );
}