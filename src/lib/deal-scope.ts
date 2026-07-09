import { prisma } from "@/lib/prisma";

/**
 * Clause `where` (sur KanbanDeal) isolant les deals « liés » à une entreprise.
 *
 * Un deal est visible par l'entreprise si :
 *  - son opportunité lui appartient (elle a « invité » le client), OU
 *  - elle détient la commission du deal.
 *
 * Le lien commission passe par KanbanDeal.commissionDealId → Deal ← Commission,
 * sans relation Prisma directe (commissionDealId est un simple champ) : on récupère
 * donc au préalable les dealId des commissions de l'entreprise.
 */
export async function dealsEntrepriseWhere(entrepriseId: string) {
  const commissions = await prisma.commission.findMany({
    where: { entrepriseId },
    select: { dealId: true },
  });

  return {
    OR: [
      { opportunite: { entrepriseId } },
      { commissionDealId: { in: commissions.map((c) => c.dealId) } },
    ],
  };
}
