import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MovieOverview } from "@/components/MovieOverview";
import { MovieRecsClient } from "@/components/MovieRecsClient";
import { getRecommendations } from "@/lib/recommendations";
import { tmdbGet, tmdbImageUrl, region } from "@/lib/tmdb";
import { TRAITS, type TraitId } from "@/lib/traits";

export const dynamic = "force-dynamic";

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

type Videos = {
  results: Array<{ site: string; type: string; key: string; name: string }>;
};

type WatchProviders = {
  results: Record<string, { link: string; flatrate?: Array<{ provider_name: string }> }>;
};

type TVKeywords = { id: number; results: Array<{ id: number; name: string }> };

async function getShow(id: string) {
  return tmdbGet<TVDetails>(`/tv/${id}`, {}, { revalidateSeconds: 60 * 60 * 6 });
}

async function getKeywords(id: string) {
  return tmdbGet<TVKeywords>(`/tv/${id}/keywords`, {}, { revalidateSeconds: 60 * 60 * 24 });
}

async function getVideos(id: string) {
  return tmdbGet<Videos>(`/tv/${id}/videos`, {}, { revalidateSeconds: 60 * 60 * 12 });
}

async function getProviders(id: string) {
  return tmdbGet<WatchProviders>(`/tv/${id}/watch/providers`, {}, { revalidateSeconds: 60 * 60 * 24 });
}

function toTunePackClient(pack: { basedOn: TraitId[]; boosts: TraitId[]; slider?: any }) {
  return {
    basedOn: pack.basedOn.map((id) => ({ id, label: TRAITS[id].label })),
    boosts: pack.boosts.map((id) => ({ id, label: TRAITS[id].label })),
    slider: pack.slider
      ? {
          id: pack.slider.id,
          leftLabel: pack.slider.leftLabel,
          rightLabel: pack.slider.rightLabel,
          defaultValue: pack.slider.defaultValue,
        }
      : undefined,
  };
}

export default async function TVPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seedId = Number(id);

  const [show, kw, vids, providers, recData] = await Promise.all([
    getShow(id),
    getKeywords(id),
    getVideos(id),
    getProviders(id),
    getRecommendations(seedId, "tv", { boosts: [] as any }),
  ]);

  const name = show.name ?? "Untitled";
  const year = (show.first_air_date ?? "").slice(0, 4) || "";
  const runtime = show.episode_run_time?.[0] ?? null;

  const trailer =
    vids.results.find((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) ??
    vids.results.find((v) => v.site === "YouTube");
  const trailerKey = trailer?.key;

  const regionCode = region();
  const providerEntry = providers.results?.[regionCode];
  const flatrate = providerEntry?.flatrate?.map((p) => p.provider_name).slice(0, 6) ?? [];
  const providerLink = providerEntry?.link;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {show.backdrop_path ? (
            <Image src={tmdbImageUrl(show.backdrop_path, "original")!} alt="Backdrop" fill className="object-cover opacity-25" priority />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/75 to-white" />
        </div>

        <Container className="relative py-10 sm:py-12 md:py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end">
            <div className="relative h-[240px] w-[168px] shrink-0 overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200/70 shadow-soft">
              {show.poster_path ? <Image src={tmdbImageUrl(show.poster_path, "w500")!} alt={name} fill className="object-cover" priority /> : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {year && <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">{year}</span>}
                {runtime ? <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">{runtime} min/ep</span> : null}
                <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                  ★ {show.vote_average.toFixed(1)} · {show.vote_count.toLocaleString()}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">TV Series</span>
              </div>

              <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">{name}</h1>

              <div className="mt-4 max-w-2xl">
                <MovieOverview text={show.overview || "No overview available."} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {show.genres.slice(0, 6).map((g) => (
                  <span key={g.id} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {g.name}
                  </span>
                ))}
                {(kw.results ?? []).slice(0, 4).map((k) => (
                  <span key={k.id} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {k.name}
                  </span>
                ))}
              </div>

              {flatrate.length ? (
                <div className="mt-5 text-xs text-slate-600">
                  Watch on ({regionCode}): <span className="text-slate-900 font-semibold">{flatrate.join(", ")}</span>{" "}
                  {providerLink ? (
                    <a className="underline underline-offset-4 hover:text-slate-900" href={providerLink} target="_blank" rel="noreferrer">
                      View options
                    </a>
                  ) : null}
                </div>
              ) : null}

              {trailerKey ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-900">Trailer</div>
                  <div className="mt-2 aspect-video overflow-hidden rounded-[28px] ring-1 ring-slate-200/70 bg-black shadow-soft">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0&mute=1&controls=1&rel=0`}
                      title="Trailer"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12 md:py-14">
        <MovieRecsClient seedId={seedId} seedType="tv" seedTitle={name} initialItems={recData.items as any} tunePack={toTunePackClient(recData.tunePack)} />

        <div className="mt-8 flex justify-end">
          <Link href={`/search?q=${encodeURIComponent(name)}&mode=auto`} className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Explore more results →
          </Link>
        </div>
      </Container>
    </>
  );
}
