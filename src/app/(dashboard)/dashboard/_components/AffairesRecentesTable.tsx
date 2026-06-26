// src/app/(dashboard)/dashboard/_components/AffairesRecentesTable.tsx
import type { AffaireRecente } from "@/lib/actions/dashboard.actions";

const BADGE_STYLES: Record<"green" | "yellow" | "red" | "gray", string> = {
  green:  "bg-[#D1FAE5] text-[#065F46]",
  yellow: "bg-[#FEF3C7] text-[#92400E]",
  red:    "bg-[#FEE2E2] text-[#991B1B]",
  gray:   "bg-[#F3F4F6] text-[#374151]",
};

export function AffairesRecentesTable({ items }: { items: AffaireRecente[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[#9CA3AF] py-4">Aucune affaire récente.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB]">
            <th className="text-left py-2 pr-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Client</th>
            <th className="text-left py-2 pr-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Type de travaux</th>
            <th className="text-left py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Statut</th>
            <th className="w-6" />
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
              <td className="py-3 pr-4 font-medium text-[#0F1117]">{a.clientNom}</td>
              <td className="py-3 pr-4 text-[#6B7280]">{a.typeTravaux}</td>
              <td className="py-3">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[a.statutCouleur]}`}>
                  {a.statutLabel}
                </span>
              </td>
              <td className="py-3 text-[#9CA3AF]">›</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
