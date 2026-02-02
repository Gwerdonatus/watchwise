"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VibeSliders } from "@/components/VibeSliders";
import type { SliderState } from "@/lib/vibes";
import { DEFAULT_SLIDERS } from "@/lib/vibes";

export function SliderClient({ base, initial }: { base: string; initial?: SliderState }) {
  const router = useRouter();
  const [v, setV] = useState<SliderState>(initial ?? DEFAULT_SLIDERS);

  return (
    <div className="sticky top-20 self-start">
      <VibeSliders
        value={v}
        onChange={(nv) => {
          setV(nv);
          const params = new URLSearchParams();
          params.set("political", String(nv.political));
          params.set("crude", String(nv.crude));
          params.set("dark", String(nv.dark));
          params.set("story", String(nv.story));
          router.replace(`${base}?${params.toString()}`);
        }}
      />
      <p className="mt-3 text-xs text-slate-500">
        Tip: sliders save into the URL so you can share your tuned page.
      </p>
    </div>
  );
}
