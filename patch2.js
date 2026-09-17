const fs = require('fs');

const origLines = fs.readFileSync('original.tsx', 'utf-8').split('\n');
const compLines = fs.readFileSync('components.tsx', 'utf-8').split('\n');

// Get all the helper lines exactly from original
const part1 = origLines.slice(0, 143).join('\n'); // 1-143 (before DropZone)
// 144-186 is DropZone.
const part2 = origLines.slice(186, 230).join('\n'); // 187 is SectionTitle, down to 230 (before ImageQueue)
// 231-244 is ImageQueue.
// 245-324 is ImageCompressor.
const part3 = origLines.slice(364, 407).join('\n'); // 365 is pagePreview, down to 407 (before PdfEditor)
// 408-476 is PdfEditor.
// 477-520 is PdfCompression.
// 521 is ToolCard, Note, Trust. DocumentTools is 524-546.

// Now extract the components from `components.tsx`
function extract(startRegex, endRegex) {
  const start = compLines.findIndex(l => startRegex.test(l));
  const end = compLines.findIndex((l, i) => i > start && endRegex.test(l));
  return compLines.slice(start, end + 1).join('\n');
}

const newDropZone = extract(/^function DropZone/, /^}$/);
const newStepBadge = extract(/^const StepBadge/, /^\);$/);
const newPdfCompression = extract(/^function PdfCompression/, /^}$/);
const newImageCompressor = extract(/^function ImageCompressor/, /^}$/);
const newImagesToPdf = extract(/^function ImagesToPdf/, /^}$/);
const newPdfEditor = extract(/^function PdfEditor/, /^}$/);
const newDocumentTools = extract(/^export default function DocumentTools/, /^}$/);

// Combine
let finalContent = [
  part1,
  newDropZone,
  newStepBadge,
  part2.replace(/function SectionTitle.*?\n  \);\n}/s, ""), // Removing SectionTitle completely as it's unneeded
  newImageCompressor,
  newImagesToPdf,
  part3,
  newPdfEditor,
  newPdfCompression,
  newDocumentTools
].join('\n\n');

// Fix imports in the final string
const importSearch = `  Zap,
} from "lucide-react";`;
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
finalContent = finalContent.replace(importSearch, importReplace);

// Remove trailing whitespace
finalContent = finalContent.split('\n').map(l => l.trimEnd()).join('\n');

fs.writeFileSync('artifacts/global-enterprise/src/pages/DocumentTools.tsx', finalContent);
