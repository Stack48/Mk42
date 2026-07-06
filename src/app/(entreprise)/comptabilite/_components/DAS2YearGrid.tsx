"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAS2ExportButton } from "./DAS2ExportButton";
import { DAS2RecapPdfButton } from "./DAS2RecapPdfButton";
import type { DAS2AnneeStat } from "@/server/documents/das2-aggregation";
import styles from "./DAS2YearGrid.module.css";

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {annees.map((a) => (
          <button
            key={a.annee}
            type="button"
            onClick={() => setSelectedAnnee(a.annee)}
            className={a.annee === selectedAnnee ? styles.cardSelected : styles.card}
          >
            <span className={styles.cardAnnee}>{a.annee}</span>
            <span className={styles.cardMontant}>{formatEur(a.montantTotal)}</span>
            <span className={styles.cardMeta}>
              {a.nombreBeneficiaires} bénéficiaire{a.nombreBeneficiaires > 1 ? "s" : ""}
            </span>
            <span className={a.statut === "GENERE" ? styles.badgeGenere : styles.badgeNonGenere}>
              {a.statut === "GENERE" ? "Générée" : "Non générée"}
            </span>
          </button>
        ))}
      </div>

      {anneeCourante && (
        <div className={styles.detail}>
          {anneeCourante.beneficiaires.length === 0 ? (
            <p className={styles.empty}>Aucune commission enregistrée pour cette année.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Nom</th>
                    <th className={styles.th}>Type</th>
                    <th className={styles.th}>Siret</th>
                    <th className={styles.th}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {anneeCourante.beneficiaires.map((b) => (
                    <tr key={b.apporteurId} className={styles.tr}>
                      <td className={styles.td}>{b.nom}</td>
                      <td className={styles.td}>
                        <span className={styles.typeBadge}>{TYPE_LABELS[b.type]}</span>
                      </td>
                      <td className={styles.td}>{b.siret ?? "—"}</td>
                      <td className={styles.td}>{formatEur(b.montant)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.exportActions}>
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
