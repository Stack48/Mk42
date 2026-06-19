// UTILITAIRES CONTRAT — lib/contrat.utils.ts
//
// Même pattern que lib/commission.utils.ts :
// les règles métier pures (sans DB, sans effets de bord) sont isolées ici.
// Avantage : testables unitairement sans mocker Prisma.
//
// Analogie Symfony : un simple Service (classe sans dépendances d'infrastructure)
// que tu pourrais tester avec un simple `new ContratUtils()`.

import type { ContratStatut } from "@/types/contrat.types";

// Table de toutes les transitions autorisées.
// La clé est le statut "source", la valeur est la liste des statuts "cible" valides.
// Tout ce qui n'est pas dans cette table est interdit.
//
// Cycle de vie : DRAFT → SENT → UPLOADED → VALIDATED | REJECTED
// (sens unique, pas de retour arrière possible)
const TRANSITIONS_VALIDES: Record<ContratStatut, ContratStatut[]> = {
  DRAFT:     ["SENT"],
  SENT:      ["UPLOADED"],
  UPLOADED:  ["VALIDATED", "REJECTED"],
  VALIDATED: [], // statut terminal
  REJECTED:  [], // statut terminal
};

/**
 * Vérifie si une transition de statut est autorisée.
 *
 * @example
 * isContratTransitionValide("DRAFT", "SENT")      // true
 * isContratTransitionValide("DRAFT", "VALIDATED") // false
 */
export function isContratTransitionValide(
  from: ContratStatut,
  to: ContratStatut
): boolean {
  return TRANSITIONS_VALIDES[from].includes(to);
}
