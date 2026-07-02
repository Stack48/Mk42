// UTILITAIRES PURS — Feature [11-FE] Pipeline Kanban
// Séparé de deal.actions.ts car "use server" interdit les exports non-async.

import type { KanbanDealStatut } from "@/types/deal.types";

export function isTransitionDealValide(
  from: KanbanDealStatut,
  to: KanbanDealStatut
): boolean {
  // Terminal states: no outgoing transitions allowed
  if (from === "ANNULE" || from === "PAYE") {
    return false;
  }

  // Cannot stay in the same state
  if (from === to) {
    return false;
  }

  // Forward sequence: PROSPECT → CONTACTE → SIGNE → PAYE
  const sequence = ["PROSPECT", "CONTACTE", "SIGNE", "PAYE"];
  const fromIndex = sequence.indexOf(from);
  const toIndex = sequence.indexOf(to);

  // Special case: ANNULE is reachable from PROSPECT, CONTACTE, SIGNE (but not PAYE)
  if (to === "ANNULE") {
    return fromIndex !== -1 && fromIndex < 3;
  }

  // For all other transitions: must move forward in the sequence
  return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
}
