import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    facture: { findMany: vi.fn() },
    recu: { findMany: vi.fn() },
    dAS2: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  getTotauxDAS2ParAnnee,
  getDAS2Overview,
  apporteurNomOuRS,
  filtrerEligiblesDAS2,
  SEUIL_DAS2_TTC,
} from "../das2-aggregation";

const mockFactureFindMany = vi.mocked(prisma.facture.findMany);
const mockRecuFindMany = vi.mocked(prisma.recu.findMany);
const mockDas2FindMany = vi.mocked(prisma.dAS2.findMany);

function apporteurFixture(overrides: Partial<{
  id: string;
  type: "PARTICULIER" | "PROFESSIONNEL";
  nom: string;
  prenom: string;
  raisonSociale: string | null;
  siret: string | null;
}> = {}) {
  return {
    id: "app_1",
    type: "PROFESSIONNEL",
    nom: "Dupont",
    prenom: "Jean",
    raisonSociale: null,
    siret: null,
    adresse: null,
    dateNaissance: null,
    lieuNaissance: null,
    ...overrides,
  } as any;
}

beforeEach(() => vi.clearAllMocks());

describe("apporteurNomOuRS", () => {
  it("utilise la raison sociale pour un professionnel", () => {
    const apporteur = apporteurFixture({ type: "PROFESSIONNEL", raisonSociale: "Dupont SARL" });
    expect(apporteurNomOuRS(apporteur)).toBe("Dupont SARL");
  });

  it("utilise prénom + nom pour un particulier", () => {
    const apporteur = apporteurFixture({ type: "PARTICULIER", prenom: "Jean", nom: "Dupont" });
    expect(apporteurNomOuRS(apporteur)).toBe("Jean Dupont");
  });

  it("utilise prénom + nom pour un professionnel sans raison sociale renseignée", () => {
    const apporteur = apporteurFixture({ type: "PROFESSIONNEL", raisonSociale: null, prenom: "Jean", nom: "Dupont" });
    expect(apporteurNomOuRS(apporteur)).toBe("Jean Dupont");
  });
});

describe("filtrerEligiblesDAS2", () => {
  it("exclut les totaux sous le seuil de 2400€", () => {
    const sousLeSeuil = { apporteur: apporteurFixture({ id: "app_1" }), total: 2399 };
    const auSeuil = { apporteur: apporteurFixture({ id: "app_2" }), total: SEUIL_DAS2_TTC };
    const auDessus = { apporteur: apporteurFixture({ id: "app_3" }), total: 3000 };

    expect(filtrerEligiblesDAS2([sousLeSeuil, auSeuil, auDessus])).toEqual([auSeuil, auDessus]);
  });
});

