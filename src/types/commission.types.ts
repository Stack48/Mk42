// TYPES TypeScript pour la feature Commission
//
// Prisma génère ses propres types depuis le schéma, mais on définit ici
// des types "métier" enrichis pour l'UI (avec les relations incluses).
// C'est l'équivalent des DTOs en Symfony.

// ─── ENUMS (miroir des enums Prisma, utilisables côté client aussi) ───────────
export type CommissionStatut = "PENDING" | "TO_PAY" | "PAID";
export type DealStatut = "DRAFT" | "SIGNED" | "LOST" | "CANCELLED";

// ─── AUDIT TRAIL ─────────────────────────────────────────────────────────────
// Une entrée dans l'historique des changements de statut
export interface AuditEntry {
  from: CommissionStatut | null; // null = création initiale
  to: CommissionStatut;
  at: string; // ISO 8601 timestamp
  by?: string; // optionnel : qui a fait le changement
}

// ─── COMMISSION (avec relations) ─────────────────────────────────────────────
// Type complet pour l'affichage (inclut apporteur + deal)
export interface CommissionWithRelations {
  id: string;
  montant: number;
  taux: number;
  statut: CommissionStatut;
  entrepriseId: string;
  paidAt: Date | null;
  auditTrail: AuditEntry[];
  createdAt: Date;
  updatedAt: Date;
  dealId: string;
  apporteurId: string;
  deal: {
    id: string;
    titre: string;
    montant: number;
    statut: DealStatut;
  };
  apporteur: {
    id: string;
    nom: string;
    email: string;
  };
}

// ─── RÉSULTATS DASHBOARD ─────────────────────────────────────────────────────
// Données agrégées pour le dashboard ROI par apporteur
export interface ApporteurROI {
  apporteur: {
    id: string;
    nom: string;
    email: string;
  };
  totalDeals: number;
  dealsSignes: number;
  tauxConversion: number; // en %
  montantTotalGenere: number; // somme des deals signés
  commissionsTotal: number; // somme de toutes les commissions
  commissionsPaid: number; // somme des commissions PAID
  commissionsPending: number; // PENDING + TO_PAY
}

// ─── TOTAUX PAR STATUT ────────────────────────────────────────────────────────
export interface TotauxStatut {
  PENDING: number;
  TO_PAY: number;
  PAID: number;
}

// ─── PAYLOAD Server Actions ───────────────────────────────────────────────────
// Ce que tu envoies à chaque Server Action (équivalent des Request DTOs en Symfony)

export interface CreateCommissionPayload {
  dealId: string;
  apporteurId: string;
  entrepriseId: string;
  taux?: number; // optionnel, défaut 5%
}

export interface UpdateStatutPayload {
  commissionId: string;
  newStatut: CommissionStatut;
  by?: string; // qui fait le changement
}
