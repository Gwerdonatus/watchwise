export function normalizeQuery(q: string) {
  return q
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}\s:'"-]/gu, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function stripStopWords(q: string) {
  const stop = new Set(["the","a","an","and","or","of","to","in","on","for","episode","season"]);
  return q
    .split(" ")
    .filter(t => t && !stop.has(t))
    .join(" ");
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
