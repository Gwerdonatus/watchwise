import "server-only";

import { tmdbGet } from "@/lib/tmdb";
import { TRAITS, type TraitId, extractTraitScores, buildTunePack, type TunePack } from "@/lib/traits";

export type MediaType = "movie" | "tv";

export type RecommendationItem = {
  id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  year?: string;
  vote_average?: number;
  vote_count?: number;
  reasons?: string[];
  why?: {
    sharedTraits: string[];
    sharedThemes: string[];
    sharedGenres: string[];
    breakdown: { themes: number; traits: number; genres: number };
    confidence: "high" | "medium" | "experimental";
  };
};

type TuningState = {
  boosts: TraitId[];
  slider?: { id: string; value: number };
};

type GenreList = { genres: Array<{ id: number; name: string }> };

type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  keywords?: { keywords?: Array<{ id: number; name: string }> };
};

type TVDetails = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  episode_run_time?: number[];
};

type TVKeywords = { id: number; results: Array<{ id: number; name: string }> };

type ListResponse = {
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
    genre_ids?: number[];
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
  }>;
};

function uniqByKey<T>(arr: T[], key: (t: T) => string) {
  const m = new Map<string, T>();
  for (const it of arr) m.set(key(it), it);
  return Array.from(m.values());
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function asConfidence(voteCount: number | undefined) {
  const vc = voteCount ?? 0;
  if (vc >= 1500) return "high" as const;
  if (vc >= 400) return "medium" as const;
  return "experimental" as const;
}

async function getGenreMap(type: MediaType) {
  const data = await tmdbGet<GenreList>(`/genre/${type}/list`, { language: "en-US" }, { revalidateSeconds: 60 * 60 * 24 });
  const m = new Map<number, string>();
  for (const g of data.genres) m.set(g.id, g.name);
  return m;
}

async function getSeedSignals(seedId: number, seedType: MediaType) {
  if (seedType === "movie") {
    const movie = await tmdbGet<MovieDetails>(
      `/movie/${seedId}`,
      { append_to_response: "keywords", language: "en-US" },
      { revalidateSeconds: 60 * 60 * 12 }
    );

    return {
      title: movie.title,
      year: (movie.release_date ?? "").slice(0, 4) || undefined,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      signals: {
        overview: movie.overview ?? "",
        genres: movie.genres.map((g) => g.name),
        keywords: (movie.keywords?.keywords ?? []).map((k) => k.name),
        runtime: movie.runtime ?? null,
      },
    };
  }

  const tv = await tmdbGet<TVDetails>(`/tv/${seedId}`, { language: "en-US" }, { revalidateSeconds: 60 * 60 * 12 });
  const kw = await tmdbGet<TVKeywords>(`/tv/${seedId}/keywords`, {}, { revalidateSeconds: 60 * 60 * 24 });

  return {
    title: tv.name,
    year: (tv.first_air_date ?? "").slice(0, 4) || undefined,
    poster_path: tv.poster_path,
    backdrop_path: tv.backdrop_path,
    vote_average: tv.vote_average,
    vote_count: tv.vote_count,
    signals: {
      overview: tv.overview ?? "",
      genres: tv.genres.map((g) => g.name),
      keywords: (kw.results ?? []).map((k) => k.name),
      runtime: (tv.episode_run_time?.[0] ?? null) as any,
    },
  };
}

function buildVector(scores: Map<TraitId, number>, boosts: TraitId[], slider?: { leftTrait: TraitId; rightTrait: TraitId; value: number }) {
  // base weights
  const w = new Map<TraitId, number>();
  for (const [k, v] of scores) w.set(k, v);

  // positive boosts: increase weight on selected traits
  for (const t of boosts) {
    w.set(t, (w.get(t) ?? 0) + 2.0);
  }

  // optional slider: shift weight between two traits
  if (slider) {
    const left = clamp01((100 - slider.value) / 100);
    const right = clamp01(slider.value / 100);
    w.set(slider.leftTrait, (w.get(slider.leftTrait) ?? 0) + left * 2.0);
    w.set(slider.rightTrait, (w.get(slider.rightTrait) ?? 0) + right * 2.0);
  }

  return w;
}

function cosine(a: Map<TraitId, number>, b: Map<TraitId, number>) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, av] of a) {
    na += av * av;
    dot += av * (b.get(k) ?? 0);
  }
  for (const [, bv] of b) nb += bv * bv;
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function topTraitLabels(seed: Map<TraitId, number>, cand: Map<TraitId, number>, n: number) {
  const shared: Array<{ id: TraitId; s: number }> = [];
  for (const [id, sv] of seed) {
    const cv = cand.get(id) ?? 0;
    const m = Math.min(sv, cv);
    if (m > 0.9) shared.push({ id, s: m });
  }
  shared.sort((a, b) => b.s - a.s);
  return shared.slice(0, n).map((x) => TRAITS[x.id].label);
}

function safeTitle(type: MediaType, r: { title?: string; name?: string }) {
  return type === "movie" ? (r.title ?? "Untitled") : (r.name ?? "Untitled");
}

function safeYear(type: MediaType, r: { release_date?: string; first_air_date?: string }) {
  const d = type === "movie" ? (r.release_date ?? "") : (r.first_air_date ?? "");
  return d.slice(0, 4) || undefined;
}

