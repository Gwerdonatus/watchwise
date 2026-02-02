import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
  const sizes = size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm";
  const variants =
    variant === "primary"
      ? "bg-slate-900 text-white shadow-soft hover:shadow-glass"
      : variant === "secondary"
      ? "bg-white/70 text-slate-900 ring-1 ring-slate-200 hover:bg-white shadow-soft"
      : "bg-transparent text-slate-700 hover:bg-slate-100 ring-1 ring-transparent";

  return <button className={clsx(base, sizes, variants, className)} {...props} />;
}
