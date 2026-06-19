// UTILITAIRES PURS — Feature [17-FE] Espace Client
// Fonctions sans effet de bord : testables unitairement sans base de données.

import type { InvitationStatut } from "@/types/client.types";

// Transitions d'invitation autorisées
// PENDING → ACCESSED → VALIDATED ou REFUSED
// On ne peut pas revenir en arrière ni changer après VALIDATED/REFUSED.
const TRANSITIONS_VALIDES: Record<InvitationStatut, InvitationStatut[]> = {
  PENDING:   ["ACCESSED"],
  ACCESSED:  ["VALIDATED", "REFUSED"],
  VALIDATED: [],
  REFUSED:   [],
};

export function isInvitationTransitionValide(
  from: InvitationStatut,
  to: InvitationStatut
): boolean {
  return TRANSITIONS_VALIDES[from].includes(to);
}

/** Vérifie qu'un token n'est pas expiré. */
export function isTokenValide(tokenExpiresAt: Date): boolean {
  return new Date() < new Date(tokenExpiresAt);
}
