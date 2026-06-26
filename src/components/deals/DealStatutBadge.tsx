// BADGE STATUT DEAL — même pattern que les autres badges du projet

import type { KanbanDealStatut } from "@/types/deal.types";

const STYLES: Record<KanbanDealStatut, { classes: string; label: string }> = {
  PROSPECT: { classes: "bg-[#F3F4F6] text-[#374151]", label: "Prospect" },
  CONTACTE: { classes: "bg-[#DBEAFE] text-[#1D4ED8]", label: "Contacté" },
  SIGNE:    { classes: "bg-[#D1FAE5] text-[#059669]", label: "Signé" },
  PAYE:     { classes: "bg-[#A7F3D0] text-[#065F46]", label: "Payé" },
  ANNULE:   { classes: "bg-[#FEE2E2] text-[#DC2626]", label: "Annulé" },
};

export function DealStatutBadge({ statut }: { statut: KanbanDealStatut }) {
  const { classes, label } = STYLES[statut];
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
