"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentEntrepriseId } from "@/lib/auth";
import { generateDAS2EDI } from "@/server/documents/edi-generator";
import { validateDAS2EDI } from "@/server/documents/edi-validator";
import { generatePDF } from "@/server/documents/pdf-generator";
import { generateCommissionsCSV } from "@/server/documents/csv-generator";
import { uploadDocumentS3 } from "@/server/documents/s3-manager";
import type { BeneficiaireDAS2 } from "@/server/documents/edi-generator";

// ── DAS2 ──────────────────────────────────────────────────────────────────────

export async function exportDAS2Action(annee: number): Promise<{
  lienSigne: string;
  documentId: string;
  dateExpiration: Date;
  warnings: string[];
}> {
  if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
    throw new Error("Année invalide");
  }

  const entrepriseId = await getCurrentEntrepriseId();

  const entreprise = await prisma.entreprise.findUniqueOrThrow({
    where: { id: entrepriseId },
  });

  // Agrégation factures + recus de l'année
  const debut = new Date(`${annee}-01-01T00:00:00.000Z`);
  const fin = new Date(`${annee}-12-31T23:59:59.999Z`);

  const [factures, recus] = await Promise.all([
    prisma.facture.findMany({
      where: {
        entrepriseId,
        dateEmission: { gte: debut, lte: fin },
        statut: "PAYEE",
      },
      include: { apporteur: true },
    }),
    prisma.recu.findMany({
      where: {
        entrepriseId,
        dateEmission: { gte: debut, lte: fin },
        statut: "PAYE",
      },
      include: { apporteur: true },
    }),
  ]);

  // Agréger par apporteur
  const totauxMap = new Map<string, { apporteur: typeof factures[0]["apporteur"]; total: number }>();

  for (const f of factures) {
    const entry = totauxMap.get(f.apporteurId) ?? {
      apporteur: f.apporteur,
      total: 0,
    };
    entry.total += f.montantHT; // DAS2 = montant HT versé
    totauxMap.set(f.apporteurId, entry);
  }

  for (const r of recus) {
    const entry = totauxMap.get(r.apporteurId) ?? {
      apporteur: r.apporteur,
      total: 0,
    };
    entry.total += r.montantBrut;
    totauxMap.set(r.apporteurId, entry);
  }

  const beneficiaires: BeneficiaireDAS2[] = Array.from(totauxMap.values()).map(
    ({ apporteur, total }) => ({
      id: apporteur.id,
      type: (apporteur.type as "pro" | "particulier") ?? "particulier",
      nomOuRS: apporteur.nom,
      siret: apporteur.siret ?? undefined,
      dateNaissance: apporteur.dateNaissance ?? undefined,
      lieuNaissance: apporteur.lieuNaissance ?? undefined,
      adresse: apporteur.adresse ?? undefined,
      montantBrutAnnuel: total,
      reference: entreprise.siret,
    })
  );

  if (beneficiaires.length === 0) {
    throw new Error(`Aucune commission payée trouvée pour l'année ${annee}`);
  }

  const ediContent = generateDAS2EDI(beneficiaires, annee, {
    expediteurSiret: entreprise.siret,
    expediteurNom: entreprise.raisonSociale,
  });

  const validation = validateDAS2EDI(ediContent, beneficiaires);
  if (!validation.isValid) {
    const detail = validation.errors
      .map((e) => `[${e.type}] ${e.message}`)
      .join(" | ");
    throw new Error(`Validation EDI échouée : ${detail}`);
  }

  const montantTotal = Array.from(totauxMap.values()).reduce((s, v) => s + v.total, 0);

  const result = await uploadDocumentS3({
    type: "DAS2",
    contenu: ediContent,
    entrepriseId,
    metadata: {
      annee,
      montantTotal,
      nombreBeneficiaires: beneficiaires.length,
      dateGeneration: new Date().toISOString(),
    },
  });

  // Upsert DAS2 record
  await prisma.dAS2.upsert({
    where: { entrepriseId_annee: { entrepriseId, annee } },
    create: {
      entrepriseId,
      annee,
      statut: "GENERE",
      s3Key: result.s3Key,
      dateExport: new Date(),
      montantTotal,
      nombreBeneficiaires: beneficiaires.length,
    },
    update: {
      statut: "GENERE",
      s3Key: result.s3Key,
      dateExport: new Date(),
      montantTotal,
      nombreBeneficiaires: beneficiaires.length,
    },
  });

  return {
    lienSigne: result.lienSigne,
    documentId: result.documentId,
    dateExpiration: result.dateExpiration,
    warnings: validation.warnings,
  };
}

// ── FACTURE PDF ───────────────────────────────────────────────────────────────

