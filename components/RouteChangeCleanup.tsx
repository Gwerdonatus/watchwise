"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensures GSAP/ScrollTrigger doesn't leave pinned DOM wrappers around during
// Next.js route transitions (a common cause of `removeChild` DOM errors).

gsap.registerPlugin(ScrollTrigger);

export function RouteChangeCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    // On every route change, aggressively kill triggers and clear transforms.
    // This keeps React/Next from unmounting nodes that GSAP has re-parented.
    try {
      ScrollTrigger.getAll().forEach((t) => t.kill(true));
      // Clear any queued GSAP animations.
      gsap.globalTimeline.clear();
      // Helps avoid scroll restoration weirdness with pinned sections.
      ScrollTrigger.clearScrollMemory();
    } catch {
      // no-op
    }

    // Also kill triggers right before unload (hard refresh / close tab).
    const onBeforeUnload = () => {
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill(true));
        gsap.globalTimeline.clear();
      } catch {
        // no-op
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [pathname]);

  return null;
}
