// UTILITAIRES PURS — Feature [11-FE] Pipeline Kanban
// Séparé de deal.actions.ts car "use server" interdit les exports non-async.

import type { KanbanDealStatut } from "@/types/deal.types";

const TRANSITIONS_AUTORISEES: Record<KanbanDealStatut, KanbanDealStatut[]> = {
  PROSPECT: ["CONTACTE", "ANNULE"],
  CONTACTE: ["NEGOCIE", "SIGNE", "ANNULE"],
  NEGOCIE:  ["SIGNE", "ANNULE"],
  SIGNE:    ["PAYE", "ANNULE"],
  PAYE:     [],
  ANNULE:   [],
};

export function isTransitionDealValide(
  from: KanbanDealStatut,
  to: KanbanDealStatut
): boolean {
  return TRANSITIONS_AUTORISEES[from].includes(to);
}
