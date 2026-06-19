// COMPOSANT SERVER — components/contrats/ContratStatusBadge.tsx
//
// Même pattern exact que components/commissions/StatusBadge.tsx.
// Server Component (pas de "use client") : rendu côté serveur, zéro JS envoyé
// au navigateur pour ce composant.
//
// Le CONFIG map centralise les labels et couleurs par statut —
// si un statut change de couleur, on modifie un seul endroit.

import type { ContratStatut } from "@/types/contrat.types";

interface Props {
  statut: ContratStatut;
}

const CONFIG: Record<ContratStatut, { label: string; bg: string; text: string }> = {
  DRAFT:     { label: "Brouillon",                bg: "bg-[#E5E7EB]",  text: "text-[#374151]" },
  SENT:      { label: "Envoyé",                   bg: "bg-[#DBEAFE]",  text: "text-[#1D4ED8]" },
  UPLOADED:  { label: "En attente de validation", bg: "bg-[#FEF3C7]",  text: "text-[#D97706]" },
  VALIDATED: { label: "Validé",                   bg: "bg-[#D1FAE5]",  text: "text-[#059669]" },
  REJECTED:  { label: "Rejeté",                   bg: "bg-[#FEE2E2]",  text: "text-[#DC2626]" },
};

export function ContratStatusBadge({ statut }: Props) {
  const { label, bg, text } = CONFIG[statut];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  );
}
