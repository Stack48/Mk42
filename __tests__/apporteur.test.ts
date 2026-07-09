// TESTS UNITAIRES — Feature Apporteurs (vue entreprise)
//
// On mocke prisma.commission.findMany (même approche que profil/_actions.test.ts)
// et on vérifie la logique de regroupement/agrégation par apporteur.

import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    commission: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getApporteursEntreprise } from "@/lib/actions/apporteur.actions";

const mockFindMany = vi.mocked(prisma.commission.findMany);

function commissionFixture(overrides: Partial<{
  apporteurId: string;
  nom: string;
  prenom: string;
  email: string;
  montant: number;
  createdAt: Date;
}> = {}) {
  const {
    apporteurId = "app_1",
    nom = "Dupont",
    prenom = "Jean",
    email = "jean.dupont@example.com",
    montant = 10_000,
    createdAt = new Date("2026-01-01T00:00:00.000Z"),
  } = overrides;

  return {
    id: `com_${Math.random()}`,
    apporteurId,
    entrepriseId: "ent_1",
    createdAt,
    apporteur: {
      id: apporteurId,
      nom,
      prenom,
      utilisateur: { email },
    },
    deal: { montant },
  } as any;
}

beforeEach(() => vi.clearAllMocks());

describe("getApporteursEntreprise", () => {
  it("retourne un tableau vide si aucune commission", async () => {
    mockFindMany.mockResolvedValue([]);
    const result = await getApporteursEntreprise("ent_1");
    expect(result).toEqual([]);
  });

  it("regroupe plusieurs commissions du même apporteur", async () => {
    mockFindMany.mockResolvedValue([
      commissionFixture({ montant: 10_000, createdAt: new Date("2026-01-01") }),
      commissionFixture({ montant: 5_000, createdAt: new Date("2026-02-01") }),
    ]);

    const result = await getApporteursEntreprise("ent_1");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "app_1",
      nom: "Jean Dupont",
      email: "jean.dupont@example.com",
      nombreCommissions: 2,
      montantApporte: 15_000,
    });
  });

  it("sépare les apporteurs différents en lignes distinctes", async () => {
    mockFindMany.mockResolvedValue([
      commissionFixture({ apporteurId: "app_1", nom: "Dupont", prenom: "Jean" }),
      commissionFixture({ apporteurId: "app_2", nom: "Martin", prenom: "Alice" }),
    ]);

    const result = await getApporteursEntreprise("ent_1");

    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id).sort()).toEqual(["app_1", "app_2"]);
  });

  it("trie par activité la plus récente (dernière commission) en premier", async () => {
    mockFindMany.mockResolvedValue([
      commissionFixture({ apporteurId: "app_old", createdAt: new Date("2025-01-01") }),
      commissionFixture({ apporteurId: "app_recent", createdAt: new Date("2026-06-01") }),
    ]);

    const result = await getApporteursEntreprise("ent_1");

    expect(result.map((r) => r.id)).toEqual(["app_recent", "app_old"]);
  });

  it("prend la commission la plus récente d'un apporteur pour dater son activité", async () => {
    mockFindMany.mockResolvedValue([
      commissionFixture({ apporteurId: "app_1", createdAt: new Date("2026-01-01") }),
      commissionFixture({ apporteurId: "app_1", createdAt: new Date("2026-05-01") }),
      commissionFixture({ apporteurId: "app_2", createdAt: new Date("2026-03-01") }),
    ]);

    const result = await getApporteursEntreprise("ent_1");

    // app_1 a une commission plus récente (mai) que app_2 (mars) → app_1 en premier
    expect(result.map((r) => r.id)).toEqual(["app_1", "app_2"]);
  });

  it("appelle prisma.commission.findMany filtré sur entrepriseId", async () => {
    mockFindMany.mockResolvedValue([]);
    await getApporteursEntreprise("ent_42");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { entrepriseId: "ent_42" } })
    );
  });
});
