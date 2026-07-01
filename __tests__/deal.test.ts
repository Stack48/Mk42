// TESTS UNITAIRES — Feature [11-FE] Pipeline Kanban des Deals
//
// Fonctions pures testées directement (isTransitionDealValide).
// Prisma et StorageService mockés pour les tests d'actions.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { isTransitionDealValide } from "@/lib/deal.utils";
import type { KanbanDealStatut } from "@/types/deal.types";

// ─── MOCKS ────────────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    apporteur:   { findUnique: vi.fn() },
    kanbanDeal:  {
      create:         vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findUnique:     vi.fn(),
      update:         vi.fn(),
      count:          vi.fn(),
      findMany:       vi.fn(),
    },
    dealDocument: { create: vi.fn(), findUniqueOrThrow: vi.fn(), delete: vi.fn() },
    dealMessage:  { create: vi.fn(), findMany: vi.fn(), updateMany: vi.fn() },
    deal:         { create: vi.fn() },
  },
}));

const { mockStorageInstance } = vi.hoisted(() => ({
  mockStorageInstance: {
    save:   vi.fn().mockResolvedValue("deal-doc-path.enc"),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/storage/storage.factory", () => ({
  getStorage: vi.fn(() => mockStorageInstance),
}));

vi.mock("@/lib/actions/notification.actions", () => ({
  createNotification: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/actions/commission.actions", () => ({
  signerDealEtCreerCommission: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentEntrepriseId: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage/storage.factory";
import { getCurrentEntrepriseId } from "@/lib/auth";
import { signerDealEtCreerCommission } from "@/lib/actions/commission.actions";
import {
  createDeal,
  updateDealStatut,
  updateDealPosition,
  uploadDealDocument,
} from "@/lib/actions/deal.actions";

beforeEach(() => vi.clearAllMocks());

// ─── 1. TRANSITIONS DE STATUT ─────────────────────────────────────────────────

describe("isTransitionDealValide", () => {
  // Transitions autorisées
  it("autorise PROSPECT → CONTACTE", () => {
    expect(isTransitionDealValide("PROSPECT", "CONTACTE")).toBe(true);
  });
  it("autorise PROSPECT → ANNULE", () => {
    expect(isTransitionDealValide("PROSPECT", "ANNULE")).toBe(true);
  });
  it("autorise CONTACTE → SIGNE", () => {
    expect(isTransitionDealValide("CONTACTE", "SIGNE")).toBe(true);
  });
  it("autorise SIGNE → PAYE", () => {
    expect(isTransitionDealValide("SIGNE", "PAYE")).toBe(true);
  });

  // ANNULE est irréversible
  it("interdit toute transition depuis ANNULE", () => {
    const statuts: KanbanDealStatut[] = ["PROSPECT", "CONTACTE", "SIGNE", "PAYE", "ANNULE"];
    for (const s of statuts) {
      expect(isTransitionDealValide("ANNULE", s)).toBe(false);
    }
  });
  it("interdit de revenir en arrière depuis SIGNE", () => {
    expect(isTransitionDealValide("SIGNE", "PROSPECT")).toBe(false);
    expect(isTransitionDealValide("SIGNE", "CONTACTE")).toBe(false);
  });
});

// ─── 2. PASSAGE À ANNULE → commissionGelee = true ────────────────────────────

describe("updateDealStatut — ANNULE", () => {
  it("gèle la commission quand le deal passe à ANNULE", async () => {
    vi.mocked(prisma.kanbanDeal.findUniqueOrThrow).mockResolvedValue({
      id: "deal-1", statut: "CONTACTE", commissionDealId: null,
      apporteurId: "ap-1", titre: "Deal Test", montant: 100000,
      apporteur: { id: "ap-1", nom: "Jean", email: "jean@test.fr" },
    } as never);
    vi.mocked(prisma.kanbanDeal.update).mockResolvedValue({} as never);

    const res = await updateDealStatut("deal-1", "ANNULE");

    expect(res.success).toBe(true);
    // L'update doit inclure commissionGelee: true
    expect(prisma.kanbanDeal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ commissionGelee: true, statut: "ANNULE" }),
      })
    );
  });

  it("interdit la transition ANNULE → autre statut", async () => {
    vi.mocked(prisma.kanbanDeal.findUniqueOrThrow).mockResolvedValue({
      id: "deal-1", statut: "ANNULE", apporteurId: "ap-1",
      apporteur: {},
    } as never);

    const res = await updateDealStatut("deal-1", "PROSPECT");

    expect(res.success).toBe(false);
    expect(res.error).toContain("Transition interdite");
    expect(prisma.kanbanDeal.update).not.toHaveBeenCalled();
  });
});

