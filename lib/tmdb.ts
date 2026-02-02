import "server-only";

const TMDB_BASE = "https://api.themoviedb.org/3";

function getAuthHeaders(): HeadersInit {
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getApiKeyParam() {
  const key = process.env.TMDB_API_KEY?.trim();
  return key ? `api_key=${encodeURIComponent(key)}` : "";
}

export type MediaType = "movie" | "tv";

export function assertTMDbConfigured() {
  const ok = Boolean(process.env.TMDB_ACCESS_TOKEN?.trim() || process.env.TMDB_API_KEY?.trim());
  if (!ok) {
    throw new Error("TMDb is not configured. Set TMDB_ACCESS_TOKEN (recommended) or TMDB_API_KEY in .env");
  }
}

export async function tmdbGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  opts?: { revalidateSeconds?: number }
) {
  assertTMDbConfigured();

  const url = new URL(TMDB_BASE + path);

  const apiKeyParam = getApiKeyParam();
  if (apiKeyParam) {
    const [k, v] = apiKeyParam.split("=");
    url.searchParams.set(k, v);
  }

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }

  const revalidate = opts?.revalidateSeconds ?? 60 * 60; // 1 hour default

  // ✅ Build headers as HeadersInit to satisfy fetch typings
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(process.env.TMDB_ACCESS_TOKEN?.trim()
      ? { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN.trim()}` }
      : {}),
  };

  const res = await fetch(url.toString(), {
    headers,
    next: { revalidate },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`TMDb error ${res.status} on ${path}: ${txt.slice(0, 300)}`);
  }

  return (await res.json()) as T;
}

export function tmdbImageUrl(path: string | null | undefined, size: "w342" | "w500" | "w780" | "original" = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function region() {
  return process.env.DEFAULT_WATCH_REGION?.trim() || "US";
}
