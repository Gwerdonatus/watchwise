import { Container } from "@/components/ui/Container";
import { WatchlistClient } from "@/components/WatchlistClient";

export default function WatchlistPage() {
  return (
    <Container className="py-10 md:py-14">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Your Watchlist</h1>
        <p className="mt-3 text-sm md:text-base text-slate-600">
          Saved locally on this device. Add movies from any results list.
        </p>
      </div>
      <div className="mt-8">
        <WatchlistClient />
      </div>
    </Container>
  );
}
