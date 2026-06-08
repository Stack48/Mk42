// TIMELINE D'AUDIT — components/contrats/AccessLogTimeline.tsx
//
// Server Component : rendu côté serveur, pas d'interactivité nécessaire.
// Affiche l'historique des actions sur un contrat sous forme de timeline verticale.

import type { ContratAccessLogEntry, ContratAction } from "@/types/contrat.types";

interface Props {
  logs: ContratAccessLogEntry[];
}

// Configuration visuelle par action
const ACTION_CONFIG: Record<
  ContratAction,
  { label: string; color: string; dot: string }
> = {
  GENERATED:       { label: "Contrat généré",                  color: "text-[#1D4ED8]", dot: "bg-[#4F6EF7]" },
  LINK_OPENED:     { label: "Lien ouvert par l'apporteur",     color: "text-[#D97706]", dot: "bg-[#F59E0B]" },
  SIGNED_UPLOADED: { label: "Contrat signé uploadé",           color: "text-[#7C3AED]", dot: "bg-[#8B5CF6]" },
  VALIDATED:       { label: "Validé par l'admin",              color: "text-[#059669]", dot: "bg-[#10B981]" },
  REJECTED:        { label: "Rejeté",                          color: "text-[#DC2626]", dot: "bg-[#EF4444]" },
};

export function AccessLogTimeline({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-[#6B7280] italic">Aucun événement enregistré.</p>
    );
  }

  return (
    <div className="relative">
      {/* Ligne verticale de la timeline */}
      <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-gray-100" />

      <div className="space-y-4">
        {logs.map((log, index) => {
          const config = ACTION_CONFIG[log.action];
          return (
            <div key={log.id ?? index} className="relative flex gap-4 pl-6">
              {/* Point coloré sur la timeline */}
              <div
                className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white ${config.dot}`}
              />

              {/* Contenu de l'entrée */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${config.color}`}>
                  {config.label}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {new Date(log.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {log.ip && (
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    IP : {log.ip}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
