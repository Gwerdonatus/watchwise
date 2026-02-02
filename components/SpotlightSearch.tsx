"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";

const EXAMPLES = [
  "Titanic",
  "Money Heist",
  "South Park",
  "Family Guy",
  "Rick and Morty",
  "wedding movies",
  "dark comedy like The Menu",
  "heist series with clever twists",
  "feel-good adventure",
  "smart sci-fi with heart",
];

type Mode = "auto" | "title" | "themes";

function useIsSmallScreen() {
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setSmall(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  return small;
}

function useRotatingHint(enabled: boolean, intervalMs = 2600) {
  const [hint, setHint] = useState("Search movies, themes, vibes…");

  useEffect(() => {
    if (!enabled) return;

    // set initial after mount to avoid hydration mismatch
    setHint(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);

    const t = setInterval(() => {
      setHint(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]);
    }, intervalMs);

    return () => clearInterval(t);
  }, [enabled, intervalMs]);

  return hint;
}

export function SpotlightSearch({ initial }: { initial?: string }) {
  const router = useRouter();
  const isSmall = useIsSmallScreen();

  const [q, setQ] = useState(initial ?? "");
  const [mode, setMode] = useState<Mode>("auto");
  const [animationOnly, setAnimationOnly] = useState(false);

  // Rotate hint only when input is empty (feels intentional)
  const rotatingHint = useRotatingHint(q.trim().length === 0);

  useEffect(() => {
    if (!initial) return;
    setQ(initial);
  }, [initial]);

  const maxSuggestions = isSmall ? 3 : 6;

  // Pick a stable slice (don’t reshuffle on every render)
  const suggestions = useMemo(() => EXAMPLES.slice(0, maxSuggestions), [maxSuggestions]);

  function go(next?: string) {
    const query = (next ?? q).trim();
    if (!query) return;

    const params = new URLSearchParams({ q: query, mode });
    if (animationOnly) params.set("animation", "1");

    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="relative z-[2] w-full max-w-2xl">
      <div className="rounded-[28px] bg-white/75 p-3 ring-1 ring-slate-200/70 backdrop-blur-xl shadow-soft">
        {/* Input row */}
        <div className="flex items-center gap-3 px-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder={rotatingHint}
            className={clsx(
              "w-full bg-transparent px-3 py-4 text-base text-slate-900 outline-none",
              "placeholder:text-slate-400"
            )}
          />
          <Button onClick={() => go()} className="shrink-0 px-6 py-3">
            Search
          </Button>
        </div>

        {/* Toggles */}
        <div className="mt-2 flex flex-wrap items-center gap-2 px-2 pb-1">
          <Toggle label="Auto" active={mode === "auto"} onClick={() => setMode("auto")} />
          <Toggle label="Title" active={mode === "title"} onClick={() => setMode("title")} />
          <Toggle label="Themes" active={mode === "themes"} onClick={() => setMode("themes")} />

          <div className="mx-1 h-5 w-px bg-slate-200/80" />

          <Toggle label="Animation" active={animationOnly} onClick={() => setAnimationOnly((v) => !v)} />
        </div>

        {/* Suggestions */}
        <div className="mt-3 px-2 pb-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700">Try one of these</div>
            {!isSmall && (
              <button
                type="button"
                onClick={() => {
                  const next = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
                  setQ(next);
                }}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/70 hover:bg-slate-50 transition"
              >
                Surprise me
              </button>
            )}
          </div>

          {/* On mobile: fewer cards + max height so it never stretches the hero */}
          <div
            className={clsx(
              "mt-2 grid gap-2 sm:grid-cols-3",
              isSmall && "max-h-[140px] overflow-auto overscroll-contain pr-1"
            )}
          >
            {suggestions.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setQ(x);
                  // If you want tap-to-search on mobile, uncomment:
                  // if (isSmall) go(x);
                }}
                className="rounded-2xl bg-white px-3 py-2 text-left text-xs text-slate-700 ring-1 ring-slate-200/70 hover:bg-slate-50 transition"
              >
                {x}
              </button>
            ))}
          </div>

          {/* Extra hint line */}
          <div className="mt-3 text-[11px] text-slate-500">
            Tip: Use <span className="font-semibold text-slate-700">Themes</span> for vibe searches like “dark comedy” or “feel-good adventure”.
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
        active
          ? "bg-slate-900 text-white ring-slate-900/10"
          : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}
