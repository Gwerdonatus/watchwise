import { tmdbGet } from "@/lib/tmdb";
import { normalizeQuery, stripStopWords } from "@/lib/text";

export type SearchResult = {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  year?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
};

type TMDbMultiSearch = {
  results: Array<{
    id: number;
    media_type: "movie" | "tv" | "person";
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    popularity?: number;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
    overview?: string;
  }>;
};

type TMDbKeywordSearch = {
  results: Array<{ id: number; name: string }>;
};

type TMDbDiscover = {
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    popularity?: number;
    vote_average?: number;
    vote_count?: number;
    genre_ids?: number[];
    overview?: string;
  }>;
};

const ANIMATION_GENRE = 16;

function titleOf(r: { media_type: "movie" | "tv"; title?: string; name?: string }) {
  return r.media_type === "movie" ? (r.title ?? "") : (r.name ?? "");
}

function yearOf(r: { media_type: "movie" | "tv"; release_date?: string; first_air_date?: string }) {
  const d = r.media_type === "movie" ? (r.release_date ?? "") : (r.first_air_date ?? "");
  return d.slice(0, 4) || undefined;
}

function looksLikeThemeQuery(q: string) {
  const t = normalizeQuery(q);
  if (/(movies|movie|films|film|like|series|show|tv)\b/i.test(q)) return true;
  const tokens = t.split(" ").filter(Boolean);
  return tokens.length >= 3;
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreResult(
  qRaw: string,
  r: { media_type: "movie" | "tv"; title?: string; name?: string; popularity?: number; vote_average?: number; poster_path: string | null }
) {
  const q = norm(qRaw);
  const t = norm(titleOf(r));

  let s = 0;
  if (!q || !t) return s;

  if (t === q) s += 1200;
  if (t.startsWith(q)) s += 650;
  if (t.includes(q)) s += 280;

  s += Math.min(350, (r.popularity ?? 0) * 2);
  if (r.poster_path) s += 35;
  s += Math.min(60, (r.vote_average ?? 0) * 6);

  // Tiny nudge toward TV for tv-ish queries (helps Money Heist vs documentary)
  if (/(season|episode|series|show|tv)\b/i.test(qRaw) && r.media_type === "tv") s += 120;

  return s;
}

function filterAnim<T extends { genre_ids?: number[] }>(r: T, animOnly: boolean) {
  if (!animOnly) return true;
  return (r.genre_ids ?? []).includes(ANIMATION_GENRE);
}

function unique(xs: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of xs) {
    const k = x.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

export async function searchCatalog(opts: { q: string; mode?: string; animation?: string }) {
  const q = (opts.q ?? "").trim();
  const mode = (opts.mode ?? "auto").toLowerCase();
  const animation = opts.animation ?? "0";

  const normQ = normalizeQuery(q);
  if (!normQ) return { query: q, mode, results: [] as SearchResult[], suggestions: [] as string[] };

  const animOnly = animation === "1";

  // 1) Title search (movie + tv)
  const titleData = await tmdbGet<TMDbMultiSearch>(
    "/search/multi",
    { query: q, include_adult: false, language: "en-US", page: 1 },
    { revalidateSeconds: 60 * 30 }
  );

  const titleResults = titleData.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .filter((r) => filterAnim(r, animOnly))
    .map((r) => ({
      id: r.id,
      media_type: r.media_type as "movie" | "tv",
      title: titleOf(r as any) || "Untitled",
      poster_path: r.poster_path,
      year: yearOf(r as any),
      vote_average: r.vote_average ?? 0,
      vote_count: r.vote_count ?? 0,
      popularity: r.popularity ?? 0,
      __score: scoreResult(q, r as any),
    }))
    .sort((a, b) => b.__score - a.__score);

  const suggestions = unique(titleResults.map((r) => r.title).filter(Boolean)).slice(0, 10);

  const shouldTheme = mode === "themes" || (mode === "auto" && (looksLikeThemeQuery(q) || titleResults.length === 0));

  let final = titleResults;

  // 2) Theme search via keywords + discover (movie + tv)
  if (shouldTheme) {
    const kwQuery = stripStopWords(normQ);
    const kw = await tmdbGet<TMDbKeywordSearch>(
      "/search/keyword",
      { query: kwQuery || normQ, page: 1 },
      { revalidateSeconds: 60 * 60 * 6 }
    );

    const keywordIds = kw.results.slice(0, 3).map((k) => k.id);
    if (keywordIds.length) {
      const [discoverMovies, discoverTV] = await Promise.all([
        tmdbGet<TMDbDiscover>(
          "/discover/movie",
          {
            with_keywords: keywordIds.join(","),
            include_adult: false,
            language: "en-US",
            sort_by: "popularity.desc",
            "vote_count.gte": 120,
            page: 1,
          },
          { revalidateSeconds: 60 * 60 * 6 }
        ),
        tmdbGet<TMDbDiscover>(
          "/discover/tv",
          {
            with_keywords: keywordIds.join(","),
            include_adult: false,
            language: "en-US",
            sort_by: "popularity.desc",
            "vote_count.gte": 120,
            page: 1,
          },
          { revalidateSeconds: 60 * 60 * 6 }
        ),
      ]);

      const discovered = [
        ...discoverMovies.results.map((r) => ({ ...r, media_type: "movie" as const })),
        ...discoverTV.results.map((r) => ({ ...r, media_type: "tv" as const })),
      ]
        .filter((r) => filterAnim(r, animOnly))
        .map((r) => ({
          id: r.id,
          media_type: r.media_type,
          title: titleOf(r as any) || "Untitled",
          poster_path: r.poster_path,
          year: yearOf(r as any),
          vote_average: r.vote_average ?? 0,
          vote_count: r.vote_count ?? 0,
          popularity: r.popularity ?? 0,
          __score: scoreResult(q, r as any) + 80,
        }))
        .sort((a, b) => b.__score - a.__score);

      const merged = new Map<string, typeof discovered[number]>();
      for (const r of [...discovered, ...titleResults]) merged.set(`${r.media_type}:${r.id}`, r);
      final = Array.from(merged.values()).sort((a, b) => b.__score - a.__score);
    }
  }

  const results: SearchResult[] = final.slice(0, 24).map(({ __score, ...r }) => r);
  return { query: q, mode, results, suggestions };
}
