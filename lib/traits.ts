import "server-only";

/**
 * Human-friendly trait vocabulary.
 *
 * IMPORTANT: traits are intentionally phrased in plain language so the UI is intuitive.
 * Internally we use `id` as a stable key.
 */
export type TraitId =
  | "romance"
  | "tragic"
  | "tearjerker"
  | "survival"
  | "disaster"
  | "historical"
  | "political"
  | "satire"
  | "offensive-humor"
  | "dark-humor"
  | "wholesome"
  | "cynical"
  | "absurd"
  | "chaotic-characters"
  | "character-driven"
  | "fast-paced"
  | "slow-burn"
  | "action"
  | "crime"
  | "mystery"
  | "thriller"
  | "horror"
  | "sci-fi"
  | "fantasy"
  | "family"
  | "friendship"
  | "coming-of-age";

export type Trait = {
  id: TraitId;
  label: string;
  group:
    | "humor"
    | "tone"
    | "story"
    | "emotion"
    | "theme"
    | "genre";
};

export const TRAITS: Record<TraitId, Trait> = {
  romance: { id: "romance", label: "Romance", group: "emotion" },
  tragic: { id: "tragic", label: "Tragic", group: "emotion" },
  tearjerker: { id: "tearjerker", label: "Emotional / tearjerker", group: "emotion" },
  survival: { id: "survival", label: "Survival", group: "theme" },
  disaster: { id: "disaster", label: "Disaster", group: "theme" },
  historical: { id: "historical", label: "Historical / period", group: "theme" },
  political: { id: "political", label: "Political", group: "theme" },
  satire: { id: "satire", label: "Satire / social commentary", group: "humor" },
  "offensive-humor": { id: "offensive-humor", label: "Offensive humor", group: "humor" },
  "dark-humor": { id: "dark-humor", label: "Dark humor", group: "humor" },
  wholesome: { id: "wholesome", label: "Wholesome", group: "tone" },
  cynical: { id: "cynical", label: "Cynical", group: "tone" },
  absurd: { id: "absurd", label: "Absurd", group: "tone" },
  "chaotic-characters": { id: "chaotic-characters", label: "Chaotic characters", group: "story" },
  "character-driven": { id: "character-driven", label: "Character-driven", group: "story" },
  "fast-paced": { id: "fast-paced", label: "Fast-paced", group: "story" },
  "slow-burn": { id: "slow-burn", label: "Slow-burn", group: "story" },
  action: { id: "action", label: "Action", group: "genre" },
  crime: { id: "crime", label: "Crime", group: "genre" },
  mystery: { id: "mystery", label: "Mystery", group: "genre" },
  thriller: { id: "thriller", label: "Thriller", group: "genre" },
  horror: { id: "horror", label: "Horror", group: "genre" },
  "sci-fi": { id: "sci-fi", label: "Sci‑Fi", group: "genre" },
  fantasy: { id: "fantasy", label: "Fantasy", group: "genre" },
  family: { id: "family", label: "Family", group: "theme" },
  friendship: { id: "friendship", label: "Friendship", group: "theme" },
  "coming-of-age": { id: "coming-of-age", label: "Coming of age", group: "theme" },
};

type SeedSignals = {
  genres: string[];
  keywords: string[];
  overview: string;
  runtime?: number | null;
};

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Very lightweight heuristic extraction.
 * This is intentionally deterministic and explainable.
 *
 * We can later swap / augment this with an embeddings model, but this gets you to a working MVP.
 */