describe("getTotauxDAS2ParAnnee", () => {
  it("retourne une map vide si aucune facture ni reçu", async () => {
    mockFactureFindMany.mockResolvedValue([]);
    mockRecuFindMany.mockResolvedValue([]);

    const result = await getTotauxDAS2ParAnnee("ent_1");

    expect(result.size).toBe(0);
  });

  it("regroupe une facture par année de paiement, montant TTC", async () => {
    const apporteur = apporteurFixture({ id: "app_1" });
    mockFactureFindMany.mockResolvedValue([
      {
        montantTTC: 1200,
        dateEmission: new Date("2024-11-20"),
        datePaiement: new Date("2025-06-15"),
        apporteur,
      },
    ] as any);
    mockRecuFindMany.mockResolvedValue([]);

    const result = await getTotauxDAS2ParAnnee("ent_1");

    // Bucketée sur l'année de datePaiement (2025), pas dateEmission (2024).
    expect(result.get(2025)).toEqual([{ apporteur, total: 1200 }]);
    expect(result.get(2024)).toBeUndefined();
  });

  it("additionne facture et reçu du même apporteur sur la même année", async () => {
    const apporteur = apporteurFixture({ id: "app_1" });
    mockFactureFindMany.mockResolvedValue([
      { montantTTC: 1000, datePaiement: new Date("2025-06-15"), apporteur },
    ] as any);
    mockRecuFindMany.mockResolvedValue([
      { montant: 500, dateVersement: new Date("2025-09-01"), apporteur },
    ] as any);

    const result = await getTotauxDAS2ParAnnee("ent_1");

    expect(result.get(2025)).toEqual([{ apporteur, total: 1500 }]);
  });

  it("sépare les années différentes selon la date de paiement", async () => {
    const apporteur = apporteurFixture({ id: "app_1" });
    mockFactureFindMany.mockResolvedValue([
      { montantTTC: 1000, datePaiement: new Date("2024-12-31"), apporteur },
      { montantTTC: 2000, datePaiement: new Date("2025-01-01"), apporteur },
    ] as any);
    mockRecuFindMany.mockResolvedValue([]);

    const result = await getTotauxDAS2ParAnnee("ent_1");

    expect(result.get(2024)).toEqual([{ apporteur, total: 1000 }]);
    expect(result.get(2025)).toEqual([{ apporteur, total: 2000 }]);
  });

  it("sépare les apporteurs différents sur la même année", async () => {
    const apporteur1 = apporteurFixture({ id: "app_1" });
    const apporteur2 = apporteurFixture({ id: "app_2" });
    mockFactureFindMany.mockResolvedValue([
      { montantTTC: 1000, datePaiement: new Date("2025-06-15"), apporteur: apporteur1 },
      { montantTTC: 2000, datePaiement: new Date("2025-07-15"), apporteur: apporteur2 },
    ] as any);
    mockRecuFindMany.mockResolvedValue([]);

    const result = await getTotauxDAS2ParAnnee("ent_1");

    expect(result.get(2025)).toEqual(
      expect.arrayContaining([
        { apporteur: apporteur1, total: 1000 },
        { apporteur: apporteur2, total: 2000 },
      ])
    );
  });

  it("appelle facture.findMany filtré sur entrepriseId, statut PAYEE et datePaiement renseignée", async () => {
    mockFactureFindMany.mockResolvedValue([]);
    mockRecuFindMany.mockResolvedValue([]);

    await getTotauxDAS2ParAnnee("ent_42");

    expect(mockFactureFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entrepriseId: "ent_42", statut: "PAYEE", datePaiement: { not: null } },
      })
    );
  });

  it("appelle recu.findMany filtré sur entrepriseId et dateVersement renseignée", async () => {
    mockFactureFindMany.mockResolvedValue([]);
    mockRecuFindMany.mockResolvedValue([]);

    await getTotauxDAS2ParAnnee("ent_42");

    expect(mockRecuFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entrepriseId: "ent_42", dateVersement: { not: null } },
      })
    );
  });
});

