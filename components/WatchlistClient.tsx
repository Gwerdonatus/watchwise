"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-client";

type MediaType = "movie" | "tv";
type WLItem = { media_type: MediaType; id: number; title: string; poster_path: string | null; year?: string };

const KEY = "watchwise.watchlist.v2";

function keyOf(x: { media_type: MediaType; id: number }) {
  return `${x.media_type}:${x.id}`;
}

function readList(): WLItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function writeList(items: WLItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function toggleWatchlist(item: WLItem) {
  const list = readList();
  const k = keyOf(item);
  const exists = list.some((x) => keyOf(x) === k);
  const next = exists ? list.filter((x) => keyOf(x) !== k) : [item, ...list];
  writeList(next);
  window.dispatchEvent(new CustomEvent("watchwise:watchlist"));
}

export function isInWatchlist(media_type: MediaType, id: number) {
  return readList().some((x) => x.media_type === media_type && x.id === id);
}

function hrefFor(x: WLItem) {
  return x.media_type === "tv" ? `/tv/${x.id}` : `/m/${x.id}`;
}

export function WatchlistClient() {
  const [items, setItems] = useState<WLItem[]>([]);

  useEffect(() => {
    const load = () => setItems(readList());
    load();
    const handler = () => load();
    window.addEventListener("watchwise:watchlist", handler as any);
    return () => window.removeEventListener("watchwise:watchlist", handler as any);
  }, []);

  if (!items.length) {
    return (
      <div className="rounded-[28px] bg-white/75 p-8 ring-1 ring-slate-200/70 shadow-soft">
        <div className="text-sm font-semibold text-slate-900">No titles yet</div>
        <p className="mt-2 text-sm text-slate-600">
          Search a movie or series, open recommendations, then hit <span className="font-semibold text-slate-900">Save</span>.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-glass transition"
        >
          Start browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Link
          key={keyOf(it)}
          href={hrefFor(it)}
          className="group relative overflow-hidden rounded-[28px] bg-white/75 ring-1 ring-slate-200/70 shadow-soft hover:shadow-glass transition"
        >
          <div className="flex gap-4 p-4">
            <div className="relative h-[120px] w-[84px] shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
              {it.poster_path ? <Image src={tmdbImageUrl(it.poster_path, "w342")!} alt={it.title} fill className="object-cover" /> : null}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{it.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {it.year ? <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">{it.year}</span> : null}
                <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">{it.media_type === "tv" ? "TV" : "Movie"}</span>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWatchlist(it);
                }}
                className="mt-4 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition"
              >
                Remove
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
