/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeApporteur" AS ENUM ('PARTICULIER', 'PROFESSIONNEL');

-- CreateEnum
CREATE TYPE "StatutKYC" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "StatutOpportunite" AS ENUM ('SOUMISE', 'ACCEPTEE', 'REFUSEE', 'EN_NEGOCIATION');

-- CreateEnum
CREATE TYPE "StatutChantier" AS ENUM ('PROSPECTION', 'CHIFFRAGE', 'SIGNE', 'EN_COURS', 'TERMINE');

-- CreateEnum
CREATE TYPE "StatutContrat" AS ENUM ('GENERE', 'EN_ATTENTE_SIGNATURE', 'SIGNE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "StatutFacture" AS ENUM ('GENEREE', 'ENVOYEE', 'PAYEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('CONTRAT', 'FACTURE', 'RECU', 'KYC_IDENTITE', 'KYC_KBIS', 'KYC_DOMICILE', 'RIB', 'DAS2_EXPORT');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "adresseSiege" TEXT NOT NULL,
    "codeApe" TEXT,
    "representantLegal" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "iban" TEXT,
    "bic" TEXT,
    "nomTitulaireIban" TEXT,
    "tauxCommissionDefaut" DOUBLE PRECISION,
    "montantFixeDefaut" DOUBLE PRECISION,
    "statutKyc" "StatutKYC" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apporteur" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" "TypeApporteur" NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "raisonSociale" TEXT,
    "siret" TEXT,
    "numeroTva" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "lieuNaissance" TEXT,
    "statutKyc" "StatutKYC" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apporteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "estProfessionnel" BOOLEAN NOT NULL DEFAULT false,
    "nom" TEXT,
    "prenom" TEXT,
    "raisonSociale" TEXT,
    "siret" TEXT,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "adresseSiege" TEXT,
    "adresseChantier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunite" (
    "id" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "statut" "StatutOpportunite" NOT NULL DEFAULT 'SOUMISE',
    "typeTravaux" TEXT NOT NULL,
    "description" TEXT,
    "delaiSouhaite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chantier" (
    "id" TEXT NOT NULL,
    "opportuniteId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "statut" "StatutChantier" NOT NULL DEFAULT 'PROSPECTION',
    "montantHT" DOUBLE PRECISION,
    "tauxCommission" DOUBLE PRECISION,
    "montantCommission" DOUBLE PRECISION,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chantier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrat" (
    "id" TEXT NOT NULL,
    "chantierId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "statut" "StatutContrat" NOT NULL DEFAULT 'GENERE',
    "urlDocument" TEXT,
    "signatureEntrepriseAt" TIMESTAMP(3),
    "signatureApporteurAt" TIMESTAMP(3),
    "horodatage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contrat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL,
    "chantierId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "statut" "StatutFacture" NOT NULL DEFAULT 'GENEREE',
    "montantHT" DOUBLE PRECISION NOT NULL,
    "tauxTva" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "montantTva" DOUBLE PRECISION NOT NULL,
    "montantTTC" DOUBLE PRECISION NOT NULL,
    "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePrestation" TIMESTAMP(3),
    "dateEcheance" TIMESTAMP(3),
    "datePaiement" TIMESTAMP(3),
    "urlDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recu" (
    "id" TEXT NOT NULL,
    "chantierId" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "dateVersement" TIMESTAMP(3),
    "urlDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DAS2" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "nomBeneficiaire" TEXT NOT NULL,
    "adresseBeneficiaire" TEXT NOT NULL,
    "siretBeneficiaire" TEXT,
    "dateNaissanceBeneficiaire" TIMESTAMP(3),
    "lieuNaissanceBeneficiaire" TEXT,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "urlExport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DAS2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "urlS3" TEXT NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "horodatage" TEXT,
    "entrepriseId" TEXT,
    "apporteurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_clerkId_key" ON "Utilisateur"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_utilisateurId_key" ON "Entreprise"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_siret_key" ON "Entreprise"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "Apporteur_utilisateurId_key" ON "Apporteur"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Apporteur_siret_key" ON "Apporteur"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "Chantier_opportuniteId_key" ON "Chantier"("opportuniteId");

-- CreateIndex
CREATE UNIQUE INDEX "Chantier_reference_key" ON "Chantier"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Contrat_chantierId_key" ON "Contrat"("chantierId");

-- CreateIndex
CREATE UNIQUE INDEX "Contrat_numero_key" ON "Contrat"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_chantierId_key" ON "Facture"("chantierId");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_numero_key" ON "Facture"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Recu_chantierId_key" ON "Recu"("chantierId");

-- CreateIndex
CREATE UNIQUE INDEX "Recu_numero_key" ON "Recu"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "DAS2_entrepriseId_annee_nomBeneficiaire_key" ON "DAS2"("entrepriseId", "annee", "nomBeneficiaire");

-- AddForeignKey
ALTER TABLE "Entreprise" ADD CONSTRAINT "Entreprise_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apporteur" ADD CONSTRAINT "Apporteur_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunite" ADD CONSTRAINT "Opportunite_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "Apporteur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunite" ADD CONSTRAINT "Opportunite_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunite" ADD CONSTRAINT "Opportunite_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chantier" ADD CONSTRAINT "Chantier_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "Opportunite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chantier" ADD CONSTRAINT "Chantier_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrat" ADD CONSTRAINT "Contrat_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "Chantier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrat" ADD CONSTRAINT "Contrat_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrat" ADD CONSTRAINT "Contrat_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "Apporteur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "Chantier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "Apporteur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recu" ADD CONSTRAINT "Recu_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "Chantier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recu" ADD CONSTRAINT "Recu_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "Apporteur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DAS2" ADD CONSTRAINT "DAS2_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "Apporteur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