// ─── 2b. PASSAGE À SIGNE → création Deal + Commission ────────────────────────

describe("updateDealStatut — SIGNE", () => {
  it("crée un Deal et une Commission, puis enregistre commissionDealId", async () => {
    vi.mocked(prisma.kanbanDeal.findUniqueOrThrow).mockResolvedValue({
      id: "deal-1", statut: "CONTACTE", commissionDealId: null,
      apporteurId: "ap-1", titre: "Deal Test", montant: 100000,
      apporteur: { id: "ap-1", nom: "Jean", email: "jean@test.fr" },
    } as never);
    vi.mocked(prisma.deal.create).mockResolvedValue({ id: "new-deal-id" } as never);
    vi.mocked(prisma.kanbanDeal.update).mockResolvedValue({} as never);
    vi.mocked(getCurrentEntrepriseId).mockResolvedValue("ent-1");
    vi.mocked(signerDealEtCreerCommission).mockResolvedValue({ success: true, commissionId: "com-1" });

    const res = await updateDealStatut("deal-1", "SIGNE");

    expect(res.success).toBe(true);
    expect(prisma.deal.create).toHaveBeenCalledWith({
      data: { titre: "Deal Test", montant: 100000 },
    });
    expect(signerDealEtCreerCommission).toHaveBeenCalledWith({
      dealId: "new-deal-id",
      apporteurId: "ap-1",
      entrepriseId: "ent-1",
    });
    expect(prisma.kanbanDeal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ statut: "SIGNE", commissionDealId: "new-deal-id" }),
      })
    );
  });

  it("ne recrée pas de commission si commissionDealId est déjà renseigné", async () => {
    vi.mocked(prisma.kanbanDeal.findUniqueOrThrow).mockResolvedValue({
      id: "deal-1", statut: "CONTACTE", commissionDealId: "existing-deal-id",
      apporteurId: "ap-1", titre: "Deal Test", montant: 100000,
      apporteur: { id: "ap-1", nom: "Jean", email: "jean@test.fr" },
    } as never);
    vi.mocked(prisma.kanbanDeal.update).mockResolvedValue({} as never);

    const res = await updateDealStatut("deal-1", "SIGNE");

    expect(res.success).toBe(true);
    expect(prisma.deal.create).not.toHaveBeenCalled();
    expect(signerDealEtCreerCommission).not.toHaveBeenCalled();
    expect(prisma.kanbanDeal.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ statut: "SIGNE" }) })
    );
  });

  it("n'écrit pas le nouveau statut si signerDealEtCreerCommission échoue", async () => {
    vi.mocked(prisma.kanbanDeal.findUniqueOrThrow).mockResolvedValue({
      id: "deal-1", statut: "CONTACTE", commissionDealId: null,
      apporteurId: "ap-1", titre: "Deal Test", montant: 100000,
      apporteur: { id: "ap-1", nom: "Jean", email: "jean@test.fr" },
    } as never);
    vi.mocked(prisma.deal.create).mockResolvedValue({ id: "new-deal-id" } as never);
    vi.mocked(getCurrentEntrepriseId).mockResolvedValue("ent-1");
    vi.mocked(signerDealEtCreerCommission).mockResolvedValue({ success: false, error: "Ce deal est déjà signé." });

    const res = await updateDealStatut("deal-1", "SIGNE");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Ce deal est déjà signé.");
    expect(prisma.kanbanDeal.update).not.toHaveBeenCalled();
  });
});

