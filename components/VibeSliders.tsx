"use client";

import { SliderState, DEFAULT_SLIDERS } from "@/lib/vibes";
import { useMemo } from "react";
import clsx from "clsx";

export function VibeSliders({
  value,
  onChange,
}: {
  value?: SliderState;
  onChange: (v: SliderState) => void;
}) {
  const v = value ?? DEFAULT_SLIDERS;

  const sliders = useMemo(
    () => [
      { key: "political" as const, left: "Silly", right: "Political" },
      { key: "crude" as const, left: "Clean", right: "Crude" },
      { key: "dark" as const, left: "Light", right: "Dark" },
      { key: "story" as const, left: "Jokes", right: "Story" },
    ],
    []
  );

  return (
    <div className="rounded-[28px] bg-white/75 p-5 ring-1 ring-slate-200/70 backdrop-blur shadow-soft">
      <h3 className="text-base font-semibold text-slate-900">Tune the vibe</h3>
      <p className="mt-1 text-xs text-slate-600">Recommendations re-rank based on your preferences.</p>

      <div className="mt-4 space-y-4">
        {sliders.map((s) => (
          <div key={s.key}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{s.left}</span>
              <span>{s.right}</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              value={Math.round((v[s.key] ?? 0) * 100)}
              onChange={(e) => {
                const nv = { ...v, [s.key]: Number(e.target.value) / 100 };
                onChange(nv);
              }}
              className={clsx("w-full accent-slate-900")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
