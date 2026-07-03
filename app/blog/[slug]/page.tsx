import { getBlogPosts, getBlogPost } from "@/lib/mdx";
import { formatDate, getReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { blogMdxComponents } from "@/components/blog/BlogMdxComponents";
import { ReadingLayoutShell } from "@/components/blog/ReadingLayoutShell";
import { shouldShowDraftBadge } from "@/lib/blog-utils";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: ["Ashwin Kumar Uppala"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const showDraftBadge = shouldShowDraftBadge();

  return (
    <ReadingLayoutShell>
      <article>
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-te-dark/75 hover:text-te-orange"
        >
          ← Back to writing
        </Link>

        <header className="mb-10 border-b border-te-gray pb-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{post.category}</Badge>
            {showDraftBadge && post.draft && (
              <Badge variant="orange">Draft</Badge>
            )}
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
          <p className="mt-5 max-w-2xl font-sans text-base leading-7 text-te-dark/80">
            {post.description}
          </p>
        )}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-te-dark/70">
            <time>{formatDate(post.date)}</time>
            <span>/</span>
            <span>{getReadingTime(post.content)} min read</span>
          </div>
          {post.image && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-te border border-te-gray">
              <Image src={post.image} alt="" fill className="object-cover" />
            </div>
          )}
        </header>

        <div className="max-w-none text-[15px] md:text-base">
          <MDXRemote source={post.content} components={blogMdxComponents} />
        </div>

        <footer className="mt-16 border-t border-te-gray pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-te-orange underline decoration-te-orange/30 underline-offset-4 hover:decoration-te-orange"
          >
            ← Back to all writing
          </Link>
        </footer>
      </article>
    </ReadingLayoutShell>
  );
}