export async function getRecommendations(seedId: number, seedType: MediaType, tuning: TuningState) {
  const { boosts, slider } = tuning;

  const [{ signals, title }, genreMap] = await Promise.all([getSeedSignals(seedId, seedType), getGenreMap(seedType)]);

  const tunePack: TunePack = buildTunePack(signals);

  const seedScores = extractTraitScores(signals);

  // slider mapping from tunePack if present
  const sliderDef = tunePack.slider
    ? {
        id: tunePack.slider.id,
        leftTrait: tunePack.slider.leftTrait,
        rightTrait: tunePack.slider.rightTrait,
        value: slider?.id === tunePack.slider.id ? slider.value : tunePack.slider.defaultValue,
      }
    : undefined;

  const seedVec = buildVector(seedScores, boosts, sliderDef ? { leftTrait: sliderDef.leftTrait, rightTrait: sliderDef.rightTrait, value: sliderDef.value } : undefined);

  // Candidate pools: recommendations + similar + discover (genres + keywords)
  const [recs, similar] = await Promise.all([
    tmdbGet<ListResponse>(`/${seedType}/${seedId}/recommendations`, { language: "en-US", page: 1 }, { revalidateSeconds: 60 * 60 * 6 }).catch(() => ({ results: [] })),
    tmdbGet<ListResponse>(`/${seedType}/${seedId}/similar`, { language: "en-US", page: 1 }, { revalidateSeconds: 60 * 60 * 6 }).catch(() => ({ results: [] })),
  ]);

  const seedGenreIds = (signals.genres ?? [])
    .map((g) => {
      for (const [id, name] of genreMap.entries()) if (name.toLowerCase() === g.toLowerCase()) return id;
      return null;
    })
    .filter((x): x is number => typeof x === "number");

  const withGenres = seedGenreIds.slice(0, 3).join(",");
  const kw = (signals.keywords ?? []).slice(0, 3);

  const [discoverByGenres] = await Promise.all([
    withGenres
      ? tmdbGet<ListResponse>(
          `/discover/${seedType}`,
          {
            with_genres: withGenres,
            include_adult: false,
            language: "en-US",
            sort_by: "popularity.desc",
            "vote_count.gte": 120,
            page: 1,
          },
          { revalidateSeconds: 60 * 60 * 12 }
        ).catch(() => ({ results: [] }))
      : Promise.resolve({ results: [] } as ListResponse)]);

  // NOTE: TMDb discover expects keyword IDs, not names. We only have names from keywords endpoints;
  // to keep this lightweight and stable, we rely on /recommendations, /similar, and genre-based discover.

  const candidates = uniqByKey(
    [...recs.results, ...similar.results, ...discoverByGenres.results],
    (r) => `${seedType}:${r.id}`
  )
    .filter((r) => r && typeof r.id === "number" && r.id !== seedId)
    .slice(0, 60);

  // Score candidates
  const scored = candidates
    .map((r) => {
      const genres = (r.genre_ids ?? []).map((id) => genreMap.get(id)).filter(Boolean) as string[];
      const sig = { overview: r.overview ?? "", genres, keywords: [], runtime: null };
      const candScores = extractTraitScores(sig);
      const sim = cosine(seedVec, candScores);

      const sharedGenres = genres.filter((g) => signals.genres.some((sg) => sg.toLowerCase() === g.toLowerCase())).slice(0, 3);
      const sharedTraits = topTraitLabels(seedScores, candScores, 4);

      const pop = (r.popularity ?? 0) / 500; // normalize-ish
      const quality = clamp01(((r.vote_average ?? 0) / 10) * 0.6 + clamp01((r.vote_count ?? 0) / 2500) * 0.4);

      // final score: similarity dominant, with gentle quality/popularity
      const score = sim * 0.72 + quality * 0.18 + clamp01(pop) * 0.10;

      const reasons = [
        ...(sharedTraits.slice(0, 3)),
        ...(sharedGenres.slice(0, 2).map((g) => `Shares genre: ${g}`)),
      ].slice(0, 4);

      return {
        r,
        score,
        sharedTraits,
        sharedGenres,
        confidence: asConfidence(r.vote_count),
        reasons,
        breakdown: { themes: 0, traits: Math.round(sim * 100), genres: sharedGenres.length * 20 },
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 18);

  const items: RecommendationItem[] = scored.map((x) => ({
    id: x.r.id,
    media_type: seedType,
    title: safeTitle(seedType, x.r),
    poster_path: x.r.poster_path,
    year: safeYear(seedType, x.r),
    vote_average: x.r.vote_average ?? 0,
    vote_count: x.r.vote_count ?? 0,
    reasons: x.reasons,
    why: {
      sharedTraits: x.sharedTraits,
      sharedThemes: [],
      sharedGenres: x.sharedGenres,
      breakdown: {
        themes: x.breakdown.themes,
        traits: clamp01(x.breakdown.traits / 100) ? x.breakdown.traits : x.breakdown.traits,
        genres: x.breakdown.genres,
      },
      confidence: x.confidence,
    },
  }));

  return {
    seed: { id: seedId, media_type: seedType, title },
    tunePack,
    items,
  };
}
