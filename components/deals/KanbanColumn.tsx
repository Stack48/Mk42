"use client";
// COLONNE KANBAN — zone de dépôt pour les cartes deal.
// useDroppable de @dnd-kit/core rend cette zone "déposable".
// isOver = true quand une carte survole cette colonne → highlight visuel.

import { useDroppable } from "@dnd-kit/core";
import { DealCard } from "./DealCard";
import { KANBAN_COLUMN_STYLES } from "@/types/deal.types";
import type { KanbanDeal, KanbanDealStatut } from "@/types/deal.types";

interface Props {
  statut: KanbanDealStatut;
  deals:  KanbanDeal[];
}

export function KanbanColumn({ statut, deals }: Props) {
  // useDroppable : enregistre cette colonne comme zone de dépôt auprès de DndContext.
  // id = identifiant unique de la zone → utilisé dans onDragEnd pour savoir où on dépose.
  // isOver = true quand une carte draggée est au-dessus de cette colonne.
  const { setNodeRef, isOver } = useDroppable({ id: statut });

  const { headerBg, label } = KANBAN_COLUMN_STYLES[statut];

  return (
    <div className="flex flex-col w-64 flex-shrink-0">
      {/* En-tête de colonne */}
      <div
        style={{ backgroundColor: headerBg }}
        className="rounded-t-[12px] px-3 py-2 flex items-center justify-between"
      >
        <span className="text-sm font-semibold text-[#0F1117]">{label}</span>
        <span className="text-xs text-[#6B7280] bg-white/60 px-2 py-0.5 rounded-full">
          {deals.length}
        </span>
      </div>

      {/* Zone de dépôt : isOver → fond bleu pâle pour indiquer l'emplacement */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-32 p-2 space-y-2 rounded-b-[12px] border border-t-0 border-gray-200 transition-colors ${
          isOver ? "bg-[#EEF2FF]" : "bg-[#F8F9FF]"
        }`}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}

        {deals.length === 0 && (
          <p className="text-xs text-[#9CA3AF] text-center py-4">
            Aucun deal
          </p>
        )}
      </div>
    </div>
  );
}
