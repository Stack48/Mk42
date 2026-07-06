"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentEntrepriseId } from "@/lib/auth";
import { generateDAS2EDI } from "@/server/documents/edi-generator";
import { validateDAS2EDI } from "@/server/documents/edi-validator";
import { generatePDF } from "@/server/documents/pdf-generator";
import { generateCommissionsCSV } from "@/server/documents/csv-generator";
import { uploadDocumentS3 } from "@/server/documents/s3-manager";
import type { BeneficiaireDAS2 } from "@/server/documents/edi-generator";
import { getTotauxDAS2ParAnnee, apporteurNomOuRS } from "@/server/documents/das2-aggregation";

// ── Public surface : 1 seul Server Action, dispatch interne via switch ──────

export type ExportDocumentInput =
  | { type: "DAS2"; annee: number }
  | { type: "DAS2_RECAP_PDF"; annee: number }
  | { type: "FACTURE_PDF"; factureId: string }
  | { type: "RECU_PDF"; recuId: string }
  | { type: "CSV"; dateDebutISO: string; dateFinISO: string };

export interface ExportDocumentResult {
  lienSigne: string;
  documentId: string;
  dateExpiration: Date;
  warnings?: string[];
}

export async function exportDocumentAction(
  input: ExportDocumentInput
): Promise<ExportDocumentResult> {
  switch (input.type) {
    case "DAS2":
      return exportDAS2(input.annee);
    case "DAS2_RECAP_PDF":
      return exportDAS2RecapPDF(input.annee);
    case "FACTURE_PDF":
      return exportFacturePDF(input.factureId);
    case "RECU_PDF":
      return exportRecuPDF(input.recuId);
    case "CSV":
      return exportCSV(input.dateDebutISO, input.dateFinISO);
  }
}

// ── Apporteur — conversions vers le format DAS2 / PDF ───────────────────────

function apporteurTypeDAS2(type: string): "pro" | "particulier" {
  return type === "PROFESSIONNEL" ? "pro" : "particulier";
}

// Date JS → format JJMMAAAA attendu par l'EDI DAS2 (DGFiP)
function formatDateNaissanceEDI(d: Date): string {
  const jj = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${jj}${mm}${d.getUTCFullYear()}`;
}

// ── DAS2 ──────────────────────────────────────────────────────────────────────

async function exportDAS2(annee: number): Promise<ExportDocumentResult> {
  if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
    throw new Error("Année invalide");
  }

  const entrepriseId = await getCurrentEntrepriseId();

  const entreprise = await prisma.entreprise.findUniqueOrThrow({
    where: { id: entrepriseId },
  });

  const totauxParAnnee = await getTotauxDAS2ParAnnee(entrepriseId);
  const totaux = totauxParAnnee.get(annee) ?? [];

  if (totaux.length === 0) {
    throw new Error(`Aucune commission payée trouvée pour l'année ${annee}`);
  }

  const beneficiaires: BeneficiaireDAS2[] = totaux.map(({ apporteur, total }) => ({
    id: apporteur.id,
    type: apporteurTypeDAS2(apporteur.type),
    nomOuRS: apporteurNomOuRS(apporteur),
    siret: apporteur.siret ?? undefined,
    dateNaissance: apporteur.dateNaissance ? formatDateNaissanceEDI(apporteur.dateNaissance) : undefined,
    lieuNaissance: apporteur.lieuNaissance ?? undefined,
    adresse: apporteur.adresse ?? undefined,
    montantBrutAnnuel: total,
    reference: entreprise.siret,
  }));

  const ediContent = generateDAS2EDI(beneficiaires, annee, {
    expediteurSiret: entreprise.siret,
    expediteurNom: entreprise.raisonSociale,
  });

  const validation = validateDAS2EDI(ediContent, beneficiaires);
  if (!validation.isValid) {
    const detail = validation.errors.map((e) => `[${e.type}] ${e.message}`).join(" | ");
    throw new Error(`Validation EDI échouée : ${detail}`);
  }

  const result = await uploadDocumentS3({
    type: "DAS2",
    contenu: ediContent,
    entrepriseId,
    metadata: {
      annee,
      montantTotal: beneficiaires.reduce((s, b) => s + b.montantBrutAnnuel, 0),
      nombreBeneficiaires: beneficiaires.length,
      dateGeneration: new Date().toISOString(),
    },
  });

  // Une ligne DAS2 par bénéficiaire — contrainte d'unicité [entrepriseId, annee, nomBeneficiaire].
  // Le fichier EDI exporté couvre tous les bénéficiaires de l'année : même s3Key/lien sur chaque ligne.
  await Promise.all(
    totaux.map(({ apporteur, total }) => {
      const nomBeneficiaire = apporteurNomOuRS(apporteur);
      return prisma.dAS2.upsert({
        where: {
          entrepriseId_annee_nomBeneficiaire: { entrepriseId, annee, nomBeneficiaire },
        },
        create: {
          entrepriseId,
          annee,
          statut: "GENERE",
          nomBeneficiaire,
          adresseBeneficiaire: apporteur.adresse ?? "",
          siretBeneficiaire: apporteur.siret,
          dateNaissanceBeneficiaire: apporteur.dateNaissance,
          lieuNaissanceBeneficiaire: apporteur.lieuNaissance,
          montantTotal: total,
          s3Key: result.s3Key,
          urlExport: result.lienSigne,
        },
        update: {
          statut: "GENERE",
          adresseBeneficiaire: apporteur.adresse ?? "",
          siretBeneficiaire: apporteur.siret,
          montantTotal: total,
          s3Key: result.s3Key,
          urlExport: result.lienSigne,
        },
      });
    })
  );

  return {
    lienSigne: result.lienSigne,
    documentId: result.documentId,
    dateExpiration: result.dateExpiration,
    warnings: validation.warnings,
  };
}

