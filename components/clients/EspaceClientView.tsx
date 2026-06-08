"use client";
// VUE ESPACE CLIENT — page publique /clients/[token]
// Le client voit son dossier, peut valider ou refuser l'étape en cours.
// "use client" nécessaire : useTransition pour les actions, useState pour le motif de refus.

import { useState, useTransition } from "react";
import { validerEtape, refuserEtape } from "@/lib/actions/client.actions";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { ClientEvenementTimeline } from "./ClientEvenementTimeline";
import type { InvitationWithDeal } from "@/types/client.types";

interface Props {
  invitation: InvitationWithDeal;
}

export function EspaceClientView({ invitation }: Props) {
  const { nom, statut, deal, token, evenements } = invitation;
  const [isPending, startTransition] = useTransition();
  const [showRefusForm, setShowRefusForm] = useState(false);
  const [raison, setRaison]               = useState("");
  const [feedback, setFeedback]           = useState<{ type: "success" | "error"; text: string } | null>(null);

  // etapeId fictif en attendant [11-FE] : on utilise l'ID du deal comme référence d'étape
  const etapeId = `deal-${deal.id}`;

  function handleValider() {
    startTransition(async () => {
      const res = await validerEtape(token, etapeId);
      if (res.success) {
        setFeedback({ type: "success", text: "Votre validation a bien été enregistrée. Merci !" });
      } else {
        setFeedback({ type: "error", text: res.error ?? "Une erreur est survenue." });
      }
    });
  }

  function handleRefuser(e: React.FormEvent) {
    e.preventDefault();
    if (!raison.trim()) return;
    startTransition(async () => {
      const res = await refuserEtape(token, etapeId, raison.trim());
      if (res.success) {
        setFeedback({ type: "success", text: "Votre refus a bien été enregistré." });
        setShowRefusForm(false);
      } else {
        setFeedback({ type: "error", text: res.error ?? "Une erreur est survenue." });
      }
    });
  }

  // L'invitation a déjà été traitée : on affiche un résumé sans boutons d'action
  const dejaTraitee = statut === "VALIDATED" || statut === "REFUSED";

  return (
    <div className="min-h-screen bg-[#F8F9FF] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="bg-white rounded-[12px] p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-[#4F6EF7]">OPUS BTP</h1>
            <ClientStatusBadge statut={statut} />
          </div>
          <h2 className="text-lg font-semibold text-[#0F1117]">
            Bonjour, {nom}
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Espace client · Accès sécurisé sans compte
          </p>
        </div>

        {/* Détail du dossier */}
        <div className="bg-white rounded-[12px] p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-4">
            Votre dossier
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B7280]">Projet</span>
              <span className="text-sm font-medium text-[#0F1117]">{deal.titre}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B7280]">Montant</span>
              <span className="text-sm font-medium text-[#0F1117]">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(deal.montant)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B7280]">Avancement</span>
              {/* Statut deal traduit simplement — [11-FE] enrichira cette section */}
              <span className="text-sm font-medium text-[#0F1117]">
                {deal.statut === "SIGNED" ? "Signé" : deal.statut === "DRAFT" ? "En cours" : deal.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Zone d'action — masquée si déjà traitée */}
        {!dejaTraitee && !feedback && (
          <div className="bg-white rounded-[12px] p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-4">
              Étape en cours
            </h3>
            <p className="text-sm text-[#0F1117] mb-6">
              Veuillez valider ou refuser l'étape actuelle de votre dossier.
            </p>

            {!showRefusForm ? (
              <div className="flex gap-3">
                <button
                  onClick={handleValider}
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-medium bg-[#D1FAE5] text-[#059669] rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "En cours…" : "✓ Valider"}
                </button>
                <button
                  onClick={() => setShowRefusForm(true)}
                  disabled={isPending}
                  className="flex-1 py-2.5 text-sm font-medium bg-[#FEE2E2] text-[#DC2626] rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                >
                  ✗ Refuser
                </button>
              </div>
            ) : (
              /* Formulaire de refus avec motif obligatoire */
              <form onSubmit={handleRefuser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0F1117] mb-1">
                    Motif du refus <span className="text-[#DC2626]">*</span>
                  </label>
                  <textarea
                    value={raison}
                    onChange={(e) => setRaison(e.target.value)}
                    placeholder="Décrivez la raison de votre refus…"
                    required
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC2626] text-[#0F1117] resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRefusForm(false)}
                    className="flex-1 py-2.5 text-sm text-[#6B7280] hover:text-[#0F1117] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !raison.trim()}
                    className="flex-1 py-2.5 text-sm font-medium bg-[#FEE2E2] text-[#DC2626] rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors"
                  >
                    {isPending ? "En cours…" : "Confirmer le refus"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Message retour après action */}
        {feedback && (
          <div
            className={`rounded-[12px] p-4 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-[#D1FAE5] text-[#059669]"
                : "bg-[#FEE2E2] text-[#DC2626]"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Résumé si déjà traitée */}
        {dejaTraitee && !feedback && (
          <div className="bg-white rounded-[12px] p-4 border border-gray-200 text-sm text-[#6B7280] text-center">
            {statut === "VALIDATED"
              ? "✓ Vous avez validé cette étape. Merci pour votre retour."
              : "✗ Vous avez refusé cette étape. L'équipe OPUS en a été informée."}
          </div>
        )}

        {/* Timeline des événements */}
        <div className="bg-white rounded-[12px] p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-4">
            Historique de votre dossier
          </h3>
          <ClientEvenementTimeline evenements={evenements} />
        </div>
      </div>
    </div>
  );
}
