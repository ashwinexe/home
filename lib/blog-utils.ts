import type { BlogPost } from "@/types";

export type BlogArchiveFilters = {
  year?: string;
  topic?: string;
  tag?: string;
};

function getDateTime(dateString: string): number {
  const time = new Date(dateString).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Undated";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getPostSummary(post: BlogPost, maxLength = 132): string {
  if (post.description) {
    return post.description;
  }

  return post.content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function getPostYear(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "now";
  }

  return String(date.getFullYear());
}

export function getPostTopic(post: BlogPost): string {
  return post.category || "uncategorized";
}

export function sortBlogPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const dateDelta = getDateTime(b.date) - getDateTime(a.date);

    if (dateDelta !== 0) {
      return dateDelta;
    }

    return a.title.localeCompare(b.title);
  });
}

export function splitLatestAndArchive(posts: BlogPost[], latestCount = 5) {
  const sortedPosts = sortBlogPostsByDate(posts);

  return {
    latestPosts: sortedPosts.slice(0, latestCount),
    archivePosts: sortedPosts.slice(latestCount),
  };
}

export function getBlogArchiveFacets(posts: BlogPost[]) {
  const years = new Set<string>();
  const topics = new Set<string>();
  const tags = new Set<string>();

  posts.forEach((post) => {
    years.add(getPostYear(post.date));
    topics.add(getPostTopic(post));
    post.tags.forEach((tag) => tags.add(tag));
  });

  return {
    years: Array.from(years).sort((a, b) => Number(b) - Number(a)),
    topics: Array.from(topics).sort((a, b) => a.localeCompare(b)),
    tags: Array.from(tags).sort((a, b) => a.localeCompare(b)),
  };
}

export function filterBlogPosts(
  posts: BlogPost[],
  filters: BlogArchiveFilters,
): BlogPost[] {
  return posts.filter((post) => {
    if (filters.year && getPostYear(post.date) !== filters.year) {
      return false;
    }

    if (filters.topic && getPostTopic(post) !== filters.topic) {
      return false;
    }

    if (filters.tag && !post.tags.includes(filters.tag)) {
      return false;
    }

    return true;
  });
}

export function shouldShowDraftBadge(): boolean {
  return (
    process.env.NODE_ENV !== "production" && process.env.SHOW_DRAFTS === "true"
  );
}
