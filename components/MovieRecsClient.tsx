"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RecommendationRail, type RecItem } from "@/components/RecommendationRail";
import { TunePanel, type TunePackClient } from "@/components/TunePanel";

export function MovieRecsClient({
  seedId,
  seedType,
  seedTitle,
  initialItems,
  tunePack,
}: {
  seedId: number;
  seedType: "movie" | "tv";
  seedTitle: string;
  initialItems: RecItem[];
  tunePack: TunePackClient;
}) {
  const [items, setItems] = useState<RecItem[]>(initialItems);
  const [appliedLabel, setAppliedLabel] = useState<string>("Showing best matches");

  const header = useMemo(() => {
    return {
      title: "Recommendations",
      subtitle: appliedLabel,
    };
  }, [appliedLabel]);

  return (
    <div className="grid gap-6 md:grid-cols-[380px,1fr]">
      <TunePanel
        seedId={seedId}
        seedType={seedType}
        seedTitle={seedTitle}
        tunePack={tunePack}
        onApplied={(next, label) => {
          setItems(next);
          setAppliedLabel(label);
        }}
      />

      <div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{header.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{header.subtitle}</p>
          </div>
        </div>

        <motion.div
          key={items.map((x) => `${x.media_type}:${x.id}`).join("-")}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <RecommendationRail items={items} />
        </motion.div>
      </div>
    </div>
  );
}
