// PAGE /clients — Vue admin
//
// SERVER COMPONENT : s'exécute côté serveur, récupère les données Prisma directement.
// Même pattern que app/contrats/page.tsx.

import { getInvitations } from "@/lib/actions/client.actions";
import { prisma } from "@/lib/prisma";
import { ClientTable } from "@/components/clients/ClientTable";
import type { InvitationWithDeal } from "@/types/client.types";

export const metadata = { title: "Espace Client — OPUS" };

export default async function ClientsPage() {
  // Charger les invitations et la liste des deals en parallèle.
  // Promise.all = équivalent de deux requêtes SQL lancées en même temps (plus rapide que séquentiel).
  const [invitations, deals] = await Promise.all([
    getInvitations(),
    prisma.kanbanDeal.findMany({
      select: { id: true, titre: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1117]">Espace Client</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Vue admin · {invitations.length} invitation{invitations.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ClientTable est un Client Component — il reçoit les données du serveur via props
          et gère les interactions (filtres, modal, timeline) côté navigateur. */}
      <ClientTable
        invitations={invitations as unknown as InvitationWithDeal[]}
        deals={deals}
      />
    </div>
  );
}
