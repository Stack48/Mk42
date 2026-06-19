// PAGE /deals — Vue Kanban principale
// SERVER COMPONENT : charge les données puis passe au Client Component KanbanBoard.

import { getDealsByStatut } from "@/lib/actions/deal.actions";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/deals/KanbanBoard";
import type { KanbanDeal, KanbanDealStatut } from "@/types/deal.types";

export const metadata = { title: "Pipeline Deals — OPUS" };

export default async function DealsPage() {
  const [dealsByStatut, apporteurs] = await Promise.all([
    getDealsByStatut(),
    prisma.apporteur.findMany({
      select: { id: true, nom: true },
      orderBy: { nom: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1117]">Pipeline Deals</h1>
        <p className="text-sm text-[#6B7280] mt-1">Kanban · Glisser-déposer pour changer le statut</p>
      </div>

      <KanbanBoard
        initialDeals={dealsByStatut as unknown as Record<KanbanDealStatut, KanbanDeal[]>}
        apporteurs={apporteurs}
      />
    </div>
  );
}
