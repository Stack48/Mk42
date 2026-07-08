"use client";

import { useState } from "react";
import { exportDocumentAction } from "../_actions";

interface Props {
  entrepriseId: string;
  annee: number;
  onExported?: () => void;
}

export function DAS2ExportButton({ annee, onExported }: Props) {
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
      onExported?.();
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
    <div className="flex flex-col items-start gap-3">
      {!result && (
        <button
          onClick={handleExport}
          disabled={loading}
          className="px-[1.4rem] py-[0.65rem] rounded-[8px] bg-[#4648D4] text-white text-[0.9rem] font-semibold cursor-pointer transition-colors whitespace-nowrap enabled:hover:bg-[#3335b0] disabled:bg-[#b0b0e0] disabled:cursor-not-allowed"
        >
          {loading ? "Génération EDI…" : `Exporter DAS2 ${annee}`}
        </button>
      )}

      {error && (
        <div className="px-4 py-3 bg-[#fff0f0] border border-[#fcc] rounded-[8px] text-[0.85rem] text-[#c0392b] max-w-105">
          <strong>Erreur :</strong> {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-2">
          {result.warnings.length > 0 && (
            <ul className="m-0 py-2 pr-2 pl-5 bg-[#fffbea] border border-[#f0d050] rounded-[6px] text-[0.78rem] text-[#7a6000] list-disc">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          <a
            href={result.lienSigne}
            download={`DAS2_${annee}.edi`}
            className="inline-flex items-center gap-[0.4rem] px-[1.4rem] py-[0.65rem] rounded-[8px] bg-[#eef0ff] text-[#4648D4] text-[0.9rem] font-semibold no-underline transition-colors hover:bg-[#4648D4] hover:text-white"
          >
            Télécharger DAS2_{annee}.edi
          </a>
          {expiration && (
            <span className="text-[0.78rem] text-[#aaa]">
              Lien valide jusqu'à {expiration} (15 min)
            </span>
          )}
          <button
            onClick={() => { setResult(null); }}
            className="bg-transparent border-0 text-[0.78rem] text-[#aaa] cursor-pointer p-0 underline hover:text-[#4648D4]"
          >
            Régénérer
          </button>
        </div>
      )}
    </div>
  );
}
