import { getBlogPosts } from "@/lib/mdx";
import { getReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BlogPostListItem } from "@/components/blog/BlogPostListItem";
import {
  formatBlogDate,
  getPostSummary,
  getPostYear,
  shouldShowDraftBadge,
  sortBlogPostsByDate,
  splitLatestAndArchive,
} from "@/lib/blog-utils";
import type { BlogPost } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts, learnings, and stories from my journey.",
};

function PostMark({ post, index }: { post: BlogPost; index: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full flex-col justify-between bg-te-light-gray p-4 text-te-dark/45 md:p-5"
    >
      <div className="flex items-start justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.2em]">
        <span>Post {String(index + 1).padStart(2, "0")}</span>
        <span>{post.category || "note"}</span>
      </div>
      <div className="space-y-3">
        <span className="block h-2 w-12 rounded-full bg-te-orange/70" />
        <span className="block h-px w-3/4 bg-te-dark/25" />
        <span className="block h-px w-1/2 bg-te-dark/20" />
        <span className="block h-px w-2/3 bg-te-dark/15" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold leading-none text-te-dark/10 md:text-4xl">
          {getPostYear(post.date)}
        </span>
        <span className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`h-1.5 w-1.5 rounded-full ${
                dotIndex === index ? "bg-te-orange" : "bg-te-dark/20"
              }`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

function PostVisual({ post, index }: { post: BlogPost; index: number }) {
  return (
    <div className="relative aspect-[5/3] overflow-hidden rounded-te border border-te-gray bg-te-light-gray">
      {post.image ? (
        <Image src={post.image} alt="" fill className="object-cover" />
      ) : (
        <PostMark post={post} index={index} />
      )}
    </div>
  );
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const postsByDate = sortBlogPostsByDate(posts);
  const { latestPosts, archivePosts } = splitLatestAndArchive(posts);
  const showDraftBadge = shouldShowDraftBadge();
  const pinnedPosts = posts.filter((post) => post.pinned);
  const featuredPosts =
    pinnedPosts.length > 0 ? pinnedPosts.slice(0, 3) : postsByDate.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-12 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-te-dark/70">
          Writing
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-te-dark md:text-5xl">
          Notes from the community floor.
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-te-dark/80 md:text-base">
          Essays, field notes, and small internet artifacts on community,
          hackathons, developer tools, and the systems around builders.
        </p>
      </header>

      {featuredPosts.length > 0 && (
        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-te-dark/75">
              {pinnedPosts.length > 0 ? "Pinned" : "Featured"}
            </h2>
            <span className="text-xs font-medium text-te-dark/65">
              {posts.length} posts
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {featuredPosts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article>
                  <PostVisual post={post} index={index} />
                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {showDraftBadge && post.draft && (
                        <Badge variant="orange">Draft</Badge>
                      )}
                      <Badge variant="outline">
                        {post.category || "uncategorized"}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-te-dark group-hover:text-te-orange md:text-xl">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 font-sans text-sm leading-6 text-te-dark/80">
                      {getPostSummary(post)}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-te-dark/65">
                      <time>{formatBlogDate(post.date)}</time>
                      <span>/</span>
                      <span>{getReadingTime(post.content)} min</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-te-dark/75">
              Latest
            </h2>
            <p className="mt-2 font-sans text-sm leading-6 text-te-dark/80">
              The newest five posts, sorted by publish date.
            </p>
          </div>
          {archivePosts.length > 0 && (
            <Link
              href="/blog/archive"
              className="inline-flex items-center gap-2 text-sm font-semibold text-te-orange underline decoration-te-orange/35 underline-offset-4 hover:decoration-te-orange"
            >
              View archive ({archivePosts.length})
            </Link>
          )}
        </div>
        <div className="divide-y divide-te-gray border-y border-te-gray">
          {latestPosts.map((post) => (
            <BlogPostListItem
              key={post.slug}
              post={post}
              showDraftBadge={showDraftBadge}
              showTopic
            />
          ))}

          {posts.length === 0 && (
            <p className="py-8 text-center text-te-dark/75">
              No posts yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