// ─── 3. DRAG & DROP — position mise à jour ───────────────────────────────────

describe("updateDealPosition", () => {
  it("met à jour la position sans changer de statut si même colonne", async () => {
    vi.mocked(prisma.kanbanDeal.findUniqueOrThrow).mockResolvedValue({
      id: "deal-1", statut: "PROSPECT",
    } as never);
    vi.mocked(prisma.kanbanDeal.update).mockResolvedValue({} as never);

    const res = await updateDealPosition("deal-1", 2, "PROSPECT");

    expect(res.success).toBe(true);
    expect(prisma.kanbanDeal.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ position: 2 }) })
    );
  });

  it("interdit le drag depuis ANNULE vers une autre colonne", async () => {
    vi.mocked(prisma.kanbanDeal.findUniqueOrThrow).mockResolvedValue({
      id: "deal-1", statut: "ANNULE",
    } as never);

    const res = await updateDealPosition("deal-1", 0, "PROSPECT");

    expect(res.success).toBe(false);
    expect(prisma.kanbanDeal.update).not.toHaveBeenCalled();
  });
});

// ─── 4. createDeal — validation des champs obligatoires ──────────────────────

describe("createDeal — validation", () => {
  it("retourne une erreur si le titre est manquant", async () => {
    const res = await createDeal({ titre: "", montant: 1000, clientNom: "Client", apporteurId: "ap-1" });
    expect(res.success).toBe(false);
    expect(res.error).toContain("titre");
  });
  it("retourne une erreur si le clientNom est manquant", async () => {
    const res = await createDeal({ titre: "Deal", montant: 1000, clientNom: "", apporteurId: "ap-1" });
    expect(res.success).toBe(false);
    expect(res.error).toContain("client");
  });
  it("retourne une erreur si le montant est 0 ou négatif", async () => {
    const res = await createDeal({ titre: "Deal", montant: 0, clientNom: "Client", apporteurId: "ap-1" });
    expect(res.success).toBe(false);
    expect(res.error).toContain("montant");
  });
  it("crée le deal si tous les champs obligatoires sont présents", async () => {
    vi.mocked(prisma.apporteur.findUnique).mockResolvedValue({ id: "ap-1" } as never);
    vi.mocked(prisma.kanbanDeal.count).mockResolvedValue(0);
    vi.mocked(prisma.kanbanDeal.create).mockResolvedValue({ id: "new-deal" } as never);

    const res = await createDeal({ titre: "Deal Test", montant: 50000, clientNom: "Mairie", apporteurId: "ap-1" });
    expect(res.success).toBe(true);
    expect(res.dealId).toBe("new-deal");
  });
});

// ─── 5. uploadDealDocument — appel StorageService ────────────────────────────

describe("uploadDealDocument — StorageService", () => {
  it("appelle storage.save() avec le buffer du fichier", async () => {
    const fakeFile = new File(["contenu test"], "devis.pdf", { type: "application/pdf" });
    const formData = new FormData();
    formData.append("dealId", "deal-1");
    formData.append("type", "DEVIS");
    formData.append("uploadedBy", "admin");
    formData.append("file", fakeFile);

    vi.mocked(prisma.dealDocument.create).mockResolvedValue({ id: "doc-1" } as never);

    const res = await uploadDealDocument(formData);

    expect(res.success).toBe(true);
    // Vérifie que le StorageService a bien été appelé
    const storage = getStorage();
    expect(storage.save).toHaveBeenCalledOnce();
  });

  it("rejette les fichiers dépassant 10 Mo", async () => {
    const bigContent = new Uint8Array(11 * 1024 * 1024); // 11 Mo
    const bigFile = new File([bigContent], "gros-fichier.pdf", { type: "application/pdf" });
    const formData = new FormData();
    formData.append("dealId", "deal-1");
    formData.append("type", "AUTRE");
    formData.append("uploadedBy", "admin");
    formData.append("file", bigFile);

    const res = await uploadDealDocument(formData);

    expect(res.success).toBe(false);
    expect(res.error).toContain("volumineux");
    expect(getStorage().save).not.toHaveBeenCalled();
  });
});
