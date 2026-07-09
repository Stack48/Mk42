"use server";
// ↑ Server Action — s'exécute uniquement côté serveur (jamais dans le navigateur).

import { prisma } from "@/lib/prisma";

export type ApporteurEntrepriseRow = {
  id: string;
  nom: string;
  email: string;
  adresse: string | null;
  ville: string | null;
  nombreCommissions: number;
  montantApporte: number;
  derniereActivite: Date;
};

/**
 * Liste des apporteurs en lien avec cette entreprise (opportunité soumise ou
 * commission déjà générée), avec leurs statistiques agrégées, triée par
 * activité la plus récente. Un apporteur sans commission signée apparaît
 * quand même, avec 0 commission / 0 € apporté.
 */
export async function getApporteursEntreprise(
  entrepriseId: string
): Promise<ApporteurEntrepriseRow[]> {
  const [commissions, opportunites] = await Promise.all([
    prisma.commission.findMany({
      where: { entrepriseId },
      include: {
        apporteur: {
          include: { utilisateur: { select: { email: true } } },
        },
        deal: { select: { montant: true } },
      },
    }),
    prisma.opportunite.findMany({
      where: { entrepriseId },
      include: {
        apporteur: {
          include: { utilisateur: { select: { email: true } } },
        },
      },
    }),
  ]);

  const parApporteur = new Map<string, ApporteurEntrepriseRow>();

  for (const opportunite of opportunites) {
    parApporteur.set(opportunite.apporteurId, {
      id: opportunite.apporteur.id,
      nom: `${opportunite.apporteur.prenom} ${opportunite.apporteur.nom}`,
      email: opportunite.apporteur.utilisateur.email,
      adresse: opportunite.apporteur.adresse,
      ville: opportunite.apporteur.ville,
      nombreCommissions: 0,
      montantApporte: 0,
      derniereActivite: opportunite.createdAt,
    });
  }

  for (const commission of commissions) {
    const existant = parApporteur.get(commission.apporteurId);

    if (existant) {
      existant.nombreCommissions += 1;
      existant.montantApporte += commission.deal.montant;
      if (commission.createdAt > existant.derniereActivite) {
        existant.derniereActivite = commission.createdAt;
      }
    } else {
      parApporteur.set(commission.apporteurId, {
        id: commission.apporteur.id,
        nom: `${commission.apporteur.prenom} ${commission.apporteur.nom}`,
        email: commission.apporteur.utilisateur.email,
        adresse: commission.apporteur.adresse,
        ville: commission.apporteur.ville,
        nombreCommissions: 1,
        montantApporte: commission.deal.montant,
        derniereActivite: commission.createdAt,
      });
    }
  }

  return Array.from(parApporteur.values()).sort(
    (a, b) => b.derniereActivite.getTime() - a.derniereActivite.getTime()
  );
}
