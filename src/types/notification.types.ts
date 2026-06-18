// TYPES — Feature [18-FE] Notifications

export type NotificationType =
  | "NOUVEAU_DEAL"
  | "COMMISSION_CALCULEE"
  | "COMMISSION_PAYEE";

export type Notification = {
  id:        string;
  type:      NotificationType;
  titre:     string;
  message:   string;
  lu:        boolean;
  metadata:  Record<string, unknown> | null;
  createdAt: Date;
  userId:    string;
};

// Libellés et icônes par type
export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { label: string; icon: string; color: string }
> = {
  NOUVEAU_DEAL:        { label: "Nouveau deal",            icon: "🤝", color: "text-[#4F6EF7]" },
  COMMISSION_CALCULEE: { label: "Commission calculée",     icon: "💰", color: "text-[#D97706]" },
  COMMISSION_PAYEE:    { label: "Commission payée",        icon: "✅", color: "text-[#059669]" },
};
