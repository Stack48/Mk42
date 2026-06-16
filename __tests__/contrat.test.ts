// TESTS UNITAIRES — Feature Contrat [13-BE]
//
// Même approche que commission.test.ts : on teste uniquement les fonctions PURES,
// sans base de données réelle. Les appels Prisma sont mockés avec vi.mock().
//
// vi.mock() = équivalent des "test doubles" / mocks en PHPUnit :
//   $mockRepo = $this->createMock(ContratRepository::class);
//   $mockRepo->method('create')->willReturn($contrat);
//
// En Vitest, vi.mock() intercepte les imports et remplace les modules par des fakes.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { randomBytes } from "crypto";
import { isContratTransitionValide } from "@/lib/contrat.utils";
import type { ContratStatut } from "@/types/contrat.types";

// ─── 1. GÉNÉRATION DE TOKEN ───────────────────────────────────────────────────
describe("Génération de token", () => {
  it("randomBytes(32).toString('hex') produit exactement 64 caractères", () => {
    // 32 octets × 2 caractères hex par octet = 64 caractères
    const token = randomBytes(32).toString("hex");
    expect(token).toHaveLength(64);
  });

  it("le token est composé uniquement de caractères hexadécimaux", () => {
    const token = randomBytes(32).toString("hex");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("deux tokens générés consécutivement sont différents (unicité)", () => {
    const token1 = randomBytes(32).toString("hex");
    const token2 = randomBytes(32).toString("hex");
    // La probabilité de collision est 1/2^256 — en pratique impossible
    expect(token1).not.toBe(token2);
  });
});

// ─── 2. EXPIRATION DE TOKEN ───────────────────────────────────────────────────
describe("Expiration de token", () => {
  beforeEach(() => {
    // vi.useFakeTimers() permet de contrôler Date.now() dans les tests.
    // Équivalent de Carbon::setTestNow() en Laravel ou ClockMock en Symfony.
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Toujours restaurer les timers réels après chaque test
    vi.useRealTimers();
  });

  it("le token n'est PAS expiré juste après sa création (dans les 72h)", () => {
    const now = new Date("2024-06-01T10:00:00Z");
    vi.setSystemTime(now);

    // Simuler la création du token avec expiration dans 72h
    const tokenExpiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000);

    // Juste après création : pas encore expiré
    expect(new Date() > tokenExpiresAt).toBe(false);
  });

  it("le token EST expiré après 73 heures", () => {
    const creationTime = new Date("2024-06-01T10:00:00Z");
    vi.setSystemTime(creationTime);

    const tokenExpiresAt = new Date(creationTime.getTime() + 72 * 60 * 60 * 1000);

    // Avancer le temps de 73 heures
    vi.setSystemTime(new Date(creationTime.getTime() + 73 * 60 * 60 * 1000));

    // Maintenant le token est expiré
    expect(new Date() > tokenExpiresAt).toBe(true);
  });

  it("le token expire exactement à tokenExpiresAt (frontière)", () => {
    const creationTime = new Date("2024-06-01T10:00:00Z");
    const tokenExpiresAt = new Date(creationTime.getTime() + 72 * 60 * 60 * 1000);

    // 1 milliseconde avant l'expiration : pas encore expiré
    vi.setSystemTime(new Date(tokenExpiresAt.getTime() - 1));
    expect(new Date() > tokenExpiresAt).toBe(false);

    // Exactement à l'expiration : expiré (> pas >=, donc à l'instant T il est encore valide)
    vi.setSystemTime(tokenExpiresAt);
    expect(new Date() > tokenExpiresAt).toBe(false);

    // 1 milliseconde après l'expiration : expiré
    vi.setSystemTime(new Date(tokenExpiresAt.getTime() + 1));
    expect(new Date() > tokenExpiresAt).toBe(true);
  });
});

// ─── 3. TRANSITIONS DE STATUT ────────────────────────────────────────────────
describe("isContratTransitionValide", () => {
  // Transitions valides
  it("autorise DRAFT → SENT", () => {
    expect(isContratTransitionValide("DRAFT", "SENT")).toBe(true);
  });

  it("autorise SENT → UPLOADED", () => {
    expect(isContratTransitionValide("SENT", "UPLOADED")).toBe(true);
  });

  it("autorise UPLOADED → VALIDATED", () => {
    expect(isContratTransitionValide("UPLOADED", "VALIDATED")).toBe(true);
  });

  it("autorise UPLOADED → REJECTED", () => {
    expect(isContratTransitionValide("UPLOADED", "REJECTED")).toBe(true);
  });

  // Transitions invalides — saut d'étape
  it("interdit DRAFT → VALIDATED (saut d'étapes)", () => {
    expect(isContratTransitionValide("DRAFT", "VALIDATED")).toBe(false);
  });

  it("interdit DRAFT → UPLOADED (saut d'étape)", () => {
    expect(isContratTransitionValide("DRAFT", "UPLOADED")).toBe(false);
  });

  it("interdit SENT → VALIDATED (doit passer par UPLOADED)", () => {
    expect(isContratTransitionValide("SENT", "VALIDATED")).toBe(false);
  });

  // Transitions invalides — retour arrière
  it("interdit VALIDATED → DRAFT (statut terminal)", () => {
    expect(isContratTransitionValide("VALIDATED", "DRAFT")).toBe(false);
  });

  it("interdit REJECTED → DRAFT (statut terminal)", () => {
    expect(isContratTransitionValide("REJECTED", "DRAFT")).toBe(false);
  });

  it("interdit VALIDATED → UPLOADED (retour arrière)", () => {
    expect(isContratTransitionValide("VALIDATED", "UPLOADED")).toBe(false);
  });

  // Transitions vers soi-même
  it("interdit DRAFT → DRAFT (même statut)", () => {
    expect(isContratTransitionValide("DRAFT", "DRAFT")).toBe(false);
  });

  it("interdit VALIDATED → VALIDATED (statut terminal)", () => {
    expect(isContratTransitionValide("VALIDATED", "VALIDATED")).toBe(false);
  });

  // Vérification exhaustive des statuts terminaux
  it("tous les statuts cibles depuis VALIDATED sont interdits", () => {
    const tous: ContratStatut[] = ["DRAFT", "SENT", "UPLOADED", "VALIDATED", "REJECTED"];
    tous.forEach((cible) => {
      expect(isContratTransitionValide("VALIDATED", cible)).toBe(false);
    });
  });

  it("tous les statuts cibles depuis REJECTED sont interdits", () => {
    const tous: ContratStatut[] = ["DRAFT", "SENT", "UPLOADED", "VALIDATED", "REJECTED"];
    tous.forEach((cible) => {
      expect(isContratTransitionValide("REJECTED", cible)).toBe(false);
    });
  });
});

// ─── 4. CONTRAT ACCESS LOG (mock Prisma) ─────────────────────────────────────
//
// On teste que logAction (fonction privée dans contrat.actions.ts) appelle bien
// prisma.contratAccessLog.create avec les bons paramètres.
//
// Stratégie : on mock @/lib/prisma/client pour intercepter les appels Prisma.
// vi.mock() remplace l'import par un objet avec des fonctions espionnées (vi.fn()).
//
// Note : logAction est privée (non exportée). On la teste INDIRECTEMENT en
// vérifiant que prisma.contratAccessLog.create est appelé lors de validateContrat.
// Pour tester directement, on pourrait l'exporter avec un underscore (_logAction)
// ou la déplacer dans un fichier séparé — choix de design hors scope ici.

// Mock du module Prisma
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    contrat: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    contratAccessLog: {
      create: vi.fn(),
    },
  },
}));

