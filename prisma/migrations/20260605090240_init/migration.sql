-- CreateEnum
CREATE TYPE "DealStatut" AS ENUM ('DRAFT', 'SIGNED', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommissionStatut" AS ENUM ('PENDING', 'TO_PAY', 'PAID');

-- CreateTable
CREATE TABLE "apporteurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apporteurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "statut" "DealStatut" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "taux" DOUBLE PRECISION NOT NULL,
    "statut" "CommissionStatut" NOT NULL DEFAULT 'PENDING',
    "entrepriseId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "auditTrail" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dealId" TEXT NOT NULL,
    "apporteurId" TEXT NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apporteurs_email_key" ON "apporteurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_dealId_key" ON "commissions"("dealId");

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_apporteurId_fkey" FOREIGN KEY ("apporteurId") REFERENCES "apporteurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
