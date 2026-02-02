import { Container } from "@/components/ui/Container";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <Container className="py-12 md:py-16">
      {/* Page header */}
      <header className="relative overflow-hidden rounded-[32px] bg-white ring-1 ring-slate-200/70 shadow-soft">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-slate-100 blur-2xl opacity-70" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-slate-100 blur-2xl opacity-70" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent" />
        </div>

        <div className="relative px-6 py-10 md:px-10 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900/80" />
                Movie discovery, vibe-first
              </div>

              <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                About Watchwise
              </h1>

              <p className="mt-4 max-w-3xl text-sm md:text-base text-slate-600">
                Watchwise is a movie discovery experience built around{" "}
                <span className="text-slate-900 font-semibold">vibes</span>—tone,
                story energy, and emotional feel. Instead of only “same genre,”
                Watchwise explains{" "}
                <span className="text-slate-900 font-semibold">why</span>{" "}
                something matches, so you can trust the recommendations.
              </p>
            </div>

            {/* Mini stat chips */}
            <div className="grid grid-cols-2 gap-3 md:w-[360px]">
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/70 shadow-soft">
                <div className="text-xs font-semibold text-slate-700">Focus</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  Movies only
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/70 shadow-soft">
                <div className="text-xs font-semibold text-slate-700">Style</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  Explainable
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature cards */}
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="group relative overflow-hidden rounded-[28px] bg-white p-6 ring-1 ring-slate-200/70 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glass">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div className="absolute -top-24 -right-24 h-60 w-60 rounded-full bg-slate-100 blur-2xl" />
          </div>

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Movie-only, by design
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Watchwise is focused on films—no TV noise—so you get clearer,
                more accurate results and better tuning.
              </p>
            </div>

            {/* Tailwind-only float using arbitrary animation */}
            <div
              className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200 [animation:floaty_4.5s_ease-in-out_infinite]"
              aria-hidden="true"
            >
              <span className="text-slate-900 text-sm">🎬</span>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[28px] bg-white p-6 ring-1 ring-slate-200/70 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glass">
          <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div className="absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-slate-100 blur-2xl" />
          </div>

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Explainable recommendations
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Each result includes the “why”: shared themes, shared genres, and
                vibe alignment based on your tuning.
              </p>
            </div>

            <div
              className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200 [animation:floaty_5.2s_ease-in-out_infinite]"
              aria-hidden="true"
            >
              <span className="text-slate-900 text-sm">✨</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-10 relative overflow-hidden rounded-[28px] bg-white p-6 ring-1 ring-slate-200/70 shadow-soft">
        {/* shimmer line (Tailwind arbitrary animation) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-40">
          <div className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-slate-200/70 to-transparent [animation:shimmer_4.2s_ease-in-out_infinite]" />
        </div>

        <div className="relative">
          <div className="text-sm font-semibold text-slate-900">
            How recommendations work
          </div>

          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              "We start with TMDb discovery + similar movie candidates.",
              "We extract lightweight vibe tags (tone + energy) from descriptions.",
              "We re-rank results with a scoring pipeline that respects your sliders.",
              "We show the match breakdown so you can see what’s driving each pick.",
            ].map((item, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Founder */}
      <section className="mt-10 rounded-[28px] bg-white p-6 ring-1 ring-slate-200/70 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Small rounded profile photo */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200/70 bg-slate-100">
            <Image
              src="/founder/founder.jpeg"
              alt="Founder"
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-slate-900">
                About the founder
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                Building for taste + emotion
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              Watchwise was built by a founder obsessed with one simple problem:
              picking the next movie shouldn’t be hard. Most “similar titles”
              features are genre-first and often miss the emotional core of a
              film—like the romance and tragedy that makes{" "}
              <span className="font-semibold text-slate-900">Titanic</span> hit
              so hard. Watchwise exists to make discovery feel human: tune what
              you care about, see why it matches, and land on a great movie
              faster.
            </p>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:shadow-glass transition active:scale-[0.99]"
        >
          Back to Home
        </Link>

        <Link
          href="/credits"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition active:scale-[0.99]"
        >
          Credits / Attribution
        </Link>
      </div>

      {/* Keyframes for the arbitrary animations above */}
      <div className="sr-only">
        {/* This is just to keep the keyframes in CSS via global stylesheet. */}
      </div>
    </Container>
  );
}
