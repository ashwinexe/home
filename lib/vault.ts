import type { VaultPost } from "@/types";
import fs from "fs";
import matter from "gray-matter";
import path from "path";

const VAULT_DIR = path.join(process.cwd(), "content/vault");

function getAllMdxFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.name.startsWith(".") || item.name.startsWith("_")) {
      continue;
    }

    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath));
    } else if (item.name.endsWith(".mdx") || item.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function getLeadingH1(content: string): string | null {
  const match = content.match(/^\s*#\s+(.+?)\s*#*\s*(?:\r?\n|$)/);
  return match?.[1]?.trim() || null;
}

function normalizeHeading(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function stripMatchingLeadingH1(content: string, title: string): string {
  const match = content.match(/^\s*#\s+(.+?)\s*#*\s*(?:\r?\n|$)/);

  if (!match || normalizeHeading(match[1]) !== normalizeHeading(title)) {
    return content;
  }

  return content.slice(match[0].length).replace(/^\s*\r?\n/, "");
}

function getDateTime(dateString: string): number {
  const time = new Date(dateString).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export async function getVaultPosts(): Promise<VaultPost[]> {
  const files = getAllMdxFiles(VAULT_DIR);

  const posts = files.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const fileSlug = path.basename(filePath, path.extname(filePath));
    const leadingTitle = getLeadingH1(content);
    const title = leadingTitle || data.title || "Untitled";

    return {
      slug: data.slug || fileSlug,
      title,
      date: data.date || new Date().toISOString(),
      description: data.description || "",
      tags: data.tags || [],
      category: data.category || "private",
      shareTokenHash: data.shareTokenHash || undefined,
      content: stripMatchingLeadingH1(content, title),
    };
  });

  return posts.sort((a, b) => {
    const dateDelta = getDateTime(b.date) - getDateTime(a.date);

    if (dateDelta !== 0) {
      return dateDelta;
    }

    return a.title.localeCompare(b.title);
  });
}

export async function getVaultPost(slug: string): Promise<VaultPost | null> {
  const posts = await getVaultPosts();
  return posts.find((post) => post.slug === slug) || null;
}
