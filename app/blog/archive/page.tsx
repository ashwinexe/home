import { BlogPostListItem } from "@/components/blog/BlogPostListItem";
import {
  filterBlogPosts,
  getBlogArchiveFacets,
  shouldShowDraftBadge,
  splitLatestAndArchive,
  type BlogArchiveFilters,
} from "@/lib/blog-utils";
import { cn } from "@/lib/utils";
import { getBlogPosts } from "@/lib/mdx";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Blog Archive",
  description: "Browse older posts by year, topic, and tag.",
};

type SearchParams = Record<string, string | string[] | undefined>;

interface Props {
  searchParams?: Promise<SearchParams>;
}

function getSearchParamValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getArchiveHref(filters: BlogArchiveFilters): string {
  const params = new URLSearchParams();

  if (filters.year) {
    params.set("year", filters.year);
  }

  if (filters.topic) {
    params.set("topic", filters.topic);
  }

  if (filters.tag) {
    params.set("tag", filters.tag);
  }

  const query = params.toString();
  return query ? `/blog/archive?${query}` : "/blog/archive";
}

function FilterLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-te-dark bg-te-dark text-te-beige"
          : "border-te-dark text-te-dark hover:bg-te-gray",
      )}
    >
      {children}
    </Link>
  );
}

function FilterGroup({
  allHref,
  activeValue,
  filterKey,
  filters,
  label,
  values,
}: {
  allHref: string;
  activeValue?: string;
  filterKey: keyof BlogArchiveFilters;
  filters: BlogArchiveFilters;
  label: string;
  values: string[];
}) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-te-dark/70">
        {label}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <FilterLink active={!activeValue} href={allHref}>
          All
        </FilterLink>
        {values.map((value) => (
          <FilterLink
            key={value}
            active={activeValue === value}
            href={getArchiveHref({ ...filters, [filterKey]: value })}
          >
            {value}
          </FilterLink>
        ))}
      </div>
    </div>
  );
}

export default async function BlogArchivePage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const posts = await getBlogPosts();
  const { archivePosts } = splitLatestAndArchive(posts);
  const filters: BlogArchiveFilters = {
    year: getSearchParamValue(params.year),
    topic: getSearchParamValue(params.topic),
    tag: getSearchParamValue(params.tag),
  };
  const facets = getBlogArchiveFacets(archivePosts);
  const filteredPosts = filterBlogPosts(archivePosts, filters);
  const showDraftBadge = shouldShowDraftBadge();

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-10 max-w-3xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-te-dark/75 hover:text-te-orange"
        >
          ← Back to latest
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-te-dark/70">
          Archive
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-te-dark md:text-5xl">
          Older notes by year, topic, and tag.
        </h1>
        <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-te-dark/80 md:text-base">
          Latest keeps the newest five posts up front. Everything older is here
          for browsing by time and theme.
        </p>
      </header>

      <section className="mb-8 grid gap-6 border-y border-te-gray py-6 lg:grid-cols-3">
        <FilterGroup
          allHref={getArchiveHref({ ...filters, year: undefined })}
          activeValue={filters.year}
          filterKey="year"
          filters={filters}
          label="Year"
          values={facets.years}
        />
        <FilterGroup
          allHref={getArchiveHref({ ...filters, topic: undefined })}
          activeValue={filters.topic}
          filterKey="topic"
          filters={filters}
          label="Topic"
          values={facets.topics}
        />
        <FilterGroup
          allHref={getArchiveHref({ ...filters, tag: undefined })}
          activeValue={filters.tag}
          filterKey="tag"
          filters={filters}
          label="Tag"
          values={facets.tags}
        />
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-te-dark/75">
              Archive posts
            </h2>
            <p className="mt-2 font-sans text-sm leading-6 text-te-dark/80">
              Showing {filteredPosts.length} of {archivePosts.length} archived
              posts.
            </p>
          </div>
          {(filters.year || filters.topic || filters.tag) && (
            <Link
              href="/blog/archive"
              className="inline-flex items-center gap-2 text-sm font-semibold text-te-orange underline decoration-te-orange/35 underline-offset-4 hover:decoration-te-orange"
            >
              Clear filters
            </Link>
          )}
        </div>

        <div className="divide-y divide-te-gray border-y border-te-gray">
          {filteredPosts.map((post) => (
            <BlogPostListItem
              key={post.slug}
              post={post}
              showDraftBadge={showDraftBadge}
              showTopic
            />
          ))}

          {filteredPosts.length === 0 && (
            <p className="py-8 text-center font-sans text-te-dark/80">
              No archived posts match those filters.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