export async function exportFacturePDFAction(factureId: string): Promise<{
  lienSigne: string;
  documentId: string;
  dateExpiration: Date;
}> {
  if (!factureId || typeof factureId !== "string") {
    throw new Error("ID facture invalide");
  }

  const entrepriseId = await getCurrentEntrepriseId();

  const facture = await prisma.facture.findUniqueOrThrow({
    where: { id: factureId },
    include: { apporteur: true, entreprise: true },
  });

  if (facture.entrepriseId !== entrepriseId) {
    throw new Error("Accès refusé");
  }

  const pdfBuffer = await generatePDF({
    type: "facture",
    numFacture: facture.numFacture,
    dateEmission: facture.dateEmission,
    entreprise: {
      raisonSociale: facture.entreprise.raisonSociale,
      siret: facture.entreprise.siret,
      adresse: facture.entreprise.adresse,
      email: facture.entreprise.email,
      telephone: facture.entreprise.telephone ?? undefined,
      numeroTVA: facture.entreprise.numeroTVA ?? undefined,
    },
    apporteur: {
      nom: facture.apporteur.nom,
      email: facture.apporteur.email,
      type: (facture.apporteur.type as "pro" | "particulier"),
      siret: facture.apporteur.siret ?? undefined,
      adresse: facture.apporteur.adresse ?? undefined,
    },
    montantHT: facture.montantHT,
    tauxTVA: facture.tauxTVA,
    montantTVA: facture.montantTVA,
    montantTTC: facture.montantTTC,
  });

  return uploadDocumentS3({
    type: "FACTURE",
    contenu: pdfBuffer,
    entrepriseId,
    apporteurId: facture.apporteurId,
    metadata: { factureId, numFacture: facture.numFacture },
  });
}

// ── RECU PDF ──────────────────────────────────────────────────────────────────

export async function exportRecuPDFAction(recuId: string): Promise<{
  lienSigne: string;
  documentId: string;
  dateExpiration: Date;
}> {
  if (!recuId || typeof recuId !== "string") {
    throw new Error("ID reçu invalide");
  }

  const entrepriseId = await getCurrentEntrepriseId();

  const recu = await prisma.recu.findUniqueOrThrow({
    where: { id: recuId },
    include: { apporteur: true, entreprise: true },
  });

  if (recu.entrepriseId !== entrepriseId) {
    throw new Error("Accès refusé");
  }

  const pdfBuffer = await generatePDF({
    type: "recu",
    numRecu: recu.numRecu,
    dateEmission: recu.dateEmission,
    entreprise: {
      raisonSociale: recu.entreprise.raisonSociale,
      siret: recu.entreprise.siret,
      adresse: recu.entreprise.adresse,
      email: recu.entreprise.email,
    },
    apporteur: {
      nom: recu.apporteur.nom,
      email: recu.apporteur.email,
      type: "particulier",
      dateNaissance: recu.apporteur.dateNaissance ?? undefined,
    },
    montantBrut: recu.montantBrut,
  });

  return uploadDocumentS3({
    type: "RECU",
    contenu: pdfBuffer,
    entrepriseId,
    apporteurId: recu.apporteurId,
    metadata: { recuId, numRecu: recu.numRecu },
  });
}

// ── CSV Commissions ───────────────────────────────────────────────────────────

export async function exportCSVAction(
  dateDebutISO: string,
  dateFinISO: string
): Promise<{ lienSigne: string; documentId: string; dateExpiration: Date }> {
  const dateDebut = new Date(dateDebutISO);
  const dateFin = new Date(dateFinISO);

  if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
    throw new Error("Dates invalides");
  }
  if (dateFin < dateDebut) {
    throw new Error("La date de fin doit être après la date de début");
  }

  const entrepriseId = await getCurrentEntrepriseId();

  const entreprise = await prisma.entreprise.findUniqueOrThrow({
    where: { id: entrepriseId },
  });

  const [factures, recus] = await Promise.all([
    prisma.facture.findMany({
      where: { entrepriseId, dateEmission: { gte: dateDebut, lte: dateFin } },
      include: { apporteur: true },
      orderBy: { dateEmission: "asc" },
    }),
    prisma.recu.findMany({
      where: { entrepriseId, dateEmission: { gte: dateDebut, lte: dateFin } },
      include: { apporteur: true },
      orderBy: { dateEmission: "asc" },
    }),
  ]);

  const lignes = [
    ...factures.map((f) => ({
      date: f.dateEmission,
      reference: f.numFacture,
      type: "Facture" as const,
      apporteur: f.apporteur.nom,
      montantTTC: f.montantTTC,
      statut: f.statut,
    })),
    ...recus.map((r) => ({
      date: r.dateEmission,
      reference: r.numRecu,
      type: "Reçu" as const,
      apporteur: r.apporteur.nom,
      montantTTC: r.montantBrut,
      statut: r.statut,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const csv = generateCommissionsCSV({
    lignes,
    entrepriseNom: entreprise.raisonSociale,
    dateDebut,
    dateFin,
  });

  return uploadDocumentS3({
    type: "CSV",
    contenu: csv,
    entrepriseId,
    metadata: {
      dateDebut: dateDebutISO,
      dateFin: dateFinISO,
      nbLignes: lignes.length,
    },
  });
}
