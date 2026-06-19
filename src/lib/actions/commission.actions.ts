"use server";
// ↑ Cette directive dit à Next.js : "ce fichier ne s'exécute QUE sur le serveur".
// Même si un composant React l'importe, les fonctions ne tournent jamais dans le browser.
// Équivalent : un Service Symfony avec ses méthodes, mais appelable directement depuis l'UI.

import { revalidatePath } from "next/cache";
// ↑ revalidatePath() invalide le cache Next.js pour une route donnée.
// Next.js met en cache les pages par défaut (comme un reverse proxy).
// Après une mutation, il faut dire à Next.js de rafraîchir les données → revalidatePath().

import { prisma } from "@/lib/prisma";
import type {
  CommissionStatut,
  CreateCommissionPayload,
  UpdateStatutPayload,
  AuditEntry,
} from "@/types/commission.types";
import {
  isTransitionValide,
  calculerMontantCommission,
} from "@/lib/commission.utils";

// ─── CONSTANTE ────────────────────────────────────────────────────────────────
const DEFAULT_TAUX = Number(process.env.DEFAULT_COMMISSION_RATE ?? 5);

/** Ajoute une entrée dans l'auditTrail. */
function ajouterAuditEntry(
  existing: AuditEntry[],
  from: CommissionStatut | null,
  to: CommissionStatut,
  by?: string
): AuditEntry[] {
  return [
    ...existing,
    {
      from,
      to,
      at: new Date().toISOString(),
      ...(by ? { by } : {}),
    },
  ];
}

// ─── ACTION 1 : Créer une commission quand un Deal est signé ─────────────────
/**
 * Appelée quand un Deal passe au statut SIGNED.
 * Calcule la commission et l'enregistre en PENDING.
 *
 * Prisma : prisma.commission.create() = INSERT INTO commissions ...
 * Le { data: { deal: { connect: { id: dealId } } } } est la façon Prisma
 * de faire une clé étrangère : équivalent de SET dealId = dealId en SQL.
 */
