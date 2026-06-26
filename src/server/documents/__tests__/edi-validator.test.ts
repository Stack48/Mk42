import { describe, it, expect } from "vitest";
import { generateDAS2EDI } from "../edi-generator";
import { validateDAS2EDI } from "../edi-validator";
import type { BeneficiaireDAS2 } from "../edi-generator";

const opts = {
  expediteurSiret: "12345678900010",
  expediteurNom: "OPUS BTP SAS",
};

const validPro: BeneficiaireDAS2 = {
  id: "b1",
  type: "pro",
  nomOuRS: "Marc SARL",
  siret: "98765432100015",
  montantBrutAnnuel: 5000,
  reference: "ref",
};

const validParticulier: BeneficiaireDAS2 = {
  id: "b2",
  type: "particulier",
  nomOuRS: "Sarah Martin",
  dateNaissance: "15051985",
  lieuNaissance: "Lyon",
  montantBrutAnnuel: 2000,
  reference: "ref",
};

describe("validateDAS2EDI — fichier valide", () => {
  it("valide un fichier correct (pro)", () => {
    const edi = generateDAS2EDI([validPro], 2025, opts);
    const result = validateDAS2EDI(edi, [validPro]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("valide un fichier correct (particulier)", () => {
    const edi = generateDAS2EDI([validParticulier], 2025, opts);
    const result = validateDAS2EDI(edi, [validParticulier]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("le compteur UNT correspond exactement au nombre de segments UNH..UNT", () => {
    const edi = generateDAS2EDI([validPro, validParticulier], 2025, opts);
    const result = validateDAS2EDI(edi, [validPro, validParticulier]);
    expect(result.warnings.some((w) => w.includes("UNT segment count"))).toBe(false);
  });
});

describe("validateDAS2EDI — erreurs encoding", () => {
  it("détecte BOM UTF-8", () => {
    const edi = generateDAS2EDI([validPro], 2025, opts);
    const withBOM = "﻿" + edi;
    const result = validateDAS2EDI(withBOM, [validPro]);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.type === "encoding")).toBe(true);
  });
});

describe("validateDAS2EDI — erreurs syntaxe", () => {
  it("détecte absence de UNA", () => {
    const edi = generateDAS2EDI([validPro], 2025, opts);
    const withoutUNA = edi.replace(/^UNA.*\n/, "");
    const result = validateDAS2EDI(withoutUNA, [validPro]);
    expect(result.errors.some((e) => e.message.includes("UNA"))).toBe(true);
  });

  it("détecte absence de UNZ", () => {
    const edi = generateDAS2EDI([validPro], 2025, opts);
    const withoutUNZ = edi.replace(/UNZ\+.*'\n?/, "");
    const result = validateDAS2EDI(withoutUNZ, [validPro]);
    expect(result.errors.some((e) => e.message.includes("UNZ"))).toBe(true);
  });
});

describe("validateDAS2EDI — erreurs sémantiques", () => {
  it("détecte SIRET invalide (trop court)", () => {
    const badSiret: BeneficiaireDAS2 = { ...validPro, siret: "1234" };
    const edi = generateDAS2EDI([badSiret], 2025, opts);
    const result = validateDAS2EDI(edi, [badSiret]);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("SIRET"))).toBe(true);
  });

  it("détecte montant négatif", () => {
    const bad: BeneficiaireDAS2 = { ...validPro, montantBrutAnnuel: -100 };
    const edi = generateDAS2EDI([{ ...validPro, montantBrutAnnuel: 1000 }], 2025, opts);
    const result = validateDAS2EDI(edi, [bad]);
    expect(result.errors.some((e) => e.message.includes("montant"))).toBe(true);
  });

  it("détecte date naissance invalide (mois 13)", () => {
    const bad: BeneficiaireDAS2 = { ...validParticulier, dateNaissance: "01131985" };
    const edi = generateDAS2EDI([validParticulier], 2025, opts);
    const result = validateDAS2EDI(edi, [bad]);
    expect(result.errors.some((e) => e.message.includes("mois naissance"))).toBe(true);
  });

  it("détecte lieuNaissance manquant pour particulier", () => {
    const bad: BeneficiaireDAS2 = { ...validParticulier, lieuNaissance: undefined };
    const edi = generateDAS2EDI([validParticulier], 2025, opts);
    const result = validateDAS2EDI(edi, [bad]);
    expect(result.errors.some((e) => e.message.includes("lieuNaissance"))).toBe(true);
  });

  it("détecte doublons d'identifiants", () => {
    const dup: BeneficiaireDAS2[] = [validPro, { ...validPro, nomOuRS: "Autre" }];
    const edi = generateDAS2EDI([validPro], 2025, opts);
    const result = validateDAS2EDI(edi, dup);
    expect(result.errors.some((e) => e.message.includes("doublon"))).toBe(true);
  });

  it("avertit si montant < 600€", () => {
    const bas: BeneficiaireDAS2 = { ...validPro, id: "bx", montantBrutAnnuel: 300 };
    const edi = generateDAS2EDI([bas], 2025, opts);
    const result = validateDAS2EDI(edi, [bas]);
    expect(result.warnings.some((w) => w.includes("600"))).toBe(true);
  });
});
