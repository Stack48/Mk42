// UTILITAIRES PURS — Feature Opportunite → KanbanDeal
// Fonctions sans effet de bord : testables unitairement sans base de données.

export function formatClientLabel(client: {
  estProfessionnel: boolean;
  raisonSociale: string | null;
  prenom: string | null;
  nom: string | null;
}): string {
  return client.estProfessionnel
    ? (client.raisonSociale ?? "—")
    : `${client.prenom ?? ""} ${client.nom ?? ""}`.trim() || "—";
}
