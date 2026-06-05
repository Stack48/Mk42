"use client";
// ↑ "use client" = ce composant s'exécute dans le navigateur.
// Nécessaire ici car on utilise useState (filtres interactifs).
// En Angular, tout est côté client par défaut. En Next.js App Router,
// c'est l'inverse : tout est serveur par défaut, on opt-in au client.

import { useState, useTransition } from "react";
import { StatusBadge } from "./StatusBadge";
import { changerStatutCommission, validerPaiement } from "@/lib/actions/commission.actions";
import type { CommissionWithRelations, CommissionStatut } from "@/types/commission.types";

interface Props {
  commissions: CommissionWithRelations[];
}

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export function CommissionTable({ commissions }: Props) {
  const [filtre, setFiltre] = useState<CommissionStatut | "ALL">("ALL");
  const [tri, setTri] = useState<"montant" | "date">("date");
  const [isPending, startTransition] = useTransition();
  // useTransition : permet de lancer une Server Action sans bloquer l'UI.
  // isPending = true pendant que l'action s'exécute → afficher un loader.

  const filtered = commissions
    .filter((c) => filtre === "ALL" || c.statut === filtre)
    .sort((a, b) =>
      tri === "montant"
        ? b.montant - a.montant
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  function handleChangerStatut(commissionId: string, newStatut: CommissionStatut) {
    // startTransition enveloppe l'appel à la Server Action.
    // Next.js envoie la requête au serveur, attend la réponse,
    // puis revalide automatiquement la page (grâce au revalidatePath dans l'action).
    startTransition(async () => {
      const res = await changerStatutCommission({ commissionId, newStatut });
      if (!res.success) alert(res.error);
    });
  }

  function handleValiderPaiement(commissionId: string) {
    startTransition(async () => {
      const res = await validerPaiement(commissionId);
      if (!res.success) alert(res.error);
    });
  }

  // KPI totaux
  const totalPending = commissions.filter((c) => c.statut === "PENDING").reduce((s, c) => s + c.montant, 0);
  const totalToPay   = commissions.filter((c) => c.statut === "TO_PAY").reduce((s, c) => s + c.montant, 0);
  const totalPaid    = commissions.filter((c) => c.statut === "PAID").reduce((s, c) => s + c.montant, 0);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "En attente", value: totalPending, color: "text-[#374151]" },
          { label: "À payer",    value: totalToPay,   color: "text-[#D97706]" },
          { label: "Payées",     value: totalPaid,    color: "text-[#059669]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#F8F9FF] rounded-[12px] p-5 border border-gray-100">
            <p className="text-sm text-[#6B7280]">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{formatEur(value)}</p>
          </div>
        ))}
      </div>

      {/* Filtres + tri */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-[#6B7280]">Filtrer :</span>
        {(["ALL", "PENDING", "TO_PAY", "PAID"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltre(s)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filtre === s
                ? "bg-[#4F6EF7] text-white"
                : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
            }`}
          >
            {s === "ALL" ? "Toutes" : s === "PENDING" ? "En attente" : s === "TO_PAY" ? "À payer" : "Payées"}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <span className="text-sm text-[#6B7280]">Trier par :</span>
          <button
            onClick={() => setTri("montant")}
            className={`px-3 py-1 rounded-lg text-sm ${tri === "montant" ? "bg-[#4F6EF7] text-white" : "bg-gray-100 text-[#6B7280]"}`}
          >
            Montant
          </button>
          <button
            onClick={() => setTri("date")}
            className={`px-3 py-1 rounded-lg text-sm ${tri === "date" ? "bg-[#4F6EF7] text-white" : "bg-gray-100 text-[#6B7280]"}`}
          >
            Date
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-[12px] border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] text-[#6B7280] text-left">
              <th className="px-4 py-3 font-medium">Deal</th>
              <th className="px-4 py-3 font-medium">Apporteur</th>
              <th className="px-4 py-3 font-medium">Montant</th>
              <th className="px-4 py-3 font-medium">Taux</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">
                  Aucune commission pour ce filtre.
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-4 py-3 font-medium text-[#0F1117]">{c.deal.titre}</td>
                <td className="px-4 py-3 text-[#6B7280]">{c.apporteur.nom}</td>
                <td className="px-4 py-3 font-semibold text-[#0F1117]">{formatEur(c.montant)}</td>
                <td className="px-4 py-3 text-[#6B7280]">{c.taux}%</td>
                <td className="px-4 py-3"><StatusBadge statut={c.statut} /></td>
                <td className="px-4 py-3 text-[#6B7280]">
                  {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.statut === "PENDING" && (
                      <button
                        disabled={isPending}
                        onClick={() => handleChangerStatut(c.id, "TO_PAY")}
                        className="px-2 py-1 text-xs bg-[#FEF3C7] text-[#D97706] rounded hover:bg-yellow-200 disabled:opacity-50"
                      >
                        Valider →
                      </button>
                    )}
                    {c.statut === "TO_PAY" && (
                      <button
                        disabled={isPending}
                        onClick={() => handleValiderPaiement(c.id)}
                        className="px-2 py-1 text-xs bg-[#D1FAE5] text-[#059669] rounded hover:bg-green-200 disabled:opacity-50"
                      >
                        Marquer payée ✓
                      </button>
                    )}
                    {c.statut === "PAID" && (
                      <span className="text-xs text-[#6B7280]">
                        Payée le {c.paidAt ? new Date(c.paidAt).toLocaleDateString("fr-FR") : "—"}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
