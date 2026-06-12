// TYPES — Feature [11-FE] Pipeline Kanban des Deals

export type KanbanDealStatut = "PROSPECT" | "CONTACTE" | "NEGOCIE" | "SIGNE" | "PAYE" | "ANNULE";
export type DealDocumentType  = "DEVIS" | "FACTURE" | "AUTRE";
export type MessageAuteurType = "ENTREPRISE" | "APPORTEUR";

export type KanbanDeal = {
  id:               string;
  titre:            string;
  montant:          number;
  mission:          string | null;
  clientNom:        string;
  clientEmail:      string | null;
  clientTel:        string | null;
  statut:           KanbanDealStatut;
  commissionGelee:  boolean;
  position:         number;
  commissionDealId: string | null;
  createdAt:        Date;
  updatedAt:        Date;
  apporteurId:      string;
  apporteur:        { id: string; nom: string; email: string };
  documents:        DealDocument[];
  messages:         DealMessage[];
};

export type DealDocument = {
  id:         string;
  nom:        string;
  type:       DealDocumentType;
  filePath:   string;
  fileSize:   number;
  mimeType:   string;
  uploadedBy: string;
  createdAt:  Date;
  dealId:     string;
};

export type DealMessage = {
  id:         string;
  contenu:    string;
  auteurId:   string;
  auteurType: MessageAuteurType;
  lu:         boolean;
  createdAt:  Date;
  dealId:     string;
};

export type CreateDealPayload = {
  titre:       string;
  montant:     number;
  mission?:    string;
  clientNom:   string;
  clientEmail?: string;
  clientTel?:  string;
  apporteurId: string;
};

// Couleurs des colonnes kanban par statut
export const KANBAN_COLUMN_STYLES: Record<
  KanbanDealStatut,
  { headerBg: string; label: string }
> = {
  PROSPECT: { headerBg: "#F3F4F6", label: "Prospect" },
  CONTACTE: { headerBg: "#DBEAFE", label: "Contacté" },
  NEGOCIE:  { headerBg: "#FEF3C7", label: "Négocié" },
  SIGNE:    { headerBg: "#D1FAE5", label: "Signé" },
  PAYE:     { headerBg: "#A7F3D0", label: "Payé" },
  ANNULE:   { headerBg: "#FEE2E2", label: "Annulé" },
};

export const KANBAN_STATUTS: KanbanDealStatut[] = [
  "PROSPECT", "CONTACTE", "NEGOCIE", "SIGNE", "PAYE", "ANNULE",
];
