import { prisma } from "@/lib/prisma";
import { getCurrentEntrepriseId } from "@/lib/auth";
import { DocumentList } from "./_components/DocumentList";
import { DAS2YearGrid } from "./_components/DAS2YearGrid";
import { getDAS2Overview } from "@/server/documents/das2-aggregation";
import styles from "./page.module.css";

export default async function ComptabilitePage() {
  const entrepriseId = await getCurrentEntrepriseId();

  const [entreprise, factures, recus, das2Overview] = await Promise.all([
    prisma.entreprise.findUniqueOrThrow({ where: { id: entrepriseId } }),
    prisma.facture.findMany({
      where: { entrepriseId },
      include: { apporteur: true },
      orderBy: { dateEmission: "desc" },
    }),
    prisma.recu.findMany({
      where: { entrepriseId },
      include: { apporteur: true },
      orderBy: { dateVersement: "desc" },
    }),
    getDAS2Overview(entrepriseId),
  ]);

  return (
    <main className={styles.container}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Comptabilité</h1>
        <p className={styles.pageSubtitle}>{entreprise.raisonSociale}</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Factures</h2>
        </div>
        <DocumentList
          type="facture"
          items={factures.map((f) => ({
            id: f.id,
            reference: f.numero,
            apporteur: f.apporteur.nom,
            montant: f.montantTTC,
            date: f.dateEmission.toISOString(),
            statut: f.statut,
          }))}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Reçus de commission</h2>
        </div>
        <DocumentList
          type="recu"
          items={recus.map((r) => ({
            id: r.id,
            reference: r.numero,
            apporteur: r.apporteur.nom,
            montant: r.montant,
            date: (r.dateVersement ?? r.createdAt).toISOString(),
            statut: r.dateVersement ? "PAYE" : "EN_ATTENTE",
          }))}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>DAS2 — Déclaration annuelle</h2>
        </div>
        <DAS2YearGrid entrepriseId={entrepriseId} annees={das2Overview} />
      </section>
    </main>
  );
}
