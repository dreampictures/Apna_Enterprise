const fs = require('fs');

const original = fs.readFileSync('original.tsx', 'utf-8');

// Find the end of compressPdfToTarget
const marker = "return output;\n}\n";
const markerIndex = original.indexOf(marker);

if (markerIndex === -1) {
  console.error("Could not find marker");
  process.exit(1);
}

const originalHelpers = original.substring(0, markerIndex + marker.length);

// Check if there are any trailing spaces in the original helpers
const cleanedHelpers = originalHelpers.split('\n').map(line => line.trimEnd()).join('\n');

fs.writeFileSync('helpers.tsx', cleanedHelpers);
