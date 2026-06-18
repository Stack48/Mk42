// BADGE STATUT INVITATION — même pattern que ContratStatusBadge.tsx
// Composant pur (pas de "use client" nécessaire : zéro état, zéro interaction).

import type { InvitationStatut } from "@/types/client.types";

const BADGE_STYLES: Record<InvitationStatut, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: "#E5E7EB", text: "#374151", label: "En attente" },
  ACCESSED:  { bg: "#DBEAFE", text: "#1D4ED8", label: "Consulté" },
  VALIDATED: { bg: "#D1FAE5", text: "#059669", label: "Validé" },
  REFUSED:   { bg: "#FEE2E2", text: "#DC2626", label: "Refusé" },
};

export function ClientStatusBadge({ statut }: { statut: InvitationStatut }) {
  const { bg, text, label } = BADGE_STYLES[statut];
  return (
    <span
      style={{ backgroundColor: bg, color: text }}
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
    >
      {label}
    </span>
  );
}
