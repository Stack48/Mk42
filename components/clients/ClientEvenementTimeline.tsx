// TIMELINE ÉVÉNEMENTS CLIENT — même pattern que AccessLogTimeline.tsx ([13-BE])
// Composant pur : affichage seul, pas d'état.

import { CLIENT_EVENEMENT_LABELS } from "@/types/client.types";
import type { ClientEvenement, ClientEvenementType } from "@/types/client.types";

// Icône + couleur selon le type d'événement
const EVENT_STYLE: Record<ClientEvenementType, { dot: string; icon: string }> = {
  INVITATION_ENVOYEE: { dot: "bg-[#DBEAFE] border-[#1D4ED8]", icon: "✉️" },
  DOSSIER_CONSULTE:   { dot: "bg-[#F8F9FF] border-[#4F6EF7]",  icon: "👁" },
  ETAPE_VALIDEE:      { dot: "bg-[#D1FAE5] border-[#059669]",   icon: "✓" },
  ETAPE_REFUSEE:      { dot: "bg-[#FEE2E2] border-[#DC2626]",   icon: "✗" },
};

export function ClientEvenementTimeline({ evenements }: { evenements: ClientEvenement[] }) {
  if (evenements.length === 0) {
    return <p className="text-sm text-[#6B7280]">Aucun événement enregistré.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-6 ml-3">
      {evenements.map((evt) => {
        const style = EVENT_STYLE[evt.type];
        return (
          <li key={evt.id} className="ml-6">
            {/* Point sur la ligne de temps */}
            <span
              className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${style.dot}`}
            >
              {style.icon}
            </span>

            <div className="bg-[#F8F9FF] rounded-[12px] p-3 border border-gray-100">
              <p className="text-sm font-medium text-[#0F1117]">
                {CLIENT_EVENEMENT_LABELS[evt.type]}
              </p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {new Date(evt.createdAt).toLocaleString("fr-FR")}
                {evt.ip && <span className="ml-2 opacity-60">· {evt.ip}</span>}
              </p>

              {/* Afficher les metadata si présentes (ex : motif de refus) */}
              {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                <div className="mt-2 text-xs text-[#6B7280] space-y-0.5">
                  {Object.entries(evt.metadata).map(([k, v]) =>
                    k === "raison" ? (
                      <p key={k}>
                        <span className="font-medium">Motif :</span> {String(v)}
                      </p>
                    ) : null
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
