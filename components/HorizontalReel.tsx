"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { tmdbImageUrl } from "@/lib/tmdb-client";
import { Container } from "@/components/ui/Container";

gsap.registerPlugin(ScrollTrigger);

export type ReelItem = {
  id: number;
  media_type: "movie";
  title: string;
  poster_path: string | null;
  year?: string;
};

export function HorizontalReel({ items }: { items: ReelItem[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !pin || !viewport || !track) return;
    if (reduceMotion) return;

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      mm.add("(min-width: 768px)", () => {
        // Ensure clean state
        gsap.set(track, { x: 0, clearProps: "transform" });

        const getDistance = () => {
          // how far we need to move the track to reveal everything
          const distance = track.scrollWidth - viewport.clientWidth;
          return Math.max(0, distance);
        };

        const setHeights = () => {
          // Give the pinned area a predictable height so it doesn't "eat" the page
          // Adjust values to taste
          pin.style.height = "520px"; // desktop pin height
        };

        setHeights();

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            id: "watchwise-reel",
            trigger: pin,
            start: "top top",
            end: () => `+=${Math.max(1, getDistance())}`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // IMPORTANT: do NOT use pinReparent unless you really need it
            // pinReparent can cause layout weirdness if containers are complex
          },
        });

        const st = tween.scrollTrigger;

        const refresh = () => {
          // If there's nothing to scroll, disable pinning
          const d = getDistance();
          if (!st) return;

          // Toggle pin based on usefulnessnn
          st.vars.pin = d > 80;
          st.refresh();
        };

        // ResizeObserver: keep it stable
        const ro = new ResizeObserver(() => ScrollTrigger.refresh());
        ro.observe(viewport);
        ro.observe(track);

        // Refresh after images load (poster widths affect scrollWidth)
        const imgs = Array.from(track.querySelectorAll("img"));
        const onImgLoad = () => ScrollTrigger.refresh();
        imgs.forEach((img) => img.addEventListener("load", onImgLoad, { once: true }));

        // Initial sanity refresh
        refresh();

        return () => {
          ro.disconnect();
          st?.kill(true);
          tween.kill();
          gsap.set(track, { clearProps: "transform" });
          pin.style.height = "";
        };
      });

      // Mobile: native scroll
      mm.add("(max-width: 767px)", () => {
        gsap.set(track, { clearProps: "transform" });
        if (pin) pin.style.height = "";
        ScrollTrigger.getById("watchwise-reel")?.kill(true);
        return () => {
          gsap.set(track, { clearProps: "transform" });
        };
      });
    }, section);

    return () => {
      mm.revert();
      ctx.revert();
      ScrollTrigger.getById("watchwise-reel")?.kill(true);
    };
  }, [items, reduceMotion]);

  return (
    <section ref={sectionRef} className="py-12 md:py-20">
      <Container>
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Trending Reel
          </h2>
          <p className="mt-2 text-sm text-slate-600">Scroll on desktop. Swipe on mobile.</p>
        </div>
      </Container>

      {/* Pinned wrapper */}
      <div ref={pinRef} className="relative">
        {/* Viewport */}
        <div
          ref={viewportRef}
          className="relative overflow-hidden"
        >
          {/* Track (the ONLY thing that moves on desktop) */}
          <div
            ref={trackRef}
            className="
              flex gap-4 px-5 md:px-8 will-change-transform
              overflow-x-auto md:overflow-visible
              scrollbar-none snap-x snap-mandatory
              py-1
            "
          >
            {items.map((it) => (
              <Link
                key={it.id}
                href={`/m/${it.id}`}
                className="group relative w-[150px] sm:w-[170px] md:w-[190px] shrink-0 snap-start"
              >
                <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-soft transition-all duration-300 group-hover:shadow-glass group-hover:-translate-y-0.5">
                  {it.poster_path ? (
                    <Image
                      src={tmdbImageUrl(it.poster_path, "w500")!}
                      alt={it.title}
                      width={380}
                      height={570}
                      className="h-auto w-full object-cover"
                      priority={false}
                    />
                  ) : (
                    <div className="aspect-[2/3] w-full bg-slate-100" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-3">
                    <div className="text-sm font-semibold text-white leading-tight line-clamp-2">
                      {it.title}
                    </div>
                    {it.year && <div className="text-xs text-white/70">{it.year}</div>}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}
