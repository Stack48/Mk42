"use client";

import { useState, useTransition, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { updateDealPosition } from "@/lib/actions/deal.actions";
import { isTransitionDealValide } from "@/lib/deal.utils";
import { KanbanColumn } from "./KanbanColumn";
import { DealCard } from "./DealCard";
import { CreateDealModal } from "./CreateDealModal";
import { KANBAN_STATUTS } from "@/types/deal.types";
import type { KanbanDeal, KanbanDealStatut } from "@/types/deal.types";

type Apporteur = { id: string; nom: string };
type LastMove  = { dealId: string; fromStatut: KanbanDealStatut; toStatut: KanbanDealStatut; dealTitre: string };
type FeedbackState =
  | { type: "undo"; move: LastMove }
  | { type: "error"; message: string }
  | null;

interface Props {
  initialDeals: Record<KanbanDealStatut, KanbanDeal[]>;
  apporteurs:   Apporteur[];
}

const STATUT_LABELS: Record<KanbanDealStatut, string> = {
  PROSPECT: "Prospect",
  CONTACTE: "Contacté",
  NEGOCIE:  "Négocié",
  SIGNE:    "Signé",
  PAYE:     "Payé",
  ANNULE:   "Annulé",
};

export function KanbanBoard({ initialDeals, apporteurs }: Props) {
  const [deals, setDeals]           = useState(initialDeals);
  const [activeCard, setActiveCard] = useState<KanbanDeal | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [feedback, setFeedback]     = useState<FeedbackState>(null);
  const [, startTransition]         = useTransition();
  const feedbackTimer               = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function showFeedback(state: FeedbackState, duration = 5000) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(state);
    if (duration > 0) {
      feedbackTimer.current = setTimeout(() => setFeedback(null), duration);
    }
  }

  function findDeal(dealId: string): KanbanDeal | undefined {
    for (const col of Object.values(deals)) {
      const found = col.find((d) => d.id === dealId);
      if (found) return found;
    }
  }

  function handleDragStart({ active }: { active: { id: string } }) {
    setActiveCard(findDeal(active.id) ?? null);
    setFeedback(null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);
    if (!over) return;

    const dealId       = active.id as string;
    const targetStatut = over.id as KanbanDealStatut;
    const deal         = findDeal(dealId);
    if (!deal || deal.statut === targetStatut) return;

    if (!isTransitionDealValide(deal.statut, targetStatut)) {
      showFeedback({
        type: "error",
        message: `Impossible de passer de ${STATUT_LABELS[deal.statut]} à ${STATUT_LABELS[targetStatut]}.`,
      }, 4000);
      return;
    }

    const fromStatut  = deal.statut;
    const newPosition = deals[targetStatut].length;

    setDeals((prev) => {
      const updated = { ...prev };
      updated[fromStatut]   = prev[fromStatut].filter((d) => d.id !== dealId);
      updated[targetStatut] = [...prev[targetStatut], { ...deal, statut: targetStatut }];
      return updated;
    });

    showFeedback({ type: "undo", move: { dealId, fromStatut, toStatut: targetStatut, dealTitre: deal.titre } });

    startTransition(async () => {
      const res = await updateDealPosition(dealId, newPosition, targetStatut);
      if (!res.success) {
        setDeals(initialDeals);
        showFeedback({ type: "error", message: res.error ?? "Erreur lors du déplacement." }, 4000);
      }
    });
  }

  function handleUndo() {
    if (feedback?.type !== "undo") return;
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    const { dealId, fromStatut, toStatut } = feedback.move;
    setFeedback(null);

    setDeals((prev) => {
      const deal = prev[toStatut].find((d) => d.id === dealId);
      if (!deal) return prev;
      const updated = { ...prev };
      updated[toStatut]   = prev[toStatut].filter((d) => d.id !== dealId);
      updated[fromStatut] = [...prev[fromStatut], { ...deal, statut: fromStatut }];
      return updated;
    });

    startTransition(async () => {
      await updateDealPosition(dealId, 999, fromStatut);
    });
  }

  return (
    <div className="space-y-3">
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">
          {Object.values(deals).flat().length} deal(s) au total
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm font-medium bg-[#4F6EF7] text-white rounded-lg hover:bg-[#3B55D9] transition-colors"
        >
          + Nouveau deal
        </button>
      </div>

      {/* Bandeau de feedback inline — undo ou erreur */}
      {feedback && (
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm ${
          feedback.type === "undo"
            ? "bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE]"
            : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
        }`}>
          {feedback.type === "undo" ? (
            <>
              <span>
                <strong>{feedback.move.dealTitre}</strong> déplacé vers{" "}
                <strong>{STATUT_LABELS[feedback.move.toStatut]}</strong>
              </span>
              <button
                onClick={handleUndo}
                className="ml-4 font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                ↩ Annuler
              </button>
            </>
          ) : (
            <>
              <span>{feedback.message}</span>
              <button
                onClick={() => setFeedback(null)}
                className="ml-4 font-semibold hover:opacity-70 transition-opacity"
              >
                ✕
              </button>
            </>
          )}
        </div>
      )}

      {/* Tableau kanban */}
      <DndContext id="kanban-dnd" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_STATUTS.map((statut) => (
            <KanbanColumn key={statut} statut={statut} deals={deals[statut]} />
          ))}
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="rotate-2 opacity-90">
              <DealCard deal={activeCard} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {showModal && (
        <CreateDealModal apporteurs={apporteurs} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
