"use client";

import { useState } from "react";

export function MovieOverview({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={[
          "text-sm md:text-base text-slate-600",
          expanded
            ? ""
            : "[display:-webkit-box] [-webkit-line-clamp:4] [-webkit-box-orient:vertical] overflow-hidden",
        ].join(" ")}
      >
        {text}
      </p>

      {text.length > 220 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
