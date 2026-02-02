import Link from "next/link";
import { Container } from "@/components/ui/Container";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/credits", label: "Credits / Attribution" },
  { href: "/watchlist", label: "Watchlist" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-slate-200/70 bg-white overflow-hidden">
      {/* Background layers: glow + net + top highlight */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Base wash (keeps it premium and clean) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50/60" />

        {/* Accent glows (small touch, matches header dots) */}
        <div className="absolute -top-24 right-[-10%] h-[520px] w-[520px] rounded-full bg-emerald-400/14 blur-3xl" />
        <div className="absolute top-10 right-[22%] h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute -top-10 left-[6%] h-[360px] w-[360px] rounded-full bg-rose-400/10 blur-3xl" />

        {/* Soft sheet gradient on the "net side" */}
        <div className="absolute inset-y-0 right-0 w-[58%] bg-gradient-to-l from-emerald-200/20 via-emerald-100/8 to-transparent" />

        {/* Visible net (stronger on right, fades left) */}
        <div className="absolute inset-0 ww-footer-net" />

        {/* top hairline */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
      </div>

      <Container className="relative py-12">
        <div className="grid gap-10 md:grid-cols-3 md:items-start">
          {/* Brand */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {/* Mini traffic dots to match header branding */}
              <span className="inline-flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              </span>

              <div className="text-sm font-semibold tracking-tight text-slate-900">
                Watchwise
              </div>
            </div>

            <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-600">
              Movie discovery with vibe tuning and explainable recommendations—so you can pick the next film faster and with confidence.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 shadow-soft">
                Vibe-first
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 shadow-soft">
                Explainable
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 shadow-soft">
                Fast UX
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="text-xs font-semibold text-slate-900">Explore</div>
            <div className="mt-3 grid gap-2">
              {FOOTER_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-slate-600 hover:text-slate-900 transition"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal / attribution */}
          <div className="md:text-right">
            <div className="text-xs font-semibold text-slate-900">Data</div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Built with TMDb data (not endorsed or certified by TMDb).
            </p>

            <div className="mt-4 inline-flex items-center justify-end gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
              Updated daily
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">© {year} Watchwise. All rights reserved.</div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="hover:text-slate-700 transition cursor-default">Privacy</span>
            <span className="hover:text-slate-700 transition cursor-default">Terms</span>
            <span className="hover:text-slate-700 transition cursor-default">Contact</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