// ── DAS2 — récapitulatif PDF (lecture humaine, en plus de l'EDI) ─────────────

async function exportDAS2RecapPDF(annee: number): Promise<ExportDocumentResult> {
  if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
    throw new Error("Année invalide");
  }

  const entrepriseId = await getCurrentEntrepriseId();

  const entreprise = await prisma.entreprise.findUniqueOrThrow({
    where: { id: entrepriseId },
  });

  const totauxParAnnee = await getTotauxDAS2ParAnnee(entrepriseId);
  const totaux = totauxParAnnee.get(annee) ?? [];

  if (totaux.length === 0) {
    throw new Error(`Aucune commission payée trouvée pour l'année ${annee}`);
  }

  const pdfBuffer = await generatePDF({
    type: "das2-recap",
    annee,
    entreprise: {
      raisonSociale: entreprise.raisonSociale,
      siret: entreprise.siret,
      adresse: entreprise.adresseSiege,
      email: entreprise.email,
      telephone: entreprise.telephone ?? undefined,
      numeroTVA: entreprise.numeroTVA ?? undefined,
    },
    beneficiaires: totaux.map(({ apporteur, total }) => ({
      nom: apporteurNomOuRS(apporteur),
      type: apporteurTypeDAS2(apporteur.type),
      siret: apporteur.siret ?? undefined,
      montant: total,
    })),
  });

  return uploadDocumentS3({
    type: "DAS2_RECAP",
    contenu: pdfBuffer,
    entrepriseId,
    metadata: {
      annee,
      montantTotal: totaux.reduce((s, t) => s + t.total, 0),
      nombreBeneficiaires: totaux.length,
    },
  });
}

// ── FACTURE PDF ───────────────────────────────────────────────────────────────

