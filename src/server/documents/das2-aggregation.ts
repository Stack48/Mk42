import { prisma } from "@/lib/prisma";
import type { Apporteur } from "@/generated/prisma/client/client";

export function apporteurNomOuRS(
  apporteur: Pick<Apporteur, "type" | "nom" | "prenom" | "raisonSociale">
): string {
  return apporteur.type === "PROFESSIONNEL" && apporteur.raisonSociale
    ? apporteur.raisonSociale
    : `${apporteur.prenom} ${apporteur.nom}`.trim();
}

export function formatAdresseComplete(parts: {
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  pays?: string | null;
}): string {
  const ligneVille = [parts.codePostal, parts.ville].filter(Boolean).join(" ");
  return [parts.adresse, ligneVille, parts.pays].filter(Boolean).join(", ");
}

export interface TotalApporteurAnnee {
  apporteur: Apporteur;
  total: number;
}

// Seuil légal DAS2 (BOFiP du 12 février 2025) : en dessous, aucune obligation
// de déclaration pour ce bénéficiaire, même en cumulant sur l'année civile.
export const SEUIL_DAS2_TTC = 2400;

export function filtrerEligiblesDAS2(
  totaux: TotalApporteurAnnee[]
): TotalApporteurAnnee[] {
  return totaux.filter((t) => t.total >= SEUIL_DAS2_TTC);
}

export async function getTotauxDAS2ParAnnee(
  entrepriseId: string
): Promise<Map<number, TotalApporteurAnnee[]>> {
  const [factures, recus] = await Promise.all([
    prisma.facture.findMany({
      where: { entrepriseId, statut: "PAYEE", datePaiement: { not: null } },
      include: { apporteur: true },
    }),
    prisma.recu.findMany({
      where: { entrepriseId, dateVersement: { not: null } },
      include: { apporteur: true },
    }),
  ]);

  const parAnnee = new Map<number, Map<string, TotalApporteurAnnee>>();

  function addMontant(annee: number, apporteur: Apporteur, montant: number) {
    const parApporteur = parAnnee.get(annee) ?? new Map<string, TotalApporteurAnnee>();
    const entry = parApporteur.get(apporteur.id) ?? { apporteur, total: 0 };
    entry.total += montant;
    parApporteur.set(apporteur.id, entry);
    parAnnee.set(annee, parApporteur);
  }

  // getUTCFullYear (pas getFullYear) : bornes UTC explicites, indépendant du
  // fuseau serveur. Bucketing sur la date de versement (datePaiement), pas la
  // date d'émission : seule la date à laquelle la commission est
  // effectivement payée compte pour la DAS2, pas celle du chantier/contrat.
  // Montant TTC (pas HT) : la DAS2 déclare les sommes réellement versées.
  for (const f of factures) {
    addMontant(f.datePaiement!.getUTCFullYear(), f.apporteur, f.montantTTC);
  }
  // dateVersement filtré non-null côté requête, mais TS le voit encore comme nullable
  for (const r of recus) {
    addMontant(r.dateVersement!.getUTCFullYear(), r.apporteur, r.montant);
  }

  const result = new Map<number, TotalApporteurAnnee[]>();
  for (const [annee, parApporteur] of parAnnee) {
    result.set(annee, Array.from(parApporteur.values()));
  }
  return result;
}

export interface DAS2BeneficiaireDetail {
  apporteurId: string;
  nom: string;
  type: "PARTICULIER" | "PROFESSIONNEL";
  siret: string | null;
  montant: number;
}

export interface DAS2AnneeStat {
  annee: number;
  montantTotal: number;
  nombreBeneficiaires: number;
  statut: "GENERE" | "NON_GENERE";
  dateGeneration: Date | null;
  beneficiaires: DAS2BeneficiaireDetail[];
}

export async function getDAS2Overview(entrepriseId: string): Promise<DAS2AnneeStat[]> {
  const [totauxParAnnee, das2Rows] = await Promise.all([
    getTotauxDAS2ParAnnee(entrepriseId),
    prisma.dAS2.findMany({ where: { entrepriseId } }),
  ]);

  const anneeActuelle = new Date().getFullYear();
  const annees = new Set<number>([
    anneeActuelle,
    ...totauxParAnnee.keys(),
    ...das2Rows.map((d) => d.annee),
  ]);

  return Array.from(annees)
    .map((annee) => {
      const totaux = filtrerEligiblesDAS2(totauxParAnnee.get(annee) ?? []);
      const das2DeLAnnee = das2Rows.filter((d) => d.annee === annee);

      const das2GenereDeLAnnee = das2DeLAnnee.filter((d) => d.statut === "GENERE");

      return {
        annee,
        montantTotal: totaux.reduce((s, t) => s + t.total, 0),
        nombreBeneficiaires: totaux.length,
        statut: (das2DeLAnnee.some((d) => d.statut === "GENERE")
          ? "GENERE"
          : "NON_GENERE") as "GENERE" | "NON_GENERE",
        dateGeneration:
          das2GenereDeLAnnee.length > 0
            ? das2GenereDeLAnnee.reduce(
                (max, d) => (d.updatedAt > max ? d.updatedAt : max),
                das2GenereDeLAnnee[0].updatedAt
              )
            : null,
        beneficiaires: totaux.map(({ apporteur, total }) => ({
          apporteurId: apporteur.id,
          nom: apporteurNomOuRS(apporteur),
          type: apporteur.type,
          siret: apporteur.siret ?? null,
          montant: total,
        })),
      };
    })
    .sort((a, b) => b.annee - a.annee);
}
