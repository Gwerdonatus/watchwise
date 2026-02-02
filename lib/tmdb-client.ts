// Client-safe TMDb helpers (NO server-only imports here)

export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w342" | "w500" | "w780" | "original" = "w500"
) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
