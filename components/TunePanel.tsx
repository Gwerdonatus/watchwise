"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import type { RecItem } from "@/components/RecommendationRail";

export type TuneSliderClient = {
  id: string;
  leftLabel: string;
  rightLabel: string;
  defaultValue: number; // 0..100
};

export type TunePackClient = {
  basedOn: Array<{ id: string; label: string }>;
  boosts: Array<{ id: string; label: string }>;
  slider?: TuneSliderClient;
};

export function TunePanel({
  seedId,
  seedType,
  seedTitle,
  tunePack,
  onApplied,
}: {
  seedId: number;
  seedType: "movie" | "tv";
  seedTitle: string;
  tunePack: TunePackClient;
  onApplied: (items: RecItem[], label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boosts, setBoosts] = useState<string[]>([]);
  const [slider, setSlider] = useState<number>(tunePack.slider?.defaultValue ?? 50);
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const boostLabel = useMemo(() => {
    if (!boosts.length) return "No boosts selected";
    return `Boosting: ${boosts
      .map((id) => tunePack.boosts.find((b) => b.id === id)?.label ?? id)
      .slice(0, 3)
      .join(", ")}${boosts.length > 3 ? "…" : ""}`;
  }, [boosts, tunePack.boosts]);

  async function apply() {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedId,
          seedType,
          boosts,
          slider: tunePack.slider ? { id: tunePack.slider.id, value: slider } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed");

      onApplied(data.items as RecItem[], boosts.length ? `Tuned to: ${boostLabel}` : "Showing best matches");
      setToast("Recommendations updated");
      setOpen(false);
    } catch (e: any) {
      setToast(e?.message ?? "Failed to apply");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[28px] bg-white/75 ring-1 ring-slate-200/70 shadow-soft overflow-hidden">
      <div className="p-5">
        <div className="text-sm font-semibold text-slate-900">Tune your vibe</div>
        <p className="mt-1 text-xs text-slate-600">
          Start with the best matches, then boost what you loved in <span className="font-semibold text-slate-900">{seedTitle}</span>.
        </p>

        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-900">Based on</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tunePack.basedOn.slice(0, 8).map((t) => (
              <Chip key={t.id} tone="muted">
                {t.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-900">Boost (positive only)</div>
            <button onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-slate-700 hover:text-slate-900">
              {open ? "Close" : "Open"}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {tunePack.boosts.map((b) => {
                    const active = boosts.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        onClick={() =>
                          setBoosts((xs) => (xs.includes(b.id) ? xs.filter((x) => x !== b.id) : [...xs, b.id]))
                        }
                        className={[
                          "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
                          active
                            ? "bg-slate-900 text-white ring-slate-900/10"
                            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>

                {tunePack.slider ? (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{tunePack.slider.leftLabel}</span>
                      <span>{tunePack.slider.rightLabel}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={slider}
                      onChange={(e) => setSlider(Number(e.target.value))}
                      className="mt-2 w-full accent-slate-900"
                    />
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">{boostLabel}</div>
                  <Button onClick={apply} disabled={loading}>
                    {loading ? "Applying…" : "Apply"}
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-5"
          >
            <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">{toast}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
