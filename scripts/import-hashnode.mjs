#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const HASHNODE_ENDPOINT = "https://gql.hashnode.com";
const DEFAULT_HOST = "ashwinexe.hashnode.dev";
const DEFAULT_BLOG_DIR = path.join(ROOT, "content/blog");
const DEFAULT_IMAGE_DIR = path.join(ROOT, "public/blog/images/hashnode");
const DEFAULT_IMAGE_PUBLIC_PREFIX = "/blog/images/hashnode";

const POSTS_QUERY = `
  query HashnodePublicationPosts($host: String!, $first: Int!, $after: String) {
    publication(host: $host) {
      id
      title
      url
      posts(first: $first, after: $after) {
        totalDocuments
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            slug
            title
            subtitle
            brief
            url
            canonicalUrl
            publishedAt
            updatedAt
            coverImage {
              url
              attribution
              photographer
              isAttributionHidden
            }
            tags {
              name
              slug
            }
            content {
              markdown
            }
            preferences {
              pinnedToBlog
              isDelisted
            }
            seo {
              title
              description
            }
            ogMetaData {
              image
            }
          }
        }
      }
    }
  }
`;

function main() {
  loadEnvFile(path.join(ROOT, ".env"));
  loadEnvFile(path.join(ROOT, ".env.local"));

  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  importPosts(options).catch((error) => {
    console.error(`\nHashnode import failed: ${error.message}`);
    if (options.verbose && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}

function parseArgs(args) {
  const options = {
    host: process.env.HASHNODE_HOST || DEFAULT_HOST,
    token: process.env.HASHNODE_TOKEN || process.env.HASHNODE_API_KEY || "",
    blogDir: DEFAULT_BLOG_DIR,
    imageDir: DEFAULT_IMAGE_DIR,
    imagePublicPrefix: DEFAULT_IMAGE_PUBLIC_PREFIX,
    pageSize: 20,
    limit: Number.POSITIVE_INFINITY,
    category: "tech",
    overwrite: false,
    dryRun: false,
    downloadImages: true,
    includeDelisted: false,
    verbose: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = () => {
      index += 1;
      if (index >= args.length) {
        throw new Error(`Missing value for ${arg}`);
      }
      return args[index];
    };

    if (arg === "--host") options.host = next();
    else if (arg === "--token") options.token = next();
    else if (arg === "--out") options.blogDir = path.resolve(ROOT, next());
    else if (arg === "--image-dir") options.imageDir = path.resolve(ROOT, next());
    else if (arg === "--image-public-prefix") options.imagePublicPrefix = next().replace(/\/$/, "");
    else if (arg === "--page-size") options.pageSize = parseInteger(next(), "--page-size");
    else if (arg === "--limit") options.limit = parseInteger(next(), "--limit");
    else if (arg === "--category") options.category = next();
    else if (arg === "--overwrite") options.overwrite = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--no-images") options.downloadImages = false;
    else if (arg === "--include-delisted") options.includeDelisted = true;
    else if (arg === "--verbose") options.verbose = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  options.host = normalizeHost(options.host);
  options.pageSize = Math.min(Math.max(options.pageSize, 1), 50);

  return options;
}

async function importPosts(options) {
  const existingSlugs = getExistingSlugs(options.blogDir);
  const posts = await fetchAllPosts(options);
  const selectedPosts = posts.slice(0, options.limit);

  let created = 0;
  let overwritten = 0;
  let skipped = 0;
  const warnings = [];

  for (const post of selectedPosts) {
    if (!options.includeDelisted && post.preferences?.isDelisted) {
      skipped += 1;
      console.log(`skip delisted: ${post.slug}`);
      continue;
    }

    const slug = sanitizeSlug(post.slug || slugify(post.title));
    const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
    const year = Number.isNaN(publishedDate.getTime())
      ? String(new Date().getFullYear())
      : String(publishedDate.getUTCFullYear());
    const targetDir = path.join(options.blogDir, year);
    const targetPath = path.join(targetDir, `${slug}.md`);
    const existingPath = existingSlugs.get(slug);

    if (existingPath && path.resolve(existingPath) !== path.resolve(targetPath)) {
      skipped += 1;
      console.log(`skip duplicate slug: ${slug} already exists at ${path.relative(ROOT, existingPath)}`);
      continue;
    }

    if (existingPath && !options.overwrite) {
      skipped += 1;
      console.log(`skip existing: ${path.relative(ROOT, existingPath)}`);
      continue;
    }

    let markdown = post.content?.markdown?.trim() || "";
    if (options.downloadImages) {
      const localized = await localizeMarkdownImages(markdown, slug, options, warnings);
      markdown = localized.markdown;
    }

    const coverUrl = post.coverImage?.url || post.ogMetaData?.image || "";
    const image = options.downloadImages && coverUrl
      ? await downloadImage(coverUrl, `${slug}-cover`, options, warnings)
      : "";

    const frontmatter = {
      title: post.title || "Untitled",
      date: formatDate(post.publishedAt),
      description: normalizeDescription(post.seo?.description || post.subtitle || post.brief || ""),
      tags: normalizeTags(post.tags),
      pinned: Boolean(post.preferences?.pinnedToBlog),
      category: options.category,
      draft: false,
      ...(image ? { image } : {}),
      source: "hashnode",
      hashnodeId: post.id,
      hashnodeUrl: post.url,
      canonicalUrl: post.canonicalUrl || post.url,
      updatedAt: post.updatedAt || null,
      ...(coverUrl ? { coverImageUrl: coverUrl } : {}),
    };

    const fileContent = matter.stringify(`${markdown}\n`, frontmatter);

    if (options.dryRun) {
      console.log(`${existingPath ? "would overwrite" : "would create"}: ${path.relative(ROOT, targetPath)}`);
    } else {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(targetPath, fileContent, "utf8");
      existingSlugs.set(slug, targetPath);
      console.log(`${existingPath ? "overwrote" : "created"}: ${path.relative(ROOT, targetPath)}`);
    }

    if (existingPath) overwritten += 1;
    else created += 1;
  }

  const action = options.dryRun ? "planned" : "finished";
  console.log(`\nImport ${action}: ${created} created, ${overwritten} overwritten, ${skipped} skipped.`);
  if (warnings.length > 0) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
}

async function fetchAllPosts(options) {
  const posts = [];
  let after = null;
  let totalDocuments = null;

  do {
    const response = await graphqlRequest(POSTS_QUERY, {
      host: options.host,
      first: options.pageSize,
      after,
    }, options.token);

    const publication = response.data?.publication;
    if (!publication) {
      throw new Error(`No Hashnode publication found for host "${options.host}"`);
    }

    const connection = publication.posts;
    totalDocuments = connection.totalDocuments;

    for (const edge of connection.edges || []) {
      posts.push(edge.node);
      if (posts.length >= options.limit) break;
    }

    after = connection.pageInfo?.hasNextPage && posts.length < options.limit
      ? connection.pageInfo.endCursor
      : null;
  } while (after);

  const totalText = Number.isFinite(totalDocuments) ? ` of ${totalDocuments}` : "";
  console.log(`Fetched ${posts.length}${totalText} posts from ${options.host}.`);
  return posts;
}

async function graphqlRequest(query, variables, token) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = token;
  }

  const response = await fetch(HASHNODE_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(`Hashnode API returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  if (!contentType.includes("json")) {
    const looksLikeHtml = text.trimStart().startsWith("<");
    const hint = looksLikeHtml
      ? " Hashnode may be serving the API access/upgrade page; set HASHNODE_TOKEN from a Pro-enabled publication."
      : "";
    throw new Error(`Hashnode API did not return JSON.${hint}`);
  }

  const payload = JSON.parse(text);
  if (payload.errors?.length) {
    const messages = payload.errors.map((error) => error.message).join("; ");
    throw new Error(`Hashnode GraphQL error: ${messages}`);
  }
  return payload;
}

async function localizeMarkdownImages(markdown, slug, options, warnings) {
  const urls = new Set();
  const markdownImagePattern = /!\[[^\]]*]\((https?:\/\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const htmlImagePattern = /<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["'][^>]*>/gi;

  for (const match of markdown.matchAll(markdownImagePattern)) {
    urls.add(match[1]);
  }
  for (const match of markdown.matchAll(htmlImagePattern)) {
    urls.add(match[1]);
  }

  const replacements = new Map();
  for (const url of urls) {
    const localPath = await downloadImage(url, slug, options, warnings);
    if (localPath) {
      replacements.set(url, localPath);
    }
  }

  let localizedMarkdown = markdown;
  for (const [remoteUrl, localPath] of replacements) {
    localizedMarkdown = localizedMarkdown.split(remoteUrl).join(localPath);
  }

  return { markdown: localizedMarkdown, replacements };
}

async function downloadImage(url, baseName, options, warnings) {
  if (!url || !url.startsWith("http")) return "";
  if (options.dryRun) {
    const filename = imageFilename(url, baseName, ".img");
    return `${options.imagePublicPrefix}/${filename}`;
  }

  fs.mkdirSync(options.imageDir, { recursive: true });

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    warnings.push(`Could not fetch image ${url}: ${error.message}`);
    return "";
  }

  if (!response.ok) {
    warnings.push(`Could not fetch image ${url}: HTTP ${response.status}`);
    return "";
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    warnings.push(`Skipped non-image URL ${url}: ${contentType || "unknown content type"}`);
    return "";
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const ext = imageExtension(url, contentType);
  const filename = imageFilename(url, baseName, ext);
  const targetPath = path.join(options.imageDir, filename);

  if (!fs.existsSync(targetPath) || options.overwrite) {
    fs.writeFileSync(targetPath, bytes);
  }

  return `${options.imagePublicPrefix}/${filename}`;
}

function imageFilename(url, baseName, ext) {
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  const safeBase = sanitizeSlug(baseName).slice(0, 80) || "hashnode-image";
  return `${safeBase}-${hash}${ext}`;
}

function imageExtension(url, contentType) {
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("avif")) return ".avif";

  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)) {
      return ext === ".jpeg" ? ".jpg" : ext;
    }
  } catch {
    // Fall through to the default extension.
  }

  return ".jpg";
}

function getExistingSlugs(blogDir) {
  const slugs = new Map();
  for (const filePath of walk(blogDir)) {
    if (!filePath.endsWith(".md") && !filePath.endsWith(".mdx")) continue;
    const basename = path.basename(filePath, path.extname(filePath));
    slugs.set(basename, filePath);
  }
  return slugs;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name.startsWith(".") || item.name.startsWith("_")) continue;
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) results.push(...walk(fullPath));
    else results.push(fullPath);
  }
  return results;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = unquoteEnvValue(rawValue.trim());
  }
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function normalizeHost(host) {
  const value = String(host || "").trim();
  if (!value) return DEFAULT_HOST;
  try {
    return new URL(value).host;
  } catch {
    return value.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

function normalizeDescription(description) {
  return String(description || "").replace(/\s+/g, " ").trim();
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => tag?.name || tag?.slug)
    .filter(Boolean)
    .map((tag) => String(tag).trim())
    .filter(Boolean);
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugify(value) {
  return String(value || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";
}

function parseInteger(value, flag) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number) || number < 1) {
    throw new Error(`${flag} must be a positive integer`);
  }
  return number;
}

function printHelp() {
  console.log(`
Import published Hashnode posts into this site's content/blog folder.

Usage:
  HASHNODE_TOKEN=... npm run import:hashnode -- --host ashwinexe.hashnode.dev

Options:
  --host <host>                 Hashnode publication host. Default: ${DEFAULT_HOST}
  --token <token>               Hashnode PAT. Prefer HASHNODE_TOKEN in .env.local or shell.
  --out <dir>                   Blog content directory. Default: content/blog
  --image-dir <dir>             Downloaded image directory. Default: public/blog/images/hashnode
  --page-size <n>               Posts per API request, max 50. Default: 20
  --limit <n>                   Import at most n posts.
  --category <name>             Frontmatter category. Default: tech
  --overwrite                   Overwrite existing files with the same slug and year.
  --dry-run                     Fetch and print intended writes without changing files.
  --no-images                   Do not download cover or inline images.
  --include-delisted            Import delisted posts too.
  --verbose                     Print stack traces on failure.
`);
}

main();
