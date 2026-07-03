# ashwinexe.com

Source for my personal website: a home for writing, work, projects, talks,
photos, music, and the small experiments that usually turn into something else.

Live site: https://ashwinexe.com

## What Lives Here

- A Next.js App Router portfolio with a bento-style home page.
- Blog posts written in MD/MDX.
- Work history across Devfolio, GitHub Campus Experts, MLH, and CodeDay.
- Project, talks, photo, Spotify, and gaming-status surfaces.
- A private-vault flow for owner-only writing and selective sharing.
- Small scripts for importing posts, creating drafts, and managing vault tokens.

The visual language is intentionally tactile: compact controls, quiet grids,
visible structure, and a little Teenage Engineering influence.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Build the production version:

```bash
npm run build
```

## Content Map

```text
app/                  Next.js routes and API endpoints
components/           UI components for the home, blog, work, talks, and live cards
content/blog/         Blog source files
content/layout/       Home bento layout JSON
content/projects/     Featured project data
content/talks/        Talk data and sample MDX
content/vault/        Private-vault templates and posts
content/work/         Work timeline data
lib/                  MDX, Spotify, vault, and utility helpers
public/               Images and static assets
scripts/              Import, token, and blog-authoring helpers
```

## Writing

Create a new blog draft with a URL-safe filename:

```bash
npm run blog:new -- "Going beyond Hackathons: The next chapter in my career"
```

Preview drafts and future-dated posts locally:

```bash
SHOW_DRAFTS=true
```

Drafts are excluded from production unless draft previews are explicitly
enabled.

## Obsidian Workflow

Use `content/blog` as an Obsidian vault:

```text
content/blog
```

In Obsidian, choose **Open folder as vault** and select that folder. The
`.obsidian/` folder is ignored by git, so local workspace settings, plugins, and
sync state stay out of commits.

Writing flow:

1. Create the post from the terminal with `npm run blog:new -- "Post Title"`.
2. Open the generated file in Obsidian under `content/blog/YYYY/`.
3. Keep the filename slug-safe; use the frontmatter `title` and first `#`
   heading for the human-readable title.
4. Keep `draft: true` while writing.
5. Add images under `content/blog/images` for source images or `public/blog/images`
   for files that should be served directly.
6. Preview locally with `SHOW_DRAFTS=true npm run dev`.
7. Publish by setting `draft: false` or removing the draft field.
8. Commit and push the markdown, images, and any content data changes.

Obsidian Sync is useful for writing across devices, but deployment still follows
git. Let Obsidian sync notes between machines; use git commits as the release
boundary for the website.

## Owner Tools

Enable local bento layout edit writes with a server-only key:

```bash
LAYOUT_EDIT_KEY=your_secret_key_here
```

Then open:

```text
http://localhost:3000/?edit=1&key=your_secret_key_here
```

The layout write endpoint uses only `LAYOUT_EDIT_KEY`. Public `NEXT_PUBLIC_*`
values must never authorize writes.

Spotify, Hashnode import, and vault features are configured through server-side
environment variables in local or hosting environments. Do not commit real
tokens, refresh tokens, vault secrets, or raw share links.
