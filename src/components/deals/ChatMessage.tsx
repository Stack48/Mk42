// BULLE DE MESSAGE — composant pur, pas d'état
// ENTREPRISE → droite, fond #4F6EF7, texte blanc
// APPORTEUR  → gauche, fond #F3F4F6, texte #0F1117

import type { DealMessage } from "@/types/deal.types";

export function ChatMessage({ message }: { message: DealMessage }) {
  const isEntreprise = message.auteurType === "ENTREPRISE";

  return (
    <div className={`flex ${isEntreprise ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[75%]">
        <div
          className={`px-3 py-2 rounded-[12px] text-sm ${
            isEntreprise
              ? "bg-[#4F6EF7] text-white rounded-br-sm"
              : "bg-[#F3F4F6] text-[#0F1117] rounded-bl-sm"
          }`}
        >
          {message.contenu}
        </div>
        <p className={`text-[11px] text-[#9CA3AF] mt-0.5 ${isEntreprise ? "text-right" : "text-left"}`}>
          {new Date(message.createdAt).toLocaleString("fr-FR", {
            hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
          })}
        </p>
      </div>
    </div>
  );
}