describe("getDAS2Overview", () => {
  it("inclut toujours l'année courante même sans donnée", async () => {
    mockFactureFindMany.mockResolvedValue([]);
    mockRecuFindMany.mockResolvedValue([]);
    mockDas2FindMany.mockResolvedValue([]);

    const result = await getDAS2Overview("ent_1");
    const anneeActuelle = new Date().getFullYear();

    expect(result.find((r) => r.annee === anneeActuelle)).toMatchObject({
      montantTotal: 0,
      nombreBeneficiaires: 0,
      statut: "NON_GENERE",
      dateGeneration: null,
      beneficiaires: [],
    });
  });

  it("calcule montantTotal et nombreBeneficiaires à partir des apporteurs au-dessus du seuil", async () => {
    const apporteurPro = apporteurFixture({
      id: "app_pro", type: "PROFESSIONNEL", raisonSociale: "Pro SARL", siret: "12345678900012",
    });
    const apporteurParticulier = apporteurFixture({
      id: "app_part", type: "PARTICULIER", prenom: "Julie", nom: "Bernard", siret: null,
    });

    mockFactureFindMany.mockResolvedValue([
      { montantTTC: 3000, datePaiement: new Date("2025-06-15"), apporteur: apporteurPro },
    ] as any);
    mockRecuFindMany.mockResolvedValue([
      { montant: 2500, dateVersement: new Date("2025-09-01"), apporteur: apporteurParticulier },
    ] as any);
    mockDas2FindMany.mockResolvedValue([]);

    const result = await getDAS2Overview("ent_1");
    const annee2025 = result.find((r) => r.annee === 2025)!;

    expect(annee2025.montantTotal).toBe(5500);
    expect(annee2025.nombreBeneficiaires).toBe(2);
    expect(annee2025.beneficiaires).toEqual(
      expect.arrayContaining([
        { apporteurId: "app_pro", nom: "Pro SARL", type: "PROFESSIONNEL", siret: "12345678900012", montant: 3000 },
        { apporteurId: "app_part", nom: "Julie Bernard", type: "PARTICULIER", siret: null, montant: 2500 },
      ])
    );
  });

  it("exclut un apporteur dont le total reste sous le seuil de 2400€", async () => {
    const apporteurEligible = apporteurFixture({ id: "app_eligible" });
    const apporteurSousLeSeuil = apporteurFixture({ id: "app_sous_seuil" });

    mockFactureFindMany.mockResolvedValue([
      { montantTTC: 3000, datePaiement: new Date("2025-06-15"), apporteur: apporteurEligible },
      { montantTTC: 900, datePaiement: new Date("2025-07-01"), apporteur: apporteurSousLeSeuil },
    ] as any);
    mockRecuFindMany.mockResolvedValue([]);
    mockDas2FindMany.mockResolvedValue([]);

    const result = await getDAS2Overview("ent_1");
    const annee2025 = result.find((r) => r.annee === 2025)!;

    expect(annee2025.nombreBeneficiaires).toBe(1);
    expect(annee2025.beneficiaires.map((b) => b.apporteurId)).toEqual(["app_eligible"]);
  });

  it("statut GENERE si au moins une ligne DAS2 générée existe pour l'année", async () => {
    mockFactureFindMany.mockResolvedValue([]);
    mockRecuFindMany.mockResolvedValue([]);
    mockDas2FindMany.mockResolvedValue([
      { annee: 2025, statut: "GENERE", updatedAt: new Date("2026-01-05") },
    ] as any);

    const result = await getDAS2Overview("ent_1");
    const annee2025 = result.find((r) => r.annee === 2025)!;

    expect(annee2025.statut).toBe("GENERE");
    expect(annee2025.dateGeneration).toEqual(new Date("2026-01-05"));
    expect(annee2025.montantTotal).toBe(0);
    expect(annee2025.nombreBeneficiaires).toBe(0);
  });

  it("dateGeneration ne prend le max updatedAt que parmi les lignes DAS2 GENERE, pas les NON_GENERE", async () => {
    mockFactureFindMany.mockResolvedValue([]);
    mockRecuFindMany.mockResolvedValue([]);
    mockDas2FindMany.mockResolvedValue([
      { annee: 2025, statut: "GENERE", updatedAt: new Date("2026-01-05") },
      { annee: 2025, statut: "NON_GENERE", updatedAt: new Date("2026-02-10") },
    ] as any);

    const result = await getDAS2Overview("ent_1");
    const annee2025 = result.find((r) => r.annee === 2025)!;

    expect(annee2025.statut).toBe("GENERE");
    expect(annee2025.dateGeneration).toEqual(new Date("2026-01-05"));
  });

  it("trie les années par ordre décroissant", async () => {
    mockFactureFindMany.mockResolvedValue([
      { montantTTC: 100, datePaiement: new Date("2023-01-01"), apporteur: apporteurFixture() },
      { montantTTC: 100, datePaiement: new Date("2024-01-01"), apporteur: apporteurFixture() },
    ] as any);
    mockRecuFindMany.mockResolvedValue([]);
    mockDas2FindMany.mockResolvedValue([]);

    const result = await getDAS2Overview("ent_1");
    const annees = result.map((r) => r.annee);

    expect(annees).toEqual([...annees].sort((a, b) => b - a));
  });
});
