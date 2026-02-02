"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { tmdbImageUrl } from "@/lib/tmdb-client";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { isInWatchlist, toggleWatchlist } from "@/components/WatchlistClient";

export type RecItem = {
  id: number;
  media_type: "movie" | "tv";
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

export function RecommendationRail({ items }: { items: RecItem[] }) {
  const [open, setOpen] = useState<RecItem | null>(null);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={`${it.media_type}:${it.id}`} it={it} onWhy={() => setOpen(it)} />
        ))}
      </div>

      <AnimatePresence>{open ? <WhyModal item={open} onClose={() => setOpen(null)} /> : null}</AnimatePresence>
    </>
  );
}

function hrefFor(it: RecItem) {
  return it.media_type === "tv" ? `/tv/${it.id}` : `/m/${it.id}`;
}

function Card({ it, onWhy }: { it: RecItem; onWhy: () => void }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWatchlist(it.media_type, it.id));
    const handler = () => setSaved(isInWatchlist(it.media_type, it.id));
    window.addEventListener("watchwise:watchlist", handler as any);
    return () => window.removeEventListener("watchwise:watchlist", handler as any);
  }, [it.id, it.media_type]);

  return (
    <div className="group relative overflow-hidden rounded-[28px] bg-white/75 ring-1 ring-slate-200/70 shadow-soft hover:shadow-glass transition">
      <Link href={hrefFor(it)} className="block">
        <div className="flex gap-4 p-4">
          <div className="relative h-[120px] w-[84px] shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
            {it.poster_path ? (
              <Image src={tmdbImageUrl(it.poster_path, "w342")!} alt={it.title} fill className="object-cover" />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{it.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  {it.year ? <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">{it.year}</span> : null}
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                    ★ {(it.vote_average ?? 0).toFixed(1)} · {(it.vote_count ?? 0).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                    {it.media_type === "tv" ? "TV" : "Movie"}
                  </span>
                </div>
              </div>
            </div>

            {it.reasons?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {it.reasons.slice(0, 3).map((r) => (
                  <Chip key={r} tone="muted">
                    {r}
                  </Chip>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWhy();
                }}
              >
                Why this match
              </Button>

              <Button
                variant={saved ? "secondary" : "ghost"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWatchlist({
                    media_type: it.media_type,
                    id: it.id,
                    title: it.title,
                    poster_path: it.poster_path,
                    year: it.year,
                  });
                }}
              >
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function WhyModal({ item, onClose }: { item: RecItem; onClose: () => void }) {
  const why = item.why;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-glass ring-1 ring-slate-200"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 18, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold text-slate-900">Why this match</div>
        <p className="mt-1 text-sm text-slate-600">
          {item.title} • {item.media_type === "tv" ? "TV series" : "Movie"} • Confidence:{" "}
          <span className="font-semibold text-slate-900">{why?.confidence ?? "experimental"}</span>
        </p>

        <div className="mt-5 space-y-4">
          {why?.sharedTraits?.length ? (
            <div>
              <div className="text-xs font-semibold text-slate-900">Shared traits</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {why.sharedTraits.map((x) => (
                  <Chip key={x}>{x}</Chip>
                ))}
              </div>
            </div>
          ) : null}

          {why?.sharedGenres?.length ? (
            <div>
              <div className="text-xs font-semibold text-slate-900">Shared genres</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {why.sharedGenres.map((x) => (
                  <Chip key={x} tone="muted">
                    {x}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-900">Match breakdown</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-700">
              <div>
                <div className="font-semibold">Traits</div>
                <div>{why?.breakdown?.traits ?? 0}%</div>
              </div>
              <div>
                <div className="font-semibold">Genres</div>
                <div>{why?.breakdown?.genres ?? 0}%</div>
              </div>
              <div>
                <div className="font-semibold">Themes</div>
                <div>{why?.breakdown?.themes ?? 0}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
