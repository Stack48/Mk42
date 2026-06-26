// src/app/(dashboard)/dashboard/_components/ActionsRecentes.tsx
import type { ActionRecente } from "@/lib/actions/dashboard.actions";

export function ActionsRecentes({ items }: { items: ActionRecente[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-[#9CA3AF] py-4">Aucune action récente.</p>;
  }
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5 ${item.couleur}`}
          >
            {item.label.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F1117] leading-snug">{item.label}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{item.sousTitre}</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{item.dateRelative}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
