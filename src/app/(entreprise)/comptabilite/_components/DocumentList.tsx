"use client";

import { useState } from "react";
import { exportFacturePDFAction, exportRecuPDFAction } from "../_actions";
import styles from "./DocumentList.module.css";

interface DocumentItem {
  id: string;
  reference: string;
  apporteur: string;
  montant: number;
  date: string;
  statut: string;
}

interface Props {
  type: "facture" | "recu";
  items: DocumentItem[];
}

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

  async function handleDownload(id: string) {
    setDownloading(id);
    setErrors((e) => ({ ...e, [id]: "" }));
    try {
      const action = type === "facture" ? exportFacturePDFAction : exportRecuPDFAction;
      const result = await action(id);
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
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Référence</th>
            <th className={styles.th}>Apporteur</th>
            <th className={styles.th}>Montant</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Statut</th>
            <th className={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={styles.tr}>
              <td className={styles.td}>
                <span className={styles.reference}>{item.reference}</span>
              </td>
              <td className={styles.td}>{item.apporteur}</td>
              <td className={styles.td}>{formatMontant(item.montant)}</td>
              <td className={styles.td}>{formatDate(item.date)}</td>
              <td className={styles.td}>
                <span className={styles.badge}>
                  {STATUT_LABELS[item.statut] ?? item.statut}
                </span>
              </td>
              <td className={styles.td}>
                {errors[item.id] && (
                  <p className={styles.error}>{errors[item.id]}</p>
                )}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
