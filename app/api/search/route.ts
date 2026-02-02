import { NextResponse } from "next/server";
import { searchCatalog } from "@/lib/search";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const mode = (searchParams.get("mode") ?? "auto").toLowerCase();
  const animation = searchParams.get("animation") ?? "0";

  const data = await searchCatalog({ q, mode, animation });
  return NextResponse.json(data);
}