async function exportFacturePDF(factureId: string): Promise<ExportDocumentResult> {
  if (!factureId || typeof factureId !== "string") {
    throw new Error("ID facture invalide");
  }

  const entrepriseId = await getCurrentEntrepriseId();

  const facture = await prisma.facture.findUniqueOrThrow({
    where: { id: factureId },
    include: { apporteur: { include: { utilisateur: true } }, entreprise: true },
  });

  if (facture.entrepriseId !== entrepriseId) {
    throw new Error("Accès refusé");
  }

  const pdfBuffer = await generatePDF({
    type: "facture",
    numFacture: facture.numero,
    dateEmission: facture.dateEmission,
    entreprise: {
      raisonSociale: facture.entreprise.raisonSociale,
      siret: facture.entreprise.siret,
      adresse: facture.entreprise.adresseSiege,
      email: facture.entreprise.email,
      telephone: facture.entreprise.telephone ?? undefined,
      numeroTVA: facture.entreprise.numeroTVA ?? undefined,
    },
    apporteur: {
      nom: apporteurNomOuRS(facture.apporteur),
      email: facture.apporteur.utilisateur.email,
      type: apporteurTypeDAS2(facture.apporteur.type),
      siret: facture.apporteur.siret ?? undefined,
      adresse: facture.apporteur.adresse ?? undefined,
    },
    montantHT: facture.montantHT,
    tauxTVA: facture.tauxTva,
    montantTVA: facture.montantTva,
    montantTTC: facture.montantTTC,
  });

  return uploadDocumentS3({
    type: "FACTURE",
    contenu: pdfBuffer,
    entrepriseId,
    apporteurId: facture.apporteurId,
    metadata: { factureId, numFacture: facture.numero },
  });
}

// ── RECU PDF ──────────────────────────────────────────────────────────────────

async function exportRecuPDF(recuId: string): Promise<ExportDocumentResult> {
  if (!recuId || typeof recuId !== "string") {
    throw new Error("ID reçu invalide");
  }

  const entrepriseId = await getCurrentEntrepriseId();

  const recu = await prisma.recu.findUniqueOrThrow({
    where: { id: recuId },
    include: { apporteur: { include: { utilisateur: true } }, entreprise: true },
  });

  if (recu.entrepriseId !== entrepriseId) {
    throw new Error("Accès refusé");
  }

  const pdfBuffer = await generatePDF({
    type: "recu",
    numRecu: recu.numero,
    dateEmission: recu.dateVersement ?? recu.createdAt,
    entreprise: {
      raisonSociale: recu.entreprise.raisonSociale,
      siret: recu.entreprise.siret,
      adresse: recu.entreprise.adresseSiege,
      email: recu.entreprise.email,
    },
    apporteur: {
      nom: apporteurNomOuRS(recu.apporteur),
      email: recu.apporteur.utilisateur.email,
      type: "particulier",
      dateNaissance: recu.apporteur.dateNaissance?.toLocaleDateString("fr-FR"),
    },
    montantBrut: recu.montant,
  });

  return uploadDocumentS3({
    type: "RECU",
    contenu: pdfBuffer,
    entrepriseId,
    apporteurId: recu.apporteurId,
    metadata: { recuId, numRecu: recu.numero },
  });
}

// ── CSV Commissions ───────────────────────────────────────────────────────────

async function exportCSV(
  dateDebutISO: string,
  dateFinISO: string
): Promise<ExportDocumentResult> {
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
      where: { entrepriseId, dateVersement: { gte: dateDebut, lte: dateFin } },
      include: { apporteur: true },
      orderBy: { dateVersement: "asc" },
    }),
  ]);

  const lignes = [
    ...factures.map((f) => ({
      date: f.dateEmission,
      reference: f.numero,
      type: "Facture" as const,
      apporteur: apporteurNomOuRS(f.apporteur),
      montantTTC: f.montantTTC,
      statut: f.statut,
    })),
    ...recus.map((r) => ({
      date: r.dateVersement ?? r.createdAt,
      reference: r.numero,
      type: "Reçu" as const,
      apporteur: apporteurNomOuRS(r.apporteur),
      montantTTC: r.montant,
      statut: r.dateVersement ? "PAYE" : "EN_ATTENTE",
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
