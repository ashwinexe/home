import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const allowedSizes = new Set([
  "1x1",
  "1x2",
  "2x1",
  "2x2",
  "2x3",
  "3x2",
  "4x2",
  "4x3",
  "2x4",
  "4x4",
]);

const allowedIds = new Set([
  "profile",
  "liveActivity",
  "work",
  "quote",
  "projects",
  "talks",
  "latestBlog",
  "featuredProject",
  "now",
]);

type LayoutItem = {
  id: string;
  size: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    layout?: LayoutItem[];
    key?: string;
  };

  const expectedKey = process.env.LAYOUT_EDIT_KEY ?? "";

  if (!expectedKey || body.key !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Array.isArray(body.layout)) {
    return NextResponse.json({ error: "Invalid layout" }, { status: 400 });
  }

  const sanitized = body.layout.filter(
    (item) => allowedIds.has(item.id) && allowedSizes.has(item.size),
  );

  const filePath = path.join(process.cwd(), "content/layout/home-layout.json");

  await fs.writeFile(filePath, JSON.stringify(sanitized, null, 2));

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const filePath = path.join(process.cwd(), "content/layout/home-layout.json");
  const rawLayout = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(rawLayout) as LayoutItem[];
  const sanitized = parsed.filter(
    (item) => allowedIds.has(item.id) && allowedSizes.has(item.size),
  );
  return NextResponse.json(sanitized);
}

export const dynamic = "force-dynamic";
