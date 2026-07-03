import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPost, Talk } from "@/types";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const TALKS_DIR = path.join(process.cwd(), "content/talks");

type BlogPostOptions = {
  includeDrafts?: boolean;
  includeFuture?: boolean;
};

function getAllMdxFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    // Skip Obsidian config and templates folders
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

function shouldIncludeDrafts(options: BlogPostOptions): boolean {
  return options.includeDrafts ?? process.env.SHOW_DRAFTS === "true";
}

function isFuturePost(dateString: string): boolean {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() > Date.now();
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

export async function getBlogPosts(
  options: BlogPostOptions = {},
): Promise<BlogPost[]> {
  const files = getAllMdxFiles(BLOG_DIR);
  const includeDrafts = shouldIncludeDrafts(options);
  const includeFuture = options.includeFuture ?? includeDrafts;

  const posts = files.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    // Extract slug from file path (e.g., content/blog/2025/hello-world.mdx -> hello-world)
    const fileSlug = path.basename(filePath, path.extname(filePath));
    const leadingTitle = getLeadingH1(content);
    const title = leadingTitle || data.title || "Untitled";

    return {
      slug: data.slug || fileSlug,
      title,
      date: data.date || new Date().toISOString(),
      description: data.description || "",
      tags: data.tags || [],
      pinned: data.pinned || false,
      category: data.category || "uncategorized",
      draft: data.draft === true,
      image: data.image,
      content: stripMatchingLeadingH1(content, title),
    };
  }).filter((post) => {
    if (post.draft && !includeDrafts) {
      return false;
    }

    if (isFuturePost(post.date) && !includeFuture) {
      return false;
    }

    return true;
  });

  // Sort by date (newest first), with pinned posts at the top
  return posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getBlogPost(
  slug: string,
  options: BlogPostOptions = {},
): Promise<BlogPost | null> {
  const posts = await getBlogPosts(options);
  return posts.find((post) => post.slug === slug) || null;
}

export async function getTalks(): Promise<Talk[]> {
  const files = getAllMdxFiles(TALKS_DIR);

  const talks = files.map((filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const slug = path.basename(filePath, path.extname(filePath));

    return {
      slug,
      title: data.title || "Untitled",
      event: data.event || "",
      date: data.date || new Date().toISOString(),
      location: data.location || "",
      type: data.type || "past",
      video: data.video,
      slides: data.slides,
      image: data.image,
      content,
    };
  });

  // Sort by date (newest first), upcoming talks first
  return talks.sort((a, b) => {
    if (a.type === "upcoming" && b.type !== "upcoming") return -1;
    if (a.type !== "upcoming" && b.type === "upcoming") return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getTalk(slug: string): Promise<Talk | null> {
  const talks = await getTalks();
  return talks.find((talk) => talk.slug === slug) || null;
}
