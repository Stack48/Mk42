// BADGE STATUT DEAL — même pattern que les autres badges du projet

import type { KanbanDealStatut } from "@/types/deal.types";

const STYLES: Record<KanbanDealStatut, { bg: string; text: string; label: string }> = {
  PROSPECT: { bg: "#F3F4F6", text: "#374151", label: "Prospect" },
  CONTACTE: { bg: "#DBEAFE", text: "#1D4ED8", label: "Contacté" },
  NEGOCIE:  { bg: "#FEF3C7", text: "#92400E", label: "Négocié" },
  SIGNE:    { bg: "#D1FAE5", text: "#059669", label: "Signé" },
  PAYE:     { bg: "#A7F3D0", text: "#065F46", label: "Payé" },
  ANNULE:   { bg: "#FEE2E2", text: "#DC2626", label: "Annulé" },
};

export function DealStatutBadge({ statut }: { statut: KanbanDealStatut }) {
  const { bg, text, label } = STYLES[statut];
  return (
    <span
      style={{ backgroundColor: bg, color: text }}
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
    >
      {label}
    </span>
  );
}
