#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content/blog");

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help || !options.title) {
    printHelp();
    process.exit(options.help ? 0 : 1);
  }

  const date = options.date || new Date().toISOString().slice(0, 10);
  const year = options.year || date.slice(0, 4);
  const slug = options.slug || slugify(options.title);
  const targetDir = path.join(BLOG_DIR, year);
  const targetPath = path.join(targetDir, `${slug}.md`);

  if (fs.existsSync(targetPath) && !options.force) {
    throw new Error(`Post already exists: ${path.relative(ROOT, targetPath)}`);
  }

  const frontmatter = {
    title: options.title,
    date,
    description: "",
    tags: [],
    pinned: false,
    category: options.category,
    draft: true,
  };
  const body = `# ${options.title}\n\nWrite your post here.\n`;

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetPath, matter.stringify(body, frontmatter), "utf8");

  console.log(`Created ${path.relative(ROOT, targetPath)}`);
}

function parseArgs(args) {
  const options = {
    title: "",
    date: "",
    year: "",
    slug: "",
    category: "tech",
    force: false,
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

    if (arg === "--date") options.date = next();
    else if (arg === "--year") options.year = next();
    else if (arg === "--slug") options.slug = next();
    else if (arg === "--category") options.category = next();
    else if (arg === "--force") options.force = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (!options.title) options.title = arg;
    else options.title += ` ${arg}`;
  }

  return options;
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "untitled";
}

function printHelp() {
  console.log(`
Create a draft blog post with a slug-safe filename and exact display title.

Usage:
  npm run blog:new -- "Going beyond Hackathons: The next chapter in my career"

Options:
  --date YYYY-MM-DD     Publish date. Default: today.
  --year YYYY           Folder under content/blog. Default: date year.
  --slug slug-value     Override generated filename slug.
  --category name       Frontmatter category. Default: tech.
  --force               Overwrite an existing generated file.
`);
}

main();
