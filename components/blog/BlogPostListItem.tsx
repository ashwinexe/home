import { Badge } from "@/components/ui/Badge";
import { formatBlogDate, getPostSummary, getPostTopic } from "@/lib/blog-utils";
import { getReadingTime } from "@/lib/utils";
import type { BlogPost } from "@/types";
import Link from "next/link";

type BlogPostListItemProps = {
  post: BlogPost;
  showDraftBadge: boolean;
  showTopic?: boolean;
};

export function BlogPostListItem({
  post,
  showDraftBadge,
  showTopic = false,
}: BlogPostListItemProps) {
  return (
    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
      <article className="grid gap-2 py-4 transition-colors hover:bg-te-light-gray sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8 sm:px-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold leading-snug text-te-dark group-hover:text-te-orange">
              {post.title}
            </h3>
            {showDraftBadge && post.draft && (
              <Badge variant="orange">Draft</Badge>
            )}
            {showTopic && <Badge variant="outline">{getPostTopic(post)}</Badge>}
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="mt-1 line-clamp-1 font-sans text-sm leading-6 text-te-dark/80">
            {getPostSummary(post)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-te-dark/70 sm:justify-end">
          <time>{formatBlogDate(post.date)}</time>
          <span aria-hidden="true">/</span>
          <span>{getReadingTime(post.content)} min</span>
        </div>
      </article>
    </Link>
  );
}
