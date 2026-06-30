import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    utilisateur: { findUnique: vi.fn() },
    entreprise: { update: vi.fn() },
    apporteur: { update: vi.fn() },
  },
}));

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateEntrepriseProfile, updateApporteurProfile } from "./_actions";

const mockAuth = vi.mocked(auth);
const mockUtilisateur = vi.mocked(prisma.utilisateur.findUnique);
const mockEntrepriseUpdate = vi.mocked(prisma.entreprise.update);
const mockApporteurUpdate = vi.mocked(prisma.apporteur.update);

beforeEach(() => vi.clearAllMocks());

describe("updateEntrepriseProfile", () => {
  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);
    const result = await updateEntrepriseProfile({}, new FormData());
    expect(result).toEqual({ error: "Non authentifié" });
  });

  it("returns error when utilisateur not found", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockUtilisateur.mockResolvedValue(null);
    const result = await updateEntrepriseProfile({}, new FormData());
    expect(result).toEqual({ error: "Utilisateur introuvable" });
  });

  it("returns validation error for empty raisonSociale", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockUtilisateur.mockResolvedValue({ entreprise: { id: "ent_1" } } as any);
    const fd = new FormData();
    fd.set("telephone", "0612345678");
    fd.set("raisonSociale", "");
    fd.set("adresseSiege", "12 rue de Paris");
    fd.set("iban", "");
    fd.set("bic", "");
    fd.set("nomTitulaireIban", "");
    const result = await updateEntrepriseProfile({}, fd);
    expect(result.error).toBeDefined();
    expect(mockEntrepriseUpdate).not.toHaveBeenCalled();
  });

  it("updates entreprise fields and returns success", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockUtilisateur.mockResolvedValue({ entreprise: { id: "ent_1" } } as any);
    mockEntrepriseUpdate.mockResolvedValue({} as any);
    const fd = new FormData();
    fd.set("telephone", "0612345678");
    fd.set("raisonSociale", "Ma Société");
    fd.set("adresseSiege", "12 rue de Paris, 75008 Paris");
    fd.set("iban", "FR7630006000011234567890123");
    fd.set("bic", "BNPAFRPP");
    fd.set("nomTitulaireIban", "Ma Société");
    const result = await updateEntrepriseProfile({}, fd);
    expect(result).toEqual({ success: true });
    expect(mockEntrepriseUpdate).toHaveBeenCalledWith({
      where: { id: "ent_1" },
      data: {
        telephone: "0612345678",
        raisonSociale: "Ma Société",
        adresseSiege: "12 rue de Paris, 75008 Paris",
        iban: "FR7630006000011234567890123",
        bic: "BNPAFRPP",
        nomTitulaireIban: "Ma Société",
      },
    });
  });
});

describe("updateApporteurProfile", () => {
  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as any);
    const result = await updateApporteurProfile({}, new FormData());
    expect(result).toEqual({ error: "Non authentifié" });
  });

  it("returns error when apporteur not found", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockUtilisateur.mockResolvedValue({ apporteur: null } as any);
    const result = await updateApporteurProfile({}, new FormData());
    expect(result).toEqual({ error: "Utilisateur introuvable" });
  });

  it("updates apporteur fields and returns success", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockUtilisateur.mockResolvedValue({ apporteur: { id: "app_1" } } as any);
    mockApporteurUpdate.mockResolvedValue({} as any);
    const fd = new FormData();
    fd.set("prenom", "Jean");
    fd.set("nom", "Dupont");
    fd.set("telephone", "0612345678");
    fd.set("iban", "");
    fd.set("bic", "");
    const result = await updateApporteurProfile({}, fd);
    expect(result).toEqual({ success: true });
    expect(mockApporteurUpdate).toHaveBeenCalledWith({
      where: { id: "app_1" },
      data: expect.objectContaining({
        prenom: "Jean",
        nom: "Dupont",
        telephone: "0612345678",
      }),
    });
  });

  it("returns validation error for empty prenom", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" } as any);
    mockUtilisateur.mockResolvedValue({ apporteur: { id: "app_1" } } as any);
    const fd = new FormData();
    fd.set("prenom", "");
    fd.set("nom", "Dupont");
    fd.set("telephone", "0612345678");
    const result = await updateApporteurProfile({}, fd);
    expect(result.error).toBeDefined();
    expect(mockApporteurUpdate).not.toHaveBeenCalled();
  });
});
