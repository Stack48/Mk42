// COMPOSANT SERVER (React Server Component par défaut)
// Pas de "use client" ici → ce composant est rendu côté serveur,
// envoyé en HTML au navigateur. Pas de useState/useEffect possible,
// mais pas de bundle JS ajouté côté client non plus.

import type { CommissionStatut } from "@/types/commission.types";

interface Props {
  statut: CommissionStatut;
}

const CONFIG: Record<
  CommissionStatut,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: "En attente", bg: "bg-[#E5E7EB]", text: "text-[#374151]" },
  TO_PAY:  { label: "À payer",    bg: "bg-[#FEF3C7]", text: "text-[#D97706]" },
  PAID:    { label: "Payée",      bg: "bg-[#D1FAE5]", text: "text-[#059669]" },
};

export function StatusBadge({ statut }: Props) {
  const { label, bg, text } = CONFIG[statut];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  );
}
