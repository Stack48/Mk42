import { describe, it, expect, afterEach } from "vitest";
import { getAnneesDisponibles, filterItems, type DocumentItem } from "../documentListFilters";

const items: DocumentItem[] = [
  { id: "1", reference: "FAC-2026-001", apporteur: "Marc Dupont", montant: 100, date: "2026-03-15T00:00:00.000Z", statut: "PAYEE" },
  { id: "2", reference: "FAC-2025-014", apporteur: "Sarah Martin", montant: 200, date: "2025-11-02T00:00:00.000Z", statut: "PAYEE" },
  { id: "3", reference: "FAC-2025-002", apporteur: "Marc Dupont", montant: 300, date: "2025-01-20T00:00:00.000Z", statut: "EN_ATTENTE" },
];

describe("getAnneesDisponibles", () => {
  it("retourne les années distinctes triées décroissantes", () => {
    expect(getAnneesDisponibles(items)).toEqual([2026, 2025]);
  });

  it("retourne un tableau vide pour une liste vide", () => {
    expect(getAnneesDisponibles([])).toEqual([]);
  });
});

describe("filterItems", () => {
  it("retourne tout si recherche vide et année TOUTES", () => {
    expect(filterItems(items, "", "TOUTES")).toEqual(items);
  });

  it("filtre par nom d'apporteur, insensible à la casse", () => {
    const result = filterItems(items, "marc", "TOUTES");
    expect(result.map((i) => i.id)).toEqual(["1", "3"]);
  });

  it("filtre par référence partielle", () => {
    const result = filterItems(items, "2025-014", "TOUTES");
    expect(result.map((i) => i.id)).toEqual(["2"]);
  });

  it("filtre par année", () => {
    const result = filterItems(items, "", 2025);
    expect(result.map((i) => i.id)).toEqual(["2", "3"]);
  });

  it("combine recherche et année (ET logique)", () => {
    const result = filterItems(items, "marc", 2025);
    expect(result.map((i) => i.id)).toEqual(["3"]);
  });

  it("retourne un tableau vide si rien ne correspond", () => {
    expect(filterItems(items, "inconnu", "TOUTES")).toEqual([]);
  });
});

describe("bucketing par année en UTC (indépendant du fuseau horaire local)", () => {
  const originalTZ = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTZ;
  });

  // 2025-12-31T23:30:00.000Z tombe le 1er janvier 2026 en heure locale dès qu'on est
  // dans un fuseau en avance sur UTC (ex: Europe/Paris, UTC+1 en décembre). Ce test force
  // un tel fuseau pour garantir que le bucketing reste bien en 2025, quel que soit le
  // fuseau horaire de la machine qui exécute la suite.
  const itemsFrontiereUTC: DocumentItem[] = [
    { id: "4", reference: "FAC-2025-099", apporteur: "Alice Petit", montant: 400, date: "2025-12-31T23:30:00.000Z", statut: "PAYEE" },
  ];

  it("getAnneesDisponibles range une date de fin décembre (23h30 UTC) dans l'année UTC, pas l'année locale", () => {
    process.env.TZ = "Europe/Paris";
    expect(getAnneesDisponibles(itemsFrontiereUTC)).toEqual([2025]);
  });

  it("filterItems retrouve une date de fin décembre (23h30 UTC) sous le filtre de l'année UTC, pas l'année locale", () => {
    process.env.TZ = "Europe/Paris";
    expect(filterItems(itemsFrontiereUTC, "", 2025).map((i) => i.id)).toEqual(["4"]);
    expect(filterItems(itemsFrontiereUTC, "", 2026)).toEqual([]);
  });
});
