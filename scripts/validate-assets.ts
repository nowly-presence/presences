import { readFileSync, existsSync, readdirSync, writeFileSync } from "fs";
import { join, extname } from "path";
import sharp from "sharp";

const BASE_DIR = process.argv[2] || ".";
const OUTPUT_FILE = process.argv[3] || "";

const ASSET_RULES: Record<string, { w: number; h: number }> = {
  "logo.png": { w: 300, h: 300 },
  "icon.png": { w: 128, h: 128 },
};

const THUMBNAIL_NAMES = ["thumbnail.png", "thumbnail.jpg", "thumbnail.jpeg"];
const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

const slug = (name: string): string => name.toLowerCase().replace(/\s+/g, "-");

type AssetStatus = "valid" | "missing" | "wrong_size" | "unreadable";

type AssetEntry = {
  filename: string
  exists: boolean
  status: AssetStatus
  expected: string
  width?: number
  height?: number
  format?: string
};

type PresenceResult = {
  slug: string
  path: string
  name: string
  status: "success" | "failure"
  assets: Record<string, AssetEntry>
  extraFiles: string[]
  errors: string[]
  warnings: string[]
};

type Output = {
  results: PresenceResult[]
  summary: {
    total: number
    passed: number
    failed: number
    errors: string[]
    warnings: string[]
  }
  overall: "success" | "failure"
};

const getImageInfo = async (filepath: string): Promise<{ width: number; height: number; format: string } | null> => {
  try {
    const meta = await sharp(filepath).metadata();
    return { width: meta.width!, height: meta.height!, format: meta.format! };
  } catch {
    return null;
  }
};

const validatePresence = async (dir: string, slugName: string, presencePath: string): Promise<PresenceResult | null> => {
  const metaPath = join(dir, "metadata.json");
  if (!existsSync(metaPath)) return null;

  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
  const assetsDir = join(dir, "assets");

  const result: PresenceResult = {
    slug: slugName,
    path: presencePath,
    name: meta.name || slugName,
    status: "success",
    assets: {},
    extraFiles: [],
    errors: [],
    warnings: [],
  };

  // Check logo + icon
  for (const [filename, rules] of Object.entries(ASSET_RULES)) {
    const filepath = join(assetsDir, filename);
    const entry: AssetEntry = { filename, exists: existsSync(filepath), status: "missing", expected: `${rules.w}×${rules.h}` };

    if (!entry.exists) {
      result.errors.push(`${filename} is missing`);
      result.status = "failure";
    } else {
      const info = await getImageInfo(filepath);
      if (!info) {
        entry.status = "unreadable";
        result.errors.push(`${filename} could not be read`);
        result.status = "failure";
      } else {
        entry.width = info.width;
        entry.height = info.height;
        entry.format = info.format;
        if (info.width !== rules.w || info.height !== rules.h) {
          entry.status = "wrong_size";
          result.errors.push(`${filename} is ${info.width}×${info.height}, expected ${rules.w}×${rules.h}`);
          result.status = "failure";
        } else {
          entry.status = "valid";
        }
      }
    }

    result.assets[filename.replace(/\.\w+$/, "")] = entry;
  }

  // Check thumbnail
  const thumbMeta: string = "thumbnail.jpg";
  const thumbPath = join(assetsDir, thumbMeta);
  const thumbEntry: AssetEntry = { filename: thumbMeta, exists: existsSync(thumbPath), status: "missing", expected: "1920×1080" };

  if (!thumbEntry.exists) {
    const found = THUMBNAIL_NAMES.find((name) => existsSync(join(assetsDir, name)));
    if (found) {
      thumbEntry.filename = found;
      thumbEntry.exists = true;
    }
  }

  if (!thumbEntry.exists) {
    thumbEntry.status = "missing";
    result.errors.push(`thumbnail (${thumbMeta}) is missing`);
    result.status = "failure";
  } else {
    const thumbFilepath = join(assetsDir, thumbEntry.filename);
    const info = await getImageInfo(thumbFilepath);
    if (!info) {
      thumbEntry.status = "unreadable";
      result.errors.push(`${thumbEntry.filename} could not be read`);
      result.status = "failure";
    } else {
      thumbEntry.width = info.width;
      thumbEntry.height = info.height;
      thumbEntry.format = info.format;
      if (info.width !== 1920 || info.height !== 1080) {
        thumbEntry.status = "wrong_size";
        result.errors.push(`${thumbEntry.filename} is ${info.width}×${info.height}, expected 1920×1080`);
        result.status = "failure";
      } else {
        thumbEntry.status = "valid";
      }
    }
  }

  result.assets.thumbnail = thumbEntry;

  // Check for extra files in assets/
  if (existsSync(assetsDir)) {
    const allowed = new Set(["logo.png", "icon.png", "thumbnail.png", "thumbnail.jpg", "thumbnail.jpeg"]);

    for (const file of readdirSync(assetsDir, { withFileTypes: true })) {
      if (file.isDirectory()) continue;
      const ext = extname(file.name).toLowerCase();
      if (!IMAGE_EXTS.includes(ext)) continue;
      if (!allowed.has(file.name)) {
        result.extraFiles.push(file.name);
        result.warnings.push(`Unexpected file in assets/: ${file.name}`);
      }
    }
  }

  return result;
}

const main = async (): Promise<void> => {
  const srcDir = join(BASE_DIR, "src");
  type PresenceInfo = { dir: string; slug: string; dirName: string; path: string };

  const presences: PresenceInfo[] = [];

  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^[A-Z#]$/.test(entry.name)) continue;
    const letterDir = join(srcDir, entry.name);
    for (const sub of readdirSync(letterDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const metaPath = join(letterDir, sub.name, "metadata.json");
      if (!existsSync(metaPath)) continue;
      presences.push({ dir: join(letterDir, sub.name), slug: slug(sub.name), dirName: sub.name, path: `${entry.name}/${sub.name}` });
    }
  }

  const changedDirs: string[] = process.env.CHANGED_DIRS
    ? process.env.CHANGED_DIRS.split(",").map(s => s.trim()).filter(Boolean)
    : presences.map(p => p.dirName);

  const results: PresenceResult[] = [];
  for (const p of presences) {
    if (!changedDirs.includes(p.dirName)) continue;
    const r = await validatePresence(p.dir, p.slug, p.path);
    if (r) results.push(r);
  }

  const passed = results.filter(r => r.status === "success").length;
  const failed = results.filter(r => r.status === "failure").length;
  const allErrors = results.flatMap(r => r.errors);
  const allWarnings = results.flatMap(r => r.warnings);

  const output: Output = {
    results,
    summary: {
      total: results.length,
      passed,
      failed,
      errors: allErrors,
      warnings: allWarnings,
    },
    overall: failed > 0 ? "failure" : "success",
  };

  const json = JSON.stringify(output, null, 2);

  if (OUTPUT_FILE) {
    writeFileSync(OUTPUT_FILE, json, "utf-8");
  }

  console.log(json);
}

main().catch((err: Error): never => {
  console.error(JSON.stringify({ overall: "failure" as const, fatal: err.message }));
  process.exit(1);
});
