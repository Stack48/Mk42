"use client";
// VUE DÉTAIL DEAL — layout deux colonnes : infos/documents | chat
// useTransition pour les changements de statut.

import { useState, useTransition } from "react";
import { updateDealStatut } from "@/lib/actions/deal.actions";
import { isTransitionDealValide } from "@/lib/deal.utils";
import { DealStatutBadge } from "./DealStatutBadge";
import { DealDocuments } from "./DealDocuments";
import { DealChat } from "./DealChat";
import { KANBAN_STATUTS } from "@/types/deal.types";
import type { KanbanDeal, KanbanDealStatut } from "@/types/deal.types";

interface Props {
  deal: KanbanDeal;
}

export function DealDetail({ deal }: Props) {
  const [statut, setStatut]       = useState<KanbanDealStatut>(deal.statut);
  const [isPending, startTransition] = useTransition();
  const [error, setError]         = useState<string | null>(null);

  // Boutons de transition : uniquement les transitions autorisées depuis le statut courant
  const transitionsDisponibles = KANBAN_STATUTS.filter(
    (s) => s !== statut && isTransitionDealValide(statut, s)
  );

  function handleChangeStatut(newStatut: KanbanDealStatut) {
    startTransition(async () => {
      const res = await updateDealStatut(deal.id, newStatut);
      if (res.success) {
        setStatut(newStatut);
        setError(null);
      } else {
        setError(res.error ?? "Erreur inconnue.");
      }
    });
  }

  const STATUT_BTN_STYLE: Record<KanbanDealStatut, string> = {
    PROSPECT: "bg-[#F3F4F6] text-[#374151] hover:bg-gray-200",
    CONTACTE: "bg-[#DBEAFE] text-[#1D4ED8] hover:bg-blue-200",
    NEGOCIE:  "bg-[#FEF3C7] text-[#92400E] hover:bg-amber-200",
    SIGNE:    "bg-[#D1FAE5] text-[#059669] hover:bg-green-200",
    PAYE:     "bg-[#A7F3D0] text-[#065F46] hover:bg-emerald-200",
    ANNULE:   "bg-[#FEE2E2] text-[#DC2626] hover:bg-red-200",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      {/* ── Colonne gauche : infos + documents (3/5) ── */}
      <div className="lg:col-span-3 space-y-6">

        {/* En-tête */}
        <div className="bg-white rounded-[12px] p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-[#0F1117]">{deal.titre}</h1>
            <DealStatutBadge statut={statut} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Montant">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(deal.montant)}
            </Info>
            <Info label="Apporteur">{deal.apporteur.nom}</Info>
            <Info label="Client">{deal.clientNom}</Info>
            {deal.clientEmail && <Info label="Email client">{deal.clientEmail}</Info>}
            {deal.clientTel   && <Info label="Téléphone">{deal.clientTel}</Info>}
            {deal.commissionGelee && (
              <Info label="Commission">🔒 Gelée</Info>
            )}
          </div>

          {deal.mission && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">Mission</p>
              <p className="text-sm text-[#0F1117]">{deal.mission}</p>
            </div>
          )}
        </div>

        {/* Boutons de changement de statut */}
        {transitionsDisponibles.length > 0 && (
          <div className="bg-white rounded-[12px] p-4 border border-gray-200">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">
              Changer le statut
            </p>
            <div className="flex flex-wrap gap-2">
              {transitionsDisponibles.map((s) => (
                <button
                  key={s}
                  onClick={() => handleChangeStatut(s)}
                  disabled={isPending}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${STATUT_BTN_STYLE[s]}`}
                >
                  → {s === "CONTACTE" ? "Contacté" : s === "NEGOCIE" ? "Négocié" : s === "SIGNE" ? "Signé" : s === "PAYE" ? "Payé" : s === "ANNULE" ? "Annulé" : s}
                </button>
              ))}
            </div>
            {error && <p className="text-xs text-[#DC2626] mt-2">{error}</p>}
          </div>
        )}

        {/* Documents */}
        <div className="bg-white rounded-[12px] p-6 border border-gray-200">
          <DealDocuments dealId={deal.id} documents={deal.documents} />
        </div>
      </div>

      {/* ── Colonne droite : chat (2/5) ── */}
      <div className="lg:col-span-2 bg-white rounded-[12px] border border-gray-200 flex flex-col" style={{ minHeight: "500px" }}>
        <DealChat
          dealId={deal.id}
          auteurId="admin"
          auteurType="ENTREPRISE"
          initialMessages={deal.messages}
        />
      </div>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[#6B7280] mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#0F1117]">{children}</p>
    </div>
  );
}
