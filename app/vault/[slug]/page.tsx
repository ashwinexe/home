import { blogMdxComponents } from "@/components/blog/BlogMdxComponents";
import { ReadingLayoutShell } from "@/components/blog/ReadingLayoutShell";
import { Badge } from "@/components/ui/Badge";
import { formatDate, getReadingTime } from "@/lib/utils";
import {
  getVaultLoginHref,
  verifyVaultShareToken,
} from "@/lib/vault-auth";
import { getVaultPost } from "@/lib/vault";
import { hasVaultOwnerSession } from "@/lib/vault-session";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vault Note",
  robots: {
    follow: false,
    index: false,
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams>;
}

function getSearchParamValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function VaultPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const post = await getVaultPost(slug);

  if (!post) {
    notFound();
  }

  const isOwner = hasVaultOwnerSession();
  const shareKey = getSearchParamValue(query.key);
  const hasSharedAccess = verifyVaultShareToken(shareKey, post.shareTokenHash);

  if (!isOwner && !hasSharedAccess) {
    if (!shareKey) {
      redirect(getVaultLoginHref(`/vault/${post.slug}`));
    }

    notFound();
  }

  return (
    <ReadingLayoutShell>
      <article>
        <Link
          href={isOwner ? "/vault" : "/"}
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-te-dark/75 hover:text-te-orange"
        >
          {isOwner ? "← Back to vault" : "← Back home"}
        </Link>

        <header className="mb-10 border-b border-te-gray pb-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{post.category}</Badge>
            {post.shareTokenHash && <Badge variant="orange">Shared</Badge>}
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-te-dark md:text-5xl">
            {post.title}
          </h1>
          {post.description && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-te-dark/80">
              {post.description}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-te-dark/70">
            <time>{formatDate(post.date)}</time>
            <span>/</span>
            <span>{getReadingTime(post.content)} min read</span>
          </div>
        </header>

        <div className="max-w-none text-[15px] md:text-base">
          <MDXRemote source={post.content} components={blogMdxComponents} />
        </div>

        <footer className="mt-16 border-t border-te-gray pt-8">
          {isOwner ? (
            <Link
              href="/vault"
              className="inline-flex items-center gap-2 text-sm text-te-orange underline decoration-te-orange/30 underline-offset-4 hover:decoration-te-orange"
            >
              ← Back to private notes
            </Link>
          ) : (
            <p className="text-sm leading-6 text-te-dark/75">
              This shared link opens only this private note.
            </p>
          )}
        </footer>
      </article>
    </ReadingLayoutShell>
  );
}
