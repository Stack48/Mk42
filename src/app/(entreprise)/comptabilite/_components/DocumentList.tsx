"use client";

import { useState } from "react";
import { exportDocumentAction } from "../_actions";
import { getAnneesDisponibles, filterItems, type DocumentItem } from "./documentListFilters";

interface Props {
  type: "facture" | "recu";
  items: DocumentItem[];
}

const NOMBRE_PAR_DEFAUT = 10;

function formatMontant(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR");
}

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  PAYEE: "Payée",
  PAYE: "Payé",
  ANNULEE: "Annulée",
  ANNULE: "Annulé",
};

export function DocumentList({ type, items }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recherche, setRecherche] = useState("");
  const [anneeFiltre, setAnneeFiltre] = useState<number | "TOUTES">("TOUTES");
  const [nombreAffiche, setNombreAffiche] = useState(NOMBRE_PAR_DEFAUT);

  const anneesDisponibles = getAnneesDisponibles(items);
  const itemsFiltres = filterItems(items, recherche, anneeFiltre);
  const itemsAffiches = itemsFiltres.slice(0, nombreAffiche);
  const resteACharger = itemsFiltres.length - itemsAffiches.length;

  function handleRechercheChange(value: string) {
    setRecherche(value);
    setNombreAffiche(NOMBRE_PAR_DEFAUT);
  }

  function handleAnneeChange(value: string) {
    setAnneeFiltre(value === "TOUTES" ? "TOUTES" : Number(value));
    setNombreAffiche(NOMBRE_PAR_DEFAUT);
  }

  async function handleDownload(id: string) {
    setDownloading(id);
    setErrors((e) => ({ ...e, [id]: "" }));
    try {
      const result = await exportDocumentAction(
        type === "facture"
          ? { type: "FACTURE_PDF", factureId: id }
          : { type: "RECU_PDF", recuId: id }
      );
      setLinks((l) => ({ ...l, [id]: result.lienSigne }));
      window.open(result.lienSigne, "_blank");
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [id]: err instanceof Error ? err.message : "Erreur inconnue",
      }));
    } finally {
      setDownloading(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-[#aaa] text-[0.9rem] border border-[#e8e8f0] rounded-[10px]">
        Aucun{type === "facture" ? "e facture" : " reçu"} enregistré.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <input
          type="text"
          value={recherche}
          onChange={(e) => handleRechercheChange(e.target.value)}
          placeholder="Rechercher par nom ou référence"
          className="flex-1 min-w-55 px-3 py-2 border border-[#e8e8f0] rounded-[8px] text-[0.88rem] text-[#1a1a2e] outline-none focus:border-[#4648D4]"
        />
        <select
          value={anneeFiltre}
          onChange={(e) => handleAnneeChange(e.target.value)}
          className="px-3 py-2 border border-[#e8e8f0] rounded-[8px] text-[0.88rem] text-[#1a1a2e] bg-white outline-none focus:border-[#4648D4]"
        >
          <option value="TOUTES">Toutes les années</option>
          {anneesDisponibles.map((annee) => (
            <option key={annee} value={annee}>
              {annee}
            </option>
          ))}
        </select>
      </div>

      {itemsFiltres.length === 0 ? (
        <div className="p-8 text-center text-[#aaa] text-[0.9rem] border border-[#e8e8f0] rounded-[10px]">Aucun résultat pour cette recherche.</div>
      ) : (
        <div className="flex flex-col border border-[#e8e8f0] rounded-[10px] overflow-hidden">
          {itemsAffiches.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 flex-wrap px-[1.1rem] py-[0.85rem] border-b border-[#f0f0f5] transition-colors last:border-b-0 hover:bg-[#f9f9ff]">
              <div className="flex flex-col gap-[0.15rem] min-w-40">
                <span className="font-mono text-[0.8rem] text-[#4648D4]">{item.reference}</span>
                <span className="text-[0.85rem] text-[#555]">{item.apporteur}</span>
              </div>
              <div className="text-[0.85rem] text-[#888]">{formatDate(item.date)}</div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[0.95rem] font-semibold text-[#1a1a2e]">{formatMontant(item.montant)}</span>
                <span className="inline-flex px-2 py-[0.15rem] rounded-full text-[0.75rem] font-medium bg-[#f3f3fa] text-[#555]">
                  {STATUT_LABELS[item.statut] ?? item.statut}
                </span>
                {errors[item.id] && <p className="text-[0.78rem] text-[#d32f2f] mt-0 mb-[0.4rem] mx-0 basis-full">{errors[item.id]}</p>}
                {links[item.id] ? (
                  <a
                    href={links[item.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[0.3rem] px-[0.9rem] py-[0.4rem] rounded-[6px] bg-[#eef0ff] text-[#4648D4] text-[0.82rem] font-medium no-underline transition-colors hover:bg-[#4648D4] hover:text-white"
                  >
                    Télécharger PDF
                  </a>
                ) : (
                  <button
                    onClick={() => handleDownload(item.id)}
                    disabled={downloading === item.id}
                    className="px-[0.9rem] py-[0.4rem] rounded-[6px] bg-[#4648D4] text-white text-[0.82rem] font-medium cursor-pointer transition-colors enabled:hover:bg-[#3335b0] disabled:bg-[#b0b0e0] disabled:cursor-not-allowed"
                  >
                    {downloading === item.id ? "Génération…" : "Générer PDF"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {resteACharger > 0 && (
        <button
          type="button"
          onClick={() => setNombreAffiche(itemsFiltres.length)}
          className="self-center px-[0.9rem] py-[0.4rem] bg-transparent border-0 text-[#4648D4] text-[0.85rem] font-semibold cursor-pointer hover:underline"
        >
          Voir plus ({resteACharger} restant{resteACharger > 1 ? "s" : ""})
        </button>
      )}
      {resteACharger === 0 && itemsFiltres.length > NOMBRE_PAR_DEFAUT && (
        <button
          type="button"
          onClick={() => setNombreAffiche(NOMBRE_PAR_DEFAUT)}
          className="self-center px-[0.9rem] py-[0.4rem] bg-transparent border-0 text-[#4648D4] text-[0.85rem] font-semibold cursor-pointer hover:underline"
        >
          Voir moins
        </button>
      )}
    </div>
  );
}
