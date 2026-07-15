import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== "node_modules") walk(p, files);
    else if (/\.tsx?$/.test(ent.name)) files.push(p);
  }
  return files;
}

for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  const orig = src;

  // Split imports accidentally merged on one line (CRLF artifact)
  src = src.replace(/;\r\nimport /g, ";\nimport ");
  src = src.replace(/;\rimport /g, ";\nimport ");
  src = src.replace(/;import /g, ";\nimport ");

  // Fix react-native import closing after removing ActivityIndicator
  src = src.replace(/(\n\s+\w+,?\s*\n\s+)View \} from "react-native";/g, "$1View,\n} from \"react-native\";");

  // Remove unused ActivityIndicator import
  if (src.includes("ActivityIndicator") && !src.match(/<ActivityIndicator/)) {
    src = src.replace(/\bActivityIndicator,?\s*/g, "");
    src = src.replace(/,\s*,/g, ",");
    src = src.replace(/\{\s*,/g, "{");
    src = src.replace(/,\s*\}/g, " }");
    src = src.replace(/import\s*\{\s*\}\s*from\s*["']react-native["'];?\n?/g, "");
  }

  if (src !== orig) {
    fs.writeFileSync(file, src);
    console.log("fixed:", path.relative(root, file));
  }
}
