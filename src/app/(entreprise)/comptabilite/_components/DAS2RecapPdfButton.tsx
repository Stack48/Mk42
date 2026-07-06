"use client";

import { useState } from "react";
import { exportDocumentAction } from "../_actions";
import styles from "./DAS2ExportButton.module.css";

interface Props {
  entrepriseId: string;
  annee: number;
}

export function DAS2RecapPdfButton({ annee }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    lienSigne: string;
    dateExpiration: Date;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await exportDocumentAction({ type: "DAS2_RECAP_PDF", annee });
      setResult({
        lienSigne: res.lienSigne,
        dateExpiration: res.dateExpiration,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération");
    } finally {
      setLoading(false);
    }
  }

  const expiration = result?.dateExpiration
    ? new Date(result.dateExpiration).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className={styles.wrapper}>
      {!result && (
        <button
          onClick={handleExport}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Génération PDF…" : `Récap PDF ${annee}`}
        </button>
      )}

      {error && (
        <div className={styles.error}>
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {result && (
        <div className={styles.success}>
          <a
            href={result.lienSigne}
            download={`DAS2_recap_${annee}.pdf`}
            className={styles.downloadLink}
          >
            Télécharger DAS2_recap_{annee}.pdf
          </a>
          {expiration && (
            <span className={styles.expiration}>
              Lien valide jusqu'à {expiration} (15 min)
            </span>
          )}
          <button
            onClick={() => { setResult(null); }}
            className={styles.resetButton}
          >
            Régénérer
          </button>
        </div>
      )}
    </div>
  );
}
