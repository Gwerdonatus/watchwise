"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";

const LINKS = [
  { href: "/watchlist", label: "Watchlist" },
  { href: "/about", label: "About" },
  { href: "/credits", label: "Credits" },
];

// -----------------------------
// CINEMATIC TIMING (ms)
// -----------------------------
const RISE_ON = 950;     // glow ramps up (~1s)
const FALL_OFF = 650;   // dim back down
const BETWEEN_PULSES = 320;
const BETWEEN_DOTS = 650;

const TYPE_TOTAL = 3000;  // Watchwise types in over ~3s
const START_DELAY = 700;  // wait for page to settle before starting

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const FULL = "Watchwise";

  const [phase, setPhase] = useState<"idle" | "dots" | "typing" | "done">("idle");
  const [activeDot, setActiveDot] = useState<number | null>(null);
  const [locked, setLocked] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [typed, setTyped] = useState("");

  // run id to cancel any in-flight sequence (prevents stacking)
  const runIdRef = useRef(0);

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

  const dots = useMemo(
    () => [
      {
        base: "bg-rose-400/25",
        glow: "bg-rose-500",
        glowShadow: "0 0 0 5px rgba(244,63,94,0.14), 0 0 22px rgba(244,63,94,0.25)",
      },
      {
        base: "bg-amber-300/25",
        glow: "bg-amber-400",
        glowShadow: "0 0 0 5px rgba(251,191,36,0.14), 0 0 22px rgba(251,191,36,0.22)",
      },
      {
        base: "bg-emerald-400/25",
        glow: "bg-emerald-500",
        glowShadow: "0 0 0 5px rgba(16,185,129,0.14), 0 0 22px rgba(16,185,129,0.22)",
      },
    ],
    []
  );

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  // Dot motion variants: dark → glow “rise”
  const dotVariants = {
    idle: {
      opacity: 0.55,
      scale: 1,
      boxShadow: "0 0 0 0 rgba(0,0,0,0)",
      transition: { duration: 0.55, ease: "easeOut" },
    },
    rising: (shadow: string) => ({
      opacity: 1,
      scale: 1.12,
      boxShadow: shadow,
      transition: { duration: RISE_ON / 1000, ease: [0.16, 1, 0.3, 1] },
    }),
    locked: (shadow: string) => ({
      opacity: 1,
      scale: 1.08,
      boxShadow: shadow,
      transition: { duration: 0.5, ease: "easeOut" },
    }),
  };

  async function runSequence(myRunId: number) {
    // Reset to initial: dots visible/dark, no name
    setPhase("idle");
    setActiveDot(null);
    setLocked([false, false, false]);
    setTyped("");

    await sleep(START_DELAY);
    if (runIdRef.current !== myRunId) return;

    setPhase("dots");

    for (let i = 0; i < 3; i++) {
      // Pulse 1: rise → fall
      setActiveDot(i);
      await sleep(RISE_ON);
      if (runIdRef.current !== myRunId) return;

      setActiveDot(null);
      await sleep(FALL_OFF);
      if (runIdRef.current !== myRunId) return;

      await sleep(BETWEEN_PULSES);
      if (runIdRef.current !== myRunId) return;

      // Pulse 2: rise → lock ON
      setActiveDot(i);
      await sleep(RISE_ON);
      if (runIdRef.current !== myRunId) return;

      setActiveDot(null);
      setLocked((prev) => {
        const next: [boolean, boolean, boolean] = [...prev] as any;
        next[i] = true;
        return next;
      });

      await sleep(BETWEEN_DOTS);
      if (runIdRef.current !== myRunId) return;
    }

    // Type name only after all lights are locked ON
    setPhase("typing");

    const perChar = Math.max(90, Math.floor(TYPE_TOTAL / FULL.length));
    for (let c = 1; c <= FULL.length; c++) {
      if (runIdRef.current !== myRunId) return;
      setTyped(FULL.slice(0, c));
      await sleep(perChar);
    }

    setPhase("done");
  }

  // ✅ Replay whenever user returns to homepage
  useEffect(() => {
    if (pathname !== "/") return;

    // increment run id to cancel any previous animation
    runIdRef.current += 1;
    const myRunId = runIdRef.current;

    runSequence(myRunId);

    // cleanup: cancel if route changes mid-animation
    return () => {
      // bumping runId cancels the running async sequence
      runIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "border-b border-slate-200/70",
        "bg-white sm:supports-[backdrop-filter]:bg-white/80 sm:backdrop-blur-xl",
        scrolled ? "sm:bg-white/92" : "",
      ].join(" ")}
    >
      <Container className="flex h-14 items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold tracking-tight text-slate-900"
          aria-label="Watchwise Home"
        >
          {/* Dots: always visible (dark by default), then rise/lock */}
          <span className="inline-flex items-center gap-1.5">
            {dots.map((d, idx) => {
              const isRising = activeDot === idx;
              const isLocked = locked[idx];

              return (
                <motion.span
                  key={idx}
                  custom={d.glowShadow}
                  initial={false}
                  animate={isLocked ? "locked" : isRising ? "rising" : "idle"}
                  variants={dotVariants}
                  className={["h-2.5 w-2.5 rounded-full", isLocked || isRising ? d.glow : d.base].join(" ")}
                  aria-hidden="true"
                />
              );
            })}
          </span>

          {/* Name: hidden until typing begins */}
          <span className="relative min-w-[9ch]">
            <span
              className={
                phase === "idle" || phase === "dots"
                  ? "opacity-0"
                  : "opacity-100 transition-opacity duration-500"
              }
            >
              {typed}
            </span>

            {/* caret while typing */}
            <span
              aria-hidden="true"
              className={[
                "ml-0.5 inline-block h-[1.05em] w-px bg-slate-900/60 align-middle",
                phase === "typing" ? "opacity-100 animate-pulse" : "opacity-0",
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

        {/* Mobile menu */}
        <button
          onClick={() => setOpen(true)}
          className="sm:hidden inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 bg-white hover:bg-slate-50 transition"
          aria-label="Open menu"
        >
          Menu
        </button>
      </Container>

      {/* Mobile drawer */}
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
