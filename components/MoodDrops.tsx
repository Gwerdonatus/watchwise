"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";

const MOODS = [
  { title: "Edgy Satire", q: "satire political comedy", desc: "Sharp takes, taboo jokes, high signal.", accent: "from-white/10 to-white/0" },
  { title: "Absurd Comedy", q: "absurd comedy", desc: "Surreal energy. Weird in the best way.", accent: "from-white/12 to-white/0" },
  { title: "Dark Laughs", q: "dark comedy", desc: "Bleak themes—funny anyway.", accent: "from-white/10 to-white/0" },
  { title: "Animated Chaos", q: "adult animation comedy", desc: "Cartoons that don’t behave.", accent: "from-white/12 to-white/0" },
];

export function MoodDrops() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Mood drops</h2>
            <p className="mt-2 text-sm text-white/65">Explore curated vibes, Apple-style: one focus at a time.</p>
          </div>
          <Link href="/search?q=trending&type=all" className="text-sm font-semibold text-white/80 hover:text-white">
            Browse trending →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {MOODS.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="relative overflow-hidden rounded-[28px] bg-white/6 ring-1 ring-white/10 shadow-soft"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${m.accent}`} />
              <div className="relative p-6 md:p-7">
                <h3 className="text-xl font-semibold tracking-tight text-white">{m.title}</h3>
                <p className="mt-2 text-sm text-white/70">{m.desc}</p>
                <Link
                  href={`/search?q=${encodeURIComponent(m.q)}&type=all`}
                  className="mt-5 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition"
                >
                  Explore
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
