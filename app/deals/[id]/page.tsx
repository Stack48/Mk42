// PAGE /deals/[id] — Détail d'un deal : infos + documents + chat
// SERVER COMPONENT : charge les données côté serveur.

import { notFound } from "next/navigation";
// ↑ notFound() de Next.js rend la page 404 intégrée.
// Équivalent d'un throw $this->createNotFoundException() en Symfony.

import { getDeal } from "@/lib/actions/deal.actions";
import { DealDetail } from "@/components/deals/DealDetail";
import type { KanbanDeal } from "@/types/deal.types";

interface Props {
  params: { id: string };
}

export default async function DealDetailPage({ params }: Props) {
  const deal = await getDeal(params.id);

  if (!deal) notFound();

  return (
    <div className="space-y-4">
      {/* Fil d'Ariane */}
      <nav className="text-sm text-[#6B7280]">
        <a href="/deals" className="hover:text-[#4F6EF7]">Pipeline</a>
        <span className="mx-2">›</span>
        <span className="text-[#0F1117]">{deal.titre}</span>
      </nav>

      <DealDetail deal={deal as unknown as KanbanDeal} />
    </div>
  );
}
