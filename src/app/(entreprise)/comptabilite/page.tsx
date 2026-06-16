import { prisma } from "@/lib/prisma";
import { getCurrentEntrepriseId } from "@/lib/auth";
import { DocumentList } from "./_components/DocumentList";
import { DAS2ExportButton } from "./_components/DAS2ExportButton";
import styles from "./page.module.css";

export default async function ComptabilitePage() {
  const entrepriseId = await getCurrentEntrepriseId();

  const [entreprise, factures, recus, das2Records] = await Promise.all([
    prisma.entreprise.findUniqueOrThrow({ where: { id: entrepriseId } }),
    prisma.facture.findMany({
      where: { entrepriseId },
      include: { apporteur: true },
      orderBy: { dateEmission: "desc" },
    }),
    prisma.recu.findMany({
      where: { entrepriseId },
      include: { apporteur: true },
      orderBy: { dateEmission: "desc" },
    }),
    prisma.dAS2.findMany({
      where: { entrepriseId },
      orderBy: { annee: "desc" },
    }),
  ]);

  const anneeActuelle = new Date().getFullYear();
  const das2Actuel = das2Records.find((d) => d.annee === anneeActuelle) ?? null;

  const montantDAS2 =
    factures
      .filter((f) => f.dateEmission.getFullYear() === anneeActuelle && f.statut === "PAYEE")
      .reduce((s, f) => s + f.montantHT, 0) +
    recus
      .filter((r) => r.dateEmission.getFullYear() === anneeActuelle && r.statut === "PAYE")
      .reduce((s, r) => s + r.montantBrut, 0);

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
            reference: f.numFacture,
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
            reference: r.numRecu,
            apporteur: r.apporteur.nom,
            montant: r.montantBrut,
            date: r.dateEmission.toISOString(),
            statut: r.statut,
          }))}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>DAS2 — Déclaration annuelle</h2>
        </div>
        <div className={styles.das2Card}>
          <div className={styles.das2Info}>
            <div className={styles.das2Stat}>
              <span className={styles.das2StatLabel}>Année</span>
              <span className={styles.das2StatValue}>{anneeActuelle}</span>
            </div>
            <div className={styles.das2Stat}>
              <span className={styles.das2StatLabel}>Statut</span>
              <span
                className={
                  das2Actuel?.statut === "GENERE"
                    ? styles.badgeGenere
                    : styles.badgeNonGenere
                }
              >
                {das2Actuel?.statut ?? "Non générée"}
              </span>
            </div>
            <div className={styles.das2Stat}>
              <span className={styles.das2StatLabel}>Montant total</span>
              <span className={styles.das2StatValue}>
                {montantDAS2.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
          </div>
          <DAS2ExportButton
            entrepriseId={entrepriseId}
            annee={anneeActuelle}
          />
        </div>
      </section>
    </main>
  );
}
