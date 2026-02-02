import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SpotlightSearch } from "@/components/SpotlightSearch";
import { HorizontalReel, ReelItem } from "@/components/HorizontalReel";
import { tmdbGet } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

type TrendingResponse = {
  results: Array<{
    id: number;
    title?: string;
    poster_path: string | null;
    release_date?: string;
  }>;
};

export default async function HomePage() {
  let items: ReelItem[] = [];
  try {
    const trending = await tmdbGet<TrendingResponse>("/trending/movie/day", {}, { revalidateSeconds: 60 * 30 });
    items = trending.results.slice(0, 14).map((r) => ({
      id: r.id,
      media_type: "movie",
      title: r.title ?? "Untitled",
      poster_path: r.poster_path,
      year: (r.release_date ?? "").slice(0, 4) || undefined,
    }));
  } catch {
    items = [];
  }

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Premium mesh + visible net + GREEN wash on net side */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {/* base wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50/70" />

          {/* Existing blue/indigo cinematic blobs */}
          <div className="absolute inset-0">
            <div className="absolute -top-44 right-[-18%] h-[640px] w-[640px] rounded-full bg-indigo-500/18 blur-3xl" />
            <div className="absolute top-[16%] right-[2%] h-[520px] w-[520px] rounded-full bg-sky-400/16 blur-3xl" />
            <div className="absolute -bottom-52 right-[18%] h-[680px] w-[680px] rounded-full bg-blue-500/14 blur-3xl" />

            {/* extra glow on small screens so the hero doesn't feel empty */}
            <div className="absolute -top-24 left-[-22%] h-[520px] w-[520px] rounded-full bg-sky-400/12 blur-3xl sm:hidden" />
          </div>

          {/* ✅ Green gradient wash (half/right side, blended + flowing) */}
          <div className="absolute inset-0">
            {/* A soft green sweep, concentrated where the net is */}
            <div className="absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full bg-emerald-400/14 blur-3xl" />
            <div className="absolute top-[18%] right-[14%] h-[520px] w-[520px] rounded-full bg-green-500/12 blur-3xl" />
            <div className="absolute -bottom-40 right-[6%] h-[620px] w-[620px] rounded-full bg-teal-400/12 blur-3xl" />

            {/* A subtle half-screen gradient sheet so it "flows in" */}
            <div className="absolute inset-y-0 right-0 w-[58%] bg-gradient-to-l from-emerald-200/25 via-emerald-100/10 to-transparent" />
          </div>

          {/* net/grid (more visible) */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(99,102,241,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.16) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "linear-gradient(to left, black 58%, transparent 90%)",
              WebkitMaskImage: "linear-gradient(to left, black 58%, transparent 90%)",
              opacity: 0.28,
            }}
          />

          {/* mobile grid overlay: slightly denser + visible */}
          <div
            className="absolute inset-0 sm:hidden"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(99,102,241,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.18) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              maskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
              opacity: 0.34,
            }}
          />

          {/* subtle vignette for cinematic feel + readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white" />
        </div>

        {/* content */}
        <Container className="relative pt-10 pb-16 sm:pt-12 sm:pb-20 md:pt-16 md:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/70 shadow-soft backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
              Vibe-first movie discovery
            </div>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
              Find movies that match your mood
              <span className="block text-slate-700">with reasons you can trust.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm sm:text-base text-slate-600">
              Search a movie or a theme. Tune the vibe. Get ranked picks—story, tone, humor, and energy.
            </p>
          </div>

          {/* search “stage” */}
          <div className="mt-8 sm:mt-10">
            <div className="rounded-[28px] bg-white/70 ring-1 ring-slate-200/70 shadow-soft backdrop-blur p-3 sm:p-4">
              <SpotlightSearch />
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <MiniStat title="Movie-only focus" desc="No TV noise—every result is a film." />
            <MiniStat title="Explainable matches" desc="Every recommendation includes the why." />
            <MiniStat title="Fast + smooth" desc="Cached TMDb data with premium UI motion." />
          </div>
        </Container>
      </section>

      <HorizontalReel items={items} />

      {/* ✅ New section AFTER the reel (so page doesn't feel empty) */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 shadow-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900/70" />
                Why Watchwise works
              </div>

              <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                Recommendations you can understand — not just “similar genre”.
              </h2>

              <p className="mt-3 text-sm md:text-base text-slate-600">
                Watchwise ranks titles by vibe alignment—tone, energy, story feel—then shows the breakdown so you can trust the pick.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-glass transition"
                >
                  How it works
                </Link>
                <Link
                  href="/watchlist"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition"
                >
                  Open watchlist
                </Link>
              </div>
            </div>

            {/* Right-side cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard title="Vibe tags" desc="We infer tone + energy signals from metadata and descriptions." />
              <InfoCard title="Ranked picks" desc="We re-rank candidates to match your tuning preferences." />
              <InfoCard title="Explainable" desc="Each result shows what contributed to the match." />
              <InfoCard title="Fast UX" desc="Cached requests + lightweight UI for smooth searching." />
            </div>
          </div>

          {/* A soft separator / flourish */}
          <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
        </Container>
      </section>
    </>
  );
}

function MiniStat({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[24px] bg-white/70 border border-slate-200/70 p-5 shadow-soft backdrop-blur hover:shadow-glass hover:border-emerald-200/70 transition-all duration-300">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs text-slate-600">{desc}</div>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[24px] bg-white/70 border border-slate-200/70 p-5 shadow-soft backdrop-blur hover:shadow-glass transition-all duration-300">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-xs text-slate-600">{desc}</div>
    </div>
  );
}
