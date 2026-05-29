/*
  Warnings:

  - A unique constraint covering the columns `[clerkOrgId]` on the table `Entreprise` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RoleOrganisation" AS ENUM ('ADMIN', 'MEMBRE', 'REFERRER_INTERNE');

-- AlterTable
ALTER TABLE "Entreprise" ADD COLUMN     "clerkOrgId" TEXT;

-- CreateTable
CREATE TABLE "MembreEntreprise" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "role" "RoleOrganisation" NOT NULL,
    "clerkMembershipId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembreEntreprise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembreEntreprise_clerkMembershipId_key" ON "MembreEntreprise"("clerkMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "MembreEntreprise_utilisateurId_entrepriseId_key" ON "MembreEntreprise"("utilisateurId", "entrepriseId");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_clerkOrgId_key" ON "Entreprise"("clerkOrgId");

-- AddForeignKey
ALTER TABLE "MembreEntreprise" ADD CONSTRAINT "MembreEntreprise_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreEntreprise" ADD CONSTRAINT "MembreEntreprise_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
