"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAS2ExportButton } from "./DAS2ExportButton";
import { DAS2RecapPdfButton } from "./DAS2RecapPdfButton";
import type { DAS2AnneeStat } from "@/server/documents/das2-aggregation";

interface Props {
  entrepriseId: string;
  annees: DAS2AnneeStat[];
}

function formatEur(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

const TYPE_LABELS: Record<string, string> = {
  PARTICULIER: "Particulier",
  PROFESSIONNEL: "Professionnel",
};

export function DAS2YearGrid({ entrepriseId, annees }: Props) {
  const router = useRouter();
  const [selectedAnnee, setSelectedAnnee] = useState(
    annees[0]?.annee ?? new Date().getFullYear()
  );

  const anneeCourante = annees.find((a) => a.annee === selectedAnnee);

  const cardBase =
    "flex flex-col items-start gap-[0.35rem] min-w-40 px-5 py-4 border rounded-[12px] cursor-pointer text-left transition-colors";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-4">
        {annees.map((a) => (
          <button
            key={a.annee}
            type="button"
            onClick={() => setSelectedAnnee(a.annee)}
            className={
              a.annee === selectedAnnee
                ? `${cardBase} border-[#4648D4] bg-[#eef0ff]`
                : `${cardBase} border-[#e8e8f0] bg-[#fafaff] hover:border-[#c9caf5]`
            }
          >
            <span className="text-[1.3rem] font-bold text-[#1a1a2e]">{a.annee}</span>
            <span className="text-[0.95rem] font-semibold text-[#1a1a2e]">{formatEur(a.montantTotal)}</span>
            <span className="text-[0.78rem] text-[#888]">
              {a.nombreBeneficiaires} bénéficiaire{a.nombreBeneficiaires > 1 ? "s" : ""}
            </span>
            <span
              className={
                a.statut === "GENERE"
                  ? "inline-flex items-center px-[0.6rem] py-[0.2rem] rounded-full text-[0.75rem] font-semibold bg-[#e6f9ec] text-[#1b7a3a]"
                  : "inline-flex items-center px-[0.6rem] py-[0.2rem] rounded-full text-[0.75rem] font-semibold bg-[#f3f3fa] text-[#666]"
              }
            >
              {a.statut === "GENERE" ? "Générée" : "Non générée"}
            </span>
          </button>
        ))}
      </div>

      {anneeCourante && (
        <div className="flex flex-col gap-4">
          {anneeCourante.beneficiaires.length === 0 ? (
            <p className="p-8 text-center text-[#aaa] text-[0.9rem] border border-[#e8e8f0] rounded-[10px]">Aucune commission enregistrée pour cette année.</p>
          ) : (
            <div className="overflow-x-auto border border-[#e8e8f0] rounded-[10px]">
              <table className="w-full border-collapse text-[0.9rem]">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-wider text-[#888] bg-[#f9f9fb] border-b border-[#e8e8f0]">Nom</th>
                    <th className="px-4 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-wider text-[#888] bg-[#f9f9fb] border-b border-[#e8e8f0]">Type</th>
                    <th className="px-4 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-wider text-[#888] bg-[#f9f9fb] border-b border-[#e8e8f0]">Siret</th>
                    <th className="px-4 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-wider text-[#888] bg-[#f9f9fb] border-b border-[#e8e8f0]">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {anneeCourante.beneficiaires.map((b) => (
                    <tr key={b.apporteurId} className="border-b border-[#f0f0f5] last:border-b-0">
                      <td className="px-4 py-[0.85rem] text-[#333]">{b.nom}</td>
                      <td className="px-4 py-[0.85rem] text-[#333]">
                        <span className="inline-flex px-2 py-[0.15rem] rounded-full text-[0.75rem] font-medium bg-[#f3f3fa] text-[#555]">{TYPE_LABELS[b.type]}</span>
                      </td>
                      <td className="px-4 py-[0.85rem] text-[#333]">{b.siret ?? "—"}</td>
                      <td className="px-4 py-[0.85rem] text-[#333]">{formatEur(b.montant)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <DAS2ExportButton
              key={`export-${selectedAnnee}`}
              entrepriseId={entrepriseId}
              annee={selectedAnnee}
              onExported={() => router.refresh()}
            />
            <DAS2RecapPdfButton
              key={`recap-${selectedAnnee}`}
              entrepriseId={entrepriseId}
              annee={selectedAnnee}
            />
          </div>
        </div>
      )}
    </div>
  );
}
