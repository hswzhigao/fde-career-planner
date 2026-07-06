// Patch @archships/dim-agent-sdk observability.js to fix webpack build error.
// The SDK's readSdkPackageMeta() uses `new URL("../../package.json", import.meta.url)`
// which webpack cannot statically resolve. Replace the entire function with a
// hardcoded return so no dynamic URL resolution is needed at build time.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "@archships",
  "dim-agent-sdk",
  "dist",
  "observability.js"
);

try {
  const src = readFileSync(target, "utf8");

  // If already patched (no import.meta.url), skip
  if (!src.includes("import.meta.url")) {
    console.log("[patch-sdk] no patch needed (already patched)");
    process.exit(0);
  }

  // Find the readSdkPackageMeta function and replace it entirely
  const start = src.indexOf("async function readSdkPackageMeta()");
  if (start === -1) {
    console.log("[patch-sdk] readSdkPackageMeta not found, skipping");
    process.exit(0);
  }

  // Find matching closing brace
  let depth = 0;
  let braceStart = src.indexOf("{", start);
  let end = braceStart;
  for (let i = braceStart; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }

  const newFunc = `async function readSdkPackageMeta() {\n\treturn { packageName: "@archships/dim-agent-sdk" };\n}`;
  const patched = src.slice(0, start) + newFunc + src.slice(end);

  writeFileSync(target, patched, "utf8");
  console.log(`[patch-sdk] patched ${target}`);
} catch (e) {
  console.log(`[patch-sdk] skipped: ${e.message}`);
}
