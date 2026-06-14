import type { CommissionStatut } from "@/types/commission.types";

const TRANSITIONS_VALIDES: Record<CommissionStatut, CommissionStatut[]> = {
  PENDING: ["TO_PAY"],
  TO_PAY: ["PAID"],
  PAID: [],
};

export function isTransitionValide(
  from: CommissionStatut,
  to: CommissionStatut
): boolean {
  return TRANSITIONS_VALIDES[from].includes(to);
}

export function calculerMontantCommission(
  montantDeal: number,
  taux: number
): number {
  return Math.round(((montantDeal * taux) / 100) * 100) / 100;
}
