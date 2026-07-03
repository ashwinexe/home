import { HomeBento, type HomeLayoutItem } from "@/components/home/HomeBento";
import fallbackLayout from "@/content/layout/home-layout.json";
import projects from "@/content/projects/projects.json";
import shotData from "@/content/shots/current.json";
import { getBlogPosts } from "@/lib/mdx";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getBlogPosts();
  const latestPost = posts[0];
  const featuredProject = projects.featured?.[0];
  const latestPostDate = latestPost
    ? new Date(latestPost.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  let layout: HomeLayoutItem[] = fallbackLayout as HomeLayoutItem[];

  try {
    const layoutPath = path.join(
      process.cwd(),
      "content/layout/home-layout.json",
    );
    const rawLayout = await fs.readFile(layoutPath, "utf-8");
    layout = JSON.parse(rawLayout) as HomeLayoutItem[];
  } catch {
    layout = fallbackLayout as HomeLayoutItem[];
  }

  return (
    <HomeBento
      layout={layout}
      data={{
        latestPost: latestPost
          ? {
              slug: latestPost.slug,
              title: latestPost.title,
              description: latestPost.description,
              dateLabel: latestPostDate,
            }
          : undefined,
        featuredProject: featuredProject
          ? {
              name: featuredProject.name,
              description: featuredProject.description,
            }
          : undefined,
        shot: shotData,
      }}
    />
  );
}
