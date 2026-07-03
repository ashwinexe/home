import { NextResponse } from "next/server";

// In-memory storage for development
// For production, use Upstash Redis or Vercel KV
let gamingStatus = {
  status: "offline" as "online" | "offline",
  game: null as string | null,
  platform: null as "playstation" | "nintendo" | "xbox" | null,
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(gamingStatus);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { status, game, platform, secret } = body;

    // Simple API key protection
    if (secret !== process.env.GAMING_STATUS_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    gamingStatus = {
      status: status || "offline",
      game: game || null,
      platform: platform || null,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: gamingStatus });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
