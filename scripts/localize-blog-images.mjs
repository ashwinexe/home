#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content/blog");
const IMAGE_DIR = path.join(ROOT, "public/blog/images/hashnode");
const IMAGE_PREFIX = "/blog/images/hashnode";

const warnings = [];
let localizedCount = 0;
let cleanedCount = 0;

for (const filePath of walk(BLOG_DIR)) {
  if (!filePath.endsWith(".md") && !filePath.endsWith(".mdx")) continue;

  const original = fs.readFileSync(filePath, "utf8");
  const slug = path.basename(filePath, path.extname(filePath));
  const rewritten = await localizeMarkdownImages(original, slug);

  if (rewritten !== original) {
    fs.writeFileSync(filePath, rewritten, "utf8");
    console.log(`updated ${path.relative(ROOT, filePath)}`);
  }
}

console.log(`\nLocalized ${localizedCount} images; cleaned ${cleanedCount} remote image references.`);

if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

async function localizeMarkdownImages(markdown, slug) {
  const imagePattern = /!\[([^\]]*)]\((https?:\/\/[^\s)]+)(?:\s+align="[^"]+")?\)/g;
  const replacements = [];

  for (const match of markdown.matchAll(imagePattern)) {
    const [raw, alt, remoteUrl] = match;
    const cleanUrl = remoteUrl.replace(/[),]+$/, "");
    const localPath = await downloadImage(cleanUrl, slug);
    const destination = localPath || cleanUrl;
    const replacement = `![${alt}](${destination})`;

    replacements.push({ raw, replacement });

    if (!localPath && raw !== replacement) {
      cleanedCount += 1;
    }
  }

  let rewritten = markdown;
  for (const { raw, replacement } of replacements) {
    rewritten = rewritten.split(raw).join(replacement);
  }

  return rewritten;
}

async function downloadImage(url, baseName) {
  if (!url.startsWith("http")) return "";

  let response;
  try {
    response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 image migration",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
  } catch (error) {
    warnings.push(`Could not fetch ${url}: ${error.message}`);
    return "";
  }

  if (!response.ok) {
    warnings.push(`Could not fetch ${url}: HTTP ${response.status}`);
    return "";
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    warnings.push(`Skipped non-image ${url}: ${contentType || "unknown content type"}`);
    return "";
  }

  let bytes;
  try {
    bytes = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    warnings.push(`Could not read ${url}: ${error.message}`);
    return "";
  }
  const ext = extensionFor(url, contentType);
  const filename = filenameFor(url, baseName, ext);
  const targetPath = path.join(IMAGE_DIR, filename);

  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  if (!fs.existsSync(targetPath)) {
    fs.writeFileSync(targetPath, bytes);
    localizedCount += 1;
  }

  return `${IMAGE_PREFIX}/${filename}`;
}

function filenameFor(url, baseName, ext) {
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  const safeBase = slugify(baseName).slice(0, 80) || "hashnode-image";
  return `${safeBase}-${hash}${ext}`;
}

function extensionFor(url, contentType) {
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("avif")) return ".avif";
  if (contentType.includes("svg")) return ".svg";

  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"].includes(ext)) {
      return ext === ".jpeg" ? ".jpg" : ext;
    }
  } catch {
    // Fall through.
  }

  return ".jpg";
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
