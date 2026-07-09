// TESTS UNITAIRES — Feature Opportunite (acceptation → création Kanban)

import { vi, describe, it, expect, beforeEach } from "vitest";
import { formatClientLabel } from "@/lib/opportunite.utils";

describe("formatClientLabel", () => {
  it("utilise la raison sociale pour un client professionnel", () => {
    const label = formatClientLabel({
      estProfessionnel: true,
      raisonSociale: "Mairie de Villefranche",
      prenom: null,
      nom: null,
    });
    expect(label).toBe("Mairie de Villefranche");
  });

  it("assemble prénom + nom pour un client particulier", () => {
    const label = formatClientLabel({
      estProfessionnel: false,
      raisonSociale: null,
      prenom: "Marie",
      nom: "Dupont",
    });
    expect(label).toBe("Marie Dupont");
  });

  it("retourne un tiret si aucune information n'est disponible", () => {
    const label = formatClientLabel({
      estProfessionnel: false,
      raisonSociale: null,
      prenom: null,
      nom: null,
    });
    expect(label).toBe("—");
  });
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    utilisateur: { findUnique: vi.fn() },
    opportunite: { findUnique: vi.fn(), update: vi.fn() },
    kanbanDeal: { count: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(mockTx)),
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

const mockTx = {
  opportunite: { update: vi.fn() },
  kanbanDeal: { count: vi.fn(), create: vi.fn() },
};

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { accepterOpportunite } from "@/lib/actions/opportunite";

const OPPORTUNITE_MOCK = {
  id: "opp-1",
  entrepriseId: "ent-1",
  apporteurId: "app-1",
  statut: "SOUMISE",
  typeTravaux: "Rénovation toiture",
  client: {
    estProfessionnel: false,
    raisonSociale: null,
    prenom: "Marie",
    nom: "Dupont",
    email: "marie@example.com",
    telephone: "0600000000",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth).mockResolvedValue({ userId: "clerk-1" } as never);
  vi.mocked(prisma.utilisateur.findUnique).mockResolvedValue({
    entreprise: { id: "ent-1" },
  } as never);
  vi.mocked(prisma.opportunite.findUnique).mockResolvedValue(OPPORTUNITE_MOCK as never);
  mockTx.kanbanDeal.count.mockResolvedValue(0);
});

describe("accepterOpportunite — montant et création du KanbanDeal", () => {
  it("refuse un montant manquant ou négatif", async () => {
    const res = await accepterOpportunite("opp-1", 0);
    expect(res.success).toBe(false);
    expect(res.success === false && res.error).toContain("montant");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("crée le KanbanDeal lié à l'opportunité dans la même transaction que l'acceptation", async () => {
    const res = await accepterOpportunite("opp-1", 150000);

    expect(res.success).toBe(true);
    expect(mockTx.opportunite.update).toHaveBeenCalledWith({
      where: { id: "opp-1" },
      data: { statut: "ACCEPTEE" },
    });
    expect(mockTx.kanbanDeal.create).toHaveBeenCalledWith({
      data: {
        titre: "Rénovation toiture — Marie Dupont",
        montant: 150000,
        clientNom: "Marie Dupont",
        clientEmail: "marie@example.com",
        clientTel: "0600000000",
        statut: "PROSPECT",
        position: 0,
        apporteurId: "app-1",
        opportuniteId: "opp-1",
      },
    });
  });

  it("ne crée rien si l'opportunité n'est plus SOUMISE", async () => {
    vi.mocked(prisma.opportunite.findUnique).mockResolvedValue({
      ...OPPORTUNITE_MOCK,
      statut: "ACCEPTEE",
    } as never);

    const res = await accepterOpportunite("opp-1", 150000);

    expect(res.success).toBe(false);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
