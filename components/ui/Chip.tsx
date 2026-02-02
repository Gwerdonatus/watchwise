import clsx from "clsx";
import type { ReactNode } from "react";

type ChipTone = "default" | "muted" | "success" | "warning" | "danger";

export function Chip({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: ChipTone;
}) {
  const toneClass =
    tone === "muted"
      ? "bg-white text-slate-700 ring-1 ring-slate-200/70"
      : tone === "success"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70"
      : tone === "warning"
      ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200/70"
      : tone === "danger"
      ? "bg-rose-50 text-rose-900 ring-1 ring-rose-200/70"
      : "bg-slate-900 text-white ring-1 ring-slate-900/10";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClass,
        className
      )}
    >
      {children}
    </span>
  );
}
