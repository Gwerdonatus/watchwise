import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { normalizeQuery } from "@/lib/text";
import { tmdbImageUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/Button";
import { searchCatalog } from "@/lib/search";

// NOTE: This page is a Server Component.
// We call the shared server-side search logic directly (no fetch to /api),
// which avoids absolute-URL issues and keeps SSR stable.

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string; animation?: string }>;
}) {
  const sp = await searchParams;
  const qRaw = sp.q ?? "";
  const q = normalizeQuery(qRaw);
  const mode = sp.mode ?? "auto";
  const animation = sp.animation ?? "0";

  if (!q) {
    return (
      <Container className="py-14">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Search</h1>
        <p className="mt-2 text-sm text-slate-600">Type a title or a theme on the homepage to begin.</p>
        <Link href="/" className="mt-5 inline-flex">
          <Button>Go to Home</Button>
        </Link>
      </Container>
    );
  }

  const data = await searchCatalog({ q: qRaw, mode, animation });

  const modeLabel = data.mode === "title" ? "Title search" : data.mode === "themes" ? "Theme search" : "Auto";

  return (
    <Container className="py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">Pick the right title</h1>
          <p className="mt-2 text-sm text-slate-600">
            For <span className="text-slate-900 font-semibold">“{qRaw}”</span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">{modeLabel}</span>
          {animation === "1" && <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">Animation</span>}
        </div>
      </div>

      {data.suggestions.length > 0 ? (
        <div className="mt-6 rounded-[28px] bg-white/75 p-5 ring-1 ring-slate-200/70 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">Quick picks</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.suggestions.slice(0, 8).map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}&mode=title&animation=${encodeURIComponent(animation)}`}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {data.results.length === 0 ? (
        <div className="mt-10 rounded-[28px] bg-white/75 p-8 ring-1 ring-slate-200/70 shadow-soft">
          <div className="text-lg font-semibold text-slate-900">No results</div>
          <p className="mt-2 text-sm text-slate-600">
            Try switching to <span className="font-semibold text-slate-900">Themes</span> mode (e.g. “heist series with clever twists”),
            or search by the exact title.
          </p>
          <Link href="/" className="mt-5 inline-flex">
            <Button>Back to Home</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.results.map((r) => {
            const href = r.media_type === "tv" ? `/tv/${r.id}` : `/m/${r.id}`;
            return (
              <Link
                key={`${r.media_type}-${r.id}`}
                href={href}
                className="group relative overflow-hidden rounded-[28px] bg-white/75 ring-1 ring-slate-200/70 shadow-soft hover:shadow-glass transition"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {r.poster_path ? (
                    <Image
                      src={tmdbImageUrl(r.poster_path, "w780")!}
                      alt={r.title}
                      fill
                      className="object-cover opacity-95 group-hover:scale-[1.02] transition"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/10 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{r.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      {r.year ? <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">{r.year}</span> : null}
                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                        ★ {(r.vote_average ?? 0).toFixed(1)} · {(r.vote_count ?? 0).toLocaleString()}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                        {r.media_type === "tv" ? "TV Series" : "Movie"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">Select →</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