// Mock du storage factory (pas besoin de vrais fichiers dans les tests)
vi.mock("@/lib/storage/storage.factory", () => ({
  getStorage: vi.fn(() => ({
    save: vi.fn().mockResolvedValue("test-file.pdf.enc"),
    read: vi.fn(),
    delete: vi.fn(),
    getDownloadUrl: vi.fn(),
  })),
}));

// Mock du générateur PDF
vi.mock("@/lib/pdf/contrat.generator", () => ({
  generateContratPDF: vi.fn().mockResolvedValue(Buffer.from("fake-pdf")),
}));

// Mock de revalidatePath (Next.js — non disponible dans l'environnement de test)
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("ContratAccessLog — logAction est appelé avec les bons paramètres", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // resetModules force le rechargement des modules mockés entre les tests
  });

  it("validateContrat appelle prisma.contratAccessLog.create avec action VALIDATED", async () => {
    // Import dynamique pour que les mocks soient actifs
    const { prisma } = await import("@/lib/prisma/client");
    const { validateContrat } = await import("@/lib/actions/contrat.actions");

    // Configurer le mock : contrat en statut UPLOADED
    vi.mocked(prisma.contrat.findUnique).mockResolvedValueOnce({
      id: "contrat-test-123",
      statut: "UPLOADED",
      token: "abc123",
      tokenExpiresAt: new Date("2099-12-31"),
      templateData: {},
      fileOriginalPath: null,
      fileSignedPath: null,
      validatedAt: null,
      validatedBy: null,
      rejectedReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      dealId: "deal-1",
      apporteurId: "apporteur-1",
    } as never);

    vi.mocked(prisma.contrat.update).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.contratAccessLog.create).mockResolvedValueOnce({} as never);

    const result = await validateContrat("contrat-test-123", "admin-user");

    expect(result.success).toBe(true);

    // Vérifier que create a été appelé avec les bons paramètres
    expect(prisma.contratAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        contratId: "contrat-test-123",
        action: "VALIDATED",
        userId: "admin-user",
      }),
    });
  });

  it("rejectContrat appelle prisma.contratAccessLog.create avec action REJECTED", async () => {
    const { prisma } = await import("@/lib/prisma/client");
    const { rejectContrat } = await import("@/lib/actions/contrat.actions");

    vi.mocked(prisma.contrat.findUnique).mockResolvedValueOnce({
      id: "contrat-test-456",
      statut: "UPLOADED",
      token: "def456",
      tokenExpiresAt: new Date("2099-12-31"),
      templateData: {},
      fileOriginalPath: null,
      fileSignedPath: null,
      validatedAt: null,
      validatedBy: null,
      rejectedReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      dealId: "deal-2",
      apporteurId: "apporteur-2",
    } as never);

    vi.mocked(prisma.contrat.update).mockResolvedValueOnce({} as never);
    vi.mocked(prisma.contratAccessLog.create).mockResolvedValueOnce({} as never);

    const result = await rejectContrat("contrat-test-456", "admin-user", "Signature illisible");

    expect(result.success).toBe(true);

    expect(prisma.contratAccessLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        contratId: "contrat-test-456",
        action: "REJECTED",
        userId: "admin-user",
      }),
    });
  });

  it("validateContrat échoue si le statut n'est pas UPLOADED", async () => {
    const { prisma } = await import("@/lib/prisma/client");
    const { validateContrat } = await import("@/lib/actions/contrat.actions");

    vi.mocked(prisma.contrat.findUnique).mockResolvedValueOnce({
      id: "contrat-test-789",
      statut: "DRAFT", // mauvais statut
      token: "ghi789",
      tokenExpiresAt: new Date("2099-12-31"),
      templateData: {},
      fileOriginalPath: null,
      fileSignedPath: null,
      validatedAt: null,
      validatedBy: null,
      rejectedReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      dealId: "deal-3",
      apporteurId: "apporteur-3",
    } as never);

    const result = await validateContrat("contrat-test-789", "admin-user");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Transition interdite");
    // Prisma.create ne doit PAS être appelé si la transition est invalide
    expect(prisma.contratAccessLog.create).not.toHaveBeenCalled();
  });
});
