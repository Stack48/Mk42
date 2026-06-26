// src/app/(dashboard)/dashboard/_components/ActionsRapides.tsx
import Link from "next/link";

interface Action {
  label: string;
  href: string;
  icon: string; // emoji ou texte court
}

interface ActionsRapidesProps {
  actions: Action[];
}

export function ActionsRapides({ actions }: ActionsRapidesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          <span>{a.icon}</span>
          {a.label}
        </Link>
      ))}
    </div>
  );
}
