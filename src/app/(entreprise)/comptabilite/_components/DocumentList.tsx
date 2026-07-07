"use client";

import { useState } from "react";
import { exportDocumentAction } from "../_actions";
import { getAnneesDisponibles, filterItems, type DocumentItem } from "./documentListFilters";
import styles from "./DocumentList.module.css";

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
      <div className={styles.empty}>
        Aucun{type === "facture" ? "e facture" : " reçu"} enregistré.
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <input
          type="text"
          value={recherche}
          onChange={(e) => handleRechercheChange(e.target.value)}
          placeholder="Rechercher par nom ou référence"
          className={styles.searchInput}
        />
        <select
          value={anneeFiltre}
          onChange={(e) => handleAnneeChange(e.target.value)}
          className={styles.yearSelect}
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
        <div className={styles.empty}>Aucun résultat pour cette recherche.</div>
      ) : (
        <div className={styles.list}>
          {itemsAffiches.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemLeft}>
                <span className={styles.reference}>{item.reference}</span>
                <span className={styles.apporteurNom}>{item.apporteur}</span>
              </div>
              <div className={styles.itemCenter}>{formatDate(item.date)}</div>
              <div className={styles.itemRight}>
                <span className={styles.montant}>{formatMontant(item.montant)}</span>
                <span className={styles.badge}>
                  {STATUT_LABELS[item.statut] ?? item.statut}
                </span>
                {errors[item.id] && <p className={styles.error}>{errors[item.id]}</p>}
                {links[item.id] ? (
                  <a
                    href={links[item.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.downloadLink}
                  >
                    Télécharger PDF
                  </a>
                ) : (
                  <button
                    onClick={() => handleDownload(item.id)}
                    disabled={downloading === item.id}
                    className={styles.button}
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
          className={styles.showMoreButton}
        >
          Voir plus ({resteACharger} restant{resteACharger > 1 ? "s" : ""})
        </button>
      )}
      {resteACharger === 0 && itemsFiltres.length > NOMBRE_PAR_DEFAUT && (
        <button
          type="button"
          onClick={() => setNombreAffiche(NOMBRE_PAR_DEFAUT)}
          className={styles.showMoreButton}
        >
          Voir moins
        </button>
      )}
    </div>
  );
}
