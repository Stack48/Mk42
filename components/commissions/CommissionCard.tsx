// SERVER COMPONENT — Carte commission pour la vue apporteur
// Pas de "use client" → rendu serveur, HTML pur.

import { StatusBadge } from "./StatusBadge";
import type { CommissionWithRelations } from "@/types/commission.types";
import type { AuditEntry } from "@/types/commission.types";

interface Props {
  commission: CommissionWithRelations;
}

function formatEur(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export function CommissionCard({ commission }: Props) {
  const { deal, statut, montant, taux, createdAt, paidAt, auditTrail } = commission;

  return (
    <div className="bg-[#F8F9FF] rounded-[12px] border border-gray-100 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[#0F1117]">{deal.titre}</h3>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Deal : {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(deal.montant)}
          </p>
        </div>
        <StatusBadge statut={statut} />
      </div>

      {/* Montant commission */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#4F6EF7]">{formatEur(montant)}</span>
        <span className="text-sm text-[#6B7280]">({taux}%)</span>
      </div>

      {/* Dates */}
      <div className="text-xs text-[#6B7280] flex gap-4">
        <span>Créée le {new Date(createdAt).toLocaleDateString("fr-FR")}</span>
        {paidAt && <span>· Payée le {new Date(paidAt).toLocaleDateString("fr-FR")}</span>}
      </div>

      {/* Audit Trail — historique des statuts */}
      {auditTrail.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-[#6B7280] mb-2">Historique</p>
          <ol className="space-y-1">
            {(auditTrail as AuditEntry[]).map((entry, i) => (
              <li key={i} className="text-xs text-[#6B7280] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F6EF7] shrink-0" />
                <span>
                  {entry.from ? `${entry.from} → ` : "Création → "}
                  <span className="font-medium text-[#0F1117]">{entry.to}</span>
                  {" · "}
                  {new Date(entry.at).toLocaleString("fr-FR")}
                  {entry.by && ` · par ${entry.by}`}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
