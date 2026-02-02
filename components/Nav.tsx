"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";

const LINKS = [
  { href: "/watchlist", label: "Watchlist" },
  { href: "/about", label: "About" },
  { href: "/credits", label: "Credits" },
];

// Timing controls (ms) — tweak if you want faster/slower
const DOT_STEP = 140; // delay between dot lights
const TYPE_SPEED = 38; // ms per character

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Animation state
  const FULL = "Watchwise";
  const [dotIndex, setDotIndex] = useState(-1); // -1 none, 0 red, 1 yellow, 2 green
  const [typed, setTyped] = useState("");

  // Close mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  // Solidify header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href;

  // Run the "lights then type" animation on mount
  useEffect(() => {
    let alive = true;

    // Reset (important in dev / strict mode)
    setDotIndex(-1);
    setTyped("");

    const t0 = window.setTimeout(() => alive && setDotIndex(0), 120);
    const t1 = window.setTimeout(() => alive && setDotIndex(1), 120 + DOT_STEP);
    const t2 = window.setTimeout(() => alive && setDotIndex(2), 120 + DOT_STEP * 2);

    const startTypingAt = 120 + DOT_STEP * 2 + 140;
    let i = 0;

    const type = () => {
      if (!alive) return;
      i += 1;
      setTyped(FULL.slice(0, i));
      if (i < FULL.length) {
        window.setTimeout(type, TYPE_SPEED);
      }
    };

    const tType = window.setTimeout(type, startTypingAt);

    return () => {
      alive = false;
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tType);
    };
  }, []);

  // Dots spec: stop (red), ready (yellow), go (green)
  const dots = useMemo(
    () => [
      { base: "bg-red-400", on: "bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.14)]" },
      { base: "bg-amber-300", on: "bg-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.14)]" },
      { base: "bg-emerald-400", on: "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]" },
    ],
    []
  );

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "border-b border-slate-200/70",
        // Mobile: opaque. Desktop: glass.
        "bg-white sm:supports-[backdrop-filter]:bg-white/80 sm:backdrop-blur-xl",
        scrolled ? "shadow-sm sm:bg-white/92" : "",
      ].join(" ")}
    >
      <Container className="flex h-14 items-center justify-between">
        {/* Brand: traffic-light dots + typewriter */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold tracking-tight text-slate-900"
          aria-label="Watchwise Home"
        >
          {/* dots (now visible on mobile too) */}
          <span className="inline-flex items-center gap-1.5">
            {dots.map((d, idx) => {
              const lit = idx <= dotIndex;
              return (
                <span
                  key={idx}
                  className={[
                    "h-2 w-2 rounded-full transition-all duration-200",
                    lit ? d.on : d.base,
                    lit ? "opacity-100" : "opacity-45",
                  ].join(" ")}
                  aria-hidden="true"
                />
              );
            })}
          </span>

          {/* typing text */}
          <span className="relative">
            <span className="align-middle">{typed}</span>

            {/* caret while typing */}
            <span
              aria-hidden="true"
              className={[
                "ml-0.5 inline-block h-[1.05em] w-px bg-slate-900/60 align-middle",
                typed.length < FULL.length ? "opacity-100 animate-pulse" : "opacity-0",
              ].join(" ")}
            />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2 text-sm">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "relative rounded-full px-3 py-2 font-semibold transition",
                  active
                    ? "text-slate-900 bg-slate-100 ring-1 ring-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                ].join(" ")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(true)}
          className="sm:hidden inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 bg-white hover:bg-slate-50 transition"
          aria-label="Open menu"
        >
          Menu
        </button>
      </Container>

      {/* Mobile drawer (unchanged) */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed right-3 top-3 z-[70] w-[min(92vw,360px)] overflow-hidden rounded-[24px] bg-white shadow-2xl ring-1 ring-slate-200"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="text-sm font-semibold text-slate-900">Watchwise</div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 bg-white hover:bg-slate-50 transition"
                  aria-label="Close menu"
                >
                  Close
                </button>
              </div>

              <div className="p-2">
                {LINKS.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={[
                        "block rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        active
                          ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200"
                          : "text-slate-800 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
