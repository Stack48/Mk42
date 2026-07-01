-- AlterTable
ALTER TABLE "kanban_deals" ADD COLUMN     "opportuniteId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "kanban_deals_opportuniteId_key" ON "kanban_deals"("opportuniteId");

-- AddForeignKey
ALTER TABLE "kanban_deals" ADD CONSTRAINT "kanban_deals_opportuniteId_fkey" FOREIGN KEY ("opportuniteId") REFERENCES "opportunites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
