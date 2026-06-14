"use client";
// CARD KANBAN — représente un deal dans le tableau kanban.
// useDraggable de @dnd-kit/core rend cette carte glissable.
//
// COMMENT FONCTIONNE @dnd-kit vs HTML5 D&D NATIF :
// ─────────────────────────────────────────────────
// HTML5 natif : l'événement "dragstart" produit un "ghost" opaque non stylisable,
// aucun support tactile, comportement variable selon les navigateurs.
//
// @dnd-kit : le composant reste dans le DOM (pas de ghost),
// une "overlay" optionnelle est rendue dans un Portal séparé,
// les positions sont calculées en JS (PointerEvents → cross-platform, touch inclus),
// l'API est déclarative : tu choisis quoi draguer, où le déposer, comment le styliser.
//
// useDraggable retourne :
//   - attributes : ARIA (accessible keyboard drag & drop)
//   - listeners  : événements onPointerDown etc.
//   - setNodeRef : ref à attacher au DOM node
//   - transform  : {x, y} de déplacement en cours (null si pas en drag)

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { DealStatutBadge } from "./DealStatutBadge";
import type { KanbanDeal } from "@/types/deal.types";

interface Props {
  deal: KanbanDeal;
}

export function DealCard({ deal }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    // data passée à onDragEnd dans KanbanBoard pour connaître le statut source
    data: { statut: deal.statut, dealId: deal.id },
    // ANNULE est irréversible — on désactive le drag sur ces cartes
    disabled: deal.statut === "ANNULE" || deal.statut === "PAYE",
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const unreadCount = deal.messages?.length ?? 0; // messages non lus passés en prop
  const docsCount   = deal.documents?.length ?? 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-[12px] border border-gray-200 p-3 shadow-sm
        ${isDragging ? "opacity-50 shadow-lg ring-2 ring-[#4F6EF7]" : "hover:shadow-md"}
        ${deal.statut === "ANNULE" ? "opacity-60" : "cursor-grab active:cursor-grabbing"}
        transition-shadow`}
    >
      {/* Titre + badge statut */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/deals/${deal.id}`}
          onClick={(e) => e.stopPropagation()} // évite de déclencher le drag au clic
          className="text-sm font-medium text-[#0F1117] hover:text-[#4F6EF7] line-clamp-2"
        >
          {deal.titre}
        </Link>
        {deal.commissionGelee && (
          <span title="Commission gelée" className="text-xs">🔒</span>
        )}
      </div>

      {/* Nom client */}
      <p className="text-xs text-[#6B7280] mb-2">{deal.clientNom}</p>

      {/* Montant + apporteur */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#0F1117]">
          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(deal.montant)}
        </span>
        <span className="text-xs text-[#6B7280]">{deal.apporteur?.nom}</span>
      </div>

      {/* Indicateurs documents + messages */}
      {(docsCount > 0 || unreadCount > 0) && (
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
          {docsCount > 0 && (
            <span className="text-xs text-[#6B7280]">📎 {docsCount}</span>
          )}
          {unreadCount > 0 && (
            <span className="text-xs bg-[#4F6EF7] text-white px-1.5 py-0.5 rounded-full">
              {unreadCount} msg
            </span>
          )}
        </div>
      )}
    </div>
  );
}
