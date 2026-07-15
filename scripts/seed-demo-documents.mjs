#!/usr/bin/env node
/**
 * Upload visible demo verification documents for test rows in document_uploads.
 *
 * Requires SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.
 *
 * Usage:
 *   node scripts/seed-demo-documents.mjs
 *   node scripts/seed-demo-documents.mjs --phone=972525555555
 *   node scripts/seed-demo-documents.mjs --phone=972525555555 --force
 */
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(root, "apps/mobile/.env"));
loadEnvFile(resolve(root, ".env"));

const url =
  process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const phoneArg = process.argv.find((a) => a.startsWith("--phone="));
const onlyPhone = phoneArg?.split("=")[1];
const force = process.argv.includes("--force");

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function normalizeStoragePath(storagePath) {
  return storagePath.replace(/^documents\//, "");
}

function demoPng(docType) {
  const result = spawnSync("python", [resolve(__dirname, "generate-demo-document.py"), docType], {
    encoding: "buffer",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw result.error ?? new Error(result.stderr?.toString() ?? "PNG generation failed");
  }
  return result.stdout;
}

async function main() {
  let query = supabase
    .from("document_uploads")
    .select("id, owner_id, doc_type, storage_path, file_name");

  if (onlyPhone) {
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", onlyPhone)
      .maybeSingle();
    if (userError) throw userError;
    if (!user?.id) {
      console.error(`No profile for phone ${onlyPhone}`);
      process.exit(1);
    }
    query = query.eq("owner_id", user.id);
  }

  const { data: rows, error } = await query;
  if (error) throw error;

  if (!rows?.length) {
    console.log("No document_uploads rows found.");
    return;
  }

  let fixed = 0;
  let uploaded = 0;
  let skipped = 0;

  for (const row of rows) {
    const normalized = normalizeStoragePath(row.storage_path);
    // Never overwrite real uploads (timestamp prefix from uploadDocumentFile).
    if (/\d{13}-/.test(normalized)) {
      console.warn(`Skip real upload: ${normalized}`);
      skipped += 1;
      continue;
    }

    const pngPath = `${row.owner_id}/${row.doc_type}.png`;
    const legacyPdf = normalized.endsWith(".pdf") ? normalized : null;

    if (normalized !== pngPath) {
      const { error: updateError } = await supabase
        .from("document_uploads")
        .update({
          storage_path: pngPath,
          file_name: `${row.doc_type}.png`,
        })
        .eq("id", row.id);
      if (updateError) throw updateError;
      fixed += 1;
    }

    if (!force) {
      const { data: existing } = await supabase.storage
        .from("documents")
        .list(row.owner_id, { search: `${row.doc_type}.png` });
      const alreadyThere = existing?.some((f) => f.name === `${row.doc_type}.png`);
      if (alreadyThere) {
        skipped += 1;
        continue;
      }
    }

    const pngBytes = demoPng(row.doc_type);
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(pngPath, pngBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.warn(`Upload failed for ${pngPath}:`, uploadError.message);
      continue;
    }

    if (legacyPdf && legacyPdf !== pngPath) {
      await supabase.storage.from("documents").remove([legacyPdf]);
    }

    uploaded += 1;
    console.log(`Uploaded demo PNG → ${pngPath}`);
  }

  console.log(
    `Done. paths_fixed=${fixed} uploaded=${uploaded} skipped=${skipped} total=${rows.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
