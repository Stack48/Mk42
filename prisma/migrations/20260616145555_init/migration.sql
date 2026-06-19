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
CREATE TABLE "entreprises" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "adresseSiege" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "codeApe" TEXT,
    "representantLegal" TEXT,
    "numeroTVA" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "nomTitulaireIban" TEXT,
    "tauxCommissionDefaut" DOUBLE PRECISION,
    "montantFixeDefaut" DOUBLE PRECISION,
    "statutKyc" "StatutKYC" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entreprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apporteurs" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "type" "TypeApporteur" NOT NULL DEFAULT 'PARTICULIER',
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

    CONSTRAINT "apporteurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "taux" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PENDING',
    "entrepriseId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "auditTrail" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dealId" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,
    "dealId" TEXT,
    "chantierId" TEXT,
    "token" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "templateData" JSONB,
    "fileOriginalPath" TEXT,
    "fileSignedPath" TEXT,
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "rejectedReason" TEXT,
    "numero" TEXT,
    "statut" "StatutContrat" NOT NULL DEFAULT 'GENERE',
    "urlDocument" TEXT,
    "signatureEntrepriseAt" TIMESTAMP(3),
    "signatureApporteurAt" TIMESTAMP(3),
    "horodatage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrat_access_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contratId" TEXT NOT NULL,

    CONSTRAINT "contrat_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_deals" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "mission" TEXT,
    "clientNom" TEXT NOT NULL,
    "clientEmail" TEXT,
    "clientTel" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PROSPECT',
    "commissionGelee" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "commissionDealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "apporteurId" TEXT NOT NULL,

    CONSTRAINT "kanban_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_documents" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AUTRE',
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dealId" TEXT NOT NULL,

    CONSTRAINT "deal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_messages" (
    "id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "auteurType" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dealId" TEXT NOT NULL,

    CONSTRAINT "deal_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "client_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dealId" TEXT NOT NULL,

    CONSTRAINT "client_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_evenements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitationId" TEXT NOT NULL,

    CONSTRAINT "client_evenements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_logs" (
    "id" TEXT NOT NULL,
    "trackingLinkId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "rfc3161Hash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_history" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunites" (
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

    CONSTRAINT "opportunites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chantiers" (
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

    CONSTRAINT "chantiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "chantierId" TEXT,
    "commissionId" TEXT,
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

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recus" (
    "id" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "chantierId" TEXT,
    "commissionId" TEXT,
    "numero" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "dateVersement" TIMESTAMP(3),
    "urlDocument" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "das2" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'NON_GENERE',
    "nomBeneficiaire" TEXT NOT NULL,
    "adresseBeneficiaire" TEXT NOT NULL,
    "siretBeneficiaire" TEXT,
    "dateNaissanceBeneficiaire" TIMESTAMP(3),
    "lieuNaissanceBeneficiaire" TEXT,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "s3Key" TEXT,
    "urlExport" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "das2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "s3Key" TEXT,
    "nomFichier" TEXT NOT NULL,
    "horodatage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entrepriseId" TEXT,
    "apporteurId" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_clerkId_key" ON "Utilisateur"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "entreprises_utilisateurId_key" ON "entreprises"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "entreprises_siret_key" ON "entreprises"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "apporteurs_utilisateurId_key" ON "apporteurs"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "apporteurs_siret_key" ON "apporteurs"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_dealId_key" ON "commissions"("dealId");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_chantierId_key" ON "contrats"("chantierId");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_token_key" ON "contrats"("token");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_numero_key" ON "contrats"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "kanban_deals_commissionDealId_key" ON "kanban_deals"("commissionDealId");

-- CreateIndex
CREATE UNIQUE INDEX "client_invitations_token_key" ON "client_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_links_token_key" ON "tracking_links"("token");

-- CreateIndex
CREATE UNIQUE INDEX "chantiers_opportuniteId_key" ON "chantiers"("opportuniteId");

-- CreateIndex
CREATE UNIQUE INDEX "chantiers_reference_key" ON "chantiers"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "factures_chantierId_key" ON "factures"("chantierId");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "recus_chantierId_key" ON "recus"("chantierId");

-- CreateIndex
CREATE UNIQUE INDEX "recus_numero_key" ON "recus"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "das2_entrepriseId_annee_nomBeneficiaire_key" ON "das2"("entrepriseId", "annee", "nomBeneficiaire");

-- AddForeignKey
ALTER TABLE "entreprises" ADD CONSTRAINT "entreprises_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apporteurs" ADD CONSTRAINT "apporteurs_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "apporteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "apporteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrat_access_logs" ADD CONSTRAINT "contrat_access_logs_contratId_fkey" FOREIGN KEY ("contratId") REFERENCES "contrats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_deals" ADD CONSTRAINT "kanban_deals_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "apporteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_documents" ADD CONSTRAINT "deal_documents_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "kanban_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_messages" ADD CONSTRAINT "deal_messages_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "kanban_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "apporteurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_evenements" ADD CONSTRAINT "client_evenements_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "client_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_logs" ADD CONSTRAINT "tracking_logs_trackingLinkId_fkey" FOREIGN KEY ("trackingLinkId") REFERENCES "tracking_links"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_history" ADD CONSTRAINT "client_history_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "apporteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chantiers" ADD CONSTRAINT "chantiers_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "opportunites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chantiers" ADD CONSTRAINT "chantiers_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "apporteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recus" ADD CONSTRAINT "recus_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "apporteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recus" ADD CONSTRAINT "recus_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recus" ADD CONSTRAINT "recus_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "chantiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "das2" ADD CONSTRAINT "das2_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "apporteurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
