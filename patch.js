const fs = require('fs');

let original = fs.readFileSync('original.tsx', 'utf-8');

// Replace imports
const importSearch = `  Zap,\n} from "lucide-react";`;
const importReplace = `  Zap,
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
} from "lucide-react";`;
original = original.replace(importSearch, importReplace);

// Let's add the components.tsx file
let components = fs.readFileSync('components.tsx', 'utf-8');

// Extract my new DropZone
const dropZoneMatch = components.match(/function DropZone\(\{[\s\S]*?^}\n/m);
// Extract StepBadge
const stepBadgeMatch = components.match(/const StepBadge = [\s\S]*?\);\n/m);
// Extract PdfCompression
const pdfCompressionMatch = components.match(/\/\/ --- 1\. PDF Compressor ---\nfunction PdfCompression\(\{[\s\S]*?^}\n/m);
// Extract ImageCompressor
const imageCompressorMatch = components.match(/\/\/ --- 2\. Image Compressor ---\nfunction ImageCompressor\(\{[\s\S]*?^}\n/m);
// Extract ImagesToPdf
const imagesToPdfMatch = components.match(/\/\/ --- 3\. Images to PDF ---\nfunction ImagesToPdf\(\{[\s\S]*?^}\n/m);
// Extract PdfEditor
const pdfEditorMatch = components.match(/\/\/ --- 4\. Merge \/ Edit PDF ---\nfunction PdfEditor\(\{[\s\S]*?^}\n/m);
// Extract DocumentTools
const documentToolsMatch = components.match(/\/\/ --- Main Page Component ---\nexport default function DocumentTools\(\) \{[\s\S]*?^}\n/m);

function replaceComponent(orig, startPhrase, endPhrase, newContent) {
  const startIndex = orig.indexOf(startPhrase);
  if (startIndex === -1) throw new Error("Could not find start: " + startPhrase);
  let endIndex = orig.indexOf(endPhrase, startIndex);
  if (endIndex === -1) throw new Error("Could not find end: " + endPhrase);
  endIndex += endPhrase.length;
  return orig.substring(0, startIndex) + newContent + orig.substring(endIndex);
}

// Replace DropZone
const dropZoneStart = "function DropZone({";
const dropZoneEnd = "  );\n}";
original = replaceComponent(original, dropZoneStart, dropZoneEnd, dropZoneMatch[0]);

// Delete SectionTitle and ImageQueue by replacing them with StepBadge (which we need)
const sectionTitleStart = "function SectionTitle({";
const imageQueueEnd = "  })}</div>;\n}";
// Actually, wait, there are helpers between SectionTitle and ImageQueue!!
// 196:async function canvasBlob
// 210:async function imageBytesForPdf
// 216:async function compressToTarget
// 231:function ImageQueue
// So we cannot just delete from SectionTitle to ImageQueue!

// Let's replace SectionTitle with StepBadge.
const sectionTitleEnd = "    </div>\n  );\n}";
original = replaceComponent(original, sectionTitleStart, sectionTitleEnd, stepBadgeMatch[0]);

// Let's just empty ImageQueue
const imageQueueStart = "function ImageQueue({";
original = replaceComponent(original, imageQueueStart, imageQueueEnd, "");

// Replace ImageCompressor
const imageCompressorStart = "function ImageCompressor({";
const imageCompressorEnd = "  </ToolCard>;\n}";
original = replaceComponent(original, imageCompressorStart, imageCompressorEnd, imageCompressorMatch[0]);

// Replace ImagesToPdf
const imagesToPdfStart = "function ImagesToPdf({";
const imagesToPdfEnd = "  </ToolCard>;\n}";
// wait, ImagesToPdf ends differently in original?
// Let's find exactly the end of ImagesToPdf
