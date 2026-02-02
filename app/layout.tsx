import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RouteChangeCleanup } from "@/components/RouteChangeCleanup";

export const metadata: Metadata = {
  title: "Watchwise",
  description: "Movie discovery with vibe tuning and explainable recommendations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="ww-bg text-slate-900 antialiased">
        <RouteChangeCleanup />
        <Nav />

        {/* Reserve space for the fixed header */}
        <main className="relative pt-[var(--header-h)]">
          {children}
        </main>

        {/* Universal footer */}
        <Footer />
      </body>
    </html>
  );
}
