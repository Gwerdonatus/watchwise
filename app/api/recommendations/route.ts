import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      seedId?: number;
      seedType?: "movie" | "tv";
      boosts?: string[];
      slider?: { id?: string; value?: number };
    };

    const seedId = Number(body.seedId);
    const seedType = (body.seedType ?? "movie") as "movie" | "tv";

    if (!seedId || Number.isNaN(seedId)) {
      return NextResponse.json({ error: "Missing seedId" }, { status: 400 });
    }

    const boosts = Array.isArray(body.boosts) ? body.boosts : [];
    const slider = body.slider?.id ? { id: String(body.slider.id), value: Number(body.slider.value ?? 50) } : undefined;

    const data = await getRecommendations(seedId, seedType, {
      boosts: boosts as any,
      slider,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
