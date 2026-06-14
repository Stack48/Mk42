// TESTS UNITAIRES — Feature [17-FE] Espace Client
//
// Même approche que contrat.test.ts : on teste uniquement les fonctions PURES,
// sans base de données réelle. Les appels Prisma sont mockés avec vi.mock().
//
// vi.mock() remplace un module entier par des "faux" contrôlables :
//   vi.fn() crée une fausse fonction dont on peut piloter la valeur de retour.
//   mockResolvedValue() = "quand cette fonction est appelée, renvoie cette valeur".

import { describe, it, expect, vi, beforeEach } from "vitest";
import { randomBytes } from "crypto";
import { isInvitationTransitionValide, isTokenValide } from "@/lib/client.utils";
import type { InvitationStatut } from "@/types/client.types";

// ─── 1. GÉNÉRATION DE TOKEN ───────────────────────────────────────────────────

describe("Génération de token", () => {
  it("produit exactement 64 caractères hexadécimaux", () => {
    const token = randomBytes(32).toString("hex");
    expect(token).toHaveLength(64);
  });

  it("est composé uniquement de caractères hex [0-9a-f]", () => {
    const token = randomBytes(32).toString("hex");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("deux tokens consécutifs sont différents (unicité)", () => {
    const t1 = randomBytes(32).toString("hex");
    const t2 = randomBytes(32).toString("hex");
    expect(t1).not.toBe(t2);
  });
});

// ─── 2. EXPIRATION DE TOKEN ───────────────────────────────────────────────────

describe("Expiration de token", () => {
  it("accepte un token dont la date d'expiration est dans le futur", () => {
    const futur = new Date(Date.now() + 3600 * 1000); // +1h
    expect(isTokenValide(futur)).toBe(true);
  });

  it("rejette un token dont la date d'expiration est passée", () => {
    const passe = new Date(Date.now() - 1000); // -1s
    expect(isTokenValide(passe)).toBe(false);
  });

  it("rejette un token expiré exactement à l'instant présent", () => {
    // new Date(Date.now()) < new Date(Date.now()) → false
    const maintenant = new Date(Date.now() - 1);
    expect(isTokenValide(maintenant)).toBe(false);
  });
});

// ─── 3. TRANSITIONS DE STATUT ─────────────────────────────────────────────────

describe("Transitions de statut invitation", () => {
  // Transitions autorisées
  it("autorise PENDING → ACCESSED (premier accès)", () => {
    expect(isInvitationTransitionValide("PENDING", "ACCESSED")).toBe(true);
  });

  it("autorise ACCESSED → VALIDATED (le client valide)", () => {
    expect(isInvitationTransitionValide("ACCESSED", "VALIDATED")).toBe(true);
  });

  it("autorise ACCESSED → REFUSED (le client refuse)", () => {
    expect(isInvitationTransitionValide("ACCESSED", "REFUSED")).toBe(true);
  });

  // Transitions interdites
  it("interdit PENDING → VALIDATED (sans passer par ACCESSED)", () => {
    expect(isInvitationTransitionValide("PENDING", "VALIDATED")).toBe(false);
  });

  it("interdit PENDING → REFUSED (sans passer par ACCESSED)", () => {
    expect(isInvitationTransitionValide("PENDING", "REFUSED")).toBe(false);
  });

  it("interdit VALIDATED → REFUSED (pas de retour en arrière)", () => {
    expect(isInvitationTransitionValide("VALIDATED", "REFUSED")).toBe(false);
  });

  it("interdit REFUSED → VALIDATED (pas de retour en arrière)", () => {
    expect(isInvitationTransitionValide("REFUSED", "VALIDATED")).toBe(false);
  });

  it("interdit VALIDATED → PENDING (pas de retour en arrière)", () => {
    expect(isInvitationTransitionValide("VALIDATED", "PENDING")).toBe(false);
  });
});

// ─── 4. CRÉATION D'ÉVÉNEMENTS CLIENT ─────────────────────────────────────────
//
// On mocke Prisma pour vérifier que chaque action crée bien un ClientEvenement.
// Sans mock, le test nécessiterait une vraie base PostgreSQL (tests d'intégration).

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    clientInvitation: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/email/client.email", () => ({
  sendInvitationEmail: vi.fn().mockResolvedValue(undefined),
}));

// On importe après le mock pour que Vitest substitue le module
import { prisma } from "@/lib/prisma/client";
import { validerEtape, refuserEtape } from "@/lib/actions/client.actions";

// Token de test avec expiration dans le futur
const TOKEN_VALIDE = "a".repeat(64);
const INVITATION_MOCK = {
  id:             "inv-test-id",
  statut:         "ACCESSED" as InvitationStatut,
  tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("validerEtape — création d'un ClientEvenement ETAPE_VALIDEE", () => {
  it("appelle $transaction (qui crée l'événement) quand le token est valide", async () => {
    // Simuler: prisma.clientInvitation.findUnique() retourne une invitation ACCESSED
    vi.mocked(prisma.clientInvitation.findUnique).mockResolvedValue(
      INVITATION_MOCK as never
    );
    // Simuler: $transaction s'exécute sans erreur
    vi.mocked(prisma.$transaction).mockResolvedValue(undefined as never);

    const res = await validerEtape(TOKEN_VALIDE, "etape-123");

    expect(res.success).toBe(true);
    // $transaction doit avoir été appelée → c'est là que UPDATE + CREATE événement se font
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it("retourne une erreur si le token est inconnu", async () => {
    vi.mocked(prisma.clientInvitation.findUnique).mockResolvedValue(null);

    const res = await validerEtape("token-inexistant", "etape-123");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Token invalide.");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("retourne une erreur si le token est expiré", async () => {
    vi.mocked(prisma.clientInvitation.findUnique).mockResolvedValue({
      ...INVITATION_MOCK,
      tokenExpiresAt: new Date(Date.now() - 1000), // expiré
    } as never);

    const res = await validerEtape(TOKEN_VALIDE, "etape-123");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Lien expiré.");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("retourne une erreur si l'invitation est déjà traitée (VALIDATED)", async () => {
    vi.mocked(prisma.clientInvitation.findUnique).mockResolvedValue({
      ...INVITATION_MOCK,
      statut: "VALIDATED",
    } as never);

    const res = await validerEtape(TOKEN_VALIDE, "etape-123");

    expect(res.success).toBe(false);
    expect(res.error).toContain("déjà été traitée");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("refuserEtape — création d'un ClientEvenement ETAPE_REFUSEE", () => {
  it("appelle $transaction quand le token est valide et la raison fournie", async () => {
    vi.mocked(prisma.clientInvitation.findUnique).mockResolvedValue(
      INVITATION_MOCK as never
    );
    vi.mocked(prisma.$transaction).mockResolvedValue(undefined as never);

    const res = await refuserEtape(TOKEN_VALIDE, "etape-123", "Prix trop élevé");

    expect(res.success).toBe(true);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it("retourne une erreur si l'invitation est déjà traitée (REFUSED)", async () => {
    vi.mocked(prisma.clientInvitation.findUnique).mockResolvedValue({
      ...INVITATION_MOCK,
      statut: "REFUSED",
    } as never);

    const res = await refuserEtape(TOKEN_VALIDE, "etape-123", "raison");

    expect(res.success).toBe(false);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
