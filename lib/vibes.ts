import { clamp } from "@/lib/text";

export type VibeTag =
  | "satire"
  | "political"
  | "crude"
  | "absurd"
  | "dark"
  | "wholesome"
  | "fast-jokes"
  | "meta"
  | "coming-of-age"
  | "crime"
  | "romance"
  | "sci-fi";

const PATTERNS: Array<{ tag: VibeTag; re: RegExp }> = [
  { tag: "satire", re: /satir|parod|spoof|lampoon/i },
  { tag: "political", re: /politic|election|government|president|senator|war|diplomac/i },
  { tag: "crude", re: /crude|raunch|explicit|profan|vulgar|sex|toilet/i },
  { tag: "absurd", re: /absurd|surreal|bizarre|nonsense|weird/i },
  { tag: "dark", re: /dark|bleak|nihil|grim|murder|death/i },
  { tag: "wholesome", re: /heartwarming|wholesome|family|friendship|uplift/i },
  { tag: "fast-jokes", re: /rapid|fast-paced|quick-witted|one-liner|jokes/i },
  { tag: "meta", re: /self-refer|meta|fourth wall/i },
  { tag: "coming-of-age", re: /coming of age|teen|high school|adolesc/i },
  { tag: "crime", re: /crime|detective|heist|gang|mafia/i },
  { tag: "romance", re: /romance|love story|relationship/i },
  { tag: "sci-fi", re: /space|alien|time travel|dimension|sci-?fi|robot/i },
];

export function extractVibes(text: string): VibeTag[] {
  const found: VibeTag[] = [];
  for (const p of PATTERNS) {
    if (p.re.test(text)) found.push(p.tag);
  }
  return Array.from(new Set(found));
}

export function vibeSimilarity(a: VibeTag[], b: VibeTag[]) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = Array.from(A).filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size || 1;
  return inter / union;
}

export type SliderState = {
  political: number; // -1..1
  crude: number;     // -1..1
  dark: number;      // -1..1
  story: number;     // -1..1 (story vs jokes)
};

export const DEFAULT_SLIDERS: SliderState = {
  political: 0,
  crude: 0,
  dark: 0,
  story: 0,
};

export function scoreWithSliders(candidateVibes: VibeTag[], sliders: SliderState) {
  // Lightweight: push score up if user leans toward a vibe and candidate has it.
  let s = 0;
  const has = (t: VibeTag) => candidateVibes.includes(t);

  s += sliders.political * (has("political") ? 1 : -0.2);
  s += sliders.crude * (has("crude") ? 1 : -0.2);
  s += sliders.dark * (has("dark") ? 1 : -0.2);

  // story slider: if story>0, reward tags associated with story; if <0 reward fast-jokes/absurd.
  if (sliders.story > 0) {
    s += sliders.story * ((has("crime") || has("romance") || has("coming-of-age") || has("sci-fi")) ? 0.8 : -0.1);
  } else if (sliders.story < 0) {
    s += Math.abs(sliders.story) * ((has("fast-jokes") || has("absurd") || has("satire") || has("meta")) ? 0.8 : -0.1);
  }

  return clamp(s, -3, 3);
}

export function explainMatch(seedVibes: VibeTag[], candidateVibes: VibeTag[]) {
  const shared = candidateVibes.filter(v => seedVibes.includes(v)).slice(0, 3);
  const extra = candidateVibes.filter(v => !seedVibes.includes(v)).slice(0, 2);
  return {
    shared,
    extra,
  };
}
