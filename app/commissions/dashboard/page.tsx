// PAGE /commissions/dashboard — Dashboard ROI
//
// SERVER COMPONENT async : fetch les données agrégées directement depuis Prisma.

import { DashboardROI } from "@/components/commissions/DashboardROI";
import Link from "next/link";

export const metadata = { title: "Dashboard ROI — OPUS" };

export default async function DashboardPage() {
  const roiData: never[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1117]">Dashboard ROI</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Performance par apporteur · {roiData.length} apporteur{roiData.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/commissions" className="text-sm text-[#4F6EF7] hover:underline">
          ← Toutes les commissions
        </Link>
      </div>
      <DashboardROI data={roiData} />
    </div>
  );
}
