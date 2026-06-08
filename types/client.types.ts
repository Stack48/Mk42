// TYPES — Feature [17-FE] Espace Client
//
// Même pattern que commission.types.ts et contrat.types.ts :
// on définit des types métier qui enrichissent les types Prisma bruts
// avec leurs relations (JOIN Prisma = include dans les requêtes).

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export type InvitationStatut = "PENDING" | "ACCESSED" | "VALIDATED" | "REFUSED";

export type ClientEvenementType =
  | "INVITATION_ENVOYEE"
  | "DOSSIER_CONSULTE"
  | "ETAPE_VALIDEE"
  | "ETAPE_REFUSEE";

// ─── TYPES AVEC RELATIONS ─────────────────────────────────────────────────────

// ClientInvitation avec le Deal associé (pour la vue admin : on affiche le titre du deal)
export type InvitationWithDeal = {
  id: string;
  email: string;
  nom: string;
  token: string;
  tokenExpiresAt: Date;
  statut: InvitationStatut;
  createdAt: Date;
  updatedAt: Date;
  deal: {
    id: string;
    titre: string;
    montant: number;
    statut: string;
  };
  evenements: ClientEvenement[];
};

// ClientEvenement seul (utilisé dans la timeline)
export type ClientEvenement = {
  id: string;
  type: ClientEvenementType;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;
  invitationId: string;
};

// ─── PAYLOADS POUR LES SERVER ACTIONS ────────────────────────────────────────

// Données nécessaires pour créer une invitation
export type InviterClientPayload = {
  dealId: string;
  email: string;
  nom: string;
};

// Libellés lisibles pour l'affichage des types d'événements
export const CLIENT_EVENEMENT_LABELS: Record<ClientEvenementType, string> = {
  INVITATION_ENVOYEE: "Invitation envoyée",
  DOSSIER_CONSULTE:   "Dossier consulté",
  ETAPE_VALIDEE:      "Étape validée",
  ETAPE_REFUSEE:      "Étape refusée",
};

// Libellés lisibles pour les statuts d'invitation
export const INVITATION_STATUT_LABELS: Record<InvitationStatut, string> = {
  PENDING:   "En attente",
  ACCESSED:  "Consulté",
  VALIDATED: "Validé",
  REFUSED:   "Refusé",
};