export function extractTraitScores(sig: SeedSignals): Map<TraitId, number> {
  const scores = new Map<TraitId, number>();
  const add = (id: TraitId, inc: number) => scores.set(id, (scores.get(id) ?? 0) + inc);

  const genres = sig.genres.map(norm);
  const keywords = sig.keywords.map(norm);
  const overview = norm(sig.overview ?? "");

  const all = [overview, ...genres, ...keywords].join(" ");

  // Genre mapping (stable)
  for (const g of genres) {
    if (g.includes("romance")) add("romance", 3);
    if (g.includes("drama")) add("tearjerker", 1);
    if (g.includes("comedy")) add("wholesome", 0.5);
    if (g.includes("thriller")) add("thriller", 2);
    if (g.includes("mystery")) add("mystery", 2);
    if (g.includes("crime")) add("crime", 2);
    if (g.includes("action")) add("action", 2);
    if (g.includes("horror")) add("horror", 2);
    if (g.includes("science fiction") || g.includes("sci fi") || g.includes("sci-fi")) add("sci-fi", 2);
    if (g.includes("fantasy")) add("fantasy", 2);
    if (g.includes("history")) add("historical", 2);
    if (g.includes("war")) add("historical", 1);
  }

  // Keyword/theme mapping (dominant)
  const KEYWORD_RULES: Array<[RegExp, TraitId, number]> = [
    [/\b(wedding|marriage|bride|groom|honeymoon)\b/i, "romance", 2],
    [/\b(love|romance|romantic|relationship|affair)\b/i, "romance", 2],
    [/\b(tragedy|tragic|death|dying|terminal|grief|mourning)\b/i, "tragic", 2],
    [/\b(tearjerker|heartbreak|emotional|weeping|cry)\b/i, "tearjerker", 2],
    [/\b(survive|survival|rescued|escape|stranded)\b/i, "survival", 2],
    [/\b(disaster|shipwreck|titanic|earthquake|tsunami|plane crash|explosion)\b/i, "disaster", 2],
    [/\b(period|victorian|medieval|ancient|historical|based on true|biopic)\b/i, "historical", 2],
    [/\b(politic|election|government|president|senate|minister|regime)\b/i, "political", 2],
    [/\b(satire|satirical|parody|spoof|social commentary)\b/i, "satire", 2],
    [/\b(profanity|vulgar|crude|raunchy|explicit|obscene)\b/i, "offensive-humor", 2],
    [/\b(dark comedy|black comedy|gallows humor)\b/i, "dark-humor", 2],
    [/\b(cynic|nihil|bleak|pessimis)\b/i, "cynical", 2],
    [/\b(absurd|surreal|nonsense|weird|bizarre)\b/i, "absurd", 2],
    [/\b(chaos|chaotic|anarchy|mayhem)\b/i, "chaotic-characters", 1.5],
    [/\b(character study|character-driven|relationships)\b/i, "character-driven", 1.5],
    [/\b(chase|heist|race against time|mission)\b/i, "fast-paced", 1.5],
    [/\b(slow burn|slow-burn)\b/i, "slow-burn", 2],
    [/\b(family)\b/i, "family", 1.2],
    [/\b(friendship|friends)\b/i, "friendship", 1.2],
    [/\b(teen|high school|coming of age)\b/i, "coming-of-age", 1.2],
  ];

  for (const [re, id, inc] of KEYWORD_RULES) {
    if (re.test(all)) add(id, inc);
  }

  // Runtime hints
  const rt = sig.runtime ?? null;
  if (typeof rt === "number") {
    if (rt >= 140) add("slow-burn", 0.8);
    if (rt <= 95) add("fast-paced", 0.5);
  }

  return scores;
}

export function topTraits(scores: Map<TraitId, number>, max = 8): TraitId[] {
  return Array.from(scores.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([k]) => k);
}

export type TuneSlider = {
  id: string;
  leftLabel: string;
  rightLabel: string;
  leftTrait: TraitId;
  rightTrait: TraitId;
  defaultValue: number; // 0..100
};

export type TunePack = {
  basedOn: TraitId[];
  boosts: TraitId[];
  slider?: TuneSlider;
};

export function buildTunePack(sig: SeedSignals): TunePack {
  const scores = extractTraitScores(sig);
  const basedOn = topTraits(scores, 5);

  // Boost options: top traits + a few related expansions (still movie-specific)
  const boosts = topTraits(scores, 10);

  const has = (t: TraitId) => (scores.get(t) ?? 0) > 0;

  let slider: TuneSlider | undefined;
  if (has("romance") && (has("survival") || has("disaster"))) {
    slider = {
      id: "romance-vs-survival",
      leftLabel: "More romance",
      rightLabel: "More survival",
      leftTrait: "romance",
      rightTrait: has("survival") ? "survival" : "disaster",
      defaultValue: 50,
    };
  } else if (has("offensive-humor") && has("satire")) {
    slider = {
      id: "offensive-vs-satire",
      leftLabel: "More offensive",
      rightLabel: "More satire",
      leftTrait: "offensive-humor",
      rightTrait: "satire",
      defaultValue: 50,
    };
  } else if (has("action") && has("romance")) {
    slider = {
      id: "action-vs-romance",
      leftLabel: "More action",
      rightLabel: "More romance",
      leftTrait: "action",
      rightTrait: "romance",
      defaultValue: 50,
    };
  } else if (has("horror") && has("mystery")) {
    slider = {
      id: "horror-vs-mystery",
      leftLabel: "More horror",
      rightLabel: "More mystery",
      leftTrait: "horror",
      rightTrait: "mystery",
      defaultValue: 50,
    };
  }

  return { basedOn, boosts, slider };
}
