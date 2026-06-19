// src/app/(dashboard)/dashboard/_components/KpiCard.tsx
interface KpiCardProps {
  valeur: string;
  label: string;
  bg: string;   // classe Tailwind ex: "bg-[#E8F4FD]"
  textColor?: string; // classe Tailwind ex: "text-[#1D4E89]"
}

export function KpiCard({ valeur, label, bg, textColor = "text-[#0F1117]" }: KpiCardProps) {
  return (
    <div className={`${bg} rounded-2xl p-5 flex flex-col gap-1 flex-1 min-w-[140px]`}>
      <span className={`text-2xl font-bold ${textColor} leading-tight`}>{valeur}</span>
      <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide leading-tight">{label}</span>
    </div>
  );
}
