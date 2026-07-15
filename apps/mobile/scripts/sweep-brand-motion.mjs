import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipFiles = new Set(["components/ui/Form.tsx"]);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== "node_modules") walk(p, files);
    else if (/\.(tsx|ts)$/.test(ent.name)) files.push(p);
  }
  return files;
}

function cleanReactNativeImport(src) {
  src = src.replace(/\bActivityIndicator,?\s*/g, "");
  src = src.replace(/,\s*,/g, ",");
  src = src.replace(/\{\s*,/g, "{");
  src = src.replace(/,\s*\}/g, " }");
  src = src.replace(/import\s*\{\s*\}\s*from\s*["']react-native["'];?\n?/g, "");
  return src;
}

function insertAfterLastImport(src, line) {
  const matches = [...src.matchAll(/^import .+;$/gm)];
  const lastImport = matches.pop();
  if (!lastImport) return line + src;
  const idx = lastImport.index + lastImport[0].length + 1;
  return src.slice(0, idx) + line + src.slice(idx);
}

const files = walk(root).filter((f) => !f.includes("BrandSpinner.tsx"));

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (skipFiles.has(rel)) continue;

  let src = fs.readFileSync(file, "utf8");
  const orig = src;

  src = src.replace(/<ActivityIndicator\s+size="large"[^/]*\/>/g, '<BrandSpinner size="large" />');

  const usesBrand = src.includes("BrandSpinner");
  const hadBrand = orig.includes("BrandSpinner");

  if (usesBrand && !hadBrand) {
    src = cleanReactNativeImport(src);
    src = insertAfterLastImport(
      src,
      'import { BrandSpinner } from "@/components/motion/BrandSpinner";\n',
    );
  }

  if (!src.includes("ActivityIndicator") && orig.includes("ActivityIndicator")) {
    src = cleanReactNativeImport(src);
  }

  if (src.includes("RefreshControl") && !src.includes("tintColor={colors.purple}")) {
    src = src.replace(/<RefreshControl(\s[\s\S]*?)\/>/g, (match, attrs) => {
      if (attrs.includes("tintColor")) return match;
      const trimmed = attrs.trimEnd();
      if (trimmed.endsWith("/")) return match;
      return `<RefreshControl${trimmed}\n          tintColor={colors.purple}\n          colors={[colors.purple]}\n        />`;
    });

    if (!src.includes('@/lib/theme')) {
      src = insertAfterLastImport(src, 'import { colors } from "@/lib/theme";\n');
    }
  }

  if (src !== orig) {
    fs.writeFileSync(file, src);
    console.log("updated:", rel);
  }
}
