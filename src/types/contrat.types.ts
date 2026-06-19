// TYPES TypeScript pour la feature Contrat [13-BE]
//
// Ces types sont des "miroirs" des enums et modèles Prisma,
// mais utilisables côté client (dans les Client Components).
//
// Pourquoi dupliquer ? Prisma génère des types côté serveur uniquement.
// Pour les Client Components qui n'ont pas accès à Prisma,
// on définit des types équivalents ici.
//
// Analogie Symfony : les DTOs (Data Transfer Objects) qui séparent
// les entités Doctrine des données exposées à la vue.

// ─── ENUMS ───────────────────────────────────────────────────────────────────
// Miroir des enums Prisma ContratStatut et ContratAction
export type ContratStatut = "DRAFT" | "SENT" | "UPLOADED" | "VALIDATED" | "REJECTED";
export type ContratAction = "GENERATED" | "LINK_OPENED" | "SIGNED_UPLOADED" | "VALIDATED" | "REJECTED";

// ─── LOG D'ACCÈS ──────────────────────────────────────────────────────────────
// Une entrée dans le journal d'audit d'un contrat
export interface ContratAccessLogEntry {
  id: string;
  action: ContratAction;
  userId: string | null;   // null si c'est l'apporteur (non connecté)
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// ─── DONNÉES DU TEMPLATE ─────────────────────────────────────────────────────
// Les données nécessaires pour générer le PDF du contrat.
// Stockées en JSON dans Prisma (champ templateData) pour pouvoir
// régénérer le PDF à tout moment sans refaire les calculs.
export interface ContratTemplateData {
  entrepriseNom: string;
  entrepriseSiret: string;
  apporteurNom: string;
  apporteurEmail: string;
  dealTitre: string;
  dealMontant: number;
  tauxCommission: number;
  dateGeneration: string; // format ISO "2024-01-15"
  numeroContrat: string;  // ex: "CTR-2024-001"
}

// ─── CONTRAT AVEC RELATIONS ──────────────────────────────────────────────────
// Type complet pour l'affichage dans l'UI (inclut deal, apporteur, logs).
// Équivalent d'un DTO enrichi en Symfony.
export interface ContratWithRelations {
  id: string;
  statut: ContratStatut;
  token: string;
  tokenExpiresAt: Date;
  templateData: ContratTemplateData;
  fileOriginalPath: string | null;   // PDF généré, null si pas encore créé
  fileSignedPath: string | null;     // PDF signé par l'apporteur, null si pas encore uploadé
  validatedAt: Date | null;
  validatedBy: string | null;        // ID ou nom de l'admin validateur
  rejectedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  dealId: string;
  apporteurId: string;
  // Relations chargées via Prisma include
  deal: { id: string; titre: string; montant: number; statut: string };
  apporteur: { id: string; nom: string; email: string };
  accessLogs: ContratAccessLogEntry[];
}
