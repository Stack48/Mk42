"use client";

import { useState } from "react";
import { exportDocumentAction } from "../_actions";
import styles from "./DAS2ExportButton.module.css";

interface Props {
  entrepriseId: string;
  annee: number;
}

export function DAS2ExportButton({ annee }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    lienSigne: string;
    dateExpiration: Date;
    warnings: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await exportDocumentAction({ type: "DAS2", annee });
      setResult({
        lienSigne: res.lienSigne,
        dateExpiration: res.dateExpiration,
        warnings: res.warnings ?? [],
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
          {loading ? "Génération EDI…" : `Exporter DAS2 ${annee}`}
        </button>
      )}

      {error && (
        <div className={styles.error}>
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {result && (
        <div className={styles.success}>
          {result.warnings.length > 0 && (
            <ul className={styles.warnings}>
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          <a
            href={result.lienSigne}
            download={`DAS2_${annee}.edi`}
            className={styles.downloadLink}
          >
            Télécharger DAS2_{annee}.edi
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