export async function signerDealEtCreerCommission(
  payload: CreateCommissionPayload
): Promise<{ success: boolean; commissionId?: string; error?: string }> {
  const { dealId, apporteurId, entrepriseId, taux = DEFAULT_TAUX } = payload;

  try {
    // Transaction Prisma : les deux opérations (update deal + create commission)
    // sont atomiques. Si l'une échoue, l'autre est annulée (comme BEGIN/COMMIT en SQL).
    const result = await prisma.$transaction(async (tx) => {
      // 1. Récupérer le deal pour avoir son montant
      const deal = await tx.deal.findUniqueOrThrow({ where: { id: dealId } });

      if (deal.statut === "SIGNED") {
        throw new Error("Ce deal est déjà signé.");
      }

      const montantCommission = calculerMontantCommission(deal.montant, taux);

      // 2. Mettre le deal au statut SIGNED
      await tx.deal.update({
        where: { id: dealId },
        data: { statut: "SIGNED" },
      });

      // 3. Créer la commission en PENDING avec audit trail initial
      const auditInitial = ajouterAuditEntry([], null, "PENDING");
      const commission = await tx.commission.create({
        data: {
          montant: montantCommission,
          taux,
          statut: "PENDING",
          entrepriseId,
          auditTrail: auditInitial as object[],
          // "connect" = lier à un enregistrement existant via son ID (clé étrangère)
          deal: { connect: { id: dealId } },
          apporteur: { connect: { id: apporteurId } },
        },
      });

      return commission;
    });

    // Invalider le cache des pages qui affichent des commissions
    revalidatePath("/commissions");
    revalidatePath("/commissions/dashboard");

    return { success: true, commissionId: result.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── ACTION 2 : Changer le statut d'une commission ───────────────────────────
/**
 * PENDING → TO_PAY → PAID
 * Chaque changement est loggé dans auditTrail.
 */
export async function changerStatutCommission(
  payload: UpdateStatutPayload
): Promise<{ success: boolean; error?: string }> {
  const { commissionId, newStatut, by } = payload;

  try {
    const commission = await prisma.commission.findUniqueOrThrow({
      where: { id: commissionId },
    });

    const currentStatut = commission.statut as CommissionStatut;

    if (!isTransitionValide(currentStatut, newStatut)) {
      return {
        success: false,
        error: `Transition interdite : ${currentStatut} → ${newStatut}`,
      };
    }

    // Lire l'auditTrail existant (stocké en JSON dans PostgreSQL)
    const existingAudit = (commission.auditTrail as unknown as AuditEntry[]) ?? [];
    const newAudit = ajouterAuditEntry(existingAudit, currentStatut, newStatut, by);

    await prisma.commission.update({
      where: { id: commissionId },
      data: {
        statut: newStatut,
        auditTrail: newAudit as object[],
        // paidAt : rempli automatiquement quand on passe à PAID
        ...(newStatut === "PAID" ? { paidAt: new Date() } : {}),
      },
    });

    revalidatePath("/commissions");
    revalidatePath("/commissions/dashboard");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: message };
  }
}

// ─── ACTION 3 : Valider le paiement (TO_PAY → PAID) ─────────────────────────
/** Raccourci sémantique pour la validation de paiement par l'entreprise. */
export async function validerPaiement(
  commissionId: string,
  by = "entreprise"
): Promise<{ success: boolean; error?: string }> {
  return changerStatutCommission({ commissionId, newStatut: "PAID", by });
}

// ─── REQUÊTES (lecture seule) ─────────────────────────────────────────────────

/** Toutes les commissions avec leurs relations (pour la vue entreprise). */
export async function getCommissions(filtreStatut?: CommissionStatut) {
  return prisma.commission.findMany({
    where: filtreStatut ? { statut: filtreStatut } : undefined,
    include: {
      deal: true,      // JOIN automatique via la relation Prisma
      apporteur: true, // idem
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Commissions d'un apporteur spécifique. */
export async function getCommissionsApporteur(apporteurId: string) {
  return prisma.commission.findMany({
    where: { apporteurId },
    include: { deal: true, apporteur: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Données ROI pour tous les apporteurs (dashboard). */
export async function getROIApporteurs() {
  const apporteurs = await prisma.apporteur.findMany({
    include: {
      commissions: {
        include: { deal: true },
      },
    },
  });

  return apporteurs.map((a) => {
    const deals = a.commissions.map((c) => c.deal);
    const dealsSignes = deals.filter((d) => d.statut === "SIGNED");
    const montantTotalGenere = dealsSignes.reduce((s, d) => s + d.montant, 0);
    const commissionsTotal = a.commissions.reduce((s, c) => s + c.montant, 0);
    const commissionsPaid = a.commissions
      .filter((c) => c.statut === "PAID")
      .reduce((s, c) => s + c.montant, 0);

    return {
      apporteur: { id: a.id, nom: a.nom, email: a.email },
      totalDeals: deals.length,
      dealsSignes: dealsSignes.length,
      tauxConversion:
        deals.length > 0
          ? Math.round((dealsSignes.length / deals.length) * 100)
          : 0,
      montantTotalGenere,
      commissionsTotal,
      commissionsPaid,
      commissionsPending: commissionsTotal - commissionsPaid,
    };
  });
}

/** Totaux par statut (pour les KPI en haut du tableau). */
export async function getTotauxParStatut() {
  // groupBy = équivalent de SELECT statut, SUM(montant) GROUP BY statut en SQL
  const groupes = await prisma.commission.groupBy({
    by: ["statut"],
    _sum: { montant: true },
  });

  const totaux = { PENDING: 0, TO_PAY: 0, PAID: 0 };
  for (const g of groupes) {
    totaux[g.statut as CommissionStatut] = g._sum.montant ?? 0;
  }
  return totaux;
}
