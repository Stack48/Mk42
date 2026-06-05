// NAVBAR OPUS — Server Component
// Rendu côté serveur → HTML statique, zéro JS client.

import Link from "next/link";
// Link de Next.js = <a> intelligent : précharge la page au hover,
// navigation sans rechargement complet (SPA-like).

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-[#4F6EF7]">
            OPUS
          </Link>

          {/* Liens nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/commissions"
              className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors"
            >
              Commissions
            </Link>
            <Link
              href="/commissions/dashboard"
              className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors"
            >
              Dashboard ROI
            </Link>
          </div>

          {/* CTA */}
          <Link
            href="#demo"
            className="bg-[#4F6EF7] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#3B55D9] transition-colors"
          >
            Démo Gratuite
          </Link>
        </div>
      </div>
    </nav>
  );
}
