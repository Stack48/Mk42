// UTILITAIRES PURS — Feature [11-FE] Pipeline Kanban
// Séparé de deal.actions.ts car "use server" interdit les exports non-async.

import type { KanbanDealStatut } from "@/types/deal.types";

export function isTransitionDealValide(
  from: KanbanDealStatut,
  to: KanbanDealStatut
): boolean {
  return from !== to;
}
