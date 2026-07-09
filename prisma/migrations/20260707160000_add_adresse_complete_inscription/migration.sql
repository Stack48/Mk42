-- AlterTable
ALTER TABLE "apporteurs" ADD COLUMN "codePostal" TEXT;
ALTER TABLE "apporteurs" ADD COLUMN "pays" TEXT;

-- AlterTable
ALTER TABLE "entreprises" ADD COLUMN "villeSiege" TEXT;
ALTER TABLE "entreprises" ADD COLUMN "codePostalSiege" TEXT;
ALTER TABLE "entreprises" ADD COLUMN "paysSiege" TEXT;
