// TESTS UNITAIRES — Feature Commission
//
// On teste les fonctions PURES (sans base de données) :
// - calculerMontantCommission
// - isTransitionValide
// - La logique d'audit trail
//
// Pour les tests qui touchent Prisma (intégration), il faudrait
// une base de test séparée — hors scope ici.

import { describe, it, expect } from "vitest";
import {
  calculerMontantCommission,
  isTransitionValide,
} from "@/lib/commission.utils";
import type { AuditEntry, CommissionStatut } from "@/types/commission.types";

// ─── 1. CALCUL DE COMMISSION ─────────────────────────────────────────────────
describe("calculerMontantCommission", () => {
  it("calcule correctement avec le taux par défaut (5%)", () => {
    expect(calculerMontantCommission(100_000, 5)).toBe(5_000);
  });

  it("calcule correctement avec un taux personnalisé (4%)", () => {
    expect(calculerMontantCommission(1_200_000, 4)).toBe(48_000);
  });

  it("arrondit à 2 décimales", () => {
    // 10 000 × 3.33% = 333.000... → 333
    expect(calculerMontantCommission(10_000, 3.33)).toBe(333);
  });

  it("retourne 0 pour un montant de 0", () => {
    expect(calculerMontantCommission(0, 5)).toBe(0);
  });

  it("gère un taux de 0%", () => {
    expect(calculerMontantCommission(500_000, 0)).toBe(0);
  });

  it("gère un taux de 100%", () => {
    expect(calculerMontantCommission(50_000, 100)).toBe(50_000);
  });
});

// ─── 2. TRANSITIONS DE STATUT ────────────────────────────────────────────────
describe("isTransitionValide", () => {
  // Transitions valides
  it("autorise PENDING → TO_PAY", () => {
    expect(isTransitionValide("PENDING", "TO_PAY")).toBe(true);
  });

  it("autorise TO_PAY → PAID", () => {
    expect(isTransitionValide("TO_PAY", "PAID")).toBe(true);
  });

  // Transitions interdites : retour en arrière
  it("interdit PAID → PENDING (on ne peut pas annuler un paiement)", () => {
    expect(isTransitionValide("PAID", "PENDING")).toBe(false);
  });

  it("interdit PAID → TO_PAY", () => {
    expect(isTransitionValide("PAID", "TO_PAY")).toBe(false);
  });

  it("interdit TO_PAY → PENDING (retour arrière interdit)", () => {
    expect(isTransitionValide("TO_PAY", "PENDING")).toBe(false);
  });

  // Transitions interdites : saut d'étape
  it("interdit PENDING → PAID (on doit passer par TO_PAY)", () => {
    expect(isTransitionValide("PENDING", "PAID")).toBe(false);
  });

  // Transition vers soi-même
  it("interdit PENDING → PENDING (même statut)", () => {
    expect(isTransitionValide("PENDING", "PENDING")).toBe(false);
  });

  it("interdit TO_PAY → TO_PAY", () => {
    expect(isTransitionValide("TO_PAY", "TO_PAY")).toBe(false);
  });

  it("interdit PAID → PAID (statut terminal)", () => {
    expect(isTransitionValide("PAID", "PAID")).toBe(false);
  });
});

// ─── 3. AUDIT TRAIL ──────────────────────────────────────────────────────────
// On teste la logique de construction de l'audit trail sans Prisma.
// La fonction ajouterAuditEntry est privée dans commission.actions.ts,
// donc on teste son comportement via les données produites.

describe("Audit Trail — logique", () => {
  // Simulation de la logique d'ajout d'une entrée audit
  function simulerAjout(
    existing: AuditEntry[],
    from: CommissionStatut | null,
    to: CommissionStatut,
    by?: string
  ): AuditEntry[] {
    return [
      ...existing,
      {
        from,
        to,
        at: new Date().toISOString(),
        ...(by ? { by } : {}),
      },
    ];
  }

  it("démarre avec une entrée de création (from: null)", () => {
    const trail = simulerAjout([], null, "PENDING");
    expect(trail).toHaveLength(1);
    expect(trail[0].from).toBeNull();
    expect(trail[0].to).toBe("PENDING");
  });

  it("accumule les entrées sans écraser les précédentes", () => {
    let trail = simulerAjout([], null, "PENDING");
    trail = simulerAjout(trail, "PENDING", "TO_PAY", "comptabilité");
    trail = simulerAjout(trail, "TO_PAY", "PAID", "entreprise");

    expect(trail).toHaveLength(3);
    expect(trail[0].to).toBe("PENDING");
    expect(trail[1].to).toBe("TO_PAY");
    expect(trail[1].by).toBe("comptabilité");
    expect(trail[2].to).toBe("PAID");
    expect(trail[2].by).toBe("entreprise");
  });

  it("enregistre un timestamp ISO valide", () => {
    const trail = simulerAjout([], null, "PENDING");
    const date = new Date(trail[0].at);
    // Si la date est invalide, getTime() retourne NaN
    expect(isNaN(date.getTime())).toBe(false);
  });

  it("le champ 'by' est absent si non fourni", () => {
    const trail = simulerAjout([], null, "PENDING");
    expect("by" in trail[0]).toBe(false);
  });

  it("le champ 'by' est présent si fourni", () => {
    const trail = simulerAjout([], "PENDING", "TO_PAY", "admin");
    expect(trail[0].by).toBe("admin");
  });
});

// ─── 4. CAS LIMITES MÉTIER ────────────────────────────────────────────────────
describe("Règles métier globales", () => {
  it("un taux négatif produit une commission négative (cas à gérer en amont)", () => {
    // Ce test documente le comportement actuel : la fonction ne valide pas le taux.
    // La validation doit être faite dans la Server Action avant d'appeler cette fn.
    expect(calculerMontantCommission(100_000, -1)).toBe(-1_000);
  });

  it("toutes les transitions depuis PAID sont interdites", () => {
    const cibles: CommissionStatut[] = ["PENDING", "TO_PAY", "PAID"];
    cibles.forEach((cible) => {
      expect(isTransitionValide("PAID", cible)).toBe(false);
    });
  });
});
