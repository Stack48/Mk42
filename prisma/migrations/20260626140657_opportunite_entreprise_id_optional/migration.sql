-- DropForeignKey
ALTER TABLE "opportunites" DROP CONSTRAINT "opportunites_entrepriseId_fkey";

-- AlterTable
ALTER TABLE "opportunites" ALTER COLUMN "entrepriseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "entreprises"("id") ON DELETE SET NULL ON UPDATE CASCADE;
