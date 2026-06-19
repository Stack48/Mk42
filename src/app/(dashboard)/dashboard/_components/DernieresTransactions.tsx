// src/app/(dashboard)/dashboard/_components/DernieresTransactions.tsx
import type { Transaction } from "@/lib/actions/dashboard.actions";

export function DernieresTransactions({ items }: { items: Transaction[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[#9CA3AF] py-4">Aucune transaction.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t.id} className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.couleur}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F1117] truncate">{t.label}</p>
            <p className="text-xs text-[#6B7280]">{t.statut}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
