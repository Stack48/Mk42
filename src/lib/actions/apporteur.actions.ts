"use server";
// ↑ Server Action — s'exécute uniquement côté serveur (jamais dans le navigateur).

import { prisma } from "@/lib/prisma";

export type ApporteurEntrepriseRow = {
  id: string;
  nom: string;
  email: string;
  nombreCommissions: number;
  montantApporte: number;
  derniereActivite: Date;
};

/**
 * Liste des apporteurs ayant déjà généré une commission avec cette entreprise,
 * avec leurs statistiques agrégées, triée par activité la plus récente.
 */
export async function getApporteursEntreprise(
  entrepriseId: string
): Promise<ApporteurEntrepriseRow[]> {
  const commissions = await prisma.commission.findMany({
    where: { entrepriseId },
    include: {
      apporteur: {
        include: { utilisateur: { select: { email: true } } },
      },
      deal: { select: { montant: true } },
    },
  });

  const parApporteur = new Map<string, ApporteurEntrepriseRow>();

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
