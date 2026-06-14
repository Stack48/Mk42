import { describe, it, expect } from "vitest";
import { generateDAS2EDI } from "../edi-generator";
import type { BeneficiaireDAS2 } from "../edi-generator";

const opts = {
  expediteurSiret: "12345678900010",
  expediteurNom: "OPUS BTP SAS",
};

const benefPro: BeneficiaireDAS2 = {
  id: "b1",
  type: "pro",
  nomOuRS: "Marc Leblanc SARL",
  siret: "98765432100015",
  adresse: "10 rue du Commerce, 75001 Paris",
  montantBrutAnnuel: 48000,
  reference: "12345678900010",
};

const benefParticulier: BeneficiaireDAS2 = {
  id: "b2",
  type: "particulier",
  nomOuRS: "Sarah Martin",
  dateNaissance: "15051985",
  lieuNaissance: "Lyon",
  adresse: "5 allée des Roses, 69003 Lyon",
  montantBrutAnnuel: 22500,
  reference: "12345678900010",
};

const benefLimiteBas: BeneficiaireDAS2 = {
  id: "b3",
  type: "pro",
  nomOuRS: "Micro Corp",
  siret: "11122233300012",
  montantBrutAnnuel: 450, // < 600€ — warning attendu
  reference: "12345678900010",
};

describe("generateDAS2EDI", () => {
  it("génère un fichier sans BOM UTF-8", () => {
    const result = generateDAS2EDI([benefPro], 2025, opts);
    // BOM serait le caractère ﻿ en premier
    expect(result.charCodeAt(0)).not.toBe(0xfeff);
  });

  it("contient les segments obligatoires (UNA, UNB, UNZ, UNH, UNT, BGM)", () => {
    const result = generateDAS2EDI([benefPro], 2025, opts);
    expect(result).toMatch(/^UNA/);
    expect(result).toContain("UNB+");
    expect(result).toContain("UNZ+");
    expect(result).toContain("UNH+");
    expect(result).toContain("UNT+");
    expect(result).toContain("BGM+");
  });

  it("cas pro — contient le SIRET et le montant", () => {
    const result = generateDAS2EDI([benefPro], 2025, opts);
    expect(result).toContain(benefPro.siret!);
    expect(result).toContain("MOA+BC:48000:EUR");
  });

  it("cas particulier — contient la date et lieu de naissance", () => {
    const result = generateDAS2EDI([benefParticulier], 2025, opts);
    expect(result).toContain("15051985");
    expect(result).toContain("Lyon");
    expect(result).toContain("MOA+BC:22500:EUR");
  });

  it("cas montant limite bas — génère quand même (déclaration volontaire)", () => {
    const result = generateDAS2EDI([benefLimiteBas], 2025, opts);
    expect(result).toContain("MOA+BC:450:EUR");
  });

  it("refuse une liste vide de bénéficiaires", () => {
    expect(() => generateDAS2EDI([], 2025, opts)).toThrow();
  });

  it("gère plusieurs bénéficiaires simultanément", () => {
    const result = generateDAS2EDI([benefPro, benefParticulier], 2025, opts);
    expect(result).toContain("MOA+BC:48000:EUR");
    expect(result).toContain("MOA+BC:22500:EUR");
  });
});
