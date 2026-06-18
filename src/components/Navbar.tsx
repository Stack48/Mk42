// NAVBAR OPUS — Server Component (async depuis [18-FE])
// async permet d'appeler Prisma directement pour le userId de la cloche.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUnreadCount } from "@/lib/actions/notification.actions";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export async function Navbar() {
  // Récupérer le premier apporteur pour la démo (sans auth, on utilise Jean par défaut).
  // En production avec auth, remplacer par getServerSession() ou équivalent.
  const demoUser = await prisma.apporteur.findFirst({ orderBy: { createdAt: "asc" } });
  const initialCount = demoUser ? await getUnreadCount(demoUser.id) : 0;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-[#4F6EF7]">
            OPUS
          </Link>

          {/* Liens nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/deals" className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors">
              Pipeline
            </Link>
            <Link href="/contrats" className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors">
              Contrats
            </Link>
            <Link href="/clients" className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors">
              Clients
            </Link>
            <Link href="/commissions" className="text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors">
              Commissions
            </Link>
          </div>

          {/* Cloche notifications [18-FE] */}
          {demoUser && (
            <NotificationBell userId={demoUser.id} initialCount={initialCount} />
          )}

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
