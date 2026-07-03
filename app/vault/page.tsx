import { Badge } from "@/components/ui/Badge";
import { formatBlogDate } from "@/lib/blog-utils";
import { getReadingTime } from "@/lib/utils";
import { getVaultPosts } from "@/lib/vault";
import { requireVaultOwner } from "@/lib/vault-session";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vault",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function VaultPage() {
  requireVaultOwner("/vault");

  const posts = await getVaultPosts();

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-te-dark/70">
            Vault
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-te-dark md:text-5xl">
            Private notes
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-te-dark/80 md:text-base">
            Owner-only writing lives here. Individual posts can also be opened
            by shared links when a post has a matching share token hash.
          </p>
        </div>
        <Link
          href="/vault/logout"
          className="inline-flex items-center gap-2 text-sm font-semibold text-te-orange underline decoration-te-orange/35 underline-offset-4 hover:decoration-te-orange"
        >
          Lock vault
        </Link>
      </header>

      <section className="divide-y divide-te-gray border-y border-te-gray">
        {posts.map((post) => (
          <Link key={post.slug} href={`/vault/${post.slug}`} className="group block">
            <article className="grid gap-2 py-4 transition-colors hover:bg-te-light-gray sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8 sm:px-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold leading-snug text-te-dark group-hover:text-te-orange">
                    {post.title}
                  </h2>
                  <Badge variant="outline">{post.category}</Badge>
                  {post.shareTokenHash && <Badge variant="orange">Shared</Badge>}
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {post.description && (
                  <p className="mt-1 line-clamp-1 text-sm leading-6 text-te-dark/75">
                    {post.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-te-dark/70 sm:justify-end">
                <time>{formatBlogDate(post.date)}</time>
                <span aria-hidden="true">/</span>
                <span>{getReadingTime(post.content)} min</span>
              </div>
            </article>
          </Link>
        ))}

        {posts.length === 0 && (
          <div className="py-10 text-center">
            <h2 className="text-lg font-semibold text-te-dark">
              No vault posts yet.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-te-dark/75">
              Add private MD or MDX files under content/vault/YYYY. Template
              files under content/vault/_templates are ignored by the loader.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
