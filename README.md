# Watchwise

Movie discovery with **vibe tuning** and **explainable recommendations**.

- **Movie-only focus** (no TV noise)
- **Theme search** (e.g. “wedding movies”, “slow-burn romance”)
- **Movie DNA** extraction (genres + keywords + overview)
- **Positive-boost tuning** (select what you want *more* of, then **Apply**)
- **Explainable matches** (“Why this match” per recommendation)
- **Watchlist** saved locally on your device

## Setup

Create `.env.local`:

```bash
TMDB_ACCESS_TOKEN=your_tmdb_v4_read_token
# or: TMDB_API_KEY=your_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Install + run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Notes

This product uses the TMDb API but is not endorsed or certified by TMDb.
# watchwise
