import { Container } from "@/components/ui/Container";

export default function CreditsPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Credits</h1>

      <div className="mt-6 rounded-[28px] bg-white/75 p-6 ring-1 ring-slate-200/70 shadow-soft">
        <p className="text-sm text-slate-600">
          Watchwise uses the TMDb API but is not endorsed or certified by TMDb.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Learn more at{" "}
          <a className="underline underline-offset-4 hover:text-slate-900" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            themoviedb.org
          </a>
          .
        </p>
      </div>

      <div className="mt-10 rounded-[28px] bg-white/75 p-6 ring-1 ring-slate-200/70 shadow-soft">
        <div className="text-sm font-semibold text-slate-900">Open-source libraries</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Next.js</li>
          <li>Tailwind CSS</li>
          <li>Framer Motion</li>
          <li>GSAP + ScrollTrigger</li>
        </ul>
      </div>
    </Container>
  );
}
